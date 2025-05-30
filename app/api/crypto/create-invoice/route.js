import { NextResponse } from 'next/server'
import { z } from 'zod'
import { coinRemitterAPI } from '@/lib/services/coinremitter'

const CreateInvoiceSchema = z.object({
  orderId: z.string(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  coin: z.string(), // btc, eth, ltc, etc.
  description: z.string().optional()
})

export async function POST(request) {
  try {
    const body = await request.json()
    console.log('📥 Create crypto invoice request:', body)
    
    // Validate request data
    const validatedData = CreateInvoiceSchema.parse(body)
    
    // Create webhook URL for payment notifications
    const webhookUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/crypto/webhook`
    
    try {
      // Create invoice with CoinRemitter
      const invoice = await coinRemitterAPI.createInvoice({
        amount: validatedData.amount / 10, // Divide by 10 for testing (TestCoin has 10 TCN max limit)
        currency: validatedData.currency,
        coin: validatedData.coin,
        orderId: validatedData.orderId,
        description: validatedData.description || `EuroTours Bus Ticket - Order ${validatedData.orderId}`,
        webhookUrl: webhookUrl,
        expireTime: 60 // 1 hour in minutes
      })
      
      console.log('✅ Crypto invoice created:', invoice)
      
      // TODO: Save invoice to database
      // const savedInvoice = await db.cryptoInvoice.create({
      //   data: {
      //     orderId: validatedData.orderId,
      //     invoiceId: invoice.invoiceId,
      //     coin: validatedData.coin,
      //     amount: invoice.amount,
      //     address: invoice.address,
      //     status: 'pending',
      //     expireTime: new Date(Date.now() + 3600 * 1000)
      //   }
      // })
      
      return NextResponse.json({
        success: true,
        invoice: {
          invoiceId: invoice.invoiceId,
          address: invoice.address,
          amount: invoice.amount,
          coin: validatedData.coin.toUpperCase(),
          qrCode: invoice.qrCode,
          url: invoice.url,
          expireTime: invoice.expireTime,
          totalAmount: invoice.totalAmount
        }
      })
      
    } catch (coinRemitterError) {
      console.error('❌ CoinRemitter API Error:', coinRemitterError)
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to create crypto payment'
      let suggestions = []
      
      if (coinRemitterError.message.includes('Invalid Coin / Token Symbol')) {
        errorMessage = `${validatedData.coin.toUpperCase()} is not supported by your CoinRemitter account`
        suggestions = [
          'Your TestCoin account may have limited cryptocurrency support',
          'Try using TCN (TestCoin) if available',
          'Consider upgrading to a premium CoinRemitter plan for full crypto support'
        ]
      }
      
      return NextResponse.json({
        success: false,
        error: errorMessage,
        suggestions: suggestions,
        supportedCoins: ['TCN'], // Based on TestCoin account limitations
        message: coinRemitterError.message
      }, { status: 400 })
    }
    
  } catch (error) {
    console.error('❌ Create crypto invoice error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create crypto invoice', 
        message: error.message 
      },
      { status: 500 }
    )
  }
} 