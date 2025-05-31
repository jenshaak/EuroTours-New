'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SearchForm } from '@/components/SearchForm'
import { Logo } from '@/components/ui/logo'

export default function HomePage() {
  const router = useRouter()
  const [searchResults, setSearchResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (searchData) => {
    console.log('🔍 === CLIENT-SIDE SEARCH STARTED ===')
    console.log('📥 Form data received:', JSON.stringify(searchData, null, 2))
    
    setIsLoading(true)
    
    try {
      // Validate form data
      console.log('✅ Validating form data...')
      if (!searchData.fromCity || !searchData.toCity) {
        console.log('❌ Validation failed: Missing cities')
        alert('Please select both departure and destination cities.')
        return
      }

      if (!searchData.departureDate) {
        console.log('❌ Validation failed: Missing departure date')
        alert('Please select a departure date.')
        return
      }

      if (searchData.tripType === 'return' && !searchData.returnDate) {
        console.log('❌ Validation failed: Missing return date for round trip')
        alert('Please select a return date for round-trip tickets.')
        return
      }

      console.log('✅ Client validation passed')

      // Transform form data to match API schema
      const apiData = {
        fromCityId: searchData.fromCity.id,
        toCityId: searchData.toCity.id,
        departureDate: searchData.departureDate,
        returnDate: searchData.returnDate || undefined,
        tripType: searchData.tripType
      }

      console.log('🔄 Transformed API data:', JSON.stringify(apiData, null, 2))
      console.log(`🏙️ Searching: ${searchData.fromCity.names?.en || 'Unknown'} → ${searchData.toCity.names?.en || 'Unknown'}`)
      console.log(`📅 Date: ${apiData.departureDate}${apiData.returnDate ? ` (return: ${apiData.returnDate})` : ''}`)
      console.log(`🎫 Type: ${apiData.tripType}`)

      console.log('📡 Making API request to /api/search...')
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData)
      })

      console.log(`📡 API response status: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        const errorData = await response.json()
        console.log('❌ API error response:', JSON.stringify(errorData, null, 2))
        throw new Error(errorData.error || 'Search failed')
      }

      const results = await response.json()
      console.log('📥 API success response:', JSON.stringify({
        searchId: results.searchId,
        outboundRoutes: results.routes?.outbound?.length || 0,
        returnRoutes: results.routes?.return?.length || 0,
        search: results.search
      }, null, 2))
      
      // Navigate to search results page with the search ID
      console.log(`🧭 Navigating to /search/${results.searchId}`)
      router.push(`/search/${results.searchId}`)
      
    } catch (error) {
      console.error('❌ === CLIENT-SIDE SEARCH ERROR ===')
      console.error('❌ Error details:', error)
      console.error('❌ Error message:', error.message)
      alert('Search failed. Please try again.')
    } finally {
      setIsLoading(false)
      console.log('🏁 === CLIENT-SIDE SEARCH COMPLETED ===')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Logo />
              <p className="ml-3 text-gray-600 hidden sm:block">
                European Bus Ticket Platform
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Discover Beautiful
            <span className="text-transparent bg-clip-text bg-blue-600">
              {' '}Europe
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Book your perfect European bus journey with the best prices and most reliable carriers. Travel comfortably across the continent.
          </p>
        </div>

        {/* Search Form */}
        <div className="mb-16">
          <SearchForm onSearch={handleSearch} />
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
            <p className="text-gray-600">
              We compare prices from multiple carriers to get you the best deals on European bus travel.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚌</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Multiple Carriers</h3>
            <p className="text-gray-600">
              Choose from top European bus companies including FlixBus, Eurolines, and more.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🛡️</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
            <p className="text-gray-600">
              Our customer support team is available around the clock to help with your travel needs.
            </p>
          </div>
        </div>

        {/* Popular Routes */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Popular Destinations</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'Prague → Vienna',
              'Berlin → Prague',
              'Warsaw → Berlin',
              'Prague → Budapest',
              'Vienna → Budapest',
              'Prague → Munich',
              'Berlin → Vienna',
              'Prague → Bratislava'
            ].map((route, index) => (
              <div 
                key={index}
                className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border"
              >
                <span className="text-sm font-medium text-gray-700">{route}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">EuroTours</h3>
              <p className="text-gray-400 text-sm">
                Your trusted partner for European bus travel. Connecting cities across the continent with comfort and reliability.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Search Routes</li>
                <li>About Us</li>
                <li>FAQ</li>
                <li>Help Center</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Bus Companies</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>FlixBus</li>
                <li>BlaBlaCar</li>
                <li>Ecolines</li>
                <li>Student Agency</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 EuroTours. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 