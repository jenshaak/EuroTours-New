# 🔑 EuroTours Complete API Credentials & Authentication Guide

## 📋 **Overview**

This document contains **ALL** API credentials, usernames, passwords, and authentication details found in the EuroTours system for integrating with external bus companies and payment providers.

⚠️ **SECURITY WARNING**: These are production credentials found in the current system. Store securely and use environment variables in production.

---

## 🚌 **Bus Company API Credentials**

### **1. BlaBlaCar API**
```javascript
const BLABLACAR_CONFIG = {
  // Production Environment
  url: "https://ims.blablacar.pro/cgi-bin/gtmapp/wapi/",
  login: "eurotours_v2_api",
  password: "x5Y22ex6sX3kFD",
  
  // Test Environment
  testUrl: "https://ims-preprod.blablacar.pro/cgi-bin/gtmapp/wapi/",
  testLogin: "eurotours_v2_api",
  testPassword: "BkSNz6a2ky9e4H",
  
  // Authentication Method
  method: "Session Token",
  flow: "Login with credentials → Get session token → Use token in headers"
}
```

### **2. Student Agency API**
```javascript
const STUDENT_AGENCY_CONFIG = {
  // Main API Credentials
  url: "https://brn-ybus-api.sa.cz/v2/r0/AffiliateBookingService?WSDL",
  username: "eurotours15062016",
  password: "I8ry0OUqDb",
  authorization: "Basic ZXVyb3RvdXJzMTUwNjIwMTY6SThyeTBPVXFEYg==", // Base64 of username:password
  
  // Admin Portal Credentials (for booking operations)
  adminUrl: "https://ybus.sa.cz/wicket/bookmarkable/cz.sa.ybus.server.web.admin.base.LoginPage",
  adminUsername: "eurotours1",
  adminPassword: "krasi2017",
  
  // Authentication Method
  method: "SOAP + HTTP Basic Auth + WebDriver",
  protocol: "SOAP/WSDL",
  flow: "HTTP Basic Auth for API + WebDriver automation for bookings"
}
```

### **3. Ecolines API**
```javascript
const ECOLINES_CONFIG = {
  // Production Environment
  url: "https://eurotours_API:xSk2WHr8Saa@api2.ecolines.net/v1/",
  username: "eurotours_API",
  password: "xSk2WHr8Saa",
  
  // Alternative Development Environment (commented in code)
  // devUrl: "http://eurotours_api:gdyr462389aq@dev.api.ecolines.net/ebs/web/v1/",
  // devUsername: "eurotours_api",
  // devPassword: "gdyr462389aq",
  
  // Authentication Method
  method: "HTTP Basic Auth",
  flow: "Username and password embedded in URL"
}
```

### **4. East Express**
```javascript
const EAST_EXPRESS_CONFIG = {
  // Web Portal Access
  loginUrl: "http://www.east-express.cz/sale/login.php",
  searchUrl: "https://www.east-express.cz/checkRoutes",
  publicUrl: "http://east-express.cz/rezervace",
  
  // Credentials (Updated from original "eurotours" to "nayden")
  username: "nayden",
  password: "florenc19",
  
  // Authentication Method
  method: "Web Scraping + WebDriver",
  flow: "Login via web form + screen scraping + browser automation"
}
```

### **5. TransTempo API**
```javascript
const TRANS_TEMPO_CONFIG = {
  // Production Environment
  url: "https://api.transtempo.ua",
  apiKey: "736f09d3d088ce48c0d40511c8f37248",
  
  // Admin Portal Access
  adminUrl: "https://brs.transtempo.ua",
  adminEmail: "transtempo67@ukr.net",
  adminPassword: "NJKlc#vjnDm23fnc28n",
  
  // Test Environment (commented in code)
  // testUrl: "https://api.test.transtempo.ua",
  // testKey: "d12995cd6603cff25525abb4a0d57613",
  // testAdminUrl: "https://brs.test.transtempo.ua",
  
  // Authentication Method
  method: "API Key + Admin Portal",
  flow: "API key as parameter + web login for ticket downloads"
}
```

### **6. Eurolines API**
```javascript
const EUROLINES_CONFIG = {
  // Web Portal Access
  loginUrl: "https://touringbohemia.amtis.eu/Account/Login",
  apiBaseUrl: "https://touringbohemia.amtis.eu",
  
  // Credentials
  username: "ag152",
  password: "Jana2017",
  
  // Authentication Method
  method: "Web Form Login + Cookie Session",
  flow: "Login via web form → Get session cookie → Use cookie for API calls"
}
```

