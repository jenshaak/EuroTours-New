# 🚀 Coinbase Commerce Setup Instructions

## 1. Create .env.local file

Create a file named `.env.local` in your project root directory with these contents:

```bash
# CoinRemitter API Configuration
COINREMITTER_API_KEY=wkey_XAYVV4x4G6ZUqW4
COINREMITTER_PASSWORD=TestCoin123@

# Coinbase Commerce API Configuration  
COINBASE_COMMERCE_API_KEY=d7d33ad7-b747-4e45-bb76-03433f337291
COINBASE_COMMERCE_WEBHOOK_SECRET=your-webhook-secret-here

# Application Configuration
NEXTAUTH_URL=http://localhost:3003
NEXTAUTH_SECRET=your-secret-key-here
```

## 2. Get Coinbase Commerce Webhook Secret

1. Go to [Coinbase Commerce Dashboard](https://commerce.coinbase.com/)
2. Login with your account
3. Go to Settings → Notifications
4. Add webhook endpoint: `https://your-domain.com/api/coinbase/webhook`
5. Copy the "Shared Secret" and replace `your-webhook-secret-here` in the .env.local file

## 3. Test the Integration

1. Save the .env.local file
2. Restart your development server
3. Try booking a trip and selecting "Pay with Coinbase Commerce"

## 4. Current Status

✅ **Implemented**: 
- Coinbase Commerce service
- Payment APIs
- Webhook handlers
- Order integration
- Three payment methods: Card, CoinRemitter, Coinbase Commerce

⚠️ **Next Steps**:
- Create .env.local file (above)
- Set up Coinbase Commerce account
- Configure webhook endpoint
- Test payment flow 