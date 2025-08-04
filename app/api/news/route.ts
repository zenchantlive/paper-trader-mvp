import { NextResponse } from 'next/server';

// Define interface for news articles
interface NewsArticle {
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

// Mock news data - In a real application, this would come from Alpha Vantage NEWS_SENTIMENT or another news API
const mockNewsData: NewsArticle[] = [
  {
    id: '1',
    title: 'Tech Stocks Rally as Q4 Earnings Beat Expectations',
    summary: 'Major technology companies reported strong quarterly results, driving broad market gains across the tech sector.',
    url: 'https://example.com/news/tech-rally',
    source: 'Financial Times',
    category: 'Markets',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    relevanceScore: 0.9,
    sentiment: 'positive',
    tickers: ['AAPL', 'MSFT', 'GOOGL']
  },
  {
    id: '2',
    title: 'Federal Reserve Signals Potential Rate Cuts in 2024',
    summary: 'Fed Chair Jerome Powell indicated that the central bank may consider lowering interest rates if inflation continues to moderate.',
    url: 'https://example.com/news/fed-rates',
    source: 'Reuters',
    category: 'Economy',
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    relevanceScore: 0.95,
    sentiment: 'positive',
    tickers: ['SPY', 'QQQ']
  },
  {
    id: '3',
    title: 'Oil Prices Surge on Middle East Tensions',
    summary: 'Crude oil futures jumped 3% in early trading following reports of supply disruptions in key oil-producing regions.',
    url: 'https://example.com/news/oil-surge',
    source: 'Bloomberg',
    category: 'Commodities',
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    relevanceScore: 0.8,
    sentiment: 'neutral',
    tickers: ['XOM', 'CVX', 'USO']
  },
  {
    id: '4',
    title: 'Electric Vehicle Sales Hit Record High in Q4',
    summary: 'EV manufacturers reported unprecedented quarterly delivery numbers, signaling strong consumer demand for electric vehicles.',
    url: 'https://example.com/news/ev-sales',
    source: 'CNBC',
    category: 'Automotive',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    relevanceScore: 0.85,
    sentiment: 'positive',
    tickers: ['TSLA', 'RIVN', 'LCID']
  },
  {
    id: '5',
    title: 'Banking Sector Faces Headwinds from Credit Concerns',
    summary: 'Regional banks see stock declines as analysts raise concerns about commercial real estate loan portfolios.',
    url: 'https://example.com/news/banking-concerns',
    source: 'Wall Street Journal',
    category: 'Banking',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    relevanceScore: 0.75,
    sentiment: 'negative',
    tickers: ['BAC', 'JPM', 'WFC']
  },
  {
    id: '6',
    title: 'Cryptocurrency Market Shows Signs of Recovery',
    summary: 'Bitcoin and other major cryptocurrencies posted significant gains as institutional interest continues to grow.',
    url: 'https://example.com/news/crypto-recovery',
    source: 'CoinDesk',
    category: 'Cryptocurrency',
    publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
    relevanceScore: 0.7,
    sentiment: 'positive',
    tickers: ['COIN', 'MSTR']
  },
  {
    id: '7',
    title: 'Healthcare Stocks Mixed on Drug Approval News',
    summary: 'Pharmaceutical companies saw varied reactions following FDA decisions on several high-profile drug applications.',
    url: 'https://example.com/news/pharma-mixed',
    source: 'BioPharma Dive',
    category: 'Healthcare',
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    relevanceScore: 0.65,
    sentiment: 'neutral',
    tickers: ['JNJ', 'PFE', 'MRNA']
  },
  {
    id: '8',
    title: 'Retail Sales Data Beats Forecasts, Boosting Consumer Stocks',
    summary: 'December retail sales figures exceeded analyst expectations, signaling resilient consumer spending despite economic uncertainties.',
    url: 'https://example.com/news/retail-sales',
    source: 'MarketWatch',
    category: 'Retail',
    publishedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(), // 30 hours ago
    relevanceScore: 0.8,
    sentiment: 'positive',
    tickers: ['AMZN', 'WMT', 'TGT']
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const limit = parseInt(searchParams.get('limit') || '10');
  
  try {
    // In a real application, you would make an API call to Alpha Vantage or another news service here
    // const apiKey = process.env.ALPHA_API_KEY;
    // const alphaVantageURL = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&apikey=${apiKey}`;
    
    let filteredNews = mockNewsData;
    
    // Filter by category if specified
    if (category && category !== 'all') {
      filteredNews = mockNewsData.filter(article => 
        article.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Sort by published date (most recent first)
    filteredNews.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    
    // Limit results
    filteredNews = filteredNews.slice(0, limit);
    
    // Add cache headers
    const response = NextResponse.json({
      articles: filteredNews,
      total: filteredNews.length,
      lastUpdated: new Date().toISOString()
    });
    
    // Cache for 5 minutes
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
    
    return response;
    
  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred while fetching news.' },
      { status: 500 }
    );
  }
}