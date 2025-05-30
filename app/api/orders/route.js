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
  paymentMethod: z.enum(['card', 'crypto']),
  totalPrice: z.number().positive(),
  currency: z.string()
})

export async function POST(request) {
  try {
    const body = await request.json()
    console.log('📥 Order creation request:', body)
    
    // Validate request data
    const validatedData = OrderRequestSchema.parse(body)
    
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
    
    // Mock payment URL generation
    if (validatedData.paymentMethod === 'card') {
      // TODO: Integrate with actual WebPay
      const paymentUrl = `/payment/webpay/${orderId}`
      return NextResponse.json({
        ...order,
        paymentUrl
      })
    } else if (validatedData.paymentMethod === 'crypto') {
      // TODO: Integrate with actual CoinRemitter
      return NextResponse.json(order)
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