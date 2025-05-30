import { NextResponse } from 'next/server'
import { z } from 'zod'
import clientPromise from '@/lib/db'
import { Search } from '@/lib/models/Search'
import { Route } from '@/lib/models/Route'
import { City } from '@/lib/models/City'
import { Carrier } from '@/lib/models/Carrier'
import { flixBusAPI } from '@/lib/external/flixbus'
import { blaBlaCarsAPI } from '@/lib/external/blablacar'
import { mockBusAPI } from '@/lib/external/mock-provider'
import { getFlixBusCityId, getBlaBlaCityCityId } from '@/lib/external/city-mapping'

// Request deduplication cache with TTL and concurrent request handling
const searchCache = new Map()
const ongoingSearches = new Map()
const CACHE_TTL = 10000 // 10 seconds

// Clean up expired cache entries
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of searchCache) {
    if (now - value.timestamp > CACHE_TTL) {
      searchCache.delete(key)
    }
  }
}, 5000) // Clean up every 5 seconds

// Validation schema for search request
const SearchRequestSchema = z.object({
  fromCityId: z.number(),
  toCityId: z.number(),
  departureDate: z.string(),
  returnDate: z.string().optional(),
  tripType: z.enum(['one-way', 'return', 'return-open'])
})

export async function POST(request) {
  const requestId = Math.random().toString(36).substring(2, 8)
  console.log(`🔍 === SEARCH API CALLED (Request ID: ${requestId}) ===`)
  
  try {
    const client = await clientPromise
    const db = client.db('eurotours')
    
    const body = await request.json()
    console.log(`📥 Request ${requestId}: Praha → London, June 5th`)
    
    // Validate request data
    const validatedData = SearchRequestSchema.parse(body)
    
    // Create search key for deduplication
    const searchKey = `${validatedData.fromCityId}-${validatedData.toCityId}-${validatedData.departureDate}-${validatedData.tripType}`
    
    // Check if we have a cached result
    if (searchCache.has(searchKey)) {
      const cached = searchCache.get(searchKey)
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`⚠️ Request ${requestId}: Returning cached result (age: ${Date.now() - cached.timestamp}ms)`)
        return NextResponse.json(cached.result)
      } else {
        // Remove expired cache
        searchCache.delete(searchKey)
      }
    }
    
    // Check if the same search is already in progress
    if (ongoingSearches.has(searchKey)) {
      console.log(`⚠️ Request ${requestId}: Waiting for ongoing search to complete...`)
      const result = await ongoingSearches.get(searchKey)
      console.log(`✅ Request ${requestId}: Returning result from ongoing search`)
      return NextResponse.json(result)
    }
    
    // Start the search and track it
    const searchPromise = performSearch(requestId, validatedData, db)
    ongoingSearches.set(searchKey, searchPromise)
    
    try {
      // Perform the search
      const result = await searchPromise
      
      // Cache the result
      searchCache.set(searchKey, {
        timestamp: Date.now(),
        result: result
      })
      
      console.log(`✅ Request ${requestId}: === SEARCH COMPLETED ===`)
      return NextResponse.json(result)
    } finally {
      // Remove from ongoing searches
      ongoingSearches.delete(searchKey)
    }
    
  } catch (error) {
    console.error(`❌ Request ${requestId}: Search API error:`, error.message)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    )
  }
}

