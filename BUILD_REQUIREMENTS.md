# 🚀 EuroTours Next.js Complete Rebuild Guide

## 📋 **Project Overview**

EuroTours is a **European bus ticket booking platform** that aggregates routes from multiple bus companies and allows customers to search, compare, and book tickets online. The platform supports multiple languages, currencies, and payment methods including traditional cards and cryptocurrencies.

### **Core Business Model**
- **Route Aggregation**: Combines internal routes with external providers (FlixBus, BlaBlaCar, Ecolines, etc.)
- **Multi-language Support**: Czech, English, Bulgarian, Russian, Ukrainian
- **Multi-currency**: CZK, EUR with real-time conversion
- **Payment Processing**: WebPay (cards) + CoinRemitter (crypto)
- **Commission-based**: Earns from ticket sales and payment processing

## 🏗️ **System Architecture**

### **Frontend Requirements**
- **Next.js** with App Router
- **JavaScript ES6+** 
- **Tailwind CSS** for styling
- **ShadCN** for most components

### **Backend Requirements**
- **MongoDB**

### **External Integrations**
- **Payment Gateways**: WebPay, CoinRemitter
- **Bus APIs**: FlixBus, BlaBlaCar, Ecolines, Student Agency, etc.
- **Currency Exchange**: Real-time rates
- **Email Service**: SMTP or SendGrid

## 🗄️ **Database Structure**

### **Core Entities**

