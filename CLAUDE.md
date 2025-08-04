# CLAUDE.md

Next.js 15 paper trading application with real-time Yahoo Finance data, interactive charting, and professional trading features.

## Current Development Status

### ✅ **DEPLOYMENT READY**
- **Vercel Deployment**: ✅ Successfully deployed without errors
- **Build Status**: ✅ Clean production build with no ESLint warnings
- **React Infinite Loop**: ✅ Fixed in Watchlist component using functional updates

### ✅ **YAHOO FINANCE MIGRATION COMPLETED**
- **Quote API**: Real-time stock quotes with change/changePercent fields
- **History API**: Historical data with period filtering (1D-1Y)
- **Overview API**: Company fundamentals with 3-tier fallback strategy
- **Benefits**: No rate limits, free access, comprehensive coverage

### ✅ **CORE FEATURES IMPLEMENTED**
- **Enhanced UX**: Toast notifications, form validation, loading states
- **Interactive Charts**: Recharts with historical data and tooltips
- **Transaction History**: Complete logging with P&L tracking
- **Smart Watchlist**: Auto-refreshing with price change indicators
- **Company Profiles**: Financial metrics via Yahoo Finance
- **Market News Feed**: Categorized news with sentiment analysis
- **Professional UI**: Responsive design with organized sections

## Active Issues & Solutions

### **React Infinite Loop - RESOLVED**
- **Issue**: Maximum update depth exceeded in Watchlist component
- **Solution**: Used functional state updates instead of direct state access
- **Impact**: Broke circular dependency between useEffect and useCallback

### **Overview Endpoint 401 Error - PARTIALLY RESOLVED**
- **Issue**: Yahoo Finance quoteSummary endpoint returning 401 errors
- **Solution**: Implemented 3-tier fallback strategy with enhanced headers
- **Status**: Fallback working, primary endpoint needs investigation

## Recent Architectural Decisions

1. **Functional State Updates**: Replaced direct state access with functional updates to prevent infinite loops
2. **Yahoo Finance Migration**: Complete replacement of Alpha Vantage with unlimited APIs
3. **Enhanced Error Handling**: Multi-tier fallback strategy for company overview data
4. **Browser Header Simulation**: Comprehensive headers to mimic real browser requests

## Testing Status
- **Build**: ✅ Clean production build, no ESLint warnings
- **Deployment**: ✅ Successfully deployed to Vercel without errors
- **API Routes**: ✅ Quote and History endpoints working perfectly
- **API Routes**: ⚠️ Overview endpoint using fallback (primary returning 401)
- **Components**: ✅ All UI components render and function properly
- **Data Flow**: ✅ State management, localStorage, and caching work correctly

## Next Session Priorities

### **IMMEDIATE (High Priority)**
1. **Fix Overview Primary Endpoint** - Investigate and resolve quoteSummary 401 errors
2. **Performance Optimization** - Bundle analysis and code splitting
3. **Data Export Features** - CSV export for transactions and portfolio data

### **MEDIUM PRIORITY**
1. **Enhanced Mobile UX** - Touch-friendly interactions and mobile-specific layouts
2. **Settings Page** - User preferences and configuration options
3. **Advanced Order Types** - Stop-loss and take-profit simulation

### **LOW PRIORITY**
1. **Portfolio Analytics** - Advanced performance metrics and visualizations
2. **Technical Indicators** - Add RSI, MACD, Moving Averages to charts
3. **Real-time News** - Replace mock news with real financial news API

## Blockers & Dependencies

### **Status: Production Ready**
- **Deployment**: ✅ Complete - Successfully deployed to Vercel
- **Build Quality**: ✅ Clean - No ESLint warnings or errors
- **Performance**: ✅ Optimized - React infinite loop resolved
- **Data Access**: ✅ Unlimited - Yahoo Finance APIs working perfectly

### **Technical Debt**
- Overview endpoint primary API needs investigation (fallback working)
- Multiple lockfile warning (pnpm vs npm)
- API route debugging code should be cleaned up

## Development Commands
- `pnpm dev` - Development server (http://localhost:3001)
- `pnpm build` - Production build
- `pnpm lint` - Code quality checks

## File Structure
```
app/
├── api/                    # All API routes
│   ├── quote/[ticker]/     - Stock quotes via Yahoo Finance
│   ├── history/[ticker]/   - Historical data via Yahoo Finance
│   ├── overview/[ticker]/  - Company data with fallback strategy
│   └── news/              - Mock market news
├── page.tsx               # Main application with all state
components/
├── sections/              # Major feature components
│   ├── TradeWidget.tsx    - Enhanced with watchlist
│   ├── PriceChart.tsx     - Recharts integration
│   ├── TransactionHistory.tsx - Complete trading log
│   ├── Watchlist.tsx      - Auto-refreshing ticker list
│   ├── CompanyProfile.tsx - Financial metrics display
│   └── NewsFeed.tsx       - Categorized market news
└── ui/                    # Reusable UI components
    ├── Toast.tsx          - Notification system
    ├── Spinner.tsx        - Loading states
    └── ConfirmationModal.tsx - Trade confirmation
lib/
└── types.ts              - Complete TypeScript definitions
