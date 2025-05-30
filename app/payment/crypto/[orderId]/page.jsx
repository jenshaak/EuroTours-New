'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Coins, Copy, CheckCircle } from 'lucide-react'

export default function CryptoPaymentPage() {
  const params = useParams()
  const router = useRouter()
  const { orderId } = params

  const [selectedCrypto, setSelectedCrypto] = useState('BTC')
  const [paymentAddress] = useState('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa') // Mock address

  const cryptoOptions = [
    { code: 'BTC', name: 'Bitcoin', amount: '0.0012' },
    { code: 'ETH', name: 'Ethereum', amount: '0.023' },
    { code: 'LTC', name: 'Litecoin', amount: '0.65' },
    { code: 'DOGE', name: 'Dogecoin', amount: '145.67' }
  ]

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Address copied to clipboard!')
  }

  const selectedOption = cryptoOptions.find(crypto => crypto.code === selectedCrypto)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">EuroTours</h1>
            <span className="ml-4 text-gray-600">Crypto Payment</span>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="w-6 h-6" />
              Cryptocurrency Payment
            </CardTitle>
            <p className="text-sm text-gray-600">
              Order ID: {orderId}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Crypto Selection */}
            <div>
              <h3 className="font-semibold mb-3">Select Cryptocurrency</h3>
              <div className="grid grid-cols-2 gap-3">
                {cryptoOptions.map((crypto) => (
                  <Button
                    key={crypto.code}
                    variant={selectedCrypto === crypto.code ? "default" : "outline"}
                    onClick={() => setSelectedCrypto(crypto.code)}
                    className="p-4 h-auto flex flex-col items-center gap-2"
                  >
                    <span className="font-bold">{crypto.code}</span>
                    <span className="text-sm">{crypto.name}</span>
                    <span className="text-xs">{crypto.amount} {crypto.code}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Payment Details */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">Payment Details</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-bold">
                    {selectedOption?.amount} {selectedCrypto}
                  </span>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Payment Address:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(paymentAddress)}
                      className="h-auto p-1"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="bg-white p-3 rounded border text-xs font-mono break-all">
                    {paymentAddress}
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">Payment Instructions</h3>
              <ol className="text-sm text-gray-600 space-y-2">
                <li>1. Send exactly <strong>{selectedOption?.amount} {selectedCrypto}</strong> to the address above</li>
                <li>2. Wait for blockchain confirmation (usually 10-30 minutes)</li>
                <li>3. You'll receive a confirmation email once payment is verified</li>
                <li>4. Your ticket will be issued automatically</li>
              </ol>
            </div>

            {/* Mock Payment Confirmation */}
            <div className="border-t pt-6">
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-800">
                        Demo Mode Active
                      </p>
                      <p className="text-sm text-green-700">
                        This is a demonstration. In production, you would send real cryptocurrency.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

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
                onClick={() => router.push(`/payment/webpay/${orderId}`)}
                className="flex-1"
              >
                Simulate Payment Success
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 