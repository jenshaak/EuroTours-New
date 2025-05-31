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

    if (!process.env.COINBASE_COMMERCE_API_KEY) {
      console.warn('⚠️ COINBASE_COMMERCE_API_KEY not found - Coinbase Commerce will be disabled')
      this.initialized = true // Mark as initialized but disabled
      return
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
      
      console.log('🟡 Initializing Coinbase Commerce client with API key...')
      // Initialize Coinbase Commerce client
      Client.init(process.env.COINBASE_COMMERCE_API_KEY)
      
      this.Client = Client
      this.Charge = resources.Charge
      this.Webhook = Webhook
      this.initialized = true
      
      console.log('🟡 Coinbase Commerce API initialized successfully')
      console.log('🟡 this.Client exists:', !!this.Client)
      console.log('🟡 this.Charge exists:', !!this.Charge)
      console.log('🟡 this.Webhook exists:', !!this.Webhook)
    } catch (error) {
      console.error('❌ Failed to initialize Coinbase Commerce:', error)
      console.error('❌ Initialization error stack:', error.stack)
      this.initialized = true // Mark as initialized but disabled
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