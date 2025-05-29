const BLABLACAR_CONFIG = {
  url: "https://ims.blablacar.pro/cgi-bin/gtmapp/wapi/",
  login: "eurotours_v2_api",
  password: "x5Y22ex6sX3kFD", // Production
  testUrl: "https://ims-preprod.blablacar.pro/cgi-bin/gtmapp/wapi/",
  testPassword: "BkSNz6a2ky9e4H" // Test environment
}

export class BlaBlaCarsAPI {
  constructor(useTest = false) {
    this.config = BLABLACAR_CONFIG
    this.useTest = useTest
  }

  async searchRoutes(fromCityId, toCityId, date, currency = 'EUR') {
    try {
      // Step 1: Login to get session token
      const sessionToken = await this.login()
      if (!sessionToken) {
        throw new Error('Failed to get session token')
      }
      
      // Step 2: Search for trips
      const trips = await this.searchTrips(sessionToken, fromCityId, toCityId, date, currency)
      
      // Step 3: Transform to our format
      const routes = this.transformRoutes(trips)
      
      return routes
      
    } catch (error) {
      console.error('❌ BlaBlaCar API error:', error.message)
      // Return empty results instead of throwing to not break the search
      return []
    }
  }

  async login() {
    console.log('🔐 BlaBlaCar: Logging in...')
    
    const baseUrl = this.useTest ? this.config.testUrl : this.config.url
    const password = this.useTest ? this.config.testPassword : this.config.password
    
    try {
      const response = await fetch(`${baseUrl}login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          login: this.config.login,
          password: password
        })
      })
      
      console.log(`📡 BlaBlaCar login: ${response.status}`)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.log('❌ BlaBlaCar login error:', errorText)
        throw new Error(`Login failed: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('✅ BlaBlaCar login successful')
      
      return data.token || data.session || data.sessionId
      
    } catch (error) {
      console.error('❌ BlaBlaCar login error:', error.message)
      throw error
    }
  }

  async searchTrips(sessionToken, fromCityId, toCityId, date, currency) {
    const baseUrl = this.useTest ? this.config.testUrl : this.config.url
    const dateString = date.toISOString().split('T')[0] // YYYY-MM-DD
    
    try {
      const response = await fetch(`${baseUrl}trips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'session': sessionToken // BlaBlaCar uses session header
        },
        body: JSON.stringify({
          from: fromCityId,
          to: toCityId,
          when: dateString,
          currency: currency
        })
      })
      
      console.log(`📡 BlaBlaCar trips: ${response.status}`)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.log('❌ BlaBlaCar trips error:', errorText)
        throw new Error(`Trips search failed: ${response.status}`)
      }
      
      const data = await response.json()
      
      return data.trips || data.results || data.data || []
      
    } catch (error) {
      console.error('❌ BlaBlaCar trips search error:', error.message)
      throw error
    }
  }

  transformRoutes(blablacarTrips) {
    if (!Array.isArray(blablacarTrips)) {
      console.log('⚠️ BlaBlaCar: No trips array in response')
      return []
    }
    
    console.log(`🔄 BlaBlaCar: Transforming ${blablacarTrips.length} trips`)
    
    return blablacarTrips.map((trip, index) => {
      try {
        return {
          id: `blablacar_${trip.id || index}`,
          carrierId: 'BLA', // BlaBlaCar carrier code
          fromCityId: trip.from_city_id || trip.departure?.city_id,
          toCityId: trip.to_city_id || trip.arrival?.city_id,
          departureTime: new Date(trip.departure_datetime || trip.departure?.datetime),
          arrivalTime: new Date(trip.arrival_datetime || trip.arrival?.datetime),
          price: parseFloat(trip.price?.amount || trip.price || 0),
          maxPrice: parseFloat(trip.price?.amount || trip.price || 0),
          currency: trip.price?.currency || trip.currency || 'EUR',
          isExternal: true,
          externalId: (trip.id || index).toString(),
          isDirect: true, // BlaBlaCar trips are typically direct
          availableSeats: trip.available_seats || trip.seats || null,
          provider: 'blablacar'
        }
      } catch (err) {
        console.error('❌ Error transforming BlaBlaCar trip:', err.message)
        return null
      }
    }).filter(Boolean)
  }
}

export const blaBlaCarsAPI = new BlaBlaCarsAPI(false) // Use production
export const blaBlaCarsTestAPI = new BlaBlaCarsAPI(true) // Use test environment 