#### **Countries**
```javascript
// Country object structure
const country = {
  id: Number,
  code: String, // "CZ", "GB", "DE"
  names: {}, // { en: "Czech Republic", cs: "Česká republika" }
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### **Cities**
```javascript
// City object structure
const city = {
  id: Number,
  countryId: Number,
  names: {}, // { en: "Prague", cs: "Praha" }
  variations: [], // Alternative names for search
  isActive: Boolean,
  latitude: Number, // optional
  longitude: Number, // optional
  createdAt: Date,
  updatedAt: Date
}
```

#### **Carriers**
```javascript
// Carrier object structure
const carrier = {
  id: Number,
  code: String, // "FB" for FlixBus, "BLA" for BlaBlaCar
  name: String,
  isExternal: Boolean,
  logoUrl: String, // optional
  website: String, // optional
  isActive: Boolean
}
```

#### **Routes**
```javascript
// Route object structure
const route = {
  id: String,
  searchId: String,
  carrierId: Number,
  fromCityId: Number,
  toCityId: Number,
  departureTime: Date,
  arrivalTime: Date,
  direction: String, // "there" | "back"
  price: Number,
  maxPrice: Number, // optional
  currency: String,
  isExternal: Boolean,
  externalId: String, // optional
  isDirect: Boolean,
  availableSeats: Number, // optional
  createdAt: Date
}
```

#### **Searches**
```javascript
// Search object structure
const search = {
  id: String,
  fromCityId: Number,
  toCityId: Number,
  departureDate: Date,
  returnDate: Date, // optional
  type: String, // "one-way" | "return" | "return-open"
  createdAt: Date
}
```

#### **Orders**
```javascript
// Order object structure
const order = {
  id: String,
  email: String,
  phone: String,
  totalPrice: Number,
  currency: String,
  status: String, // "pending" | "confirmed" | "cancelled"
  paymentMethod: String, // "card" | "crypto"
  paymentId: String, // optional
  createdAt: Date,
  updatedAt: Date
}
```

#### **OrderPersons**
```javascript
// OrderPerson object structure
const orderPerson = {
  id: String,
  orderId: String,
  name: String,
  phone: String, // optional
  dateOfBirth: Date, // optional
  documentNumber: String, // optional
  seatNumber: String // optional
}
```

#### **Payments**
```javascript
// Payment object structure
const payment = {
  id: String,
  orderId: String,
  amount: Number,
  currency: String,
  method: String, // "webpay" | "crypto"
  status: String, // "pending" | "completed" | "failed" | "expired"
  externalId: String, // optional
  cryptoCurrency: String, // optional
  cryptoInvoiceId: String, // optional
  webhookData: {}, // optional
  createdAt: Date,
  updatedAt: Date
}
```

### **External Integration Entities**

#### **ExternalCities**
```javascript
// ExternalCity object structure
const externalCity = {
  id: Number,
  cityId: Number,
  provider: String, // "flixbus" | "blablacar" | "ecolines" | "student_agency" | "east_express" | "eurolines" | "trans_tempo"
  externalId: String,
  externalName: String,
  isProcessed: Boolean
}
```

#### **ExternalSearches**
```javascript
// ExternalSearch object structure
const externalSearch = {
  id: String,
  searchId: String,
  provider: String,
  status: String, // "queued" | "processing" | "completed" | "failed"
  processedAt: Date, // optional
  showedAt: Date, // optional
  errorMessage: String // optional
}
```

## 🔑 **API Credentials & Configuration**

### **Required API Keys**

#### **1. BlaBlaCar API**
```javascript
const BLABLACAR_CONFIG = {
  url: "https://ims.blablacar.pro/cgi-bin/gtmapp/wapi/",
  login: "eurotours_v2_api",
  password: "x5Y22ex6sX3kFD", // Production
  testUrl: "https://ims-preprod.blablacar.pro/cgi-bin/gtmapp/wapi/",
  testPassword: "BkSNz6a2ky9e4H" // Test environment
}
```

#### **2. Ecolines API**
```javascript
const ECOLINES_CONFIG = {
  url: "https://eurotours_API:xSk2WHr8Saa@api2.ecolines.net/v1/",
  // Authentication is embedded in URL (HTTP Basic Auth)
}
```

#### **3. Student Agency API**
```javascript
const STUDENT_AGENCY_CONFIG = {
  url: "https://brn-ybus-api.sa.cz/v2/r0/AffiliateBookingService?WSDL",
  username: "eurotours15062016",
  password: "I8ry0OUqDb",
  authorization: "Basic ZXVyb3RvdXJzMTUwNjIwMTY6SThyeTBPVXFEYg=="
}
```

#### **4. East Express**
```javascript
const EAST_EXPRESS_CONFIG = {
  loginUrl: "http://www.east-express.cz/sale/login.php",
  username: "eurotours",
  password: "florenc19"
}
```

#### **5. TransTempo**
```javascript
const TRANS_TEMPO_CONFIG = {
  adminEmail: "transtempo67@ukr.net",
  adminPassword: "NJKlc#vjnDm23fnc28n"
}
```

#### **6. Eurolines**
```javascript
const EUROLINES_CONFIG = {
  loginUrl: "https://touringbohemia.amtis.eu/Account/Login",
  username: "ag152",
  password: "Jana2017"
}
```

#### **7. FlixBus (No API Key Required)**
```javascript
const FLIXBUS_CONFIG = {
  citiesUrl: "https://search.k8s.mfb.io/api/v1/cities",
  stationsUrl: "https://search.k8s.mfb.io/api/v1/stations",
  searchUrl: "https://search.k8s.mfb.io/api/v2/search",
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
}
```

### **Payment API Keys**

#### **WebPay Configuration**
```javascript
const WEBPAY_CONFIG = {
  merchantNumber: "2000301041",
  privateKeyPassword: "florenc",
  url: "https://3dsecure.gpwebpay.com/pgw/order.do",
  // Private/Public key files needed
}
```

#### **CoinRemitter Configuration**
```javascript
const COINREMITTER_CONFIG = {
  apiKey: "wkey_XAYVV4x4G6ZUqW4",
  password: "TestCoin123@",
  supportedCurrencies: ["BTC", "ETH", "LTC", "DOGE"],
  feePercentage: 0.23
}
```

## 🔄 **External API Integration Logic**

### **Search Flow**
1. **User submits search** (Prague → London, 2024-12-01)
2. **Create Search record** in database
3. **Find internal routes** from local database
4. **Queue external searches** for each provider
5. **Background workers** process external APIs
6. **Merge results** and display to user

### **External API Processing**

#### **FlixBus Integration**
```javascript
async function searchFlixBus(fromCityId, toCityId, date) {
  const params = {
    from_city_id: fromCityId,
    to_city_id: toCityId,
    departure_date: date.toLocaleDateString("cs-CZ"),
    search_by: "cities",
    currency: "CZK",
    include_after_midnight_rides: 0,
    bike_slot: 0,
    _locale: "cs",
    products: JSON.stringify({ adult: 1 })
  }
  
  const response = await fetch(`${FLIXBUS_CONFIG.searchUrl}?${new URLSearchParams(params)}`, {
    headers: {
      'User-Agent': FLIXBUS_CONFIG.userAgent,
      'Referer': 'https://shop.flixbus.cz/search'
    }
  })
  
  return response.json()
}
```

#### **BlaBlaCar Integration**
```javascript
async function searchBlaBlaCar(fromCityId, toCityId, date) {
  // 1. Login to get session token
  const loginResponse = await fetch(`${BLABLACAR_CONFIG.url}login`, {
    method: 'POST',
    body: JSON.stringify({
      login: BLABLACAR_CONFIG.login,
      password: BLABLACAR_CONFIG.password
    })
  })
  
  const { token } = await loginResponse.json()
  
  // 2. Search for trips
  const searchResponse = await fetch(`${BLABLACAR_CONFIG.url}trips`, {
    headers: { session: token },
    body: JSON.stringify({
      from: fromCityId,
      to: toCityId,
      when: date.toISOString().split('T')[0],
      currency: "CZK"
    })
  })
  
  return searchResponse.json()
}
```

### **Background Job Processing**
```javascript
// Queue structure for external searches
const externalSearchJob = {
  searchId: String,
  provider: String,
  fromCityId: String,
  toCityId: String,
  date: Date,
  currency: String
}

