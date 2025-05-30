class CoinbaseCommerceAPI {
  constructor() {
    this.Client = null
    this.Charge = null
    this.Webhook = null
    this.initialized = false
  }

  async initialize() {
    if (this.initialized) return

    console.log('🔍 Debugging Coinbase Commerce environment variables:')
    console.log('COINBASE_COMMERCE_API_KEY exists:', !!process.env.COINBASE_COMMERCE_API_KEY)
    console.log('COINBASE_COMMERCE_API_KEY length:', process.env.COINBASE_COMMERCE_API_KEY?.length || 0)
    console.log('COINBASE_COMMERCE_API_KEY value:', process.env.COINBASE_COMMERCE_API_KEY ? `${process.env.COINBASE_COMMERCE_API_KEY.substring(0, 8)}...` : 'undefined')
    
    if (!process.env.COINBASE_COMMERCE_API_KEY) {
      console.warn('⚠️ COINBASE_COMMERCE_API_KEY not found - Coinbase Commerce will be disabled')
      this.initialized = true // Mark as initialized but disabled
      return
    }

    try {
      // Dynamic import to handle CommonJS module
      const coinbaseCommerce = await import('coinbase-commerce-node')
      
      // Handle both default and named exports
      const { Client, resources, Webhook } = coinbaseCommerce.default || coinbaseCommerce
      
      // Initialize Coinbase Commerce client
      Client.init(process.env.COINBASE_COMMERCE_API_KEY)
      
      this.Client = Client
      this.Charge = resources.Charge
      this.Webhook = Webhook
      this.initialized = true
      
      console.log('🟡 Coinbase Commerce API initialized')
    } catch (error) {
      console.error('❌ Failed to initialize Coinbase Commerce:', error)
      this.initialized = true // Mark as initialized but disabled
    }
  }

  // Create a new charge for payment
  async createCharge(params) {
    await this.initialize()

    if (!this.Charge) {
      throw new Error('Coinbase Commerce is not available. Please check your API configuration.')
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

      console.log('🟡 Creating Coinbase Commerce charge:', chargeData)
      
      const charge = await this.Charge.create(chargeData)
      
      console.log('✅ Coinbase Commerce charge created:', {
        id: charge.id,
        hosted_url: charge.hosted_url,
        status: charge.timeline[charge.timeline.length - 1]?.status
      })

      return {
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
    } catch (error) {
      console.error('❌ Coinbase Commerce charge creation error:', error)
      throw error
    }
  }

  // Retrieve charge details
  async getCharge(chargeId) {
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