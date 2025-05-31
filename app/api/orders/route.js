import { NextResponse } from 'next/server'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import clientPromise from '@/lib/db'
import { Order } from '@/lib/models/Order'

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
  paymentMethod: z.enum(['card', 'coinremitter', 'coinbase', 'onchainkit']),
  cryptoCurrency: z.string().optional(), // Required if paymentMethod is 'crypto'
  totalPrice: z.number().positive(),
  currency: z.string().default('EUR'),
  cryptoProvider: z.string().optional()
})

export async function POST(request) {
  console.log('🚀 === ORDER CREATION API STARTED ===')
  
  try {
    console.log('📥 Reading request body...')
    const body = await request.json()
    console.log('📥 Order creation request received:', JSON.stringify(body, null, 2))
    
    console.log('✅ Validating request data...')
    const validatedData = OrderRequestSchema.parse(body)
    console.log('✅ Validation passed. Validated data:', JSON.stringify(validatedData, null, 2))
    
    // Validate crypto currency if payment method is crypto
    if (validatedData.paymentMethod === 'crypto' && !validatedData.cryptoCurrency) {
      console.log('❌ Validation failed: Crypto currency required for crypto payments')
      return NextResponse.json(
        { error: 'Cryptocurrency selection is required for crypto payments' },
        { status: 400 }
      )
    }
    
    console.log('🆔 Generating order ID...')
    const orderId = randomUUID()
    console.log('🆔 Generated order ID:', orderId)
    
    console.log('🔗 Connecting to database...')
    const client = await clientPromise
    const db = client.db('eurotours')
    console.log('✅ Database connection established')
    
    console.log('💾 Preparing order data for database...')
    const orderData = {
      id: orderId,
      routeId: validatedData.routeId,
      passenger: validatedData.passenger,
      paymentMethod: validatedData.paymentMethod,
      cryptoCurrency: validatedData.cryptoCurrency,
      totalPrice: validatedData.totalPrice,
      currency: validatedData.currency,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    console.log('💾 Order data prepared:', JSON.stringify(orderData, null, 2))
    
    console.log('💾 Creating order in database...')
    const order = await Order.create(db, orderData)
    console.log('✅ Order created in database successfully:', orderId)
    console.log('💾 Created order object:', JSON.stringify(order, null, 2))
    
    console.log('💳 Processing payment method:', validatedData.paymentMethod)
    
    // Handle payment method
    if (validatedData.paymentMethod === 'card') {
      console.log('💳 Processing card payment...')
      const paymentUrl = `/payment/webpay/${orderId}`
      console.log('💳 Card payment URL generated:', paymentUrl)
      return NextResponse.json({
        ...order,
        paymentUrl
      })
    } else if (validatedData.paymentMethod === 'coinremitter') {
      console.log('🪙 Processing CoinRemitter payment...')
      try {
        const testPrice = Math.max(0.01, validatedData.totalPrice / 100)
        console.log('🪙 CoinRemitter test price calculated:', testPrice)
        
        const cryptoRequestBody = {
          orderId: orderId,
          amount: testPrice,
          currency: validatedData.currency === 'CZK' ? 'USD' : validatedData.currency,
          coin: validatedData.cryptoCurrency.toLowerCase(),
          description: `EuroTours Bus Ticket - ${validatedData.passenger.fullName} (TEST)`
        }
        console.log('🪙 CoinRemitter request body:', JSON.stringify(cryptoRequestBody, null, 2))
        
        const cryptoResponse = await fetch(`${request.nextUrl.origin}/api/crypto/create-invoice`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cryptoRequestBody)
        })
        
        console.log('🪙 CoinRemitter API response status:', cryptoResponse.status)
        const cryptoResult = await cryptoResponse.json()
        console.log('🪙 CoinRemitter API response:', JSON.stringify(cryptoResult, null, 2))
        
        if (cryptoResponse.ok && cryptoResult.success) {
          console.log('✅ CoinRemitter payment created successfully')
          return NextResponse.json({
            ...order,
            testPrice,
            originalPrice: validatedData.totalPrice,
            cryptoInvoice: cryptoResult.invoice
          })
        } else {
          console.log('❌ CoinRemitter payment failed:', cryptoResult.error || 'Unknown error')
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
        console.error('❌ CoinRemitter invoice creation failed:', cryptoError)
        console.error('❌ CoinRemitter error stack:', cryptoError.stack)
        return NextResponse.json(
          { error: 'Failed to create crypto payment', message: cryptoError.message },
          { status: 500 }
        )
      }
    } else if (validatedData.paymentMethod === 'coinbase') {
      console.log('🟡 Processing Coinbase Commerce payment...')
      try {
        // Divide price by 1000 for testing (even smaller test amounts)
        const testPrice = Math.max(0.01, validatedData.totalPrice / 1000)
        console.log('🟡 Coinbase test price calculated:', testPrice)
        
        const successUrl = `${request.nextUrl.origin}/payment/success/${orderId}`
        console.log('🟡 Coinbase success URL:', successUrl)
        
        const coinbaseRequestBody = {
          orderId: orderId,
          amount: testPrice,
          currency: validatedData.currency === 'CZK' ? 'USD' : validatedData.currency,
          description: `EuroTours Bus Ticket - ${validatedData.passenger.fullName} (TEST)`,
          customerEmail: validatedData.passenger.email,
          redirectUrl: successUrl
        }
        console.log('🟡 Coinbase request body:', JSON.stringify(coinbaseRequestBody, null, 2))
        
        console.log('🟡 Making request to Coinbase API...')
        const coinbaseResponse = await fetch(`${request.nextUrl.origin}/api/coinbase/create-charge`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(coinbaseRequestBody)
        })
        
        console.log('🟡 Coinbase API response status:', coinbaseResponse.status)
        console.log('🟡 Coinbase API response headers:', Object.fromEntries(coinbaseResponse.headers.entries()))
        
        const coinbaseResult = await coinbaseResponse.json()
        console.log('🟡 Coinbase API response:', JSON.stringify(coinbaseResult, null, 2))
        
        if (coinbaseResponse.ok && coinbaseResult.success) {
          console.log('✅ Coinbase Commerce charge created successfully')
          console.log('✅ Coinbase charge details:', JSON.stringify(coinbaseResult.charge, null, 2))
          return NextResponse.json({
            ...order,
            testPrice,
            originalPrice: validatedData.totalPrice,
            coinbaseCharge: coinbaseResult.charge
          })
        } else {
          console.log('❌ Coinbase Commerce charge creation failed')
          console.log('❌ Coinbase error details:', coinbaseResult.error || 'Unknown error')
          throw new Error(coinbaseResult.error || 'Failed to create Coinbase Commerce charge')
        }
      } catch (error) {
        console.error('❌ Coinbase Commerce error:', error)
        console.error('❌ Coinbase error stack:', error.stack)
        return NextResponse.json(
          { error: `Coinbase Commerce payment failed: ${error.message}` },
          { status: 500 }
        )
      }
    } else if (validatedData.paymentMethod === 'onchainkit') {
      console.log('⛓️ Processing OnchainKit payment...')
      try {
        const testPrice = Math.max(0.01, validatedData.totalPrice / 100)
        console.log('⛓️ OnchainKit test price calculated:', testPrice)
        
        const onchainKitRequestBody = {
          orderId: orderId,
          amount: testPrice,
          currency: 'USDC',
          description: `EuroTours Bus Ticket - ${validatedData.passenger.fullName} (TEST)`,
          customerEmail: validatedData.passenger.email
        }
        console.log('⛓️ OnchainKit request body:', JSON.stringify(onchainKitRequestBody, null, 2))
        
        const onchainKitResponse = await fetch(`${request.nextUrl.origin}/api/onchainkit/create-charge`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(onchainKitRequestBody)
        })
        
        console.log('⛓️ OnchainKit API response status:', onchainKitResponse.status)
        const onchainKitResult = await onchainKitResponse.json()
        console.log('⛓️ OnchainKit API response:', JSON.stringify(onchainKitResult, null, 2))
        
        if (onchainKitResponse.ok && onchainKitResult.success) {
          console.log('✅ OnchainKit charge created successfully')
          return NextResponse.json({
            ...order,
            testPrice,
            originalPrice: validatedData.totalPrice,
            onchainKitCharge: onchainKitResult.charge
          })
        } else {
          console.log('❌ OnchainKit charge creation failed:', onchainKitResult.error || 'Unknown error')
          throw new Error(onchainKitResult.error || 'Failed to create OnchainKit charge')
        }
      } catch (error) {
        console.error('❌ OnchainKit error:', error)
        console.error('❌ OnchainKit error stack:', error.stack)
        return NextResponse.json(
          { error: `OnchainKit payment failed: ${error.message}` },
          { status: 500 }
        )
      }
    }
    
    console.log('❌ Unhandled payment method:', validatedData.paymentMethod)
    return NextResponse.json(
      { error: 'Invalid payment method' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('❌ === ORDER CREATION API ERROR ===')
    console.error('❌ Error type:', error.constructor.name)
    console.error('❌ Error message:', error.message)
    console.error('❌ Error stack:', error.stack)
    
    if (error instanceof z.ZodError) {
      console.error('❌ Zod validation errors:', JSON.stringify(error.errors, null, 2))
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create order', 
        message: error.message,
        type: error.constructor.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  } finally {
    console.log('🏁 === ORDER CREATION API COMPLETED ===')
  }
}

export async function GET() {
  console.log('ℹ️ Orders API GET endpoint called')
  return NextResponse.json({ 
    message: 'Orders API is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      POST: 'Create new order',
      GET: 'API status'
    }
  })
} 