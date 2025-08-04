# Paper Trader MVP

A comprehensive Next.js 15 paper trading application with real-time stock data, interactive charts, and professional-grade features. Built with TypeScript, Tailwind CSS, and Yahoo Finance API integration.

## 🚀 Features

### Core Trading Functionality
- **Real-time Stock Quotes**: Live price data via Yahoo Finance API
- **Paper Trading**: Buy/sell stocks with virtual money
- **Portfolio Management**: Track holdings, cash balance, and performance
- **Transaction History**: Complete trading log with P&L tracking
- **Interactive Charts**: Historical price data with multiple timeframes (1D-1Y)

### Advanced Features
- **Smart Watchlist**: Auto-refreshing prices with localStorage persistence
- **Company Profiles**: Comprehensive financial metrics and ratios
- **Market News Feed**: Categorized news with sentiment analysis
- **Professional UI**: Responsive design with toast notifications
- **Type Safety**: Full TypeScript implementation with strict mode

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts with interactive historical data visualization
- **APIs**: Yahoo Finance (unlimited, free access)
- **State Management**: React hooks with localStorage persistence
- **Package Manager**: pnpm

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- pnpm package manager

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd paper-trader-mvp

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

The application will be available at [http://localhost:3001](http://localhost:3001)

## 🎯 Usage

### Getting Started
1. **Initial Balance**: Start with $100,000 virtual cash
2. **Search Stocks**: Use the search bar to find stocks by ticker or company name
3. **Place Trades**: Buy/sell stocks with real-time pricing
4. **Track Performance**: Monitor portfolio value and individual holdings

### Key Features

#### Trading Widget
- Real-time stock search with autocomplete
- Instant price quotes and company info
- One-click trading from watchlist
- Form validation and error handling

#### Interactive Charts
- Multiple timeframes: 1D, 1W, 1M, 3M, 6M, 1Y
- Historical price data from Yahoo Finance
- Interactive tooltips and reference lines
- Volume indicators

#### Portfolio Management
- Real-time portfolio valuation
- Individual holding performance
- Transaction history with sorting/filtering
- P&L calculations for each trade

#### Watchlist
- Add/remove stocks with one click
- Auto-refreshing prices every 30 seconds
- Price change indicators (green/red)
- Click-to-trade functionality

#### Company Profiles
- Comprehensive financial metrics
- Key ratios and performance indicators
- Company fundamentals and description
- Market cap and sector information

#### News Feed
- Categorized market news
- Sentiment analysis (positive/negative/neutral)
- Ticker filtering for relevant news
- Source attribution and timestamps

## 🏗️ Project Structure

```
app/
├── api/                    # API routes
│   ├── quote/[ticker]/     # Real-time stock quotes
│   ├── history/[ticker]/   # Historical price data
│   ├── overview/[ticker]/  # Company fundamentals
│   └── news/               # Mock market news
├── page.tsx               # Main application with state
├── layout.tsx             # Root layout
└── globals.css            # Global styles

components/
├── sections/              # Major feature components
│   ├── TradeWidget.tsx    # Trading interface
│   ├── PriceChart.tsx     # Interactive charts
│   ├── TransactionHistory.tsx # Trading log
│   ├── Watchlist.tsx      # Stock watchlist
│   ├── CompanyProfile.tsx # Financial data
│   ├── NewsFeed.tsx       # Market news
│   └── Portfolio.tsx      # Portfolio overview
└── ui/                    # Reusable UI components
    ├── Toast.tsx          # Notifications
    ├── Spinner.tsx        # Loading states
    ├── Section.tsx        # Layout sections
    └── ConfirmationModal.tsx # Trade confirmations

lib/
└── types.ts              # TypeScript definitions
```

## 🔧 Configuration

### Environment Variables
This project uses Yahoo Finance APIs which are free and unlimited. No API keys required.

### TypeScript Configuration
- Strict mode enabled
- No implicit any types
- Proper path aliases (`@/*` for imports)
- ES2017 target with modern module resolution

## 🚀 Deployment

### Vercel Deployment
1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Configure Build Settings**:
   - Framework: Next.js
   - Build Command: `pnpm build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`
3. **Environment Variables**: No required variables (Yahoo Finance is free)
4. **Deploy**: Automatic deployment on every push to main branch

### Build Commands
```bash
# Development
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Linting
pnpm lint
```

## 📊 API Architecture

### Yahoo Finance Integration
- **Quote Endpoint**: Real-time stock prices with change percentages
- **History Endpoint**: Historical data with multiple timeframes
- **Overview Endpoint**: Company fundamentals with fallback strategy
- **Benefits**: No rate limits, free access, comprehensive coverage

### API Routes
```
/api/quote/[ticker]     - Real-time stock quotes
/api/history/[ticker]   - Historical price data
/api/overview/[ticker]  - Company fundamentals
/api/news              - Market news (mock data)
```

## 🧪 Testing

### API Endpoints
- ✅ Quote and History endpoints working perfectly
- ⚠️ Overview endpoint using fallback strategy
- ✅ All components render and function properly

### Type Safety
- ✅ Strict TypeScript mode enabled
- ✅ Comprehensive type definitions
- ✅ No implicit any types (after fixes)

## 🎯 Future Enhancements

### Immediate Priorities
- Fix overview primary endpoint (currently using fallback)
- Performance optimization and code splitting
- Mobile UX improvements

### Medium Priority
- Data export features (CSV for transactions/portfolio)
- Advanced order types (stop-loss, take-profit)
- Enhanced charting features

### Long-term Goals
- User authentication and multiple portfolios
- Real-time market data subscriptions
- Advanced analytics and reporting
- Social features and portfolio sharing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is for educational and demonstration purposes. Please ensure compliance with Yahoo Finance's terms of service when using their APIs.

## 🙏 Acknowledgments

- **Yahoo Finance**: For providing free, unlimited stock data APIs
- **Next.js Team**: For the excellent framework and tooling
- **Vercel**: For hosting and deployment platform
- **Recharts**: For the interactive charting library

---

**Built with ❤️ using Next.js 15, TypeScript, and Yahoo Finance**
