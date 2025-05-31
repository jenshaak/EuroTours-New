'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Clock, Bus, MapPin, CreditCard, Coins } from 'lucide-react'
import { formatTime, formatDuration, formatPrice, getTranslatedName } from '@/lib/utils/i18n'
import { Logo } from '@/components/ui/logo'

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const { routeId } = params

  const [route, setRoute] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [showCryptoSelection, setShowCryptoSelection] = useState(false)
  const [selectedCrypto, setSelectedCrypto] = useState('BTC')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card')
  
  // Form state
  const [passengerInfo, setPassengerInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    documentNumber: ''
  })

  // Supported cryptocurrencies - different for each provider
  const getSupportedCryptos = () => {
    if (selectedPaymentMethod === 'coinremitter') {
      return [
        { code: 'TCN', name: 'TestCoin' }
      ]
    } else if (selectedPaymentMethod === 'coinbase') {
      return [
        { code: 'BTC', name: 'Bitcoin' },
        { code: 'ETH', name: 'Ethereum' },
        { code: 'LTC', name: 'Litecoin' },
        { code: 'USDC', name: 'USD Coin' },
        { code: 'DAI', name: 'Dai' },
        { code: 'DOGE', name: 'Dogecoin' }
      ]
    }
    return []
  }

  useEffect(() => {
    if (routeId) {
      loadRouteDetails()
    }
  }, [routeId])

  const loadRouteDetails = async () => {
    try {
      setIsLoading(true)
      
      // Try to get route data from sessionStorage first
      const storedRoute = sessionStorage.getItem('selectedRoute')
      if (storedRoute) {
        const route = JSON.parse(storedRoute)
        console.log('📋 Loaded route from storage:', route)
        setRoute(route)
        return
      }
      
      // Fallback: Try to fetch from API (TODO: implement route API endpoint)
      console.log('⚠️ No route data in storage, using fallback data')
      const mockRoute = {
        id: routeId,
        fromCity: { names: { en: "Prague" } },
        toCity: { names: { en: "London" } },
        departureTime: new Date("2024-12-15T08:00:00"),
        arrivalTime: new Date("2024-12-15T20:30:00"),
        price: 45,
        currency: "EUR",
        carrier: { name: "FlixBus" },
        isDirect: true,
        availableSeats: 15
      }
      
      setRoute(mockRoute)
    } catch (error) {
      console.error('Error loading route details:', error)
      setError('Failed to load route details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setPassengerInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleBookingSubmit = async (paymentMethod) => {
    try {
      // Validate form
      if (!passengerInfo.fullName || !passengerInfo.email || !passengerInfo.phone) {
        alert('Please fill in all required fields')
        return
      }

      // For crypto payments, show currency selection first
      if ((paymentMethod === 'coinremitter' || paymentMethod === 'coinbase') && !showCryptoSelection) {
        setSelectedPaymentMethod(paymentMethod)
        setShowCryptoSelection(true)
        return
      }

      setIsSubmitting(true)

      // Create order
      const orderData = {
        routeId: route.id,
        passenger: passengerInfo,
        paymentMethod,
        totalPrice: route.price,
        currency: route.currency
      }

      // Add crypto currency if selected
      if (paymentMethod === 'coinremitter' || paymentMethod === 'coinbase') {
        orderData.cryptoCurrency = selectedCrypto
        orderData.cryptoProvider = paymentMethod
      }

      console.log('Creating order:', orderData)
      
      console.log('📡 Making request to /api/orders...')
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      console.log('📡 Orders API response status:', response.status, response.statusText)
      console.log('📡 Orders API response headers:', Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const order = await response.json()
        console.log('✅ Order created successfully:', JSON.stringify(order, null, 2))
        
        if (paymentMethod === 'card') {
          console.log('💳 Handling card payment response...')
          if (order.successUrl) {
            console.log('✅ Order completed immediately, redirecting to success page:', order.successUrl)
            router.push(order.successUrl)
          } else if (order.paymentUrl) {
            console.log('💳 Redirecting to WebPay...')
            // Fallback to WebPay if successUrl not available
            window.location.href = order.paymentUrl
          } else {
            console.error('❌ No payment URL or success URL provided')
            throw new Error('Payment processing failed - no redirect URL provided')
          }
        } else if (paymentMethod === 'coinremitter') {
          console.log('🪙 Processing CoinRemitter payment...')
          if (order.cryptoInvoice) {
            console.log('🪙 CoinRemitter invoice received:', JSON.stringify(order.cryptoInvoice, null, 2))
            // Navigate to crypto payment page with invoice data
            sessionStorage.setItem('cryptoInvoice', JSON.stringify(order.cryptoInvoice))
            router.push(`/payment/crypto/${order.id}`)
          } else {
            console.error('❌ CoinRemitter invoice not found in order response')
            throw new Error('CoinRemitter invoice not created')
          }
        } else if (paymentMethod === 'coinbase') {
          console.log('🟡 Processing Coinbase Commerce payment...')
          if (order.coinbaseCharge) {
            console.log('🟡 Coinbase Commerce charge received:', JSON.stringify(order.coinbaseCharge, null, 2))
            console.log('🟡 Redirecting to Coinbase Commerce:', order.coinbaseCharge.hosted_url)
            // Navigate to Coinbase Commerce checkout
            window.location.href = order.coinbaseCharge.hosted_url
          } else {
            console.error('❌ Coinbase Commerce charge not found in order response')
            throw new Error('Coinbase Commerce charge not created')
          }
        }
      } else {
        console.error('❌ Orders API request failed with status:', response.status)
        
        try {
          // Read response as text first to avoid "body stream already read" error
          const responseText = await response.text()
          console.error('❌ Raw error response:', responseText)
          
          let errorData
          try {
            errorData = JSON.parse(responseText)
            console.error('❌ Orders API error response:', JSON.stringify(errorData, null, 2))
          } catch (jsonParseError) {
            console.error('❌ Error response is not valid JSON, treating as plain text')
            throw new Error(`Server error (${response.status}): ${responseText || 'Unknown error'}`)
          }
          
          // Create detailed error message
          let errorMessage = errorData.message || errorData.error || 'Failed to create order'
          
          if (errorData.type) {
            errorMessage += ` (${errorData.type})`
          }
          
          if (errorData.stack && process.env.NODE_ENV === 'development') {
            console.error('❌ Server error stack:', errorData.stack)
          }
          
          if (errorData.details) {
            console.error('❌ Error details:', errorData.details)
            errorMessage += '\nDetails: ' + JSON.stringify(errorData.details, null, 2)
          }
          
          throw new Error(errorMessage)
        } catch (responseError) {
          console.error('❌ Failed to read error response:', responseError)
          throw new Error(`Server error (${response.status}): Unable to read response`)
        }
      }
      
    } catch (error) {
      console.error('❌ === BOOKING ERROR ===')
      console.error('❌ Error type:', error.constructor.name)
      console.error('❌ Error message:', error.message)
      console.error('❌ Error stack:', error.stack)
      
      // Show detailed error to user
      let userMessage = `Booking failed: ${error.message}`
      
      if (error.message.includes('Coinbase Commerce')) {
        userMessage += '\n\nPossible issues:\n• Coinbase Commerce API key not configured\n• Network connectivity problems\n• Invalid payment parameters'
      } else if (error.message.includes('Database')) {
        userMessage += '\n\nDatabase connection issue. Please try again.'
      }
      
      alert(userMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCryptoConfirm = () => {
    setShowCryptoSelection(false)
    handleBookingSubmit(selectedPaymentMethod)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (error || !route) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">{error || 'Route not found'}</p>
            <Button onClick={() => router.push('/')} variant="outline">
              Back to Search
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const departureTime = new Date(route.departureTime)
  const arrivalTime = new Date(route.arrivalTime)
  const duration = formatDuration(route.departureTime, route.arrivalTime)
  const fromCityName = getTranslatedName(route.fromCity?.names || {}, 'en')
  const toCityName = getTranslatedName(route.toCity?.names || {}, 'en')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Logo />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Route Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">Trip Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Route Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="font-medium">{fromCityName}</div>
                      <div className="text-sm text-gray-600">
                        {formatTime(departureTime)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 pl-2">
                    <div className="w-px h-8 bg-gray-300"></div>
                    <div className="text-sm text-gray-500">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {duration}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="font-medium">{toCityName}</div>
                      <div className="text-sm text-gray-600">
                        {formatTime(arrivalTime)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Bus className="w-4 h-4" />
                    <span>{route.carrier?.name}</span>
                    {route.isDirect && (
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        Direct
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Price</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatPrice(route.price, route.currency)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Passenger Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Passenger Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={passengerInfo.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={passengerInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={passengerInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={passengerInfo.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="documentNumber">ID/Passport Number</Label>
                    <Input
                      id="documentNumber"
                      value={passengerInfo.documentNumber}
                      onChange={(e) => handleInputChange('documentNumber', e.target.value)}
                      placeholder="Enter your ID or passport number"
                    />
                  </div>
                </div>

                {/* Payment Options */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      onClick={() => handleBookingSubmit('card')}
                      disabled={isSubmitting}
                      className="h-16 flex flex-col items-center gap-2"
                    >
                      <CreditCard className="w-6 h-6" />
                      <span>Pay with Card</span>
                    </Button>
                    
                    {/* 
                    <Button
                      onClick={() => handleBookingSubmit('coinremitter')}
                      disabled={isSubmitting}
                      variant="outline"
                      className="h-16 flex flex-col items-center gap-2"
                    >
                      <Coins className="w-6 h-6" />
                      <span>Pay with CoinRemitter</span>
                    </Button>
                    */}

                    <Button
                      onClick={() => handleBookingSubmit('coinbase')}
                      disabled={isSubmitting}
                      variant="outline"
                      className="h-16 flex flex-col items-center gap-2"
                    >
                      <Coins className="w-6 h-6" />
                      <span>Pay with Cryptocurrency</span>
                    </Button>

                    {/*
                    <Button
                      onClick={() => handleBookingSubmit('onchainkit')}
                      disabled={isSubmitting}
                      variant="outline"
                      className="h-16 flex flex-col items-center gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200"
                    >
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        $
                      </div>
                      <span>Pay with USDC (OnchainKit)</span>
                    </Button>
                    */}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Crypto Selection Modal */}
        {showCryptoSelection && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <Card className="max-w-md mx-4 w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="w-5 h-5" />
                  Select Cryptocurrency - {selectedPaymentMethod === 'coinremitter' ? 'CoinRemitter' : 'Coinbase Commerce'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Choose your preferred cryptocurrency for payment:
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  {getSupportedCryptos().map((crypto) => (
                    <Button
                      key={crypto.code}
                      variant={selectedCrypto === crypto.code ? "default" : "outline"}
                      onClick={() => setSelectedCrypto(crypto.code)}
                      className="h-16 flex flex-col items-center gap-1"
                    >
                      <span className="font-bold text-sm">{crypto.code}</span>
                      <span className="text-xs">{crypto.name}</span>
                    </Button>
                  ))}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setShowCryptoSelection(false)}
                    variant="outline"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCryptoConfirm}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Continue'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 