// Extract search logic into separate function
async function performSearch(requestId, validatedData, db) {
  // Get city names for logging
  const [fromCity, toCity] = await Promise.all([
    City.findById(db, validatedData.fromCityId),
    City.findById(db, validatedData.toCityId)
  ])
  
  console.log(`🏙️ Request ${requestId}: ${fromCity?.names?.en} → ${toCity?.names?.en}`)
  
  // Create search record
  const searchData = {
    fromCityId: validatedData.fromCityId,
    toCityId: validatedData.toCityId,
    departureDate: new Date(validatedData.departureDate),
    returnDate: validatedData.returnDate ? new Date(validatedData.returnDate) : undefined,
    type: validatedData.tripType
  }
  
  const search = await Search.create(db, searchData)
  console.log(`💾 Request ${requestId}: Search ID: ${search.id}`)
  
  // Find internal routes (should be minimal/none for external API model)
  const internalOutboundRoutes = await findInternalRoutes(
    db, 
    validatedData.fromCityId, 
    validatedData.toCityId, 
    new Date(validatedData.departureDate)
  )

  let internalReturnRoutes = []
  if (validatedData.tripType === 'return' && validatedData.returnDate) {
    internalReturnRoutes = await findInternalRoutes(
      db,
      validatedData.toCityId,
      validatedData.fromCityId,
      new Date(validatedData.returnDate)
    )
  }

  // Search external APIs
  console.log(`🌐 Request ${requestId}: Searching external providers...`)
  const externalOutboundRoutes = await searchExternalAPIs(
    validatedData.fromCityId,
    validatedData.toCityId,
    new Date(validatedData.departureDate),
    requestId
  )

  let externalReturnRoutes = []
  if (validatedData.tripType === 'return' && validatedData.returnDate) {
    externalReturnRoutes = await searchExternalAPIs(
      validatedData.toCityId,
      validatedData.fromCityId,
      new Date(validatedData.returnDate),
      requestId
    )
  }

  // Combine internal and external routes
  const allOutboundRoutes = [...internalOutboundRoutes, ...externalOutboundRoutes]
  const allReturnRoutes = [...internalReturnRoutes, ...externalReturnRoutes]

  console.log(`✅ Request ${requestId}: Total routes found: ${allOutboundRoutes.length} outbound, ${allReturnRoutes.length} return`)

  // Log all generated route IDs to check for duplicates
  const outboundIds = allOutboundRoutes.map(r => r.id)
  const duplicateOutbound = outboundIds.filter((id, index) => outboundIds.indexOf(id) !== index)
  if (duplicateOutbound.length > 0) {
    console.log(`⚠️ Request ${requestId}: Duplicate outbound route IDs detected:`, duplicateOutbound)
  }

  // Save external routes to database for later retrieval
  if (allOutboundRoutes.length > 0) {
    await saveRoutesToDatabase(db, search.id, allOutboundRoutes, 'there')
  }
  if (allReturnRoutes.length > 0) {
    await saveRoutesToDatabase(db, search.id, allReturnRoutes, 'back')
  }

  // Get enriched routes
  const enrichedOutboundRoutes = await enrichRoutesWithDetails(db, allOutboundRoutes)
  const enrichedReturnRoutes = await enrichRoutesWithDetails(db, allReturnRoutes)
  
  const response = {
    searchId: search.id,
    routes: {
      outbound: enrichedOutboundRoutes,
      return: enrichedReturnRoutes
    },
    search: {
      fromCityId: validatedData.fromCityId,
      toCityId: validatedData.toCityId,
      departureDate: validatedData.departureDate,
      returnDate: validatedData.returnDate,
      type: validatedData.tripType
    }
  }
  
  console.log(`📤 Request ${requestId}: Response: ${response.routes.outbound.length} outbound routes`)
  return response
}

// Save routes to database
async function saveRoutesToDatabase(db, searchId, routes, direction) {
  console.log(`💾 Saving ${routes.length} ${direction} routes to database`)
  
  if (routes.length === 0) {
    console.log('⚠️ No routes to save')
    return
  }

  const routesToSave = routes.map(route => ({
    ...route,
    searchId,
    direction,
    createdAt: new Date()
  }))

  try {
    // Try bulk insert first
    await db.collection('routes').insertMany(routesToSave, { ordered: false })
    console.log(`✅ Saved ${routesToSave.length} routes`)
  } catch (error) {
    if (error.code === 11000) {
      console.log('⚠️ Duplicate key error detected, trying individual inserts...')
      let successCount = 0
      for (const route of routesToSave) {
        try {
          await db.collection('routes').insertOne(route)
          successCount++
        } catch (individualError) {
          if (individualError.code !== 11000) {
            console.error(`❌ Failed to save individual route:`, individualError.message)
          }
          // Skip duplicates silently
        }
      }
      console.log(`✅ Saved ${successCount} out of ${routesToSave.length} routes (${routesToSave.length - successCount} duplicates skipped)`)
    } else {
      console.error('❌ Error saving routes to database:', error.message)
      throw error
    }
  }
}