// Background worker processes these jobs
async function processExternalSearch(job) {
  try {
    let routes = []
    
    switch (job.provider) {
      case 'flixbus':
        routes = await searchFlixBus(job.fromCityId, job.toCityId, job.date)
        break
      case 'blablacar':
        routes = await searchBlaBlaCar(job.fromCityId, job.toCityId, job.date)
        break
      // ... other providers
    }
    
    // Save routes to database
    await saveExternalRoutes(job.searchId, routes, job.provider)
    
    // Mark search as completed
    await updateExternalSearchStatus(job.searchId, job.provider, 'completed')
    
  } catch (error) {
    await updateExternalSearchStatus(job.searchId, job.provider, 'failed', error.message)
  }
}
```

## 💳 **Payment Integration**

### **WebPay (Card Payments)**
```javascript
// WebPay payment object structure
const webPayPayment = {
  merchantNumber: String,
  orderNumber: String,
  amount: Number, // in cents
  currency: String,
  depositFlag: Number,
  url: String,
  description: String
}

async function createWebPayPayment(order) {
  const payment = {
    merchantNumber: WEBPAY_CONFIG.merchantNumber,
    orderNumber: order.id,
    amount: Math.round(order.totalPrice * 100), // Convert to cents
    currency: order.currency === 'CZK' ? '203' : '978', // CZK or EUR
    depositFlag: 1,
    url: `${process.env.DOMAIN}/payment/webpay/callback`,
    description: `EuroTours Order ${order.id}`
  }
  
  // Sign the request with private key
  const signature = signWebPayRequest(payment)
  
  // Redirect user to WebPay
  return `${WEBPAY_CONFIG.url}?${new URLSearchParams({...payment, signature})}`
}
```

### **CoinRemitter (Crypto Payments)**
```javascript
async function createCryptoPayment(order, cryptocurrency) {
  const invoice = await coinRemitter.createInvoice({
    amount: convertToUSD(order.totalPrice, order.currency),
    currency: cryptocurrency,
    description: `EuroTours Order ${order.id}`,
    webhook_url: `${process.env.DOMAIN}/api/crypto/webhook`,
    expire_time: 3600 // 1 hour
  })
  
  await db.payment.create({
    data: {
      orderId: order.id,
      amount: order.totalPrice,
      currency: order.currency,
      method: 'crypto',
      cryptoCurrency: cryptocurrency,
      cryptoInvoiceId: invoice.invoice_id,
      status: 'pending'
    }
  })
  
  return invoice
}
```

## 🌍 **Internationalization**

### **Translation Structure**
```javascript
// locales/en.json
{
  "search": {
    "from": "From",
    "to": "To",
    "departure": "Departure date",
    "return": "Return date",
    "find": "Search",
    "oneWay": "One way",
    "returnTrip": "Return trip"
  },
  "route": {
    "arrival": "arrival",
    "selectLine": "Choose",
    "variablePrice": "variable price",
    "noRoutesFound": "No routes found",
    "noRoutesFoundDescription": "Unfortunately, no direct routes were found for your search. Please try different dates or check our external partners below.",
    "checkExternalRoutes": "Checking external routes..."
  },
  "order": {
    "fullName": "Name and Surname",
    "email": "E-mail",
    "phone": "Phone",
    "buy": "Buy",
    "book": "Book"
  }
}
```

### **Currency Support**
```javascript
const SUPPORTED_CURRENCIES = {
  CZK: { symbol: 'Kč', rate: 1 },
  EUR: { symbol: '€', rate: 0.041 } // Dynamic rate from API
}

