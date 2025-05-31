import { NextResponse } from 'next/server'
import { emailService } from '@/lib/services/email'

export async function POST(request) {
  console.log('📧 === EMAIL TEST API STARTED ===')
  
  try {
    const body = await request.json()
    console.log('📧 Email test request:', JSON.stringify(body, null, 2))
    
    // Get email address from request or use default
    const testEmail = body.email || 'test@example.com'
    
    console.log('📧 Testing email service configuration...')
    
    // Check environment variables
    console.log('📧 Environment check:')
    console.log('📧 SMTP_HOST:', process.env.SMTP_HOST || 'Not set')
    console.log('📧 SMTP_PORT:', process.env.SMTP_PORT || 'Not set')
    console.log('📧 SMTP_USER exists:', !!process.env.SMTP_USER)
    console.log('📧 SMTP_PASSWORD exists:', !!process.env.SMTP_PASSWORD)
    console.log('📧 SMTP_FROM:', process.env.SMTP_FROM || 'Not set')
    
    // Create test order data
    const testOrder = {
      id: 'test-order-' + Date.now(),
      passenger: {
        fullName: body.fullName || 'Test User',
        email: testEmail,
        phone: body.phone || '+1234567890'
      },
      totalPrice: body.amount || 26,
      currency: 'EUR',
      paymentMethod: 'coinbase',
      status: 'paid'
    }
    
    // Create test route data
    const testRoute = {
      fromCity: 'Prague',
      toCity: 'London',
      departureTime: new Date('2024-12-15T08:00:00'),
      arrivalTime: new Date('2024-12-15T20:30:00'),
      carrier: 'FlixBus'
    }
    
    console.log('📧 Sending test email...')
    console.log('📧 Test order:', JSON.stringify(testOrder, null, 2))
    console.log('📧 Test route:', JSON.stringify(testRoute, null, 2))
    
    // Send test email
    const result = await emailService.sendOrderConfirmation(testOrder, testRoute)
    
    console.log('📧 Email test result:', JSON.stringify(result, null, 2))
    
    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      result,
      testData: {
        order: testOrder,
        route: testRoute
      },
      environmentStatus: {
        smtpHost: process.env.SMTP_HOST || 'Not configured',
        smtpPort: process.env.SMTP_PORT || 'Not configured',
        smtpUserConfigured: !!process.env.SMTP_USER,
        smtpPasswordConfigured: !!process.env.SMTP_PASSWORD,
        smtpFrom: process.env.SMTP_FROM || 'Not configured'
      }
    })
    
  } catch (error) {
    console.error('❌ === EMAIL TEST API ERROR ===')
    console.error('❌ Error type:', error.constructor.name)
    console.error('❌ Error message:', error.message)
    console.error('❌ Error stack:', error.stack)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      type: error.constructor.name,
      environmentStatus: {
        smtpHost: process.env.SMTP_HOST || 'Not configured',
        smtpPort: process.env.SMTP_PORT || 'Not configured',
        smtpUserConfigured: !!process.env.SMTP_USER,
        smtpPasswordConfigured: !!process.env.SMTP_PASSWORD,
        smtpFrom: process.env.SMTP_FROM || 'Not configured'
      }
    }, { status: 500 })
  } finally {
    console.log('🏁 === EMAIL TEST API COMPLETED ===')
  }
}

export async function GET() {
  console.log('ℹ️ Email test API GET endpoint called')
  return NextResponse.json({ 
    message: 'Email test API is running',
    usage: {
      POST: 'Send a test email',
      body: {
        email: 'recipient@example.com (optional)',
        fullName: 'Test User (optional)',
        phone: '+1234567890 (optional)',
        amount: '26 (optional)'
      }
    },
    timestamp: new Date().toISOString()
  })
} 