// Search external APIs (FlixBus, BlaBlaCar, etc.)
async function searchExternalAPIs(fromCityId, toCityId, departureDate, requestId) {
  const allRoutes = []
  
  // FlixBus Search
  try {
    const flixbusFromId = getFlixBusCityId(fromCityId)
    const flixbusToId = getFlixBusCityId(toCityId)
    
    if (flixbusFromId && flixbusToId) {
      console.log(`🚌 Request ${requestId}: FlixBus: ${flixbusFromId} → ${flixbusToId}`)
      const flixbusRoutes = await flixBusAPI.searchRoutes(
        flixbusFromId,
        flixbusToId,
        departureDate
      )
      allRoutes.push(...flixbusRoutes)
      console.log(`✅ Request ${requestId}: FlixBus: ${flixbusRoutes.length} routes`)
    } else {
      console.log(`⚠️ Request ${requestId}: FlixBus: No city mapping`)
    }
  } catch (error) {
    console.error(`❌ Request ${requestId}: FlixBus error:`, error.message)
  }
  
  // BlaBlaCar Search
  try {
    const blablacarFromId = getBlaBlaCityCityId(fromCityId)
    const blablacarToId = getBlaBlaCityCityId(toCityId)
    
    if (blablacarFromId && blablacarToId) {
      console.log(`🚗 Request ${requestId}: BlaBlaCar: ${blablacarFromId} → ${blablacarToId}`)
      const blablacarRoutes = await blaBlaCarsAPI.searchRoutes(
        blablacarFromId,
        blablacarToId,
        departureDate
      )
      allRoutes.push(...blablacarRoutes)
      console.log(`✅ Request ${requestId}: BlaBlaCar: ${blablacarRoutes.length} routes`)
    } else {
      console.log(`⚠️ Request ${requestId}: BlaBlaCar: No city mapping`)
    }
  } catch (error) {
    console.error(`❌ Request ${requestId}: BlaBlaCar error:`, error.message)
  }
  
  // Mock Provider (temporary - until real APIs are working)
  try {
    console.log(`🚌 Request ${requestId}: Mock Provider (temporary)`)
    const mockRoutes = await mockBusAPI.searchRoutes(
      fromCityId,
      toCityId,
      departureDate,
      'EUR'
    )
    
    // Log the generated route IDs to verify uniqueness
    console.log(`🔍 Request ${requestId}: Mock route IDs:`, mockRoutes.map(r => r.id))
    
    allRoutes.push(...mockRoutes)
    console.log(`✅ Request ${requestId}: Mock Provider: ${mockRoutes.length} routes`)
  } catch (error) {
    console.error(`❌ Request ${requestId}: Mock Provider error:`, error.message)
  }
  
  // TODO: Add Ecolines, Student Agency, etc. when credentials are updated
  
  return allRoutes
}

// Helper function to find internal routes (kept for potential internal routes)
async function findInternalRoutes(db, fromCityId, toCityId, departureDate) {
  console.log(`🔍 findInternalRoutes called:`)
  console.log(`   - fromCityId: ${fromCityId}`)
  console.log(`   - toCityId: ${toCityId}`)
  console.log(`   - departureDate: ${departureDate}`)
  
  try {
    const routesCollection = db.collection('routes')
    const totalRoutes = await routesCollection.countDocuments()
    console.log(`📊 Total internal routes in database: ${totalRoutes}`)
    
    if (totalRoutes === 0) {
      console.log('ℹ️ No internal routes in database (expected for external API model)')
      return []
    }
    
    // Look for routes matching the criteria
    const query = {
      fromCityId: fromCityId,
      toCityId: toCityId
    }
    console.log(`🔎 Searching internal routes with query:`, JSON.stringify(query, null, 2))
    
    const matchingRoutes = await routesCollection.find(query).toArray()
    console.log(`📊 Internal routes matching cities: ${matchingRoutes.length}`)
    
    return matchingRoutes
    
  } catch (error) {
    console.error('❌ Error in findInternalRoutes:', error)
    return []
  }
}

// Helper function to enrich routes with city and carrier details
async function enrichRoutesWithDetails(db, routes) {
  console.log(`🏷️ Enriching ${routes.length} routes with details...`)
  
  if (!routes || routes.length === 0) return []
  
  const enrichedRoutes = []
  
  for (const route of routes) {
    try {
      // For external routes, we need to map back to our city IDs
      let fromCityId = route.fromCityId
      let toCityId = route.toCityId
      
      // If these are FlixBus routes, we need to map FlixBus city IDs back to our IDs
      if (route.provider === 'flixbus') {
        // For now, we'll use the original city IDs from the search
        // In the future, we should implement reverse mapping
      }
      
      const [fromCity, toCity, carrier] = await Promise.all([
        City.findById(db, fromCityId),
        City.findById(db, toCityId),
        route.carrierId ? Carrier.findByCode(db, route.carrierId) : null
      ])
      
      enrichedRoutes.push({
        ...route,
        fromCity,
        toCity,
        carrier: carrier || {
          code: route.carrierId || route.provider,
          name: route.provider === 'flixbus' ? 'FlixBus' : route.carrierId
        }
      })
    } catch (error) {
      console.error('❌ Error enriching route:', error)
      // Include route even if enrichment fails
      enrichedRoutes.push(route)
    }
  }
  
  console.log(`✅ Successfully enriched ${enrichedRoutes.length} routes`)
  return enrichedRoutes
} 