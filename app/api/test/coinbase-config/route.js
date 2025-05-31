import { NextResponse } from 'next/server'

export async function GET() {
  console.log('🔧 === COINBASE CONFIG TEST ===')
  
  const result = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    coinbaseApiKeyExists: !!process.env.COINBASE_COMMERCE_API_KEY,
    coinbaseApiKeyLength: process.env.COINBASE_COMMERCE_API_KEY ? process.env.COINBASE_COMMERCE_API_KEY.length : 0,
    coinbaseApiKeyPrefix: process.env.COINBASE_COMMERCE_API_KEY ? process.env.COINBASE_COMMERCE_API_KEY.substring(0, 8) + '...' : 'NOT_SET',
    webhookSecretExists: !!process.env.COINBASE_COMMERCE_WEBHOOK_SECRET,
    webhookSecretLength: process.env.COINBASE_COMMERCE_WEBHOOK_SECRET ? process.env.COINBASE_COMMERCE_WEBHOOK_SECRET.length : 0,
    otherEnvVars: {
      databaseUrl: !!process.env.DATABASE_URL,
      smtpHost: !!process.env.SMTP_HOST,
      smtpUser: !!process.env.SMTP_USER,
      smtpPassword: !!process.env.SMTP_PASSWORD
    }
  }
  
  console.log('🔧 Coinbase config check result:', JSON.stringify(result, null, 2))
  
  return NextResponse.json(result)
} 