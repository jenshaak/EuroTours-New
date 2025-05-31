'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Mail, ArrowLeft, Download, MapPin, Clock, Bus, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'

// Helper functions for formatting
const formatTime = (date) => {
  if (!date) return 'TBD'
  return new Date(date).toLocaleTimeString('en-GB', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const formatDate = (date) => {
  if (!date) return 'TBD'
  return new Date(date).toLocaleDateString('en-GB', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const formatDuration = (minutes) => {
  if (!minutes) return 'TBD'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours === 0) {
    return `${mins}m`
  } else if (mins === 0) {
    return `${hours}h`
  } else {
    return `${hours}h ${mins}m`
  }
}

const getTranslatedName = (names, lang = 'en') => {
  if (!names) return 'Unknown City'
  return names[lang] || names.en || Object.values(names)[0] || 'Unknown City'
}

export default function PaymentSuccessPage({ params }) {
  const { orderId } = params
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchOrderDetails()
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders/${orderId}`)
      
      if (response.ok) {
        const orderData = await response.json()
        setOrder(orderData)
      } else {
        setError('Order not found')
      }
    } catch (err) {
      setError('Failed to load order details')
      console.error('Error fetching order:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p>Loading your order details...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <AlertCircle className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link href="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Logo />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful! 🎉
          </h1>
          <p className="text-lg text-gray-600">
            Your bus ticket has been confirmed and you'll receive an email shortly.
          </p>
        </div>

        {/* Travel Details */}
        {order && order.route && (
          <Card className="mb-8">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-blue-800 flex items-center gap-2">
                <Bus className="w-5 h-5" />
                🚌 Your Journey Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Route Overview */}
                <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {getTranslatedName(order.route.fromCity?.names)}
                    </div>
                    <div className="text-sm text-gray-600">Departure</div>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center px-4">
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {formatDuration(order.route.duration)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {getTranslatedName(order.route.toCity?.names)}
                    </div>
                    <div className="text-sm text-gray-600">Arrival</div>
                  </div>
                </div>

                {/* Detailed Journey Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-gray-900">Departure</div>
                        <div className="text-lg font-medium text-blue-600">
                          {getTranslatedName(order.route.fromCity?.names)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDate(order.route.departureTime)}
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {formatTime(order.route.departureTime)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-gray-900">Arrival</div>
                        <div className="text-lg font-medium text-green-600">
                          {getTranslatedName(order.route.toCity?.names)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDate(order.route.arrivalTime)}
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {formatTime(order.route.arrivalTime)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Journey Info */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Bus className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Carrier:</span>
                      <span>{order.route.carrier?.name || 'Bus Service'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Duration:</span>
                      <span>{formatDuration(order.route.duration)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Type:</span>
                      <span>{order.route.isDirect ? 'Direct' : 'With transfers'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Details */}
        {order && (
          <Card className="mb-8">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-800">
                🎫 Your Ticket Confirmation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Order Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Order ID:</span> {order.id}</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status === 'paid' ? 'Confirmed' : 'Processing'}
                      </span>
                    </p>
                    <p><span className="font-medium">Total:</span> {order.totalPrice} {order.currency}</p>
                    <p><span className="font-medium">Payment:</span> Cryptocurrency</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Passenger Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {order.passenger.fullName}</p>
                    <p><span className="font-medium">Email:</span> {order.passenger.email}</p>
                    <p><span className="font-medium">Phone:</span> {order.passenger.phone}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>📋 What's Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900">Check Your Email</h4>
                  <p className="text-sm text-gray-600">
                    We've sent a confirmation email with your ticket details and travel information.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900">Prepare for Travel</h4>
                  <p className="text-sm text-gray-600">
                    Arrive 15 minutes early and bring a valid photo ID for your journey.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button variant="outline" size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Book Another Trip
            </Button>
          </Link>
          
          <Button 
            size="lg" 
            onClick={() => window.print()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Print Confirmation
          </Button>
        </div>

        {/* Support Info */}
        <div className="text-center mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@eurotours.com" className="text-blue-600 hover:underline">
              support@eurotours.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
} 