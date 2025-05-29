const FLIXBUS_CONFIG = {
  searchUrl: "https://shop.flixbus.com/service/search/autocomplete/cities",
  publicSearchUrl: "https://shop.flixbus.com/service/v2/search",
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

export class FlixBusAPI {
  constructor() {
    this.config = FLIXBUS_CONFIG
  }

  async searchRoutes(fromCityId, toCityId, date, currency = 'EUR') {
    console.log('🚌 FlixBus: Searching routes...')
    console.log(`   From: ${fromCityId} → To: ${toCityId}`)
    console.log(`   Date: ${date}`)
    
    try {
      const departureDate = date.toISOString().split('T')[0] // YYYY-MM-DD format
      
      // Try the public search URL approach
      const params = new URLSearchParams({
        from_city_id: fromCityId,
        to_city_id: toCityId,
        departure_date: departureDate,
        currency: currency,
        locale: "en",
        adult: "1",
        _locale: "en"
      })
      
      const url = `${this.config.publicSearchUrl}?${params}`
      console.log('🔗 FlixBus public search URL:', url)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': this.config.userAgent,
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://shop.flixbus.com/',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
      
      console.log(`📡 FlixBus API response: ${response.status} ${response.statusText}`)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.log('❌ FlixBus API error response:', errorText)
        
        // If public API fails, return empty results instead of throwing
        console.log('⚠️ FlixBus API not accessible, returning empty results')
        return []
      }
      
      const data = await response.json()
      console.log('📥 FlixBus raw response keys:', Object.keys(data))
      
      // Transform FlixBus response to our route format
      const routes = this.transformRoutes(data)
      console.log(`✅ FlixBus: Found ${routes.length} routes`)
      
      return routes
      
    } catch (error) {
      console.error('❌ FlixBus API error:', error.message)
      // Return empty results instead of throwing to not break the search
      console.log('⚠️ FlixBus integration failed, returning empty results')
      return []
    }
  }

  transformRoutes(flixbusData) {
    // Try different possible response formats
    let trips = flixbusData.trips || flixbusData.results || flixbusData.data || []
    
    if (!Array.isArray(trips)) {
      console.log('⚠️ FlixBus: No trips array in response')
      console.log('Available keys:', Object.keys(flixbusData || {}))
      console.log('Sample data:', JSON.stringify(flixbusData, null, 2).substring(0, 500))
      return []
    }
    
    console.log(`🔄 FlixBus: Transforming ${trips.length} trips`)
    
    return trips.map((trip, index) => {
      try {
        return {
          id: `flixbus_${trip.uid || trip.id || index}`,
          carrierId: 'FB',
          fromCityId: trip.departure?.station?.city?.id || trip.from_city_id,
          toCityId: trip.arrival?.station?.city?.id || trip.to_city_id,
          departureTime: new Date(trip.departure?.date || trip.departure_datetime),
          arrivalTime: new Date(trip.arrival?.date || trip.arrival_datetime),
          price: trip.price?.total || trip.price?.amount || trip.price || 0,
          maxPrice: trip.price?.regular || trip.price?.amount || trip.price || 0,
          currency: trip.price?.currency || currency || 'EUR',
          isExternal: true,
          externalId: (trip.uid || trip.id || index).toString(),
          isDirect: !trip.transfers || trip.transfers.length === 0,
          availableSeats: trip.available_seats || trip.available || null,
          provider: 'flixbus'
        }
      } catch (err) {
        console.error('❌ Error transforming trip:', err.message)
        return null
      }
    }).filter(Boolean)
  }

  async getCities() {
    console.log('🏙️ FlixBus: Not fetching cities (using manual mappings)')
    return []
  }
}

export const flixBusAPI = new FlixBusAPI() 