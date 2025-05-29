import { NextResponse } from 'next/server'
import clientPromise from '@/lib/db'
import { City } from '@/lib/models/City'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('eurotours')
    
    const cities = await City.getForSelect(db)
    
    return NextResponse.json(cities)
  } catch (error) {
    console.error('Error fetching cities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    )
  }
} 