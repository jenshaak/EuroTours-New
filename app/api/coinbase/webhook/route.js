import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    console.log('📥 Coinbase Commerce webhook received - basic version')
    
    const rawBody = await request.text()
    const signature = request.headers.get('x-cc-webhook-signature')
    
    console.log('Webhook signature present:', !!signature)
    console.log('Body length:', rawBody.length)
    
    // Basic response for now to confirm the endpoint works
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook received',
      timestamp: new Date().toISOString(),
      hasSignature: !!signature,
      bodyLength: rawBody.length
    })
    
  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Coinbase webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
} 