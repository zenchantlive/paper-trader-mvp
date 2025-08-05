// Ticker symbol extraction from news articles

export interface ExtractedTicker {
  symbol: string;
  confidence: number;
  context: string;
}

// Common stock tickers that are also common words to avoid false positives
const COMMON_WORDS_BLACKLIST = new Set([
  'A', 'I', 'AN', 'IN', 'IT', 'ON', 'AT', 'BE', 'DO', 'GO', 'HI', 'NO', 'OK', 'SO', 'TO', 'UP', 'US',
  'ALL', 'AND', 'ARE', 'BUT', 'FOR', 'HAD', 'HAS', 'HER', 'HIS', 'HOW', 'ITS', 'NEW', 'NOT', 'NOW', 'ONE',
  'OUR', 'OUT', 'SAW', 'SAY', 'SHE', 'THAT', 'THE', 'THEY', 'WAS', 'WAY', 'WHO', 'WHY', 'YES', 'YOU'
]);

// Valid US stock exchanges for context validation
const VALID_EXCHANGES = new Set(['NASDAQ', 'NYSE', 'OTC', 'AMEX']);

// Major company tickers for validation
const MAJOR_TICKERS = new Set([
  'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'META', 'TSLA', 'NVDA', 'JPM', 'JNJ', 'V', 'PG', 'UNH',
  'HD', 'BAC', 'XOM', 'PFE', 'CSCO', 'ADBE', 'NFLX', 'CRM', 'ORCL', 'WMT', 'DIS', 'MA', 'PYPL',
  'INTC', 'T', 'VZ', 'KO', 'PEP', 'TMO', 'ABT', 'ABBV', 'ACN', 'COST', 'LIN', 'MDT', 'NKE',
  'UPS', 'LLY', 'DHR', 'WFC', 'IBM', 'TXN', 'HON', 'CVX', 'MRK', 'PLD', 'AMGN', 'COP', 'NEE',
  'LOW', 'ISRG', 'SBUX', 'AMD', 'INTU', 'GE', 'DE', 'MS', 'GS', 'CAT', 'RTX', 'BKNG', 'AMAT',
  'AXP', 'ADI', 'SYK', 'BLK', 'GILD', 'MDLZ', 'CI', 'EL', 'EQIX', 'TJX', 'CDNS', 'EOG', 'SCHW',
  'SO', 'SNPS', 'PANW', 'CMCSA', 'MU', 'ADP', 'CSX', 'BDX', 'BIIB', 'CL', 'ITW', 'CB', 'ICE',
  'PGR', 'USB', 'APD', 'NSC', 'AON', 'DUK', 'LRCX', 'FCX', 'MCO', 'MPC', 'KMI', 'ETN', 'ECL',
  'EMR', 'EXC', 'AIG', 'SPG', 'ROK', 'PH', 'GD', 'ORLY', 'ADSK', 'HCA', 'CTAS', 'FIS', 'ANET',
  'MMM', 'TGT', 'SHW', 'NOC', 'LMT', 'HUM', 'DXCM', 'O', 'VLO', 'BSX', 'WM', 'PNC', 'ZTS',
  'CIEN', 'D', 'EQNR', 'MCK', 'COF', 'ROP', 'JCI', 'SLB', 'GM', 'F', 'BA', 'RCL', 'C', 'DAL'
]);

// Patterns for extracting ticker symbols
const TICKER_PATTERNS = [
  // $AAPL, $MSFT format
  {
    pattern: /\$([A-Z]{1,5})\b/g,
    confidence: 0.9,
    context: 'dollar_sign'
  },
  // NASDAQ:AAPL, NYSE:MSFT format
  {
    pattern: /\b(NASDAQ|NYSE|OTC|AMEX):\s*([A-Z]{1,5})\b/gi,
    confidence: 0.95,
    context: 'exchange_prefix'
  },
  // AAPL stock, MSFT shares format
  {
    pattern: /\b([A-Z]{1,5})\s+(?:stock|shares|equity|corp|inc|ltd|co|company)\b/gi,
    confidence: 0.7,
    context: 'stock_suffix'
  },
  // AAPL rises, MSFT falls format (with market action words)
  {
    pattern: /\b([A-Z]{1,5})\s+(?:rises|falls|gains|drops|jumps|slides|surges|plunges|climbs|dips|fluctuates|trades|moves|gains|loses)\b/gi,
    confidence: 0.8,
    context: 'market_action'
  },
  // Standalone tickers in financial context (higher confidence for major tickers)
  {
    pattern: /\b([A-Z]{1,5})\b/g,
    confidence: 0.3,
    context: 'standalone',
    validator: (ticker: string) => MAJOR_TICKERS.has(ticker)
  }
];

