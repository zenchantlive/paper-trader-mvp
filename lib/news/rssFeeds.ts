// RSS Feed configurations for financial news sources, verified as of August 2025

export interface RSSFeedConfig {
  name: string;
  url: string;
  category: string;
  credibility: number;
  enabled: boolean;
}

export const RSS_FEEDS: RSSFeedConfig[] = [
  // WORKING General Market News
  {
    name: 'Yahoo Finance',
    url: 'https://finance.yahoo.com/news/rssindex',
    category: 'General',
    credibility: 0.9,
    enabled: true
  },
  {
    name: 'Yahoo Finance Headlines',
    url: 'https://feeds.finance.yahoo.com/rss/2.0/headline',
    category: 'General',
    credibility: 0.9,
    enabled: true
  },
  {
    name: 'MarketWatch Top Stories',
    url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories',
    category: 'Markets',
    credibility: 0.8,
    enabled: true
  },
  {
    name: 'Seeking Alpha Market Currents',
    url: 'https://seekingalpha.com/feed.xml',
    category: 'Markets',
    credibility: 0.8,
    enabled: true
  },

  // WORKING Business & Corporate News
  {
    name: 'CNBC Top News',
    url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html',
    category: 'Business',
    credibility: 0.9,
    enabled: true
  },
  {
    name: 'Fortune',
    url: 'https://fortune.com/feed/',
    category: 'Business',
    credibility: 0.9,
    enabled: true
  },
  {
    name: 'Motley Fool',
    url: 'https://www.fool.com/feed/',
    category: 'Business',
    credibility: 0.8,
    enabled: true
  },
  {
    name: 'Benzinga',
    url: 'https://www.benzinga.com/feed',
    category: 'Business',
    credibility: 0.8,
    enabled: true
  },

  // WORKING Economic News - FIXED URLS
  {
    name: 'Federal Reserve News',
    url: 'https://www.federalreserve.gov/feeds/press_all.xml',
    category: 'Economy',
    credibility: 1.0,
    enabled: true
  },
  {
    name: 'Investing.com Economics',
    url: 'https://www.investing.com/rss/news.rss',
    category: 'Economy',
    credibility: 0.8,
    enabled: true
  },
  {
    name: 'CNBC Economics',
    url: 'https://www.cnbc.com/id/20910258/device/rss/rss.html',
    category: 'Economy',
    credibility: 0.9,
    enabled: true
  },

  // WORKING Technology Sector News
  {
    name: 'TechCrunch Fintech',
    url: 'https://techcrunch.com/category/fintech/feed/',
    category: 'Technology',
    credibility: 0.9,
    enabled: true
  },

  // WORKING Cryptocurrency News - FIXED URLS
  {
    name: 'CoinDesk',
    url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
    category: 'Cryptocurrency',
    credibility: 1.0,
    enabled: true
  },
  {
    name: 'Cointelegraph',
    url: 'https://cointelegraph.com/rss',
    category: 'Cryptocurrency',
    credibility: 0.9,
    enabled: true
  },

  // WORKING Commodities & Energy News - FIXED URLS
  {
    name: 'OilPrice.com',
    url: 'https://oilprice.com/rss/main',
    category: 'Commodities',
    credibility: 0.9,
    enabled: true
  },

  // DISABLED BROKEN FEEDS - Keep for reference but disabled
  {
    name: 'Financial Times',
    url: 'https://www.ft.com/rss/home',
    category: 'General',
    credibility: 1.0,
    enabled: false // Often blocks RSS access
  },
  {
    name: 'Reuters Business',
    url: 'https://feeds.reuters.com/reuters/businessNews',
    category: 'Business',
    credibility: 1.0,
    enabled: false // DNS issues
  },
  {
    name: 'Bloomberg Markets',
    url: 'https://feeds.bloomberg.com/markets/news.rss',
    category: 'Markets',
    credibility: 1.0,
    enabled: false // Access restricted
  },
  {
    name: 'Forbes',
    url: 'https://www.forbes.com/real-time/feed2/',
    category: 'Business',
    credibility: 0.9,
    enabled: false // Feed format issues
  },
  {
    name: 'FRED Economic Data',
    url: 'https://fred.stlouisfed.org/feed',
    category: 'Economy',
    credibility: 1.0,
    enabled: false // 404 errors
  },
  {
    name: 'Trading Economics',
    url: 'https://tradingeconomics.com/rss/news',
    category: 'Economy',
    credibility: 0.9,
    enabled: false // 403 Forbidden
  },
  {
    name: 'Ars Technica Business',
    url: 'https://feeds.arstechnica.com/arstechnica/technology-lab',
    category: 'Technology',
    credibility: 0.8,
    enabled: false // Feed structure changes
  },
  {
    name: 'Kitco News',
    url: 'https://www.kitco.com/rss/KitcoNews.xml',
    category: 'Commodities',
    credibility: 0.9,
    enabled: false // 404 errors
  }
];

// Helper function to get enabled feeds
export function getEnabledFeeds(): RSSFeedConfig[] {
  return RSS_FEEDS.filter(feed => feed.enabled);
}

// Helper function to get feeds by category
export function getFeedsByCategory(category: string): RSSFeedConfig[] {
  return RSS_FEEDS.filter(feed => 
    feed.enabled && (feed.category.toLowerCase() === category.toLowerCase() || category.toLowerCase() === 'all')
  );
}

// Helper function to enable/disable a feed
export function toggleFeed(feedName: string, enabled: boolean): boolean {
  const feed = RSS_FEEDS.find(f => f.name === feedName);
  if (feed) {
    feed.enabled = enabled;
    return true;
  }
  return false;
}

// Get feed status summary
export function getFeedStatus() {
  const enabled = RSS_FEEDS.filter(f => f.enabled).length;
  const disabled = RSS_FEEDS.filter(f => !f.enabled).length;
  
  return {
    total: RSS_FEEDS.length,
    enabled,
    disabled,
    categories: [...new Set(RSS_FEEDS.map(f => f.category))],
    avgCredibility: RSS_FEEDS.filter(f => f.enabled).reduce((sum, f) => sum + f.credibility, 0) / enabled
  };
}