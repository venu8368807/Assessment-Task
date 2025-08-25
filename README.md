# Portfolio Dashboard

A dynamic, production-ready portfolio dashboard built with Next.js 14, TypeScript, and Tailwind CSS. Features live market data fetching, sector analysis, and real-time portfolio tracking with auto-refresh capabilities.

##  Features

### Core Functionality
- **Live Market Data**: Fetches current market prices (CMP) from Yahoo Finance
- **Financial Metrics**: Scrapes P/E ratios and latest earnings from Google Finance
- **Auto-refresh**: Updates CMP, present value, and gain/loss every 15 seconds
- **Sector Analysis**: Groups holdings by sector with detailed breakdowns
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### Data Visualization
- **Interactive Charts**: Sector allocation pie chart and performance bar chart using Recharts
- **Real-time Updates**: Live data with visual indicators for stale information
- **Color-coded Performance**: Green for gains, red for losses, neutral for zero
- **Portfolio Summary Cards**: Quick overview of total investment, present value, and returns

### Technical Features
- **Type Safety**: Full TypeScript implementation with Zod schema validation
- **Caching Strategy**: Intelligent caching with different TTLs for different data types
- **Rate Limiting**: Prevents API abuse with concurrent request limiting
- **Error Handling**: Graceful error states with retry mechanisms
- **Performance Optimized**: Memoized calculations and efficient re-renders

##  Architecture

### Data Flow
```
Frontend (SWR) → API Routes → External APIs (Yahoo Finance, Google Finance)
     ↓
Portfolio Data → Sector Grouping → Calculations → UI Components
```

### Key Components
- **API Routes**: Server-side data fetching with caching and rate limiting
- **SWR**: Client-side data fetching with auto-refresh and error handling
- **TanStack Table**: Sortable, responsive data table
- **Recharts**: Interactive data visualization
- **Tailwind CSS**: Utility-first styling with responsive design

### Caching Strategy
- **Quote Data**: 15-second TTL for current market prices
- **Metrics Data**: 12-hour TTL for P/E ratios and earnings data
- **In-memory Cache**: Simple TTL-based cache implementation
- **Stale Indicators**: Visual badges for cached data

##  Setup

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd portfolio-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Variables
No API keys required! All data fetching is done server-side using:
- Yahoo Finance (unofficial library) for market prices
- Google Finance (web scraping) for P/E ratios and earnings

##  Data Sources

### Market Data (Yahoo Finance)
- **Current Market Price (CMP)**: Real-time stock prices
- **Exchange Information**: NSE/BSE exchange details
- **Update Frequency**: Every 15 seconds with caching

### Financial Metrics (Google Finance)
- **P/E Ratio**: Price-to-earnings ratio
- **Latest Earnings**: Earnings date and quarter information
- **Update Frequency**: Every 12 hours with caching
- **Scraping**: Respectful web scraping with rate limiting

##  Project Structure

```
/
├── app/
│   ├── api/                    # API routes
│   │   ├── portfolio/route.ts  # Main portfolio endpoint
│   │   ├── quote/route.ts      # Yahoo Finance quotes
│   │   └── metrics/route.ts    # Google Finance scraping
│   ├── components/             # React components
│   │   ├── PortfolioTable.tsx  # Main data table
│   │   ├── SectorSummary.tsx   # Sector overview cards
│   │   ├── Charts.tsx          # Data visualization
│   │   ├── NumberCell.tsx      # Formatted number display
│   │   └── ErrorBanner.tsx     # Error handling
│   ├── lib/                    # Utility libraries
│   │   ├── calc.ts            # Portfolio calculations
│   │   ├── cache.ts           # TTL cache implementation
│   │   ├── limits.ts          # Rate limiting utilities
│   │   ├── symbols.ts         # Symbol normalization
│   │   └── schemas.ts         # Zod validation schemas
│   ├── styles/                # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main dashboard page
├── data/                      # Seed data
│   ├── holdings.json          # Sample portfolio data
│   └── sectors.json           # Sector metadata
└── public/                    # Static assets
```