### **7. Nikolo API (BusSystem)**
```javascript
const NIKOLO_CONFIG = {
  // API Configuration
  url: "https://api.nikolo.eu/server/curl/",
  login: "Eurotours",
  password: "123456",
  
  // Proxy Configuration
  proxy: "http://eurotours:w5podz7AiRXb2fX@207.154.216.20:9305",
  
  // Authentication Method
  method: "HTTP POST with credentials",
  flow: "Login and password sent as POST parameters via proxy"
}
```

### **8. Infobus API (BusSystem)**
```javascript
const INFOBUS_CONFIG = {
  // API Configuration
  url: "https://api.bussystem.eu/server/curl/",
  login: "api.eurotours7d",
  password: "b77mu9yWFIh",
  
  // Proxy Configuration
  proxy: "http://eurotours:w5podz7AiRXb2fX@207.154.216.20:9305",
  
  // Authentication Method
  method: "HTTP POST with credentials",
  flow: "Login and password sent as POST parameters via proxy"
}
```

### **9. LikeBus API**
```javascript
const LIKEBUS_CONFIG = {
  // Production Environment
  url: "https://likebus.ua/sync/v3s",
  apiKey: "hGwn6fb4",
  
  // Test Environment (commented in code)
  // testUrl: "https://like99.akstor.com.ua/sync/v3s",
  // testKey: "EvRtsApi",
  
  // Authentication Method
  method: "API Key Header",
  flow: "API key sent in 'x-api-key' HTTP header"
}
```

### **10. FlixBus API**
```javascript
const FLIXBUS_CONFIG = {
  // Public API Endpoints
  citiesUrl: "https://search.k8s.mfb.io/api/v1/cities",
  stationsUrl: "https://search.k8s.mfb.io/api/v1/stations",
  searchUrl: "https://search.k8s.mfb.io/api/v2/search",
  
  // Required Headers
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36",
  referer: "https://shop.flixbus.cz/search",
  
  // Authentication Method
  method: "Public API - No Authentication Required",
  flow: "Direct API calls with proper User-Agent header"
}
```

---

## 💳 **Payment Gateway Credentials**

### **1. WebPay (Card Payments)**
```javascript
const WEBPAY_CONFIG = {
  // Merchant Configuration
  merchantNumber: "2000301041",
  url: "https://3dsecure.gpwebpay.com/pgw/order.do",
  
  // Key Configuration
  privateKeyPassword: "florenc",
  privateKeyFile: "app/Resources/webpay/EurotoursPrivate.pem",
  publicKeyFile: "app/Resources/webpay/EurotoursPublic.pem",
  
  // Authentication Method
  method: "Digital Signature",
  flow: "Sign requests with private key + merchant number"
}
```

### **2. CoinRemitter (Cryptocurrency)**
```javascript
const COINREMITTER_CONFIG = {
  // API Configuration
  apiKey: "wkey_XAYVV4x4G6ZUqW4",
  password: "TestCoin123@",
  baseUrl: "https://coinremitter.com/api/",
  
  // Supported Currencies
  supportedCurrencies: ["BTC", "ETH", "LTC", "DOGE"],
  feePercentage: 0.23,
  
  // Authentication Method
  method: "API Key + Password",
  flow: "API key and password for invoice creation and status checking"
}
```

---

## 🔧 **System Infrastructure Credentials**

### **1. Database Configuration**
```javascript
const DATABASE_CONFIG = {
  // Current system uses MySQL/MariaDB
  // Connection details stored in parameters.yml
  host: "127.0.0.1",
  port: 3306,
  name: "symfony", // actual database name varies
  user: "root",
  password: "configured_per_environment"
}
```

### **2. Redis Configuration**
```javascript
const REDIS_CONFIG = {
  // Caching and session storage
  dsn: "redis://localhost",
  port: 6379
}
```

### **3. Email Configuration**
```javascript
const EMAIL_CONFIG = {
  // SMTP Configuration
  transport: "sendmail",
  user: "adam@motvicka.cz",
  password: "nepotrebuju",
  port: 465,
  encryption: "ssl",
  sender: "info@eurotours.cz"
}
```

### **4. Selenium WebDriver**
```javascript
const SELENIUM_CONFIG = {
  // For web scraping operations
  url: "http://localhost:4444/wd/hub"
}
```

