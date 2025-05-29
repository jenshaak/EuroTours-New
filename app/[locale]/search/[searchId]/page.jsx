'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RouteCard } from '@/components/RouteCard'
import { SearchForm } from '@/components/SearchForm'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react'
import { getTranslatedName } from '@/lib/utils/i18n'

export default function SearchResultsPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations()
  const locale = useLocale()
  const { searchId } = params

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
    try {
      setIsLoading(true)
      const response = await fetch(`/api/search/${searchId}`)
      
      if (!response.ok) {
        throw new Error('Failed to load search results')
      }

      const data = await response.json()
      setRoutes(data.routes || { outbound: [], return: [] })
      setSearchData(data.search)
      
    } catch (error) {
      console.error('Error loading search results:', error)
      setError(t('common.error'))
    } finally {
      setIsLoading(false)
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
    // Navigate to booking page
    router.push(`/booking/${route.id}`)
  }

  const handleNewSearch = (newSearchData) => {
    // This would typically navigate to a new search results page
    console.log('New search:', newSearchData)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{t('common.loading')}</p>
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
            <h2 className="text-xl font-semibold mb-2">{t('common.error')}</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push(`/${locale}`)} variant="outline">
              {t('navigation.home')}
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
                onClick={() => router.push(`/${locale}`)}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('navigation.home')}
              </Button>
              <h1 className="text-2xl font-bold text-blue-600">EuroTours</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
            </div>
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
              {t('results.searchResults')}
            </h2>
            <p className="text-gray-600">
              {t('results.foundRoutes', { count: totalRoutes })}
              {searchData.type === 'return' && ` (${t('search.oneWay')} ${t('search.return').toLowerCase()})`}
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
                    {t('results.checkingExternal')}
                  </p>
                  <p className="text-sm text-blue-700">
                    {externalProcessing} {externalProcessing === 1 ? 'provider' : 'providers'} {t('common.loading').toLowerCase()}
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
              {t('results.departure')} {t('search.oneWay')}
            </h3>
            <div className="space-y-4">
              {routes.outbound.map((route, index) => (
                <RouteCard
                  key={`outbound-${index}`}
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
              {t('search.return')} {t('search.oneWay')}
            </h3>
            <div className="space-y-4">
              {routes.return.map((route, index) => (
                <RouteCard
                  key={`return-${index}`}
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

        {/* No Routes Found */}
        {totalRoutes === 0 && !isLoadingExternal && externalProcessing === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">🚌</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {t('results.noResults')}
              </h2>
              <p className="text-gray-600 mb-6">
                {t('results.noResultsDescription')}
              </p>
              <Button onClick={() => router.push(`/${locale}`)} variant="outline">
                {t('common.search')} {t('navigation.search').toLowerCase()}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 