async function convertCurrency(amount, from, to) {
  if (from === to) return amount
  
  const rates = await fetchExchangeRates()
  return amount * rates[to] / rates[from]
}
```

## 🎨 **UI/UX Components**

### **Search Form Component**
```javascript
// SearchForm component props structure
const searchFormProps = {
  initialValues: {
    fromCity: {}, // City object (optional)
    toCity: {}, // City object (optional)
    departureDate: Date, // optional
    returnDate: Date, // optional
    tripType: String // 'one-way' | 'return' (optional)
  }
}

export function SearchForm({ initialValues }) {
  const { register, handleSubmit, watch } = useForm()
  const tripType = watch('tripType')
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <CitySelect 
        name="fromCity" 
        label="From"
        placeholder="Select departure city"
        {...register('fromCity', { required: true })}
      />
      
      <CitySelect 
        name="toCity" 
        label="To"
        placeholder="Select destination city"
        {...register('toCity', { required: true })}
      />
      
      <DatePicker 
        name="departureDate"
        label="Departure date"
        minDate={new Date()}
        {...register('departureDate', { required: true })}
      />
      
      <div className="flex items-center space-x-2">
        <input 
          type="checkbox" 
          {...register('tripType')}
          value="return"
        />
        <label>I want a return ticket</label>
      </div>
      
      {tripType === 'return' && (
        <DatePicker 
          name="returnDate"
          label="Return date"
          minDate={watch('departureDate')}
          {...register('returnDate')}
        />
      )}
      
      <button 
        type="submit"
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
      >
        Search
      </button>
    </form>
  )
}
```

### **Route Card Component**
```javascript
// RouteCard component props structure
const routeCardProps = {
  route: {}, // Route object
  onSelect: Function // (route) => void
}

