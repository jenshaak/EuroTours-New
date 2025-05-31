'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react'

export default function EmailTestPage() {
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    amount: '26'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)
    setError(null)

    try {
      console.log('📧 Testing email with data:', formData)
      
      const response = await fetch('/api/test/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      console.log('📧 Email test response:', data)

      if (response.ok && data.success) {
        setResult(data)
      } else {
        setError(data.error || 'Failed to send test email')
      }
    } catch (err) {
      console.error('❌ Email test error:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📧 Email Service Test
          </h1>
          <p className="text-lg text-gray-600">
            Test the EuroTours email confirmation functionality
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Send Test Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Enter your email address to receive the test confirmation email
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Test User"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1234567890"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Test Amount (EUR)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="26"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading || !formData.email}
                  className="w-full"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending Test Email...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Send Test Email
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            {/* Success Result */}
            {result && (
              <Card className="border-green-200">
                <CardHeader className="bg-green-50">
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Test Email Sent Successfully!
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Email Result:</h4>
                    <p className="text-sm text-green-600">
                      ✅ {result.message}
                    </p>
                    {result.result?.messageId && (
                      <p className="text-sm text-gray-600">
                        Message ID: {result.result.messageId}
                      </p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">SMTP Configuration:</h4>
                    <div className="text-sm space-y-1">
                      <p>Host: <span className="font-mono">{result.environmentStatus.smtpHost}</span></p>
                      <p>Port: <span className="font-mono">{result.environmentStatus.smtpPort}</span></p>
                      <p>User: {result.environmentStatus.smtpUserConfigured ? '✅ Configured' : '❌ Not configured'}</p>
                      <p>Password: {result.environmentStatus.smtpPasswordConfigured ? '✅ Configured' : '❌ Not configured'}</p>
                      <p>From: <span className="font-mono">{result.environmentStatus.smtpFrom}</span></p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Test Data Used:</h4>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <p><strong>Order ID:</strong> {result.testData.order.id}</p>
                      <p><strong>Email:</strong> {result.testData.order.passenger.email}</p>
                      <p><strong>Amount:</strong> {result.testData.order.totalPrice} {result.testData.order.currency}</p>
                      <p><strong>Route:</strong> {result.testData.route.fromCity} → {result.testData.route.toCity}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error Result */}
            {error && (
              <Card className="border-red-200">
                <CardHeader className="bg-red-50">
                  <CardTitle className="text-red-800 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Email Test Failed
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-sm text-red-600">
                    <p><strong>Error:</strong> {error}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>📋 How to Use</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium">1. Enter Your Email</h4>
                  <p className="text-gray-600">
                    Use your real email address to receive the test confirmation email
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">2. Click Send Test Email</h4>
                  <p className="text-gray-600">
                    The system will send a sample bus ticket confirmation email
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">3. Check Your Inbox</h4>
                  <p className="text-gray-600">
                    Look for an email from EuroTours with your test ticket details
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">4. Check Configuration</h4>
                  <p className="text-gray-600">
                    The results will show SMTP configuration status and any errors
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 