import { NextResponse } from 'next/server'
import { z } from 'zod'
import clientPromise from '@/lib/db'
import { Search } from '@/lib/models/Search'
import { Route } from '@/lib/models/Route'
import { City } from '@/lib/models/City'
import { Carrier } from '@/lib/models/Carrier'

// Validation schema for search request
const SearchRequestSchema = z.object({
  fromCityId: z.number(),
  toCityId: z.number(),
  departureDate: z.string(),
  returnDate: z.string().optional(),
  tripType: z.enum(['one-way', 'return', 'return-open'])
})

export async function POST(request) {
  try {
    const client = await clientPromise
    const db = client.db('eurotours')
    
    const body = await request.json()
    
    // Validate request data
    const validatedData = SearchRequestSchema.parse(body)
    
    // Create search record
    const searchData = {
      fromCityId: validatedData.fromCityId,
      toCityId: validatedData.toCityId,
      departureDate: new Date(validatedData.departureDate),
      returnDate: validatedData.returnDate ? new Date(validatedData.returnDate) : undefined,
      type: validatedData.tripType
    }
    
    const search = await Search.create(db, searchData)
    
    // Find internal routes for outbound journey
    const outboundRoutes = await findInternalRoutes(
      db, 
      validatedData.fromCityId, 
      validatedData.toCityId, 
      new Date(validatedData.departureDate)
    )
    
    let returnRoutes = []
    // Find return routes if it's a return trip
    if (validatedData.tripType === 'return' && validatedData.returnDate) {
      returnRoutes = await findInternalRoutes(
        db,
        validatedData.toCityId,
        validatedData.fromCityId,
        new Date(validatedData.returnDate)
      )
    }
    
    // Get city and carrier information for routes
    const enrichedOutboundRoutes = await enrichRoutesWithDetails(db, outboundRoutes)
    const enrichedReturnRoutes = await enrichRoutesWithDetails(db, returnRoutes)
    
    // TODO: Queue external searches in background
    // This would be implemented with a job queue system
    
    return NextResponse.json({
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
    })
    
  } catch (error) {
    console.error('Search error:', error)
    
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

// Helper function to find internal routes
async function findInternalRoutes(db, fromCityId, toCityId, departureDate) {
  // For now, return empty array since we don't have internal routes set up yet
  // In production, this would query the internal routes database
  return []
}

// Helper function to enrich routes with city and carrier details
async function enrichRoutesWithDetails(db, routes) {
  if (!routes || routes.length === 0) return []
  
  const enrichedRoutes = []
  
  for (const route of routes) {
    try {
      const [fromCity, toCity, carrier] = await Promise.all([
        City.findById(db, route.fromCityId),
        City.findById(db, route.toCityId),
        Carrier.findByCode(db, route.carrierId)
      ])
      
      enrichedRoutes.push({
        ...route,
        fromCity,
        toCity,
        carrier
      })
    } catch (error) {
      console.error('Error enriching route:', error)
      // Include route even if enrichment fails
      enrichedRoutes.push(route)
    }
  }
  
  return enrichedRoutes
} 