export function RouteCard({ route, onSelect }) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {format(route.departureTime, 'HH:mm')}
              </div>
              <div className="text-sm text-gray-600">
                {route.fromCity.name}
              </div>
            </div>
            
            <div className="flex-1 text-center">
              <div className="text-sm text-gray-500">
                {formatDuration(route.departureTime, route.arrivalTime)}
              </div>
              <div className="border-t border-gray-300 my-2"></div>
              {!route.isDirect && (
                <div className="text-xs text-orange-600">with transfer</div>
              )}
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">
                {format(route.arrivalTime, 'HH:mm')}
              </div>
              <div className="text-sm text-gray-600">
                {route.toCity.name}
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-right ml-4">
          <div className="text-2xl font-bold text-green-600">
            {formatPrice(route.price, route.currency)}
          </div>
          <button 
            onClick={() => onSelect(route)}
            className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Select
          </button>
        </div>
      </div>
    </div>
  )
}
```

## 🔧 **API Routes Structure**

### **Search API**
```javascript
// app/api/search/route.js
export async function POST(request) {
  const { fromCityId, toCityId, departureDate, returnDate, tripType } = await request.json()
  
  // Create search record
  const search = await db.search.create({
    data: {
      fromCityId,
      toCityId,
      departureDate: new Date(departureDate),
      returnDate: returnDate ? new Date(returnDate) : null,
      type: tripType
    }
  })
  
  // Find internal routes
  const internalRoutes = await findInternalRoutes(search)
  
  // Queue external searches
  await queueExternalSearches(search)
  
  return NextResponse.json({
    searchId: search.id,
    routes: internalRoutes
  })
}
```

### **External Routes API**
```javascript
// app/api/search/[searchId]/external/route.js
export async function GET(request, { params }) {
  const { searchId } = params
  
  // Get external search status
  const externalSearches = await db.externalSearch.findMany({
    where: { searchId }
  })
  
  // Get new routes that haven't been shown yet
  const newRoutes = await db.route.findMany({
    where: {
      searchId,
      isExternal: true,
      showedAt: null
    }
  })
  
  // Mark routes as shown
  await db.route.updateMany({
    where: { id: { in: newRoutes.map(r => r.id) } },
    data: { showedAt: new Date() }
  })
  
  const processing = externalSearches.filter(s => s.status === 'processing').length
  
  return NextResponse.json({
    processing,
    routes: newRoutes
  })
}
```

### **Payment API**
```javascript
// app/api/payment/create/route.js
export async function POST(request) {
  const { orderId, method, cryptocurrency } = await request.json()
  
  const order = await db.order.findUnique({ where: { id: orderId } })
  if (!order) throw new Error('Order not found')
  
  if (method === 'card') {
    const paymentUrl = await createWebPayPayment(order)
    return NextResponse.json({ paymentUrl })
  } else if (method === 'crypto') {
    const invoice = await createCryptoPayment(order, cryptocurrency)
    return NextResponse.json({ invoice })
  }
}
```

## 📱 **Mobile-First Design**

### **Responsive Breakpoints**
```css
/* Tailwind CSS configuration */
module.exports = {
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px', 
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    }
  }
}
```

### **Mobile Search Form**
```javascript
export function MobileSearchForm() {
  return (
    <div className="px-4 py-6 bg-gradient-to-r from-blue-600 to-green-600">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-center mb-6">
          Search for tickets across Europe
        </h2>
        
        <div className="space-y-4">
          <CitySelect 
            label="From"
            className="w-full"
            size="lg"
          />
          
          <div className="flex justify-center">
            <button className="p-2 text-blue-600">
              <ArrowUpDownIcon className="w-6 h-6" />
            </button>
          </div>
          
          <CitySelect 
            label="To"
            className="w-full"
            size="lg"
          />
          
          <DatePicker 
            label="Departure"
            className="w-full"
            size="lg"
          />
          
          <button className="w-full bg-green-600 text-white py-4 rounded-lg text-lg font-semibold">
            Search Tickets
          </button>
        </div>
      </div>
    </div>
  )
}
```

## 🚀 **Performance Optimization**

### **Caching Strategy**
```javascript
// Redis caching for external API responses
const CACHE_KEYS = {
  cities: 'cities:all',
  externalCities: (provider) => `external_cities:${provider}`,
  routes: (searchId) => `routes:${searchId}`,
  exchangeRates: 'exchange_rates'
}

