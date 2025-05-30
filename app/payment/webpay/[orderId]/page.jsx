'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react'

export default function WebPayPaymentPage() {
  const params = useParams()
  const router = useRouter()
  const { orderId } = params

  const [paymentStatus, setPaymentStatus] = useState('processing')

  useEffect(() => {
    // Simulate payment processing
    const timer = setTimeout(() => {
      // Mock successful payment for demo
      setPaymentStatus('success')
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  if (paymentStatus === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <CreditCard className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Processing Payment</h2>
            <p className="text-gray-600 mb-4">
              Please wait while we process your payment securely...
            </p>
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">
              Your ticket has been booked successfully. You will receive a confirmation email shortly.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Order ID: {orderId}
            </p>
            <Button 
              onClick={() => router.push('/')}
              className="w-full"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Payment Failed</h2>
          <p className="text-gray-600 mb-4">
            There was an issue processing your payment. Please try again.
          </p>
          <Button 
            onClick={() => router.back()}
            variant="outline"
            className="w-full"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 