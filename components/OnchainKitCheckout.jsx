'use client'

import { useState } from 'react'

export default function OnchainKitCheckout({ 
  orderId, 
  amount, 
  customerEmail, 
  onSuccess, 
  onError 
}) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePayment = async () => {
    setIsLoading(true)
    
    try {
      // Create charge using OnchainKit approach
      const response = await fetch('/api/onchainkit/create-charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId,
          amount,
          currency: 'USDC',
          description: `EuroTours bus ticket payment`,
          customerEmail
        })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create payment')
      }

      // Redirect to Coinbase Commerce hosted checkout
      window.location.href = result.charge.hosted_url
      
    } catch (error) {
      console.error('OnchainKit payment error:', error)
      onError?.(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading}
      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <span>Creating Payment...</span>
        </>
      ) : (
        <>
          <span>💰</span>
          <span>Pay with USDC (OnchainKit)</span>
        </>
      )}
    </button>
  )
} 