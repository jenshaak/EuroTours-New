import { NextResponse } from 'next/server'
import { z } from 'zod'
import { coinbaseCommerceAPI } from '@/lib/services/coinbase-commerce'

const CreateChargeSchema = z.object({
  orderId: z.string(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  description: z.string().optional(),
  customerEmail: z.string().email(),
  redirectUrl: z.string().optional()
})

export async function POST(request) {
  try {
    const body = await request.json()
    console.log('📥 Create Coinbase Commerce charge request:', body)
    
    // Validate request data
    const validatedData = CreateChargeSchema.parse(body)
    
    // Create charge with Coinbase Commerce
    const result = await coinbaseCommerceAPI.createCharge({
      amount: validatedData.amount,
      currency: validatedData.currency,
      orderId: validatedData.orderId,
      description: validatedData.description,
      customerEmail: validatedData.customerEmail,
      redirectUrl: validatedData.redirectUrl
    })
    
    if (result.success) {
      console.log('✅ Coinbase Commerce charge created successfully')
      return NextResponse.json(result)
    } else {
      throw new Error('Failed to create Coinbase Commerce charge')
    }
    
  } catch (error) {
    console.error('❌ Coinbase Commerce charge creation error:', error)
    
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
        error: error.message || 'Failed to create Coinbase Commerce charge'
      },
      { status: 500 }
    )
  }
} 