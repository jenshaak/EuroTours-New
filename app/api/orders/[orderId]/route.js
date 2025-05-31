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
    
    console.log('✅ Order found:', JSON.stringify(order, null, 2))
    return NextResponse.json(order)
    
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