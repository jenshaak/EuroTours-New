import { NextResponse } from 'next/server'
import { coinRemitterAPI } from '@/lib/services/coinremitter'

export async function GET() {
  const testCurrencies = [
    'btc', 'eth', 'ltc', 'doge', 'bch', 'usdt', 'trx', 'bnb', 'ada', 'xrp'
  ]
  
  const supportedCurrencies = []
  const unsupportedCurrencies = []
  
  console.log('🧪 Testing CoinRemitter currency support...')
  
  for (const currency of testCurrencies) {
    try {
      console.log(`Testing ${currency.toUpperCase()}...`)
      await coinRemitterAPI.getBalance(currency)
      supportedCurrencies.push(currency.toUpperCase())
      console.log(`✅ ${currency.toUpperCase()} is supported`)
    } catch (error) {
      unsupportedCurrencies.push({
        currency: currency.toUpperCase(),
        error: error.message
      })
      console.log(`❌ ${currency.toUpperCase()} is not supported: ${error.message}`)
    }
  }
  
  console.log('🏁 Currency test completed')
  console.log(`✅ Supported: ${supportedCurrencies.join(', ')}`)
  console.log(`❌ Unsupported: ${unsupportedCurrencies.map(c => c.currency).join(', ')}`)
  
  return NextResponse.json({
    supported: supportedCurrencies,
    unsupported: unsupportedCurrencies,
    timestamp: new Date().toISOString()
  })
} 