---

## 🔐 **Authentication Method Summary**

### **Session Token Based Authentication**
- **BlaBlaCar/Regabus**: Login → Get token → Use in session header
- **Flow**: POST login credentials → Receive session token → Include token in subsequent requests

### **HTTP Basic Authentication**
- **Ecolines**: Username:password in URL
- **Student Agency**: Basic auth header + CURL username/password
- **Flow**: Include credentials in Authorization header or URL

### **API Key Authentication**
- **TransTempo**: API key as request parameter
- **LikeBus**: API key in HTTP header
- **CoinRemitter**: API key + password combination
- **Flow**: Include API key in headers or parameters

### **Web Form + Cookie Authentication**
- **Eurolines**: Login form → Session cookie
- **TransTempo Admin**: Login form for ticket downloads
- **Flow**: POST to login form → Extract session cookie → Use cookie in requests

### **Web Scraping + Browser Automation**
- **East Express**: WebDriver automation
- **Student Agency Booking**: WebDriver for complex booking flow
- **Flow**: Automate browser interactions for login and operations

### **Public API (No Authentication)**
- **FlixBus**: Open API with proper headers
- **Flow**: Direct API calls with User-Agent header

---

## 🚨 **Security & Implementation Notes**

### **Environment Variables for Next.js**
```javascript
// .env.local for Next.js implementation
// Bus APIs
BLABLACAR_LOGIN=eurotours_v2_api
BLABLACAR_PASSWORD=x5Y22ex6sX3kFD
BLABLACAR_TEST_PASSWORD=BkSNz6a2ky9e4H

STUDENT_AGENCY_USERNAME=eurotours15062016
STUDENT_AGENCY_PASSWORD=I8ry0OUqDb
STUDENT_AGENCY_ADMIN_USERNAME=eurotours1
STUDENT_AGENCY_ADMIN_PASSWORD=krasi2017

ECOLINES_USERNAME=eurotours_API
ECOLINES_PASSWORD=xSk2WHr8Saa

EAST_EXPRESS_USERNAME=nayden
EAST_EXPRESS_PASSWORD=florenc19

TRANSTEMPO_API_KEY=736f09d3d088ce48c0d40511c8f37248
TRANSTEMPO_ADMIN_EMAIL=transtempo67@ukr.net
TRANSTEMPO_ADMIN_PASSWORD=NJKlc#vjnDm23fnc28n

EUROLINES_USERNAME=ag152
EUROLINES_PASSWORD=Jana2017

NIKOLO_LOGIN=Eurotours
NIKOLO_PASSWORD=123456

INFOBUS_LOGIN=api.eurotours7d
INFOBUS_PASSWORD=b77mu9yWFIh

LIKEBUS_API_KEY=hGwn6fb4

// Payment APIs
WEBPAY_MERCHANT_NUMBER=2000301041
WEBPAY_PRIVATE_KEY_PASSWORD=florenc

COINREMITTER_API_KEY=wkey_XAYVV4x4G6ZUqW4
COINREMITTER_PASSWORD=TestCoin123@

// Proxy
BUSSYSTEM_PROXY=http://eurotours:w5podz7AiRXb2fX@207.154.216.20:9305
```

### **Important Security Considerations**

1. **Never commit credentials to version control**
2. **Use environment variables in production**
3. **Rotate credentials periodically**
4. **Some APIs have separate test/production environments**
5. **WebPay requires separate private/public key files**
6. **Proxy credentials are needed for BusSystem APIs**
7. **Some integrations require browser automation (WebDriver)**

### **API Status & Reliability**

- **High Reliability**: FlixBus, Ecolines, Student Agency
- **Medium Reliability**: BlaBlaCar, TransTempo, LikeBus
- **Low Reliability**: East Express, Eurolines (web scraping based)
- **Deprecated**: RegabusConnector (replaced by BlaBlaCar)

### **Rate Limiting & Best Practices**

- **BlaBlaCar**: Session token expires, implement token refresh
- **Student Agency**: SOAP API, handle timeouts gracefully
- **Ecolines**: RESTful API, standard HTTP status codes
- **FlixBus**: Public API, respect rate limits
- **TransTempo**: Key-based, monitor quota usage

This document contains all the authentication credentials found in the EuroTours system. Store securely and implement proper environment variable management in the Next.js rebuild. 