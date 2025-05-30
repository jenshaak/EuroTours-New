class CoinRemitterAPI {
  constructor() {
    this.apiKey = process.env.COINREMITTER_API_KEY
    this.password = process.env.COINREMITTER_PASSWORD
    this.baseUrl = 'https://coinremitter.com/api'
    
    if (!this.apiKey || !this.password) {
      throw new Error('CoinRemitter API credentials are missing')
    }
  }

  async makeRequest(endpoint, data = {}) {
    const url = `${this.baseUrl}/${endpoint}`
    
    const payload = {
      api_key: this.apiKey,
      password: this.password,
      ...data
    }

    try {
      console.log(`🚀 CoinRemitter API Request to ${endpoint}:`, payload)
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()
      console.log(`📥 CoinRemitter API Response from ${endpoint}:`, result)

      if (!response.ok || result.flag !== 1) {
        throw new Error(result.msg || 'CoinRemitter API request failed')
      }

      return result.data
    } catch (error) {
      console.error(`❌ CoinRemitter API Error (${endpoint}):`, error)
      throw error
    }
  }

  // Get supported currencies
  async getSupportedCurrencies() {
    try {
      // Based on CoinRemitter TestCoin account, only TCN (TestCoin) seems to be supported
      // The free/test plan has limited cryptocurrency support
      return [
        { code: 'TCN', name: 'TestCoin', network: 'tcn' }
      ]
    } catch (error) {
      console.error('Error getting supported currencies:', error)
      return []
    }
  }

  // Create a new invoice
  async createInvoice(params) {
    const {
      amount,
      currency, // USD amount
      coin, // Cryptocurrency (btc, eth, ltc, etc.)
      orderId,
      description,
      webhookUrl,
      expireTime = 60 // 1 hour in MINUTES (CoinRemitter expects minutes, max 1440)
    } = params

    const invoiceData = {
      amount: parseFloat(amount),
      currency: currency.toUpperCase(),
      coin: coin.toLowerCase(),
      order_id: orderId,
      description: description || `EuroTours Payment - ${orderId}`,
      webhook_url: webhookUrl,
      expire_time: expireTime, // Already in minutes
      custom_data1: orderId,
      custom_data2: 'eurotours'
    }

    const result = await this.makeRequest(`v3/${coin.toLowerCase()}/create-invoice`, invoiceData)
    
    return {
      invoiceId: result.invoice_id,
      address: result.address,
      amount: result.amount,
      currency: result.currency,
      coin: result.coin,
      qrCode: result.qr_code,
      url: result.url,
      expireTime: result.expire_time,
      status: result.status,
      totalAmount: {
        crypto: result.total_amount?.crypto || result.amount,
        usd: result.total_amount?.usd || amount
      }
    }
  }

  // Get invoice details
  async getInvoice(invoiceId, coin) {
    const result = await this.makeRequest(`v3/${coin.toLowerCase()}/get-invoice`, {
      invoice_id: invoiceId
    })

    return {
      invoiceId: result.invoice_id,
      address: result.address,
      amount: result.amount,
      currency: result.currency,
      coin: result.coin,
      status: result.status,
      paidAmount: result.paid_amount,
      confirmations: result.confirmations,
      orderId: result.order_id,
      expireTime: result.expire_time,
      totalAmount: {
        crypto: result.total_amount?.crypto || result.amount,
        usd: result.total_amount?.usd
      }
    }
  }

  // Get wallet balance
  async getBalance(coin) {
    const result = await this.makeRequest(`v3/${coin.toLowerCase()}/get-balance`)
    
    return {
      balance: result.balance,
      coin: result.coin
    }
  }

  // Validate webhook data
  validateWebhook(webhookData, signature) {
    // Implement webhook signature validation if CoinRemitter provides it
    // For now, we'll do basic validation
    return webhookData && webhookData.invoice_id
  }

  // Convert status from CoinRemitter to our internal status
  mapStatus(coinremitterStatus) {
    // Handle both string and number status codes
    const status = parseInt(coinremitterStatus)
    
    switch (status) {
      case 0:
        return 'pending'
      case 1:
        return 'paid'
      case 2:
        return 'partially_paid'
      case 3:
        return 'overpaid'
      case 4:
        return 'expired'
      case 5:
        return 'cancelled'
      default:
        return 'pending' // Default to pending for unknown statuses
    }
  }
}

export const coinRemitterAPI = new CoinRemitterAPI() 