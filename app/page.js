'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SearchForm } from '@/components/SearchForm'

export default function HomePage() {
  const router = useRouter()
  const [searchResults, setSearchResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (searchData) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(searchData)
      })

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const results = await response.json()
      
      // Navigate to search results page with the search ID
      router.push(`/search/${results.searchId}`)
      
    } catch (error) {
      console.error('Search error:', error)
      alert('Search failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">EuroTours</h1>
              <p className="ml-3 text-gray-600 hidden sm:block">
                European Bus Ticket Platform
              </p>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>🇨🇿 CZK</span>
              <span>🇬🇧 EN</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Travel Across
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
              {' '}Europe
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Find and compare bus tickets from multiple providers. 
            Book your journey with FlixBus, BlaBlaCar, Ecolines and more.
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
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Compare Prices</h3>
            <p className="text-gray-600">
              Search and compare prices from multiple bus companies in one place
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚌</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Multiple Carriers</h3>
            <p className="text-gray-600">
              Access routes from FlixBus, BlaBlaCar, Ecolines, Student Agency and more
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💳</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Flexible Payment</h3>
            <p className="text-gray-600">
              Pay with cards or cryptocurrency. Multiple currencies supported
            </p>
          </div>
        </div>

        {/* Popular Routes */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Popular Routes</h2>
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
                Your trusted partner for bus travel across Europe. 
                Compare prices and book tickets from multiple carriers.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Bus Tickets</li>
                <li>Route Planning</li>
                <li>Price Comparison</li>
                <li>Customer Support</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Partners</h4>
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
