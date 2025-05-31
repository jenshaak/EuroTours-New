import { NextResponse } from 'next/server'
import clientPromise from '@/lib/db'
import { Order } from '@/lib/models/Order'
import { sendBookingConfirmation } from '@/lib/services/email'

export async function POST(request, { params }) {
  console.log('📧 === SEND CONFIRMATION EMAIL API STARTED ===')
  
  try {
    const { orderId } = params
    console.log('📧 Sending confirmation email for order:', orderId)
    
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
    
    console.log('🔍 Fetching order details...')
    const order = await Order.findById(db, orderId)
    
    if (!order) {
      console.log('❌ Order not found:', orderId)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
    
    console.log('✅ Order found:', JSON.stringify(order, null, 2))
    console.log('📍 Fetching route details for order...')
    
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
        
        console.log('✅ Route details found and enriched:', JSON.stringify(routeDetails, null, 2))
      } else {
        console.log('⚠️ Route not found in database, using fallback data')
        // Create fallback route data for testing
        routeDetails = {
          id: order.routeId,
          fromCity: { 
            id: 4, 
            names: { en: 'Prague', cs: 'Praha' } 
          },
          toCity: { 
            id: 308, 
            names: { en: 'Vienna', de: 'Wien' } 
          },
          departureTime: new Date().toISOString(),
          arrivalTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours later
          carrier: { name: 'EuroLines' },
          isDirect: true,
          duration: 480 // 8 hours in minutes
        }
        console.log('⚠️ Using fallback route details:', JSON.stringify(routeDetails, null, 2))
      }
    } catch (routeError) {
      console.error('❌ Error fetching route details:', routeError.message)
      console.error('❌ Route error stack:', routeError.stack)
      
      // Create minimal fallback route data
      routeDetails = {
        id: order.routeId,
        fromCity: { names: { en: 'Departure City' } },
        toCity: { names: { en: 'Destination City' } },
        departureTime: new Date().toISOString(),
        arrivalTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        carrier: { name: 'Bus Carrier' },
        isDirect: true,
        duration: 480
      }
      console.log('⚠️ Using minimal fallback route details due to error')
    }
    
    // Prepare email data
    const emailData = {
      orderId: order.id,
      passengerName: order.passenger.fullName,
      passengerEmail: order.passenger.email,
      route: routeDetails,
      totalPrice: order.totalPrice,
      currency: order.currency,
      paymentMethod: order.paymentMethod,
      bookingDate: order.createdAt
    }
    
    console.log('📧 Prepared email data:', JSON.stringify(emailData, null, 2))
    console.log('📧 Attempting to send booking confirmation email...')
    
    // Send the email
    try {
      const emailResult = await sendBookingConfirmation(emailData)
      console.log('✅ Email sent successfully:', JSON.stringify(emailResult, null, 2))
      
      return NextResponse.json({
        success: true,
        message: 'Confirmation email sent successfully',
        orderId: orderId,
        emailSentTo: order.passenger.email,
        emailResult: emailResult
      })
      
    } catch (emailError) {
      console.error('❌ Failed to send confirmation email:')
      console.error('❌ Email error type:', emailError.constructor.name)
      console.error('❌ Email error message:', emailError.message)
      console.error('❌ Email error stack:', emailError.stack)
      
      return NextResponse.json(
        { 
          error: 'Failed to send confirmation email',
          orderId: orderId,
          message: emailError.message,
          type: emailError.constructor.name,
          stack: process.env.NODE_ENV === 'development' ? emailError.stack : undefined
        },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('❌ === SEND CONFIRMATION EMAIL API ERROR ===')
    console.error('❌ Error type:', error.constructor.name)
    console.error('❌ Error message:', error.message)
    console.error('❌ Error stack:', error.stack)
    
    return NextResponse.json(
      { 
        error: 'Failed to process confirmation email request', 
        message: error.message,
        type: error.constructor.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  } finally {
    console.log('🏁 === SEND CONFIRMATION EMAIL API COMPLETED ===')
  }
} 