async function getCachedCities() {
  const cached = await redis.get(CACHE_KEYS.cities)
  if (cached) return JSON.parse(cached)
  
  const cities = await db.city.findMany({ where: { isActive: true } })
  await redis.setex(CACHE_KEYS.cities, 3600, JSON.stringify(cities)) // 1 hour
  
  return cities
}
```

### **MongoDB Database Optimization**
```javascript
// Essential MongoDB indexes for performance
// Run these commands in MongoDB shell or via Node.js

// Cities collection indexes
db.cities.createIndex({ isActive: 1 })
db.cities.createIndex({ countryId: 1 })
db.cities.createIndex({ "names.en": "text", "names.cs": "text", "names.bg": "text", "names.ru": "text", "names.uk": "text" })
db.cities.createIndex({ "variations": 1 })
db.cities.createIndex({ location: "2dsphere" }) // For geospatial queries

// Routes collection indexes
db.routes.createIndex({ searchId: 1 })
db.routes.createIndex({ fromCityId: 1, toCityId: 1 })
db.routes.createIndex({ departureTime: 1 })
db.routes.createIndex({ isExternal: 1 })
db.routes.createIndex({ carrierId: 1 })
db.routes.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 }) // TTL index - routes expire after 1 hour

// External cities collection indexes
db.externalCities.createIndex({ provider: 1, externalId: 1 })
db.externalCities.createIndex({ cityId: 1 })
db.externalCities.createIndex({ isProcessed: 1 })

// External searches collection indexes
db.externalSearches.createIndex({ status: 1, createdAt: 1 })
db.externalSearches.createIndex({ searchId: 1 })
db.externalSearches.createIndex({ createdAt: 1 }, { expireAfterSeconds: 7200 }) // TTL index - searches expire after 2 hours

// Orders collection indexes
db.orders.createIndex({ email: 1 })
db.orders.createIndex({ status: 1 })
db.orders.createIndex({ createdAt: 1 })

// Payments collection indexes
db.payments.createIndex({ orderId: 1 })
db.payments.createIndex({ status: 1 })
db.payments.createIndex({ method: 1 })
db.payments.createIndex({ cryptoInvoiceId: 1 })

// Searches collection indexes
db.searches.createIndex({ fromCityId: 1, toCityId: 1 })
db.searches.createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 }) // TTL index - searches expire after 24 hours

// Countries collection indexes
db.countries.createIndex({ code: 1 })
db.countries.createIndex({ isActive: 1 })

// Carriers collection indexes
db.carriers.createIndex({ code: 1 })
db.carriers.createIndex({ isExternal: 1 })
db.carriers.createIndex({ isActive: 1 })
```

### **MongoDB Performance Tips**
```javascript
// Use MongoDB aggregation pipeline for complex queries
async function getRouteStatistics() {
  return await db.routes.aggregate([
    {
      $match: { 
        isExternal: true,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }
    },
    {
      $group: {
        _id: "$carrierId",
        totalRoutes: { $sum: 1 },
        avgPrice: { $avg: "$price" }
      }
    },
    {
      $sort: { totalRoutes: -1 }
    }
  ])
}

// Use projection to limit returned fields
async function getCitiesForSelect() {
  return await db.cities.find(
    { isActive: true },
    { 
      projection: { 
        _id: 1, 
        names: 1, 
        variations: 1 
      }
    }
  ).toArray()
}

// Use MongoDB TTL indexes instead of manual cleanup
// TTL indexes automatically remove expired documents
const routeSchema = {
  // ... route fields
  createdAt: { type: Date, default: Date.now, expires: 3600 } // Expires after 1 hour
}
```

## 🔒 **Security Considerations**

### **API Security**
```javascript
// Rate limiting
import { Ratelimit } from "@upstash/ratelimit"

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
})

export async function middleware(request) {
  const ip = request.ip ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)
  
  if (!success) {
    return new Response('Too Many Requests', { status: 429 })
  }
}
```

### **Input Validation**
```javascript
import { z } from 'zod'

const SearchSchema = z.object({
  fromCityId: z.number().positive(),
  toCityId: z.number().positive(),
  departureDate: z.string().datetime(),
  returnDate: z.string().datetime().optional(),
  tripType: z.enum(['one-way', 'return'])
})

