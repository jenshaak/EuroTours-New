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

// Validation schema for search request
const SearchRequestSchema = z.object({
  fromCityId: z.number(),
  toCityId: z.number(),
  departureDate: z.string(),
  returnDate: z.string().optional(),
  tripType: z.enum(['one-way', 'return', 'return-open'])
})

export async function POST(request) {
  console.log('🔍 === SEARCH API CALLED ===')
  
  try {
    const client = await clientPromise
    const db = client.db('eurotours')
    
    const body = await request.json()
    console.log('📥 Request: Praha → London, June 5th')
    
    // Validate request data
    const validatedData = SearchRequestSchema.parse(body)
    
    // Get city names for logging
    const [fromCity, toCity] = await Promise.all([
      City.findById(db, validatedData.fromCityId),
      City.findById(db, validatedData.toCityId)
    ])
    
    console.log(`🏙️ ${fromCity?.names?.en} → ${toCity?.names?.en}`)
    
    // Create search record
    const searchData = {
      fromCityId: validatedData.fromCityId,
      toCityId: validatedData.toCityId,
      departureDate: new Date(validatedData.departureDate),
      returnDate: validatedData.returnDate ? new Date(validatedData.returnDate) : undefined,
      type: validatedData.tripType
    }
    
    const search = await Search.create(db, searchData)
    console.log(`💾 Search ID: ${search.id}`)
    
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
    console.log('🌐 Searching external providers...')
    const externalOutboundRoutes = await searchExternalAPIs(
      validatedData.fromCityId,
      validatedData.toCityId,
      new Date(validatedData.departureDate)
    )

    let externalReturnRoutes = []
    if (validatedData.tripType === 'return' && validatedData.returnDate) {
      externalReturnRoutes = await searchExternalAPIs(
        validatedData.toCityId,
        validatedData.fromCityId,
        new Date(validatedData.returnDate)
      )
    }

    // Combine internal and external routes
    const allOutboundRoutes = [...internalOutboundRoutes, ...externalOutboundRoutes]
    const allReturnRoutes = [...internalReturnRoutes, ...externalReturnRoutes]

    console.log(`✅ Total routes found: ${allOutboundRoutes.length} outbound, ${allReturnRoutes.length} return`)

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
    
    console.log(`📤 Response: ${response.routes.outbound.length} outbound routes`)
    console.log('✅ === SEARCH COMPLETED ===')
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('❌ Search API error:', error.message)
    
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
async function searchExternalAPIs(fromCityId, toCityId, departureDate) {
  const allRoutes = []
  
  // FlixBus Search
  try {
    const flixbusFromId = getFlixBusCityId(fromCityId)
    const flixbusToId = getFlixBusCityId(toCityId)
    
    if (flixbusFromId && flixbusToId) {
      console.log(`🚌 FlixBus: ${flixbusFromId} → ${flixbusToId}`)
      const flixbusRoutes = await flixBusAPI.searchRoutes(
        flixbusFromId,
        flixbusToId,
        departureDate
      )
      allRoutes.push(...flixbusRoutes)
      console.log(`✅ FlixBus: ${flixbusRoutes.length} routes`)
    } else {
      console.log('⚠️ FlixBus: No city mapping')
    }
  } catch (error) {
    console.error('❌ FlixBus error:', error.message)
  }
  
  // BlaBlaCar Search
  try {
    const blablacarFromId = getBlaBlaCityCityId(fromCityId)
    const blablacarToId = getBlaBlaCityCityId(toCityId)
    
    if (blablacarFromId && blablacarToId) {
      console.log(`🚗 BlaBlaCar: ${blablacarFromId} → ${blablacarToId}`)
      const blablacarRoutes = await blaBlaCarsAPI.searchRoutes(
        blablacarFromId,
        blablacarToId,
        departureDate
      )
      allRoutes.push(...blablacarRoutes)
      console.log(`✅ BlaBlaCar: ${blablacarRoutes.length} routes`)
    } else {
      console.log('⚠️ BlaBlaCar: No city mapping')
    }
  } catch (error) {
    console.error('❌ BlaBlaCar error:', error.message)
  }
  
  // Mock Provider (temporary - until real APIs are working)
  try {
    console.log('🚌 Mock Provider (temporary)')
    const mockRoutes = await mockBusAPI.searchRoutes(
      fromCityId,
      toCityId,
      departureDate,
      'EUR'
    )
    allRoutes.push(...mockRoutes)
    console.log(`✅ Mock Provider: ${mockRoutes.length} routes`)
  } catch (error) {
    console.error('❌ Mock Provider error:', error.message)
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