/**
 * Extract ticker symbols from text
 */
export function extractTickers(text: string): ExtractedTicker[] {
  const tickers = new Map<string, ExtractedTicker>(); // Use Map to deduplicate by symbol
  
  // Clean and normalize text
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  for (const patternConfig of TICKER_PATTERNS) {
    let match;
    
    while ((match = patternConfig.pattern.exec(cleanText)) !== null) {
      let symbol = match[1] || match[2]; // Handle different capture groups
      
      // Normalize symbol
      symbol = symbol.toUpperCase().trim();
      
      // Skip if invalid length or blacklisted
      if (symbol.length < 1 || symbol.length > 5 || COMMON_WORDS_BLACKLIST.has(symbol)) {
        continue;
      }
      
      // Apply validator if present
      if (patternConfig.validator && !patternConfig.validator(symbol)) {
        continue;
      }
      
      // Calculate confidence based on various factors
      let confidence = patternConfig.confidence;
      
      // Boost confidence for major tickers
      if (MAJOR_TICKERS.has(symbol)) {
        confidence += 0.2;
      }
      
      // Boost confidence if near financial keywords
      const context = getContextAroundMatch(cleanText, match.index, 50);
      if (hasFinancialKeywords(context)) {
        confidence += 0.1;
      }
      
      // Reduce confidence for standalone tickers that aren't major
      if (patternConfig.context === 'standalone' && !MAJOR_TICKERS.has(symbol)) {
        confidence -= 0.1;
      }
      
      // Cap confidence at 1.0
      confidence = Math.min(confidence, 1.0);
      
      // Only include if confidence is above threshold
      if (confidence >= 0.4) {
        // Use Map to keep only the highest confidence for each symbol
        const existing = tickers.get(symbol);
        if (!existing || confidence > existing.confidence) {
          tickers.set(symbol, {
            symbol,
            confidence,
            context: patternConfig.context
          });
        }
      }
    }
  }
  
  return Array.from(tickers.values()).sort((a, b) => b.confidence - a.confidence);
}

/**
 * Get context around a match for better validation
 */
function getContextAroundMatch(text: string, index: number, windowSize: number): string {
  const start = Math.max(0, index - windowSize);
  const end = Math.min(text.length, index + windowSize);
  return text.substring(start, end).toLowerCase();
}

/**
 * Check if context contains financial keywords
 */
function hasFinancialKeywords(context: string): boolean {
  const financialKeywords = [
    'stock', 'share', 'price', 'market', 'trading', 'investor', 'portfolio',
    'dividend', 'revenue', 'earnings', 'profit', 'loss', 'buy', 'sell',
    'analyst', 'rating', 'target', 'forecast', 'guidance', 'quarterly',
    'annual', 'financial', 'fiscal', 'ipo', 'merger', 'acquisition'
  ];
  
  return financialKeywords.some(keyword => context.includes(keyword));
}

/**
 * Filter tickers by minimum confidence threshold
 */
export function filterTickersByConfidence(tickers: ExtractedTicker[], minConfidence: number = 0.5): ExtractedTicker[] {
  return tickers.filter(ticker => ticker.confidence >= minConfidence);
}

/**
 * Get top N tickers by confidence
 */
export function getTopTickers(tickers: ExtractedTicker[], count: number = 5): ExtractedTicker[] {
  return tickers.slice(0, count);
}

/**
 * Extract tickers from news article title and summary
 */
export function extractTickersFromArticle(title: string, summary: string): ExtractedTicker[] {
  const titleTickers = extractTickers(title);
  const summaryTickers = extractTickers(summary);
  
  // Combine and deduplicate, keeping highest confidence
  const allTickers = new Map<string, ExtractedTicker>();
  
  [...titleTickers, ...summaryTickers].forEach(ticker => {
    const existing = allTickers.get(ticker.symbol);
    if (!existing || ticker.confidence > existing.confidence) {
      allTickers.set(ticker.symbol, ticker);
    }
  });
  
  return Array.from(allTickers.values()).sort((a, b) => b.confidence - a.confidence);
}
