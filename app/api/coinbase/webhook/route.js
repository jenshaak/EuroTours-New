import { NextResponse } from 'next/server'
import { coinbaseCommerceAPI } from '@/lib/services/coinbase-commerce'
import clientPromise from '@/lib/db'
import { Order } from '@/lib/models/Order'
import { Route } from '@/lib/models/Route'

export async function POST(request) {
  try {
    console.log('📥 Coinbase Commerce webhook received')
    
    const rawBody = await request.text()
    const signature = request.headers.get('x-cc-webhook-signature')
    
    if (!signature) {
      console.error('❌ Missing Coinbase Commerce webhook signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }
    
    console.log('Webhook signature present:', !!signature)
    console.log('Body length:', rawBody.length)
    
    // Parse the webhook body
    let event
    try {
      event = JSON.parse(rawBody)
      console.log('✅ Webhook parsed successfully:', {
        type: event.type,
        id: event.id,
        chargeId: event.data?.id
      })
    } catch (parseError) {
      console.error('❌ Failed to parse webhook body:', parseError)
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    // Handle different event types
    switch (event.type) {
      case 'charge:created':
        console.log('💳 Charge created:', event.data.id)
        await handleChargeCreated(event.data)
        break
        
      case 'charge:confirmed':
        console.log('✅ Payment confirmed:', event.data.id)
        await handlePaymentConfirmed(event.data)
        break
        
      case 'charge:failed':
        console.log('❌ Payment failed:', event.data.id)
        await handlePaymentFailed(event.data)
        break
        
      case 'charge:delayed':
        console.log('⏳ Payment delayed:', event.data.id)
        await handlePaymentDelayed(event.data)
        break
        
      case 'charge:pending':
        console.log('⏸️ Payment pending:', event.data.id)
        await handlePaymentPending(event.data)
        break
        
      case 'charge:resolved':
        console.log('✅ Payment resolved:', event.data.id)
        await handlePaymentConfirmed(event.data)
        break
        
      default:
        console.log('ℹ️ Unhandled Coinbase Commerce event type:', event.type)
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Webhook processed successfully',
      eventType: event.type,
      chargeId: event.data?.id,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Coinbase Commerce webhook error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Coinbase webhook endpoint is active',
    timestamp: new Date().toISOString(),
    status: 'operational'
  })
}

async function handleChargeCreated(chargeData) {
  try {
    const orderId = chargeData.metadata?.order_id
    console.log(`💳 Processing charge created for order: ${orderId}`)
    
    if (!orderId) {
      console.error('❌ No order ID found in charge metadata')
      return
    }

    const client = await clientPromise
    const db = client.db('eurotours')
    
    // Update order with payment ID
    await Order.updateStatus(db, orderId, 'pending', chargeData.id)
    console.log(`✅ Order ${orderId} updated with Coinbase charge ID: ${chargeData.id}`)
    
  } catch (error) {
    console.error('❌ Error handling charge created:', error)
  }
}

async function handlePaymentConfirmed(chargeData) {
  try {
    const orderId = chargeData.metadata?.order_id
    const customerEmail = chargeData.metadata?.customer_email
    
    if (!orderId) {
      console.error('❌ No order ID found in charge metadata')
      return
    }
    
    console.log(`✅ Processing confirmed payment for order: ${orderId}`)
    
    const client = await clientPromise
    const db = client.db('eurotours')
    
    // Update order status to paid
    await Order.updateStatus(db, orderId, 'paid', chargeData.id)
    console.log(`✅ Order ${orderId} status updated to 'paid'`)
    
    // Send confirmation email using the same endpoint as card payments
    try {
      console.log('📧 Sending confirmation email via API...')
      const emailResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/orders/${orderId}/send-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (emailResponse.ok) {
        const emailResult = await emailResponse.json()
        console.log('✅ Confirmation email sent successfully:', emailResult)
      } else {
        const emailError = await emailResponse.text()
        console.error('❌ Failed to send confirmation email:', emailError)
      }
    } catch (emailError) {
      console.error('❌ Error sending confirmation email:', emailError)
      // Don't throw here - the payment is still successful even if email fails
    }
    
    console.log(`🎉 Order ${orderId} Coinbase Commerce payment confirmed and processed successfully!`)
    
  } catch (error) {
    console.error('❌ Error handling confirmed payment:', error)
  }
}

async function handlePaymentFailed(chargeData) {
  try {
    const orderId = chargeData.metadata?.order_id
    
    if (!orderId) {
      console.error('❌ No order ID found in charge metadata')
      return
    }
    
    console.log(`❌ Processing failed payment for order: ${orderId}`)
    
    const client = await clientPromise
    const db = client.db('eurotours')
    
    // Update order status to failed
    await Order.updateStatus(db, orderId, 'failed', chargeData.id)
    console.log(`❌ Order ${orderId} status updated to 'failed'`)
    
    // TODO: Optionally notify customer of payment failure via email
    
  } catch (error) {
    console.error('❌ Error handling failed payment:', error)
  }
}

async function handlePaymentDelayed(chargeData) {
  try {
    const orderId = chargeData.metadata?.order_id
    
    if (!orderId) {
      console.error('❌ No order ID found in charge metadata')
      return
    }
    
    console.log(`⏳ Processing delayed payment for order: ${orderId}`)
    
    const client = await clientPromise
    const db = client.db('eurotours')
    
    // Keep as pending but log the delay
    await Order.updateStatus(db, orderId, 'pending', chargeData.id)
    console.log(`⏳ Order ${orderId} remains pending due to delayed payment`)
    
    // TODO: Optionally notify customer about payment delay
    
  } catch (error) {
    console.error('❌ Error handling delayed payment:', error)
  }
}

async function handlePaymentPending(chargeData) {
  try {
    const orderId = chargeData.metadata?.order_id
    
    if (!orderId) {
      console.error('❌ No order ID found in charge metadata')
      return
    }
    
    console.log(`⏸️ Processing pending payment for order: ${orderId}`)
    
    const client = await clientPromise
    const db = client.db('eurotours')
    
    // Update order status to pending
    await Order.updateStatus(db, orderId, 'pending', chargeData.id)
    console.log(`⏸️ Order ${orderId} status updated to 'pending'`)
    
  } catch (error) {
    console.error('❌ Error handling pending payment:', error)
  }
} 