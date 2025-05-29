# 🚀 EuroTours - European Bus Ticket Platform

EuroTours is a comprehensive bus ticket booking platform that aggregates routes from multiple European bus companies. Users can search, compare, and book tickets from providers like FlixBus, BlaBlaCar, Ecolines, Student Agency, and more.

## ✨ Features

- **Multi-provider Search**: Compare routes from multiple bus companies
- **Real-time Results**: Dynamic loading of external provider data
- **Multi-language Support**: Czech, English, Bulgarian, Russian, Ukrainian
- **Multi-currency**: CZK, EUR with real-time conversion
- **Modern UI**: Beautiful, responsive design with Tailwind CSS
- **Mobile-first**: Optimized for all device sizes
- **Payment Integration**: Support for cards and cryptocurrency

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **UI Components**: ShadCN/UI, Radix UI
- **Database**: MongoDB with optimized indexes
- **Validation**: Zod schema validation
- **Icons**: Lucide React
- **Styling**: Tailwind CSS v4

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB instance (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd eurotours
   ```

2. **Install dependencies**
   ```bash
   npm install --force
   ```
   *Note: Using `--force` due to React 19 peer dependency conflicts with some packages*

3. **Set up environment variables**
   Copy the environment template and configure your settings:
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   # Database
   DATABASE_URL="mongodb://localhost:27017/eurotours"
   
   # Next.js
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   DOMAIN="http://localhost:3000"
   
   # External API keys (optional for development)
   BLABLACAR_LOGIN="your-blablacar-login"
   BLABLACAR_PASSWORD="your-blablacar-password"
   # ... other API credentials
   ```

4. **Initialize the database**
   
   **Option A: Using the admin panel (Recommended)**
   ```bash
   npm run dev
   ```
   Then visit `http://localhost:3000/admin` and click "Initialize Database"
   
   **Option B: Using npm script**
   ```bash
   npm run init-db
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 📱 Usage

### Basic Search
1. Go to the homepage
2. Select departure and destination cities
3. Choose your travel date
4. Optionally select return date for round trips
5. Click "Search Tickets"

### Admin Panel
Visit `/admin` to:
- Initialize the database with sample data
- View system information
- Manage database collections

## 🗄️ Database Structure

The application uses MongoDB with the following main collections:

- **Countries**: Geographic country data with multi-language names
- **Cities**: City information with coordinates and search variations
- **Carriers**: Bus company information (internal and external)
- **Routes**: Bus route data with TTL expiration (1 hour)
- **Searches**: Search history with TTL expiration (24 hours)
- **Orders**: Customer booking information
- **Payments**: Payment transaction records

### Sample Data

The database initialization includes:
- 6 European countries (CZ, DE, AT, PL, HU, SK)
- 9 major cities (Prague, Berlin, Vienna, Warsaw, etc.)
- 6 bus carriers (FlixBus, BlaBlaCar, Ecolines, etc.)

## 🌍 Multi-language Support

Currently supported languages:
- 🇬🇧 English (en)
- 🇨🇿 Czech (cs)
- ��🇬 Bulgarian (bg)
- 🇷🇺 Russian (ru)
- 🇺🇦 Ukrainian (uk)

All city and country names are stored in multiple languages for better search experience.

## 💳 Payment Integration

The platform supports multiple payment methods:

### Card Payments (WebPay)
- Merchant configuration in environment variables
- Secure payment processing
- Czech and European card support

### Cryptocurrency Payments (CoinRemitter)
- Bitcoin, Ethereum, Litecoin, Dogecoin support
- Automatic conversion from fiat currencies
- Webhook-based payment confirmation

## 🔌 External API Integration

The platform integrates with multiple bus operators:

- **FlixBus**: Direct API integration
- **BlaBlaCar**: REST API with authentication
- **Ecolines**: API with HTTP basic auth
- **Student Agency**: SOAP web service
- **East Express**: Web scraping with login
- **Eurolines**: Web scraping with session management

## 📝 API Documentation

### Search API
```http
POST /api/search
Content-Type: application/json

{
  "fromCityId": 1,
  "toCityId": 3,
  "departureDate": "2024-12-01",
  "returnDate": "2024-12-08",
  "tripType": "return"
}
```

### Cities API
```http
GET /api/cities
```

### External Results API
```http
GET /api/search/{searchId}/external
```

## 🚀 Development

### Project Structure
```
eurotours/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin panel
│   └── search/            # Search results pages
├── components/            # React components
│   └── ui/               # ShadCN UI components
├── lib/                  # Utilities and models
│   ├── models/           # Database models
│   └── utils/            # Utility functions
└── scripts/              # Database and utility scripts
```

### Key Components
- `SearchForm`: Main search interface
- `CitySelect`: Searchable city selector
- `DatePicker`: Date selection component
- `RouteCard`: Route display component

### Database Models
- `Country`: Geographic country data
- `City`: City information with multi-language support
- `Route`: Bus route with pricing and timing
- `Search`: Search session tracking
- `Carrier`: Bus company information

## 🔧 Configuration

### Environment Variables

All configuration is handled through environment variables. See `.env.example` for a complete list of available options.

### Database Indexes

The application creates optimized MongoDB indexes for:
- Fast city searches with text indexing
- Efficient route queries by cities and dates
- TTL indexes for automatic data cleanup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the GitHub issues
- Review the BUILD_REQUIREMENTS.md for detailed specifications
- Visit the admin panel for system status

## 🎯 Roadmap

- [ ] Complete external API integrations
- [ ] Advanced booking flow
- [ ] Payment processing
- [ ] User accounts and booking history
- [ ] Mobile app (React Native)
- [ ] Real-time notifications
- [ ] Analytics dashboard
- [ ] Multi-tenant support

---

Built with ❤️ using Next.js, React, and modern web technologies.
