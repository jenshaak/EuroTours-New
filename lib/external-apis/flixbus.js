/**
 * FlixBus API Integration
 * 
 * This module provides integration with FlixBus API for fetching cities and searching routes.
 * FlixBus doesn't require API keys, but has specific user agent requirements.
 */

const FLIXBUS_CONFIG = {
  citiesUrl: "https://search.k8s.mfb.io/api/v1/cities",
  stationsUrl: "https://search.k8s.mfb.io/api/v1/stations", 
  searchUrl: "https://search.k8s.mfb.io/api/v2/search",
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
}

/**
 * Fetch all cities from FlixBus API
 */
export async function fetchFlixBusCities() {
  try {
    const response = await fetch(FLIXBUS_CONFIG.citiesUrl, {
      headers: {
        'User-Agent': FLIXBUS_CONFIG.userAgent,
        'Referer': 'https://shop.flixbus.cz/search'
      }
    })

    if (!response.ok) {
      throw new Error(`FlixBus cities API error: ${response.status}`)
    }

    const cities = await response.json()
    return cities.map(city => ({
      externalId: city.id,
      name: city.name,
      country: city.country_code,
      latitude: city.latitude,
      longitude: city.longitude,
      provider: 'flixbus'
    }))

  } catch (error) {
    console.error('FlixBus cities fetch error:', error)
    throw error
  }
}

/**
 * Search for routes on FlixBus
 */
export async function searchFlixBus(fromCityId, toCityId, date, currency = 'CZK') {
  try {
    const params = {
      from_city_id: fromCityId,
      to_city_id: toCityId,
      departure_date: date.toLocaleDateString("cs-CZ"),
      search_by: "cities",
      currency: currency,
      include_after_midnight_rides: 0,
      bike_slot: 0,
      _locale: "cs",
      products: JSON.stringify({ adult: 1 })
    }

    const url = `${FLIXBUS_CONFIG.searchUrl}?${new URLSearchParams(params)}`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': FLIXBUS_CONFIG.userAgent,
        'Referer': 'https://shop.flixbus.cz/search'
      }
    })

    if (!response.ok) {
      throw new Error(`FlixBus search API error: ${response.status}`)
    }

    const data = await response.json()
    
    return data.trips?.map(trip => ({
      externalId: trip.uid,
      fromCityId: parseInt(fromCityId),
      toCityId: parseInt(toCityId),
      departureTime: new Date(trip.departure.date),
      arrivalTime: new Date(trip.arrival.date),
      price: parseFloat(trip.price.total),
      currency: trip.price.currency,
      provider: 'flixbus',
      carrierId: 1, // FlixBus carrier ID
      isDirect: trip.transfers === 0,
      availableSeats: trip.available > 0 ? trip.available : null,
      transferCount: trip.transfers || 0
    })) || []

  } catch (error) {
    console.error('FlixBus search error:', error)
    throw error
  }
}

/**
 * Get FlixBus route details
 */
export async function getFlixBusRouteDetails(tripId) {
  try {
    // This would fetch detailed information about a specific trip
    // Implementation depends on FlixBus API endpoints
    console.log('Fetching FlixBus route details for:', tripId)
    return null
  } catch (error) {
    console.error('FlixBus route details error:', error)
    throw error
  }
}

/**
 * Helper function to map internal city IDs to FlixBus city IDs
 */
export function mapCityToFlixBus(internalCityId) {
  // This mapping would be stored in the database
  // For now, return a simple mapping
  const cityMapping = {
    1: 40, // Prague
    3: 88, // Berlin
    4: 73, // Munich
    5: 1, // Vienna
  }
  
  return cityMapping[internalCityId] || null
}

/**
 * Background job to sync FlixBus cities with internal database
 */
export async function syncFlixBusCities(db) {
  try {
    console.log('Starting FlixBus cities sync...')
    
    const flixbusCities = await fetchFlixBusCities()
    const externalCitiesCollection = db.collection('externalCities')
    
    // Clear existing FlixBus cities
    await externalCitiesCollection.deleteMany({ provider: 'flixbus' })
    
    // Insert new cities
    for (const city of flixbusCities) {
      // Try to match with internal cities based on name
      const citiesCollection = db.collection('cities')
      const matchedCity = await citiesCollection.findOne({
        $or: [
          { 'names.en': { $regex: city.name, $options: 'i' } },
          { 'names.cs': { $regex: city.name, $options: 'i' } },
          { 'variations': { $regex: city.name, $options: 'i' } }
        ]
      })

      if (matchedCity) {
        await externalCitiesCollection.insertOne({
          cityId: matchedCity.id,
          provider: 'flixbus',
          externalId: city.externalId,
          externalName: city.name,
          isProcessed: true,
          createdAt: new Date()
        })
      }
    }
    
    console.log(`FlixBus cities sync completed: ${flixbusCities.length} cities processed`)
    
  } catch (error) {
    console.error('FlixBus cities sync error:', error)
    throw error
  }
} 