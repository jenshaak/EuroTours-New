'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RouteCard } from '@/components/RouteCard'
import { SearchForm } from '@/components/SearchForm'
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react'
import { getTranslatedName } from '@/lib/utils/i18n'
import { Logo } from '@/components/ui/logo'
import { LanguageDropdown } from '@/components/LanguageDropdown'
import { useLanguage } from '@/lib/contexts/LanguageContext'

export default function SearchResultsPage() {
  const params = useParams()
  const router = useRouter()
  const { searchId } = params
  const { t } = useLanguage()

  const [routes, setRoutes] = useState({ outbound: [], return: [] })
  const [searchData, setSearchData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingExternal, setIsLoadingExternal] = useState(false)
  const [externalProcessing, setExternalProcessing] = useState(0)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (searchId) {
      loadSearchResults()
      // Start polling for external results
      const interval = setInterval(checkExternalResults, 3000)
      return () => clearInterval(interval)
    }
  }, [searchId])

  const loadSearchResults = async () => {
    console.log('🔍 === LOADING SEARCH RESULTS ===')
    console.log(`📋 Search ID: ${searchId}`)
    
    try {
      setIsLoading(true)
      console.log('📡 Fetching search results from API...')
      const response = await fetch(`/api/search/${searchId}`)
      
      console.log(`📡 API response status: ${response.status} ${response.statusText}`)
      
      if (!response.ok) {
        console.log('❌ API request failed')
        throw new Error('Failed to load search results')
      }

      const data = await response.json()
      console.log('📥 Search results received:', JSON.stringify({
        searchId: data.searchId,
        outboundCount: data.routes?.outbound?.length || 0,
        returnCount: data.routes?.return?.length || 0,
        search: data.search
      }, null, 2))
      
      if (data.search) {
        console.log(`🏙️ Search details: From City ${data.search.fromCityId} → To City ${data.search.toCityId}`)
        console.log(`📅 Departure: ${data.search.departureDate}`)
        if (data.search.returnDate) {
          console.log(`📅 Return: ${data.search.returnDate}`)
        }
        console.log(`🎫 Trip type: ${data.search.type}`)
      }
      
      setRoutes(data.routes || { outbound: [], return: [] })
      setSearchData(data.search)
      
      const totalRoutes = (data.routes?.outbound?.length || 0) + (data.routes?.return?.length || 0)
      console.log(`✅ Loaded ${totalRoutes} total routes`)
      
      if (totalRoutes === 0) {
        console.log('❌ No routes found - this could mean:')
        console.log('   1. No routes exist between these cities')
        console.log('   2. Database needs initialization')
        console.log('   3. Route data is missing')
      }
      
    } catch (error) {
      console.error('❌ === SEARCH RESULTS LOADING ERROR ===')
      console.error('❌ Error details:', error)
      setError('An error occurred while loading search results')
    } finally {
      setIsLoading(false)
      console.log('🏁 === SEARCH RESULTS LOADING COMPLETED ===')
    }
  }

  const checkExternalResults = async () => {
    if (!searchId) return

    try {
      setIsLoadingExternal(true)
      const response = await fetch(`/api/search/${searchId}/external`)
      
      if (response.ok) {
        const data = await response.json()
        
        // Update processing count
        setExternalProcessing(data.processing || 0)
        
        // Add new routes if any
        if (data.routes && data.routes.length > 0) {
          setRoutes(prevRoutes => ({
            outbound: [...prevRoutes.outbound, ...data.routes.filter(r => r.direction === 'there')],
            return: [...prevRoutes.return, ...data.routes.filter(r => r.direction === 'back')]
          }))
        }
        
        // Stop polling if no more processing
        if (data.processing === 0) {
          setExternalProcessing(0)
        }
      }
    } catch (error) {
      console.error('Error checking external results:', error)
    } finally {
      setIsLoadingExternal(false)
    }
  }

  const handleRouteSelect = (route) => {
    // Store route data for booking page
    console.log('🎯 Route selected:', route.id)
    
    // Store route data in sessionStorage for the booking page
    sessionStorage.setItem('selectedRoute', JSON.stringify(route))
    
    // Navigate to booking page
    router.push(`/booking/${route.id}`)
  }

  const handleNewSearch = async (newSearchData) => {
    // Validate form data
    if (!newSearchData.fromCity || !newSearchData.toCity) {
      alert(t.selectCities)
      return
    }

    if (!newSearchData.departureDate) {
      alert(t.selectDepartureDate)
      return
    }

    if (newSearchData.tripType === 'return' && !newSearchData.returnDate) {
      alert(t.selectReturnDate)
      return
    }

    try {
      // Transform form data to match API schema
      const apiData = {
        fromCityId: newSearchData.fromCity.id,
        toCityId: newSearchData.toCity.id,
        departureDate: newSearchData.departureDate,
        returnDate: newSearchData.returnDate || undefined,
        tripType: newSearchData.tripType
      }

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Search failed')
      }

      const results = await response.json()
      
      // Navigate to new search results page
      router.push(`/search/${results.searchId}`)
      
    } catch (error) {
      console.error('Search error:', error)
      alert(t.searchFailed)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/')} variant="outline">
              {t.home}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalRoutes = routes.outbound.length + routes.return.length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.home}
              </Button>
              <Logo />
            </div>
            
            {/* Language Dropdown */}
            <LanguageDropdown />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form - Compact */}
        <div className="mb-8">
          <SearchForm onSearch={handleNewSearch} initialValues={searchData} />
        </div>

        {/* Search Summary */}
        {searchData && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {t.searchResults}
            </h2>
            <p className="text-gray-600">
              {t.foundRoutes} {totalRoutes} {totalRoutes === 1 ? t.route : t.routes}
              {searchData.type === 'return' && ` ${t.outboundReturn}`}
            </p>
          </div>
        )}

        {/* External Provider Status */}
        {externalProcessing > 0 && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                <div>
                  <p className="font-medium text-blue-900">
                    {t.checkingExternalProviders}
                  </p>
                  <p className="text-sm text-blue-700">
                    {externalProcessing} {externalProcessing === 1 ? t.provider : t.providers} {t.providersLoading}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Outbound Routes */}
        {routes.outbound.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t.outboundJourney}
            </h3>
            <div className="space-y-4">
              {routes.outbound.map((route) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  onSelect={handleRouteSelect}
                  fromCity={route.fromCity}
                  toCity={route.toCity}
                  carrier={route.carrier}
                />
              ))}
            </div>
          </div>
        )}

        {/* Return Routes */}
        {routes.return.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t.returnJourney}
            </h3>
            <div className="space-y-4">
              {routes.return.map((route) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  onSelect={handleRouteSelect}
                  fromCity={route.fromCity}
                  toCity={route.toCity}
                  carrier={route.carrier}
                />
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {totalRoutes === 0 && !isLoading && (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t.noRoutesFound}</h3>
              <p className="text-gray-600 mb-4">
                {t.noRoutesMessage}
              </p>
              <Button 
                onClick={() => router.push('/')}
                variant="outline"
              >
                {t.newSearch}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 