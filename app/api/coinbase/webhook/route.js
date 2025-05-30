import { NextResponse } from 'next/server'
import { coinbaseCommerceAPI } from '@/lib/services/coinbase-commerce'

export async function POST(request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-cc-webhook-signature')
    
    if (!signature) {
      console.error('❌ Missing Coinbase Commerce webhook signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }
    
    if (!process.env.COINBASE_COMMERCE_WEBHOOK_SECRET) {
      console.error('❌ Missing COINBASE_COMMERCE_WEBHOOK_SECRET environment variable')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    
    console.log('📥 Coinbase Commerce webhook received')
    
    // Verify webhook signature
    const event = await coinbaseCommerceAPI.verifyWebhook(
      rawBody, 
      signature, 
      process.env.COINBASE_COMMERCE_WEBHOOK_SECRET
    )
    
    console.log('✅ Verified Coinbase Commerce webhook:', {
      type: event.type,
      id: event.id,
      chargeId: event.data?.id
    })
    
    // Handle different event types
    switch (event.type) {
      case 'charge:created':
        console.log('💳 Charge created:', event.data.id)
        // TODO: Update order status to 'pending'
        break
        
      case 'charge:confirmed':
        console.log('✅ Payment confirmed:', event.data.id)
        // TODO: Update order status to 'paid' and fulfill order
        await handlePaymentConfirmed(event.data)
        break
        
      case 'charge:failed':
        console.log('❌ Payment failed:', event.data.id)
        // TODO: Update order status to 'failed'
        break
        
      case 'charge:delayed':
        console.log('⏳ Payment delayed:', event.data.id)
        // TODO: Update order status to 'partially_paid'
        break
        
      case 'charge:pending':
        console.log('⏸️ Payment pending:', event.data.id)
        // TODO: Update order status to 'pending'
        break
        
      case 'charge:resolved':
        console.log('✅ Payment resolved:', event.data.id)
        // TODO: Update order status to 'paid'
        await handlePaymentConfirmed(event.data)
        break
        
      default:
        console.log('ℹ️ Unhandled Coinbase Commerce event type:', event.type)
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('❌ Coinbase Commerce webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentConfirmed(chargeData) {
  try {
    const orderId = chargeData.metadata?.order_id
    
    if (!orderId) {
      console.error('❌ No order ID found in charge metadata')
      return
    }
    
    console.log(`✅ Processing confirmed payment for order: ${orderId}`)
    
    // TODO: Update order in database to 'paid' status
    // TODO: Send confirmation email to customer
    // TODO: Trigger any post-payment workflows
    
    console.log(`✅ Order ${orderId} payment confirmed via Coinbase Commerce`)
    
  } catch (error) {
    console.error('❌ Error handling confirmed payment:', error)
  }
} 