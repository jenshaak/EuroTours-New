import { NextResponse } from 'next/server'
import { z } from 'zod'

const CreateChargeSchema = z.object({
  orderId: z.string(),
  amount: z.number().positive(),
  currency: z.string().default('USDC'),
  description: z.string().optional(),
  customerEmail: z.string().email()
})

export async function POST(request) {
  try {
    const body = await request.json()
    console.log('📥 OnchainKit create charge request:', body)
    
    // Validate request data
    const validatedData = CreateChargeSchema.parse(body)
    
    if (!process.env.COINBASE_COMMERCE_API_KEY) {
      throw new Error('Coinbase Commerce API key not configured')
    }

    // Create charge using OnchainKit approach (standard Coinbase Commerce API)
    const url = 'https://api.commerce.coinbase.com/charges'
    
    const metadata = {
      order_id: validatedData.orderId,
      customer_email: validatedData.customerEmail,
      service: 'eurotours'
    }

    const requestBody = {
      local_price: {
        amount: validatedData.amount.toString(),
        currency: validatedData.currency
      },
      pricing_type: 'fixed_price',
      name: `EuroTours Bus Ticket - Order ${validatedData.orderId}`,
      description: validatedData.description || `Bus ticket payment for order ${validatedData.orderId}`,
      metadata
    }

    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': process.env.COINBASE_COMMERCE_API_KEY,
      },
      body: JSON.stringify(requestBody),
    }

    console.log('🟡 Creating OnchainKit charge...')
    const response = await fetch(url, payload)
    const result = await response.json()

    if (!response.ok) {
      console.error('❌ OnchainKit charge creation failed:', result)
      throw new Error(result.error?.message || 'Failed to create charge')
    }

    console.log('✅ OnchainKit charge created successfully:', {
      id: result.data.id,
      hosted_url: result.data.hosted_url
    })

    return NextResponse.json({
      success: true,
      charge: {
        id: result.data.id,
        hosted_url: result.data.hosted_url,
        code: result.data.code,
        status: 'pending',
        amount: result.data.pricing.local.amount,
        currency: result.data.pricing.local.currency,
        created_at: result.data.created_at,
        expires_at: result.data.expires_at
      }
    })

  } catch (error) {
    console.error('❌ OnchainKit charge creation error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data', 
          details: error.errors 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create OnchainKit charge'
      },
      { status: 500 }
    )
  }
} 