export interface Holding {
  ticker: string;
  shares: number;
  averagePrice: number;
}

export interface Portfolio {
  cash: number;
  holdings: Holding[]; // Corrected to be an array of Holding objects
  totalValue: number; // This will be a derived value
}

export interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface TradeConfirmation {
  ticker: string;
  quantity: number;
  price: number;
  type: 'buy' | 'sell';
  total: number;
  currentHolding?: Holding;
}

export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface HistoricalData {
  symbol: string;
  data: HistoricalDataPoint[];
  period: string;
}

export interface Transaction {
  id: string;
  ticker: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  total: number;
  timestamp: Date;
}

export interface CompanyOverview {
  symbol: string;
  name: string;
  description: string;
  exchange: string;
  currency: string;
  country: string;
  sector: string;
  industry: string;
  marketCapitalization: string;
  peRatio: string;
  pegRatio: string;
  bookValue: string;
  dividendPerShare: string;
  dividendYield: string;
  eps: string;
  revenuePerShareTTM: string;
  profitMargin: string;
  operatingMarginTTM: string;
  returnOnAssetsTTM: string;
  returnOnEquityTTM: string;
  revenueTTM: string;
  grossProfitTTM: string;
  dilutedEPSTTM: string;
  quarterlyEarningsGrowthYOY: string;
  quarterlyRevenueGrowthYOY: string;
  analystTargetPrice: string;
  trailingPE: string;
  forwardPE: string;
  priceToSalesRatioTTM: string;
  priceToBookRatio: string;
  evToRevenue: string;
  evToEBITDA: string;
  beta: string;
  weekHigh52: string;
  weekLow52: string;
  movingAverage50Day: string;
  movingAverage200Day: string;
  sharesOutstanding: string;
  dividendDate: string;
  exDividendDate: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  category: string;
  publishedAt: string;
  imageUrl?: string;
  relevanceScore: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  tickers?: string[];
}
