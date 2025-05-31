class CoinbaseCommerceAPI {
  constructor() {
    this.Client = null
    this.Charge = null
    this.Webhook = null
    this.initialized = false
  }

  async initialize() {
    console.log('🟡 Coinbase Commerce API initialization starting...')
    
    if (this.initialized) {
      console.log('🟡 Coinbase Commerce API already initialized')
      return
    }

    // Enhanced environment variable checking
    const apiKey = process.env.COINBASE_COMMERCE_API_KEY
    console.log('🟡 Environment check:')
    console.log('🟡 - NODE_ENV:', process.env.NODE_ENV)
    console.log('🟡 - COINBASE_COMMERCE_API_KEY exists:', !!apiKey)
    console.log('🟡 - COINBASE_COMMERCE_API_KEY length:', apiKey ? apiKey.length : 0)
    console.log('🟡 - COINBASE_COMMERCE_API_KEY prefix:', apiKey ? apiKey.substring(0, 8) + '...' : 'NOT_SET')
    
    if (!apiKey) {
      console.warn('⚠️ COINBASE_COMMERCE_API_KEY not found - Coinbase Commerce will be disabled')
      console.warn('⚠️ Available environment variables:', Object.keys(process.env).filter(key => key.includes('COINBASE')))
      this.initialized = true // Mark as initialized but disabled
      return
    }

    // Validate API key format
    if (!apiKey.match(/^[a-f0-9-]{36}$/)) {
      console.warn('⚠️ COINBASE_COMMERCE_API_KEY format appears invalid (should be UUID format)')
      console.warn('⚠️ Current format:', apiKey.replace(/./g, '*'))
    }

    try {
      console.log('🟡 Attempting to import coinbase-commerce-node...')
      // Dynamic import to handle CommonJS module
      const coinbaseCommerce = await import('coinbase-commerce-node')
      console.log('✅ coinbase-commerce-node imported successfully')
      
      // Handle both default and named exports
      const { Client, resources, Webhook } = coinbaseCommerce.default || coinbaseCommerce
      console.log('🟡 Extracted Client, resources, and Webhook from import')
      console.log('🟡 Client exists:', !!Client)
      console.log('🟡 resources exists:', !!resources)
      console.log('🟡 Webhook exists:', !!Webhook)
      
      if (!Client || !resources || !Webhook) {
        throw new Error('Failed to extract required components from coinbase-commerce-node')
      }
      
      console.log('🟡 Initializing Coinbase Commerce client with API key...')
      // Initialize Coinbase Commerce client
      try {
        Client.init(apiKey)
        console.log('✅ Coinbase Commerce client initialized successfully')
      } catch (initError) {
        console.error('❌ Client.init failed:', initError)
        throw new Error(`Failed to initialize Coinbase client: ${initError.message}`)
      }
      
      this.Client = Client
      this.Charge = resources.Charge
      this.Webhook = Webhook
      this.initialized = true
      
      console.log('🟡 Coinbase Commerce API initialized successfully')
      console.log('🟡 this.Client exists:', !!this.Client)
      console.log('🟡 this.Charge exists:', !!this.Charge)
      console.log('🟡 this.Webhook exists:', !!this.Webhook)
      
      // Test the connection by checking if we can access the Charge resource
      try {
        console.log('🟡 Testing Coinbase Commerce connection...')
        // This doesn't make a network call, just checks if the resource is available
        if (this.Charge && typeof this.Charge.create === 'function') {
          console.log('✅ Coinbase Commerce connection test passed')
        } else {
          console.warn('⚠️ Coinbase Commerce Charge resource not properly initialized')
        }
      } catch (testError) {
        console.warn('⚠️ Coinbase Commerce connection test failed:', testError)
      }
      
    } catch (error) {
      console.error('❌ Failed to initialize Coinbase Commerce:', error)
      console.error('❌ Initialization error type:', error.constructor.name)
      console.error('❌ Initialization error message:', error.message)
      console.error('❌ Initialization error stack:', error.stack)
      
      // Provide specific error guidance
      if (error.message.includes('Cannot resolve module')) {
        console.error('❌ Module resolution error - coinbase-commerce-node may not be installed')
      } else if (error.message.includes('API key')) {
        console.error('❌ API key error - check COINBASE_COMMERCE_API_KEY environment variable')
      } else if (error.message.includes('Network')) {
        console.error('❌ Network error - check internet connection and Coinbase Commerce service status')
      }
      
      this.initialized = true // Mark as initialized but disabled
      // Don't rethrow here, let the service be disabled
    }
  }

  // Create a new charge for payment
  async createCharge(params) {
    console.log('🟡 createCharge called with params:', JSON.stringify(params, null, 2))
    
    await this.initialize()

    if (!this.Charge) {
      const errorMsg = 'Coinbase Commerce is not available. Please check your API configuration.'
      console.error('❌ createCharge failed:', errorMsg)
      throw new Error(errorMsg)
    }

    const {
      amount,
      currency, // USD amount
      orderId,
      description,
      customerEmail,
      redirectUrl = null
    } = params

    try {
      console.log('🟡 Building charge data...')
      const chargeData = {
        name: `EuroTours Bus Ticket - Order ${orderId}`,
        description: description || `Bus ticket payment for order ${orderId}`,
        pricing_type: 'fixed_price',
        local_price: {
          amount: amount.toString(),
          currency: currency.toUpperCase()
        },
        metadata: {
          order_id: orderId,
          customer_email: customerEmail,
          service: 'eurotours'
        }
      }

      // Add redirect URL if provided
      if (redirectUrl) {
        chargeData.redirect_url = redirectUrl
      }

      console.log('🟡 Final charge data prepared:', JSON.stringify(chargeData, null, 2))
      console.log('🟡 Creating Coinbase Commerce charge...')
      
      const charge = await this.Charge.create(chargeData)
      
      console.log('✅ Coinbase Commerce charge created successfully')
      console.log('✅ Raw charge response:', JSON.stringify(charge, null, 2))

      const result = {
        success: true,
        charge: {
          id: charge.id,
          hosted_url: charge.hosted_url,
          code: charge.code,
          status: this.mapStatus(charge.timeline[charge.timeline.length - 1]?.status),
          amount: charge.pricing.local.amount,
          currency: charge.pricing.local.currency,
          created_at: charge.created_at,
          expires_at: charge.expires_at,
          addresses: charge.addresses || {},
          timeline: charge.timeline
        }
      }
      
      console.log('✅ Processed charge result:', JSON.stringify(result, null, 2))
      return result
    } catch (error) {
      console.error('❌ Coinbase Commerce charge creation error:', error)
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        response: error.response?.data || error.response || 'No response data'
      })
      throw error
    }
  }

  // Retrieve charge details
  async getCharge(chargeId) {
    console.log('🟡 getCharge called for ID:', chargeId)
    
    await this.initialize()

    if (!this.Charge) {
      throw new Error('Coinbase Commerce is not available. Please check your API configuration.')
    }

    try {
      const charge = await this.Charge.retrieve(chargeId)
      
      return {
        id: charge.id,
        code: charge.code,
        hosted_url: charge.hosted_url,
        status: this.mapStatus(charge.timeline[charge.timeline.length - 1]?.status),
        amount: charge.pricing.local.amount,
        currency: charge.pricing.local.currency,
        created_at: charge.created_at,
        expires_at: charge.expires_at,
        addresses: charge.addresses || {},
        timeline: charge.timeline,
        metadata: charge.metadata
      }
    } catch (error) {
      console.error('❌ Coinbase Commerce charge retrieval error:', error)
      throw error
    }
  }

  // Verify webhook signature
  async verifyWebhook(rawBody, signature, webhookSecret) {
    await this.initialize()

    if (!this.Webhook) {
      throw new Error('Coinbase Commerce webhook verification is not available. Please check your API configuration.')
    }

    try {
      const event = this.Webhook.verifyEventBody(rawBody, signature, webhookSecret)
      console.log('✅ Coinbase Commerce webhook verified:', event.type)
      return event
    } catch (error) {
      console.error('❌ Coinbase Commerce webhook verification failed:', error)
      throw error
    }
  }

  // Map Coinbase Commerce status to our internal status
  mapStatus(coinbaseStatus) {
    console.log('🟡 Mapping Coinbase status:', coinbaseStatus)
    switch (coinbaseStatus) {
      case 'NEW':
        return 'pending'
      case 'PENDING':
        return 'pending'
      case 'COMPLETED':
        return 'paid'
      case 'EXPIRED':
        return 'expired'
      case 'UNRESOLVED':
        return 'partially_paid'
      case 'RESOLVED':
        return 'paid'
      case 'CANCELED':
        return 'cancelled'
      default:
        console.warn('⚠️ Unknown Coinbase status:', coinbaseStatus)
        return 'pending'
    }
  }

  // Get supported cryptocurrencies from Coinbase Commerce
  async getSupportedCurrencies() {
    // Coinbase Commerce supports many cryptocurrencies
    // This is a static list of the most popular ones
    return [
      { code: 'BTC', name: 'Bitcoin' },
      { code: 'ETH', name: 'Ethereum' },
      { code: 'LTC', name: 'Litecoin' },
      { code: 'BCH', name: 'Bitcoin Cash' },
      { code: 'USDC', name: 'USD Coin' },
      { code: 'DAI', name: 'Dai' },
      { code: 'DOGE', name: 'Dogecoin' }
    ]
  }
}

// Create singleton instance
const coinbaseCommerceAPI = new CoinbaseCommerceAPI()

export { coinbaseCommerceAPI } 