// Mock external provider for testing
export class MockBusAPI {
  constructor(providerName = 'MockBus') {
    this.providerName = providerName
  }

  async searchRoutes(fromCityId, toCityId, date, currency = 'EUR') {
    console.log(`🚌 ${this.providerName}: searchRoutes called`)
    console.log(`   fromCityId: ${fromCityId} (type: ${typeof fromCityId})`)
    console.log(`   toCityId: ${toCityId} (type: ${typeof toCityId})`)
    console.log(`   date: ${date}`)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Generate mock routes based on the search
    const routes = this.generateMockRoutes(fromCityId, toCityId, date, currency)
    
    console.log(`🚌 ${this.providerName}: Generated ${routes.length} routes`)
    return routes
  }

  generateMockRoutes(fromCityId, toCityId, date, currency) {
    console.log(`🔧 generateMockRoutes: ${fromCityId} → ${toCityId}`)
    
    // Only generate routes for Prague (4) -> London (308) for now
    if (fromCityId !== 4 && fromCityId !== 308) {
      console.log(`⚠️ ${this.providerName}: No routes for city pair ${fromCityId} → ${toCityId}`)
      return []
    }
    
    const routes = []
    const baseDate = new Date(date)
    const uniqueTimestamp = Date.now()
    
    // Generate 2-3 mock routes
    const numRoutes = Math.floor(Math.random() * 3) + 2
    console.log(`🔧 Generating ${numRoutes} mock routes`)
    
    for (let i = 0; i < numRoutes; i++) {
      const departureHour = 8 + (i * 4) + Math.floor(Math.random() * 2)
      const journeyHours = 12 + Math.floor(Math.random() * 4) // 12-15 hours
      
      const departureTime = new Date(baseDate)
      departureTime.setHours(departureHour, Math.floor(Math.random() * 60), 0, 0)
      
      const arrivalTime = new Date(departureTime)
      arrivalTime.setHours(arrivalTime.getHours() + journeyHours)
      
      // Generate unique ID using timestamp + random component + index
      const randomComponent = Math.random().toString(36).substring(2, 8)
      const route = {
        id: `${this.providerName.toLowerCase()}_${uniqueTimestamp}_${randomComponent}_${i}`,
        carrierId: this.providerName.substring(0, 3).toUpperCase(),
        fromCityId: fromCityId,
        toCityId: toCityId,
        departureTime: departureTime,
        arrivalTime: arrivalTime,
        price: Math.floor(Math.random() * 50) + 25, // 25-75 EUR
        maxPrice: Math.floor(Math.random() * 30) + 80, // 80-110 EUR
        currency: currency,
        isExternal: true,
        externalId: `ext_${uniqueTimestamp}_${randomComponent}_${i}`,
        isDirect: Math.random() > 0.3, // 70% chance of direct
        availableSeats: Math.floor(Math.random() * 20) + 5, // 5-25 seats
        provider: this.providerName.toLowerCase()
      }
      
      routes.push(route)
      console.log(`✅ Generated route ${i + 1}: ${departureTime.toLocaleTimeString()} → ${arrivalTime.toLocaleTimeString()}, ${route.price}€`)
    }
    
    return routes
  }
}

export const mockBusAPI = new MockBusAPI('EuroBus') 