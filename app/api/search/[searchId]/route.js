import { NextResponse } from 'next/server'
import clientPromise from '@/lib/db'
import { Search } from '@/lib/models/Search'
import { Route } from '@/lib/models/Route'
import { City } from '@/lib/models/City'
import { Carrier } from '@/lib/models/Carrier'

export async function GET(request, { params }) {
  try {
    const { searchId } = await params
    const client = await clientPromise
    const db = client.db('eurotours')

    console.log(`🔍 Fetching search results for ID: ${searchId}`)

    // Find the search record
    const search = await Search.findById(db, searchId)
    if (!search) {
      console.log(`❌ Search ${searchId} not found`)
      return NextResponse.json(
        { error: 'Search not found' },
        { status: 404 }
      )
    }

    console.log(`✅ Found search: ${search.fromCityId} → ${search.toCityId}`)

    // Find routes for this search
    const routes = await Route.findBySearch(db, searchId)
    console.log(`📊 Found ${routes.length} total routes in database`)
    
    // Enrich routes with city and carrier details
    const enrichedRoutes = await enrichRoutesWithDetails(db, routes)
    
    // Separate outbound and return routes
    const outboundRoutes = enrichedRoutes.filter(route => route.direction === 'there')
    const returnRoutes = enrichedRoutes.filter(route => route.direction === 'back')

    console.log(`📤 Returning ${outboundRoutes.length} outbound, ${returnRoutes.length} return routes`)

    return NextResponse.json({
      searchId,
      outboundCount: outboundRoutes.length,
      returnCount: returnRoutes.length,
      search: {
        fromCityId: search.fromCityId,
        toCityId: search.toCityId,
        departureDate: search.departureDate.toISOString().split('T')[0],
        returnDate: search.returnDate ? search.returnDate.toISOString().split('T')[0] : null,
        type: search.type
      },
      routes: {
        outbound: outboundRoutes,
        return: returnRoutes
      }
    })

  } catch (error) {
    console.error('❌ Error fetching search results:', error)
    return NextResponse.json(
      { error: 'Failed to fetch search results' },
      { status: 500 }
    )
  }
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