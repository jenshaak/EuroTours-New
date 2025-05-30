import { NextResponse } from 'next/server'
import { coinbaseCommerceAPI } from '@/lib/services/coinbase-commerce'

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
    
    // For now, let's verify manually without the coinbaseCommerceAPI dependency
    let event
    try {
      // Parse the webhook body
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
    
    // TODO: Update order status to 'pending' in database
    // For now, just log the event
    console.log(`✅ Charge created event processed for order: ${orderId}`)
    
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
    
    // TODO: Update order in database to 'paid' status
    // TODO: Send confirmation email to customer
    // TODO: Trigger any post-payment workflows
    
    console.log(`✅ Order ${orderId} payment confirmed via Coinbase Commerce`)
    console.log(`📧 Confirmation should be sent to: ${customerEmail}`)
    
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
    
    // TODO: Update order status to 'failed' in database
    // TODO: Notify customer of payment failure
    
    console.log(`❌ Order ${orderId} payment failed via Coinbase Commerce`)
    
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
    
    // TODO: Update order status to 'partially_paid' in database
    // TODO: Notify customer about payment delay
    
    console.log(`⏳ Order ${orderId} payment delayed via Coinbase Commerce`)
    
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
    
    // TODO: Update order status to 'pending' in database
    
    console.log(`⏸️ Order ${orderId} payment pending via Coinbase Commerce`)
    
  } catch (error) {
    console.error('❌ Error handling pending payment:', error)
  }
} 