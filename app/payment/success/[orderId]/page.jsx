'use client'

import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Download, Mail } from 'lucide-react'

export default function PaymentSuccessPage() {
  const params = useParams()
  const router = useRouter()
  const { orderId } = params

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Your cryptocurrency payment has been confirmed and your bus ticket has been issued.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-600">Order ID</p>
            <p className="font-mono font-semibold text-gray-900">{orderId}</p>
          </div>
          
          <div className="space-y-3">
            <Button className="w-full flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download Ticket
            </Button>
            
            <Button variant="outline" className="w-full flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Resend Confirmation Email
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={() => router.push('/')}
              className="w-full"
            >
              Back to Home
            </Button>
          </div>
          
          <div className="mt-6 text-xs text-gray-500">
            <p>A confirmation email has been sent to your email address.</p>
            <p>Please keep your order ID for future reference.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 