import { NextResponse } from 'next/server'
import { initializeCompleteDatabase } from '@/scripts/init-complete-db.js'

export async function POST() {
  try {
    await initializeCompleteDatabase()
    
    return NextResponse.json({
      success: true,
      message: 'Complete database with all cities initialized successfully'
    })
  } catch (error) {
    console.error('Complete database initialization error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to initialize complete database',
        details: error.message 
      },
      { status: 500 }
    )
  }
} 