import { NextResponse } from 'next/server'
import clientPromise from '@/lib/db'
import { Order } from '@/lib/models/Order'

export async function GET(request, { params }) {
  console.log('📋 === GET ORDER API STARTED ===')
  
  try {
    const { orderId } = params
    console.log('📋 Fetching order with ID:', orderId)
    
    if (!orderId) {
      console.log('❌ Missing order ID in request')
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }
    
    console.log('🔗 Connecting to database...')
    const client = await clientPromise
    const db = client.db('eurotours')
    console.log('✅ Database connection established')
    
    console.log('🔍 Searching for order in database...')
    const order = await Order.findById(db, orderId)
    
    if (!order) {
      console.log('❌ Order not found:', orderId)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
    
    console.log('✅ Order found, now fetching route details...')
    
    // Fetch route details and enrich with city information
    let routeDetails = null
    try {
      // First try to get route from routes collection
      const routesCollection = db.collection('routes')
      let route = await routesCollection.findOne({ id: order.routeId })
      
      if (route) {
        console.log('📍 Route found in database, fetching city details...')
        
        // Fetch city information
        const citiesCollection = db.collection('cities')
        const [fromCity, toCity] = await Promise.all([
          citiesCollection.findOne({ id: route.fromCityId }),
          citiesCollection.findOne({ id: route.toCityId })
        ])
        
        // Get carrier information
        const carriersCollection = db.collection('carriers')
        const carrier = await carriersCollection.findOne({ id: route.carrierId })
        
        routeDetails = {
          id: route.id,
          fromCity: fromCity || { id: route.fromCityId, names: { en: `City ${route.fromCityId}` } },
          toCity: toCity || { id: route.toCityId, names: { en: `City ${route.toCityId}` } },
          departureTime: route.departureTime,
          arrivalTime: route.arrivalTime,
          carrier: carrier || { id: route.carrierId, name: 'Bus Carrier' },
          isDirect: route.isDirect,
          availableSeats: route.availableSeats,
          duration: Math.round((new Date(route.arrivalTime) - new Date(route.departureTime)) / (1000 * 60))
        }
        
        console.log('✅ Route details enriched with city information')
      } else {
        console.log('⚠️ Route not found in database, using fallback data based on routeId')
        // Fallback for external or missing routes
        routeDetails = {
          id: order.routeId,
          fromCity: { names: { en: 'Departure City' } },
          toCity: { names: { en: 'Destination City' } },
          departureTime: new Date(),
          arrivalTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours later
          carrier: { name: 'Bus Carrier' },
          isDirect: true,
          duration: 480 // 8 hours in minutes
        }
      }
    } catch (routeError) {
      console.warn('⚠️ Error fetching route details:', routeError.message)
      // Continue without route details if there's an error
      routeDetails = null
    }
    
    const enrichedOrder = {
      ...order,
      route: routeDetails
    }
    
    console.log('✅ Order with route details prepared:', JSON.stringify(enrichedOrder, null, 2))
    return NextResponse.json(enrichedOrder)
    
  } catch (error) {
    console.error('❌ === GET ORDER API ERROR ===')
    console.error('❌ Error type:', error.constructor.name)
    console.error('❌ Error message:', error.message)
    console.error('❌ Error stack:', error.stack)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch order', 
        message: error.message,
        type: error.constructor.name
      },
      { status: 500 }
    )
  } finally {
    console.log('🏁 === GET ORDER API COMPLETED ===')
  }
} 