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

  // Generate a deterministic ID based on search parameters
  generateDeterministicId(fromCityId, toCityId, date, routeIndex) {
    // Create a deterministic seed from search parameters
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0]
    const seed = `${fromCityId}-${toCityId}-${dateStr}-${routeIndex}`
    
    // Simple hash function to create a unique ID
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    // Convert to positive number and add randomness for uniqueness
    const uniqueId = Math.abs(hash).toString(36)
    return `${this.providerName.toLowerCase()}_${uniqueId}_${routeIndex}`
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
    
    // Use deterministic number of routes based on search parameters
    const dateStr = baseDate.toISOString().split('T')[0]
    const searchSeed = `${fromCityId}-${toCityId}-${dateStr}`
    let seedHash = 0
    for (let i = 0; i < searchSeed.length; i++) {
      seedHash = ((seedHash << 5) - seedHash) + searchSeed.charCodeAt(i)
    }
    const numRoutes = 2 + (Math.abs(seedHash) % 3) // Always 2-4 routes for same search
    console.log(`🔧 Generating ${numRoutes} deterministic mock routes`)
    
    for (let i = 0; i < numRoutes; i++) {
      // Generate deterministic times based on route index
      const departureHour = 8 + (i * 4) + (Math.abs(seedHash + i) % 2)
      const journeyHours = 12 + (Math.abs(seedHash + i * 2) % 4) // 12-15 hours
      
      const departureTime = new Date(baseDate)
      departureTime.setHours(departureHour, Math.abs(seedHash + i * 3) % 60, 0, 0)
      
      const arrivalTime = new Date(departureTime)
      arrivalTime.setHours(arrivalTime.getHours() + journeyHours)
      
      // Generate deterministic IDs and prices
      const routeId = this.generateDeterministicId(fromCityId, toCityId, date, i)
      const externalId = this.generateDeterministicId(fromCityId, toCityId, date, `ext_${i}`)
      const price = 25 + (Math.abs(seedHash + i * 5) % 50) // Deterministic price 25-75 EUR
      const maxPrice = 80 + (Math.abs(seedHash + i * 7) % 30) // Deterministic max price 80-110 EUR
      
      const route = {
        id: routeId,
        carrierId: this.providerName.substring(0, 3).toUpperCase(),
        fromCityId: fromCityId,
        toCityId: toCityId,
        departureTime: departureTime,
        arrivalTime: arrivalTime,
        price: price,
        maxPrice: maxPrice,
        currency: currency,
        isExternal: true,
        externalId: externalId,
        isDirect: (Math.abs(seedHash + i * 11) % 10) > 2, // Deterministic direct/transfer
        availableSeats: 5 + (Math.abs(seedHash + i * 13) % 20), // Deterministic seats 5-25
        provider: this.providerName.toLowerCase()
      }
      
      routes.push(route)
      console.log(`✅ Generated route ${i + 1}: ${routeId} - ${departureTime.toLocaleTimeString()} → ${arrivalTime.toLocaleTimeString()}, ${route.price}€`)
    }
    
    return routes
  }
}

export const mockBusAPI = new MockBusAPI('EuroBus') 