##  Data Management

### Adding Your Portfolio Data

1. **Replace seed data**: Update `data/holdings.json` with your holdings
2. **CSV Import**: Convert your Excel/CSV data to the required JSON format
3. **API Integration**: Use the POST `/api/portfolio` endpoint with your data

### Data Format
```json
{
  "symbol": "RELIANCE",
  "name": "Reliance Industries Limited",
  "sector": "Energy",
  "purchasePrice": 2500,
  "qty": 10,
  "exchange": "NSE"
}
```

### Supported Exchanges
- **NSE**: National Stock Exchange (India)
- **BSE**: Bombay Stock Exchange (India)

##  Interview Talking Points

### Technical Decisions

**Why SWR for data fetching?**
- Built-in caching and revalidation
- Automatic background updates
- Optimistic UI updates
- Error handling and retry logic
- Reduces server load with intelligent caching

**Why different cache TTLs?**
- CMP data changes frequently (15s TTL)
- P/E ratios are relatively stable (12h TTL)
- Balances data freshness with API efficiency
- Reduces external API calls and costs

**Why server-side scraping?**
- No client-side secrets or API keys
- Better rate limiting and error handling
- Consistent user experience
- Respectful scraping with delays and retries

**Why TanStack Table?**
- Type-safe column definitions
- Built-in sorting and filtering
- Responsive design out of the box
- Excellent performance with large datasets
- Easy customization and theming

### Performance Optimizations

**Caching Strategy**
- In-memory TTL cache for API responses
- SWR deduplication to prevent duplicate requests
- Memoized calculations to avoid re-computation
- Efficient re-renders with React.memo

**Rate Limiting**
- p-limit for concurrent request limiting
- Exponential backoff for failed requests
- Respectful delays between scraping requests
- Graceful degradation on API failures

**Error Handling**
- Comprehensive error boundaries
- User-friendly error messages
- Retry mechanisms with exponential backoff
- Fallback to cached data when possible

### Scalability Considerations

**API Design**
- RESTful endpoints with proper HTTP status codes
- Input validation with Zod schemas
- Consistent error response format
- Rate limiting to prevent abuse

**Data Processing**
- Parallel processing of multiple holdings
- Efficient sector grouping algorithms
- Optimized calculation functions
- Memory-efficient caching

##  Limitations & Disclaimers

### Data Accuracy
- Uses unofficial Yahoo Finance library
- Web scraping may break if Google Finance changes structure
- Data may be delayed or unavailable during market hours
- No guarantee of data accuracy or completeness

### Rate Limits
- Respects external API rate limits
- Implements backoff strategies for failures
- May experience temporary data unavailability
- Consider upgrading to official APIs for production use

### Browser Compatibility
- Modern browsers with ES6+ support
- Responsive design for mobile devices
- Progressive enhancement for older browsers

##  Development

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run format   # Format code with Prettier
```

### Code Quality
- **ESLint**: Code linting with Next.js rules
- **Prettier**: Code formatting
- **TypeScript**: Strict type checking
- **Comments**: Comprehensive code documentation

##  Future Enhancements

### Potential Improvements
- **Real-time WebSocket updates** for live market data
- **Portfolio rebalancing tools** with target allocations
- **Historical performance tracking** with charts
- **Export functionality** for reports and tax purposes
- **Multi-currency support** for international portfolios
- **Advanced filtering and search** capabilities
- **Dark mode** theme support
- **Mobile app** using React Native

### API Enhancements
- **Official API integrations** for better reliability
- **WebSocket connections** for real-time updates
- **Batch processing** for large portfolios
- **Advanced caching** with Redis or similar

##  Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

##  License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Note**: This is a demonstration project. For production use, consider using official APIs and implementing additional security measures.
