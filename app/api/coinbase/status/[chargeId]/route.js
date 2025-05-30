import { NextResponse } from 'next/server'
import { coinbaseCommerceAPI } from '@/lib/services/coinbase-commerce'

export async function GET(request, { params }) {
  try {
    const { chargeId } = params
    
    if (!chargeId) {
      return NextResponse.json(
        { error: 'Charge ID is required' },
        { status: 400 }
      )
    }
    
    console.log(`📋 Checking Coinbase Commerce charge status: ${chargeId}`)
    
    // Get charge details from Coinbase Commerce
    const charge = await coinbaseCommerceAPI.getCharge(chargeId)
    
    console.log(`✅ Coinbase Commerce charge status: ${charge.status}`)
    
    return NextResponse.json({
      success: true,
      charge
    })
    
  } catch (error) {
    console.error('❌ Error checking Coinbase Commerce charge status:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to check charge status'
      },
      { status: 500 }
    )
  }
} 