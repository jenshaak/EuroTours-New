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
  console.log('🟡 === COINBASE CREATE CHARGE API STARTED ===')
  
  try {
    console.log('📥 Reading request body...')
    const body = await request.json()
    console.log('📥 Coinbase create charge request received:', JSON.stringify(body, null, 2))
    
    console.log('✅ Validating request data...')
    const validatedData = CreateChargeSchema.parse(body)
    console.log('✅ Validation passed. Validated data:', JSON.stringify(validatedData, null, 2))
    
    console.log('🟡 Checking environment variables...')
    console.log('🟡 COINBASE_COMMERCE_API_KEY exists:', !!process.env.COINBASE_COMMERCE_API_KEY)
    console.log('🟡 COINBASE_COMMERCE_WEBHOOK_SECRET exists:', !!process.env.COINBASE_COMMERCE_WEBHOOK_SECRET)
    
    console.log('🟡 Preparing charge parameters...')
    const chargeParams = {
      amount: validatedData.amount,
      currency: validatedData.currency,
      orderId: validatedData.orderId,
      description: validatedData.description,
      customerEmail: validatedData.customerEmail,
      redirectUrl: validatedData.redirectUrl
    }
    console.log('🟡 Charge parameters:', JSON.stringify(chargeParams, null, 2))
    
    console.log('🟡 Calling coinbaseCommerceAPI.createCharge...')
    const result = await coinbaseCommerceAPI.createCharge(chargeParams)
    console.log('🟡 Coinbase Commerce API result:', JSON.stringify(result, null, 2))
    
    if (result.success) {
      console.log('✅ Coinbase Commerce charge created successfully')
      console.log('✅ Charge ID:', result.charge?.id)
      console.log('✅ Hosted URL:', result.charge?.hosted_url)
      return NextResponse.json(result)
    } else {
      console.log('❌ Coinbase Commerce charge creation failed in result')
      throw new Error('Failed to create Coinbase Commerce charge')
    }
    
  } catch (error) {
    console.error('❌ === COINBASE CREATE CHARGE API ERROR ===')
    console.error('❌ Error type:', error.constructor.name)
    console.error('❌ Error message:', error.message)
    console.error('❌ Error stack:', error.stack)
    
    if (error.name === 'ZodError') {
      console.error('❌ Zod validation errors:', JSON.stringify(error.errors, null, 2))
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
        error: error.message || 'Failed to create Coinbase Commerce charge',
        type: error.constructor.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  } finally {
    console.log('🏁 === COINBASE CREATE CHARGE API COMPLETED ===')
  }
} 