export async function validateSearchRequest(data) {
  return SearchSchema.parse(data)
}
```

## 📊 **Analytics & Monitoring**

### **Key Metrics to Track**
```javascript
// Analytics object structure
const analytics = {
  searches: {
    total: Number,
    byRoute: {}, // { "Prague-London": 150, ... }
    byProvider: {} // { "flixbus": 45, "blablacar": 30, ... }
  },
  bookings: {
    total: Number,
    revenue: Number,
    conversionRate: Number
  },
  performance: {
    searchResponseTime: Number,
    externalApiResponseTime: {}, // { "flixbus": 1200, "blablacar": 800 }
    errorRate: Number
  }
}
```

### **Error Monitoring**
```javascript
// Integration with Sentry or similar
import * as Sentry from "@sentry/nextjs"

export function logExternalApiError(provider, error) {
  Sentry.captureException(error, {
    tags: {
      provider,
      type: 'external_api_error'
    }
  })
}
```

## 🎯 **Deployment Strategy**

### **Environment Configuration**
```javascript
// .env.local
DATABASE_URL="mongodb://localhost:27017/eurotours"
REDIS_URL="redis://localhost:6379"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

// Payment APIs
WEBPAY_MERCHANT_NUMBER="2000301041"
WEBPAY_PRIVATE_KEY_PASSWORD="florenc"
COINREMITTER_API_KEY="your-api-key"
COINREMITTER_PASSWORD="your-password"

// External APIs
BLABLACAR_LOGIN="eurotours_v2_api"
BLABLACAR_PASSWORD="x5Y22ex6sX3kFD"
STUDENT_AGENCY_USERNAME="eurotours15062016"
STUDENT_AGENCY_PASSWORD="I8ry0OUqDb"
EAST_EXPRESS_USERNAME="eurotours"
EAST_EXPRESS_PASSWORD="florenc19"
```

### **Production Deployment Options**
- **Vercel**: Recommended for Next.js apps
- **Netlify**: Alternative hosting platform
- **Railway**: Simple deployment with database hosting
- **DigitalOcean App Platform**: Full-stack hosting
- **AWS/Google Cloud**: Enterprise-level hosting

## 🔄 **Migration Strategy**

### **Data Migration**
```javascript
// scripts/migrate-data.js
async function migrateFromSymfony() {
  // 1. Export data from existing MySQL database
  const cities = await exportCities()
  const countries = await exportCountries()
  const carriers = await exportCarriers()
  
  // 2. Transform data structure
  const transformedCities = cities.map(transformCity)
  
  // 3. Import to new database
  await db.city.createMany({ data: transformedCities })
  
  console.log('Migration completed successfully')
}
```

### **Gradual Rollout**
1. **Phase 1**: Deploy new system alongside old one
2. **Phase 2**: Redirect 10% of traffic to new system
3. **Phase 3**: Gradually increase traffic percentage
4. **Phase 4**: Full migration and old system shutdown

## 📋 **Development Checklist**

### **Core Features**
- [ ] City/Country management with translations
- [ ] Route search functionality
- [ ] External API integrations (FlixBus, BlaBlaCar, etc.)
- [ ] Background job processing
- [ ] Order management system
- [ ] Payment integration (WebPay + CoinRemitter)
- [ ] Multi-language support
- [ ] Multi-currency support
- [ ] Email notifications
- [ ] Admin dashboard

### **Advanced Features**
- [ ] Seat selection
- [ ] Route combinations
- [ ] Price alerts
- [ ] User accounts
- [ ] Booking history
- [ ] Mobile app (React Native)
- [ ] Real-time notifications
- [ ] Analytics dashboard

### **Technical Requirements**
- [ ] Database schema design
- [ ] API documentation
- [ ] Unit tests
- [ ] Integration tests
- [ ] Performance monitoring
- [ ] Error tracking
- [ ] Security audit
- [ ] Load testing
