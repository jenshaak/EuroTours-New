import { NextResponse } from 'next/server'
import { coinRemitterAPI } from '@/lib/services/coinremitter'
import clientPromise from '@/lib/db'
import { Order } from '@/lib/models/Order'

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
    
    // Handle different payment statuses
    switch (paymentStatus) {
      case 'paid':
        console.log(`✅ Payment confirmed for order ${orderId}`)
        await handlePaymentConfirmed(orderId, invoiceId, paidAmount, coin, transactionId)
        break
        
      case 'partially_paid':
        console.log(`⚠️ Partial payment received for order ${orderId}`)
        await handlePaymentPartial(orderId, paidAmount, amount, coin)
        break
        
      case 'overpaid':
        console.log(`💰 Overpayment received for order ${orderId}`)
        await handlePaymentConfirmed(orderId, invoiceId, paidAmount, coin, transactionId)
        break
        
      case 'expired':
        console.log(`⏰ Payment expired for order ${orderId}`)
        await handlePaymentExpired(orderId)
        break
        
      case 'cancelled':
        console.log(`❌ Payment cancelled for order ${orderId}`)
        await handlePaymentCancelled(orderId)
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

async function handlePaymentConfirmed(orderId, invoiceId, paidAmount, coin, transactionId) {
  try {
    console.log(`✅ Processing confirmed CoinRemitter payment for order: ${orderId}`)
    
    const client = await clientPromise
    const db = client.db('eurotours')
    
    // Update order status to paid
    await Order.updateStatus(db, orderId, 'paid', invoiceId)
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
    
    console.log(`🎉 Order ${orderId} CoinRemitter payment confirmed and processed successfully!`)
    
  } catch (error) {
    console.error('❌ Error handling confirmed CoinRemitter payment:', error)
  }
}

async function handlePaymentPartial(orderId, paidAmount, requiredAmount, coin) {
  try {
    console.log(`⚠️ Processing partial CoinRemitter payment for order: ${orderId}`)
    console.log(`   Paid: ${paidAmount} ${coin.toUpperCase()}`)
    console.log(`   Required: ${requiredAmount} ${coin.toUpperCase()}`)
    
    const client = await clientPromise
    const db = client.db('eurotours')
    
    // Update order status to partial payment
    await Order.updateStatus(db, orderId, 'partial_payment')
    console.log(`⚠️ Order ${orderId} status updated to 'partial_payment'`)
    
  } catch (error) {
    console.error('❌ Error handling partial CoinRemitter payment:', error)
  }
}

async function handlePaymentExpired(orderId) {
  try {
    console.log(`⏰ Processing expired CoinRemitter payment for order: ${orderId}`)
    
    const client = await clientPromise
    const db = client.db('eurotours')
    
    // Update order status to expired
    await Order.updateStatus(db, orderId, 'expired')
    console.log(`⏰ Order ${orderId} status updated to 'expired'`)
    
  } catch (error) {
    console.error('❌ Error handling expired CoinRemitter payment:', error)
  }
}

async function handlePaymentCancelled(orderId) {
  try {
    console.log(`❌ Processing cancelled CoinRemitter payment for order: ${orderId}`)
    
    const client = await clientPromise
    const db = client.db('eurotours')
    
    // Update order status to cancelled
    await Order.updateStatus(db, orderId, 'cancelled')
    console.log(`❌ Order ${orderId} status updated to 'cancelled'`)
    
  } catch (error) {
    console.error('❌ Error handling cancelled CoinRemitter payment:', error)
  }
}

// Handle GET requests (for webhook verification if needed)
export async function GET(request) {
  return NextResponse.json({
    message: 'CoinRemitter webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
} 