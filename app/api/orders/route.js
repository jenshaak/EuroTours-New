import { NextResponse } from 'next/server'
import { z } from 'zod'
import { randomUUID } from 'crypto'

// Validation schema for order creation
const OrderRequestSchema = z.object({
  routeId: z.string(),
  passenger: z.object({
    fullName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    dateOfBirth: z.string().optional(),
    documentNumber: z.string().optional()
  }),
  paymentMethod: z.enum(['card', 'coinremitter', 'coinbase']),
  cryptoCurrency: z.string().optional(), // Required if paymentMethod is 'crypto'
  totalPrice: z.number().positive(),
  currency: z.string().default('EUR'),
  cryptoProvider: z.string().optional()
})

export async function POST(request) {
  try {
    const body = await request.json()
    console.log('📥 Order creation request:', body)
    
    // Validate request data
    const validatedData = OrderRequestSchema.parse(body)
    
    // Validate crypto currency if payment method is crypto
    if (validatedData.paymentMethod === 'crypto' && !validatedData.cryptoCurrency) {
      return NextResponse.json(
        { error: 'Cryptocurrency selection is required for crypto payments' },
        { status: 400 }
      )
    }
    
    // Generate order ID
    const orderId = randomUUID()
    
    // TODO: Save to database
    const order = {
      id: orderId,
      ...validatedData,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    
    console.log('✅ Order created:', order)
    
    // Handle payment method
    if (validatedData.paymentMethod === 'card') {
      // TODO: Integrate with actual WebPay
      const paymentUrl = `/payment/webpay/${orderId}`
      return NextResponse.json({
        ...order,
        paymentUrl
      })
    } else if (validatedData.paymentMethod === 'coinremitter') {
      // Create real crypto invoice using CoinRemitter
      try {
        const cryptoResponse = await fetch(`${request.nextUrl.origin}/api/crypto/create-invoice`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderId,
            amount: validatedData.totalPrice,
            currency: validatedData.currency === 'CZK' ? 'USD' : validatedData.currency, // Convert CZK to USD for crypto
            coin: validatedData.cryptoCurrency.toLowerCase(),
            description: `EuroTours Bus Ticket - ${validatedData.passenger.fullName}`
          })
        })
        
        const cryptoResult = await cryptoResponse.json()
        
        if (cryptoResponse.ok && cryptoResult.success) {
          return NextResponse.json({
            ...order,
            cryptoInvoice: cryptoResult.invoice
          })
        } else {
          // Handle specific crypto errors with helpful messages
          let errorMessage = 'Failed to create crypto payment'
          
          if (cryptoResult.suggestions) {
            const suggestions = cryptoResult.suggestions.join('\n• ')
            errorMessage = `${cryptoResult.error}\n\nSuggestions:\n• ${suggestions}`
          } else if (cryptoResult.message) {
            errorMessage = cryptoResult.message
          }
          
          return NextResponse.json(
            { 
              error: 'Crypto payment not available', 
              message: errorMessage,
              supportedCoins: cryptoResult.supportedCoins || ['TCN']
            },
            { status: 400 }
          )
        }
        
      } catch (cryptoError) {
        console.error('❌ Crypto invoice creation failed:', cryptoError)
        return NextResponse.json(
          { error: 'Failed to create crypto payment', message: cryptoError.message },
          { status: 500 }
        )
      }
    } else if (validatedData.paymentMethod === 'coinbase') {
      // Create Coinbase Commerce charge
      try {
        const successUrl = `${request.nextUrl.origin}/payment/success/${orderId}`
        
        const coinbaseResponse = await fetch(`${request.nextUrl.origin}/api/coinbase/create-charge`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderId,
            amount: validatedData.totalPrice,
            currency: validatedData.currency === 'CZK' ? 'USD' : validatedData.currency, // Convert CZK to USD
            description: `EuroTours Bus Ticket - ${validatedData.passenger.fullName}`,
            customerEmail: validatedData.passenger.email,
            redirectUrl: successUrl
          })
        })
        
        const coinbaseResult = await coinbaseResponse.json()
        
        if (coinbaseResponse.ok && coinbaseResult.success) {
          return NextResponse.json({
            ...order,
            coinbaseCharge: coinbaseResult.charge
          })
        } else {
          throw new Error(coinbaseResult.error || 'Failed to create Coinbase Commerce charge')
        }
      } catch (error) {
        console.error('❌ Coinbase Commerce error:', error)
        return NextResponse.json(
          { error: `Coinbase Commerce payment failed: ${error.message}` },
          { status: 500 }
        )
      }
    }
    
  } catch (error) {
    console.error('❌ Order creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
} 