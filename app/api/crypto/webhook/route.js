import { NextResponse } from 'next/server'
import { coinRemitterAPI } from '@/lib/services/coinremitter'

export async function POST(request) {
  try {
    const webhookData = await request.json()
    console.log('🔔 CoinRemitter webhook received:', webhookData)
    
    // Validate webhook (basic validation for now)
    if (!webhookData.invoice_id || !webhookData.order_id) {
      console.log('❌ Invalid webhook data')
      return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 })
    }
    
    const {
      invoice_id: invoiceId,
      order_id: orderId,
      status,
      coin,
      amount,
      paid_amount: paidAmount,
      confirmations,
      transaction_id: transactionId
    } = webhookData
    
    console.log(`💰 Payment update for Order ${orderId}:`)
    console.log(`   Invoice: ${invoiceId}`)
    console.log(`   Status: ${status}`)
    console.log(`   Coin: ${coin}`)
    console.log(`   Amount: ${amount}`)
    console.log(`   Paid: ${paidAmount}`)
    console.log(`   Confirmations: ${confirmations}`)
    
    // Map CoinRemitter status to our internal status
    const paymentStatus = coinRemitterAPI.mapStatus(status)
    
    // TODO: Update order status in database
    // const updatedOrder = await db.order.update({
    //   where: { id: orderId },
    //   data: {
    //     status: paymentStatus === 'paid' ? 'confirmed' : 'pending',
    //     payment: {
    //       update: {
    //         status: paymentStatus,
    //         paidAmount: paidAmount,
    //         confirmations: confirmations,
    //         transactionId: transactionId,
    //         updatedAt: new Date()
    //       }
    //     }
    //   }
    // })
    
    // Handle different payment statuses
    switch (paymentStatus) {
      case 'paid':
        console.log(`✅ Payment confirmed for order ${orderId}`)
        // TODO: Send confirmation email
        // TODO: Generate ticket
        // await sendOrderConfirmationEmail(orderId)
        // await generateTicket(orderId)
        break
        
      case 'partially_paid':
        console.log(`⚠️ Partial payment received for order ${orderId}`)
        // TODO: Send partial payment notification
        break
        
      case 'overpaid':
        console.log(`💰 Overpayment received for order ${orderId}`)
        // TODO: Handle overpayment (refund or credit)
        break
        
      case 'expired':
        console.log(`⏰ Payment expired for order ${orderId}`)
        // TODO: Mark order as expired
        break
        
      case 'cancelled':
        console.log(`❌ Payment cancelled for order ${orderId}`)
        // TODO: Mark order as cancelled
        break
        
      default:
        console.log(`🔄 Payment pending for order ${orderId}`)
        break
    }
    
    // Return success response to CoinRemitter
    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      orderId,
      status: paymentStatus
    })
    
  } catch (error) {
    console.error('❌ Webhook processing error:', error)
    
    // Return error response to CoinRemitter
    return NextResponse.json(
      { 
        error: 'Webhook processing failed',
        message: error.message 
      },
      { status: 500 }
    )
  }
}

// Handle GET requests (for webhook verification if needed)
export async function GET(request) {
  return NextResponse.json({
    message: 'CoinRemitter webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
} 