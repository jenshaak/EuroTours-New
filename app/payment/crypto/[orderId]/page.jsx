'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Coins, Copy, CheckCircle, Clock, RefreshCw } from 'lucide-react'
import { Logo } from '@/components/ui/logo'

export default function CryptoPaymentPage() {
  const params = useParams()
  const router = useRouter()
  const { orderId } = params

  const [invoice, setInvoice] = useState(null)
  const [paymentStatus, setPaymentStatus] = useState('pending')
  const [isLoading, setIsLoading] = useState(true)
  const [countdown, setCountdown] = useState(null)

  useEffect(() => {
    loadInvoiceData()
    
    // Start checking payment status every 30 seconds
    const statusInterval = setInterval(checkPaymentStatus, 30000)
    
    return () => clearInterval(statusInterval)
  }, [])

  useEffect(() => {
    if (invoice?.expireTime) {
      const expireTime = new Date(invoice.expireTime * 1000)
      
      const countdownInterval = setInterval(() => {
        const now = new Date()
        const timeLeft = expireTime - now
        
        if (timeLeft <= 0) {
          setCountdown('Expired')
          clearInterval(countdownInterval)
        } else {
          const minutes = Math.floor(timeLeft / 60000)
          const seconds = Math.floor((timeLeft % 60000) / 1000)
          setCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`)
        }
      }, 1000)
      
      return () => clearInterval(countdownInterval)
    }
  }, [invoice])

  const loadInvoiceData = () => {
    try {
      const storedInvoice = sessionStorage.getItem('cryptoInvoice')
      if (storedInvoice) {
        const invoiceData = JSON.parse(storedInvoice)
        setInvoice(invoiceData)
        console.log('📋 Loaded crypto invoice:', invoiceData)
      }
    } catch (error) {
      console.error('Error loading invoice data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkPaymentStatus = async () => {
    if (!invoice) return
    
    try {
      const response = await fetch(`/api/crypto/status/${invoice.invoiceId}?coin=${invoice.coin}`)
      if (response.ok) {
        const data = await response.json()
        setPaymentStatus(data.status)
        
        if (data.status === 'paid') {
          // Payment confirmed, show success and redirect after a delay
          setTimeout(() => {
            router.push(`/payment/success/${orderId}`)
          }, 3000)
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Address copied to clipboard!')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">Payment information not found</p>
            <Button onClick={() => router.push('/')} variant="outline">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Logo />
              <span className="ml-4 text-gray-600">Crypto Payment</span>
            </div>
            {countdown && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span>Expires in: {countdown}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="w-6 h-6" />
              {invoice.coin.toUpperCase()} Payment
            </CardTitle>
            <p className="text-sm text-gray-600">
              Order ID: {orderId}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Payment Status */}
            {paymentStatus === 'paid' && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-800">
                        Payment Confirmed!
                      </p>
                      <p className="text-sm text-green-700">
                        Your ticket has been issued. Check your email for confirmation.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Details */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Amount to Pay:</span>
                <span className="text-xl font-bold">
                  {invoice.amount} {invoice.coin.toUpperCase()}
                </span>
              </div>
              
              {invoice.totalAmount?.usd && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>USD Equivalent:</span>
                  <span>${invoice.totalAmount.usd}</span>
                </div>
              )}
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Payment Address:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(invoice.address)}
                    className="h-auto p-1"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div className="bg-white p-3 rounded border text-xs font-mono break-all">
                  {invoice.address}
                </div>
              </div>

              {/* QR Code */}
              {invoice.qrCode && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Scan QR Code:</p>
                  <img 
                    src={invoice.qrCode} 
                    alt="Payment QR Code" 
                    className="mx-auto max-w-[200px] border rounded"
                  />
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">Payment Instructions</h3>
              <ol className="text-sm text-gray-600 space-y-2">
                <li>1. Send exactly <strong>{invoice.amount} {invoice.coin.toUpperCase()}</strong> to the address above</li>
                <li>2. Wait for blockchain confirmation (usually 10-30 minutes)</li>
                <li>3. Your payment will be automatically detected</li>
                <li>4. You'll receive a confirmation email once verified</li>
                <li>5. Your ticket will be issued automatically</li>
              </ol>
            </div>

            {/* Warning */}
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-yellow-600 text-white flex items-center justify-center text-sm font-bold mt-0.5">
                    !
                  </div>
                  <div>
                    <p className="font-semibold text-yellow-800 mb-1">Important:</p>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Send only {invoice.coin.toUpperCase()} to this address</li>
                      <li>• Sending other cryptocurrencies will result in loss</li>
                      <li>• Payment must be exact amount: {invoice.amount} {invoice.coin.toUpperCase()}</li>
                      <li>• This address expires in {countdown || 'soon'}</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="flex-1"
              >
                Back to Home
              </Button>
              <Button
                onClick={checkPaymentStatus}
                className="flex-1"
                disabled={paymentStatus === 'paid'}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Check Status
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 