import { NextResponse } from 'next/server'
import clientPromise from '@/lib/db'
import { Route } from '@/lib/models/Route'

export async function GET(request, { params }) {
  try {
    const { searchId } = await params
    const client = await clientPromise
    const db = client.db('eurotours')

    // Get external search status (simulated for now)
    const externalSearches = [
      { provider: 'flixbus', status: 'completed' },
      { provider: 'blablacar', status: 'completed' },
      { provider: 'ecolines', status: 'completed' }
    ]

    // Get new routes that haven't been shown yet
    const newRoutes = await Route.findNewExternalRoutes(db, searchId)

    // Mark routes as shown
    if (newRoutes.length > 0) {
      const routeIds = newRoutes.map(r => r.id)
      await Route.markAsShown(db, routeIds)
    }

    // Count processing providers (simulated)
    const processing = externalSearches.filter(s => s.status === 'processing').length

    return NextResponse.json({
      processing,
      routes: newRoutes,
      externalSearches
    })

  } catch (error) {
    console.error('Error fetching external results:', error)
    return NextResponse.json(
      { error: 'Failed to fetch external results' },
      { status: 500 }
    )
  }
} 