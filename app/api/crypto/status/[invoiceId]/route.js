import { NextResponse } from 'next/server'
import { coinRemitterAPI } from '@/lib/services/coinremitter'

export async function GET(request, { params }) {
  try {
    const { invoiceId } = await params
    const url = new URL(request.url)
    const coin = url.searchParams.get('coin')
    
    if (!coin) {
      return NextResponse.json(
        { error: 'Coin parameter is required' },
        { status: 400 }
      )
    }
    
    console.log(`🔍 Checking payment status for invoice ${invoiceId} (${coin})`)
    
    // Get invoice details from CoinRemitter
    const invoice = await coinRemitterAPI.getInvoice(invoiceId, coin)
    
    const status = coinRemitterAPI.mapStatus(invoice.status)
    
    console.log(`📊 Invoice ${invoiceId} status: ${status}`)
    console.log(`💰 Paid amount: ${invoice.paidAmount} ${coin.toUpperCase()}`)
    console.log(`✅ Confirmations: ${invoice.confirmations}`)
    
    return NextResponse.json({
      invoiceId: invoice.invoiceId,
      orderId: invoice.orderId,
      status: status,
      paidAmount: invoice.paidAmount,
      requiredAmount: invoice.amount,
      confirmations: invoice.confirmations,
      coin: invoice.coin,
      address: invoice.address,
      expireTime: invoice.expireTime
    })
    
  } catch (error) {
    console.error('❌ Error checking payment status:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to check payment status',
        message: error.message 
      },
      { status: 500 }
    )
  }
} 