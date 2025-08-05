// Main news parser that integrates RSS feeds, ticker extraction, and sentiment analysis

import Parser from 'rss-parser';
import { format, subHours, isAfter, isBefore, parseISO } from 'date-fns';
import { RSS_FEEDS, getEnabledFeeds, RSSFeedConfig } from './rssFeeds';
import { extractTickersFromArticle, filterTickersByConfidence, getTopTickers, ExtractedTicker } from './tickerExtractor';
import { analyzeArticleSentiment, SentimentResult } from './sentimentAnalyzer';
import { NewsArticle } from '@/lib/types';

// RSS Parser instance with robust configuration
const parser = new Parser({
  timeout: 15000, // Increased to 15 seconds
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; PaperTrader/1.0; +https://github.com/zenchant/paper-trader-mvp)',
    'Accept': 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
    'Accept-Encoding': 'gzip, deflate',
    'Cache-Control': 'no-cache',
  },
  customFields: {
    item: ['media:content', 'content:encoded', 'description', 'summary']
  }
});

// Category classification patterns
const CATEGORY_PATTERNS: Record<string, string[]> = {
  'Markets': [
    'market', 'index', 'dow', 's&p', 'nasdaq', 'trading', 'stocks', 'equities', 'bull', 'bear',
    'rally', 'slump', 'volatility', 'session', 'close', 'open', 'high', 'low', 'volume'
  ],
  'Economy': [
    'economy', 'economic', 'fed', 'federal reserve', 'inflation', 'interest rates', 'gdp',
    'employment', 'jobs', 'unemployment', 'recession', 'stimulus', 'policy', 'central bank'
  ],
  'Commodities': [
    'oil', 'gold', 'silver', 'copper', 'commodity', 'energy', 'natural gas', 'crude',
    'futures', 'precious metals', 'industrial metals', 'agriculture', 'wheat', 'corn'
  ],
  'Cryptocurrency': [
    'bitcoin', 'crypto', 'cryptocurrency', 'ethereum', 'blockchain', 'digital currency',
    'altcoin', 'mining', 'exchange', 'wallet', 'defi', 'nft', 'web3'
  ],
  'Banking': [
    'bank', 'financial', 'loan', 'credit', 'mortgage', 'interest rate', 'deposit',
    'lending', 'investment bank', 'commercial bank', 'regional bank', 'wall street'
  ],
  'Technology': [
    'tech', 'technology', 'software', 'ai', 'artificial intelligence', 'semiconductor',
    'chip', 'cloud', 'saas', 'internet', 'social media', 'e-commerce', 'big tech'
  ],
  'Healthcare': [
    'pharma', 'biotech', 'health', 'medical', 'drug', 'fda', 'healthcare', 'pharmaceutical',
    'clinical trial', 'treatment', 'therapy', 'hospital', 'insurance', 'medical device'
  ],
  'Automotive': [
    'auto', 'car', 'vehicle', 'ev', 'electric vehicle', 'tesla', 'ford', 'gm', 'toyota',
    'automotive', 'manufacturing', 'assembly', 'dealership', 'autonomous', 'self-driving'
  ],
  'Retail': [
    'retail', 'consumer', 'shopping', 'sales', 'revenue', 'earnings', 'quarterly',
    'customer', 'store', 'mall', 'e-commerce', 'amazon', 'walmart', 'target', 'costco'
  ],
  'Business': [
    'business', 'company', 'corporate', 'merger', 'acquisition', 'ipo', 'earnings',
    'revenue', 'profit', 'loss', 'ceo', 'executive', 'management', 'strategy'
  ]
};

// Source credibility scores
const SOURCE_CREDIBILITY: Record<string, number> = {
  'Reuters': 1.0,
  'Bloomberg': 1.0,
  'Wall Street Journal': 1.0,
  'Financial Times': 1.0,
  'Associated Press': 0.95,
  'CNBC': 0.9,
  'Yahoo Finance': 0.9,
  'MarketWatch': 0.8,
  'Seeking Alpha': 0.8,
  'Investopedia': 0.8,
  'Business Insider': 0.75,
  'The Street': 0.7,
  'Fortune': 0.9,
  'Motley Fool': 0.8,
  'Benzinga': 0.8,
  'CoinDesk': 1.0,
  'Cointelegraph': 0.9,
  'Federal Reserve News': 1.0,
  'Investing.com': 0.8,
  'OilPrice.com': 0.9,
  'TechCrunch': 0.9
};

export interface ParsedNewsArticle extends NewsArticle {
  rawTitle: string;
  rawSummary: string;
  sourceCredibility: number;
  extractedTickers: ExtractedTicker[];
  sentimentDetails: SentimentResult;
  processingTime: string;
}

export interface NewsProcessingOptions {
  maxArticlesPerFeed?: number;
  maxTotalArticles?: number;
  minConfidence?: number;
  maxAgeHours?: number;
  enableDeduplication?: boolean;
  userWatchlist?: string[];
}

const DEFAULT_OPTIONS: NewsProcessingOptions = {
  maxArticlesPerFeed: 10,
  maxTotalArticles: 50,
  minConfidence: 0.5,
  maxAgeHours: 48,
  enableDeduplication: true,
  userWatchlist: []
};

// Feed failure tracking
const feedFailures = new Map<string, { count: number; lastAttempt: number }>();

/**
 * Main function to fetch and parse news from RSS feeds
 */
export async function fetchAndParseNews(options: NewsProcessingOptions = {}): Promise<ParsedNewsArticle[]> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const enabledFeeds = getEnabledFeeds();
  
  console.log(`🔄 Fetching news from ${enabledFeeds.length} enabled feeds...`);
  
  try {
    // Fetch news from all feeds with controlled concurrency
    const batchSize = 3; // Process 3 feeds at a time to avoid overwhelming servers
    const allArticles: ParsedNewsArticle[] = [];
    
    for (let i = 0; i < enabledFeeds.length; i += batchSize) {
      const batch = enabledFeeds.slice(i, i + batchSize);
      const batchPromises = batch.map(feed => fetchFeed(feed, config));
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        const feed = batch[index];
        if (result.status === 'fulfilled' && result.value.length > 0) {
          allArticles.push(...result.value);
          console.log(`✅ ${feed.name}: ${result.value.length} articles`);
        } else {
          const error = result.status === 'rejected' ? result.reason : 'No articles';
          console.warn(`❌ ${feed.name}: ${error}`);
        }
      });
      
      // Small delay between batches to be respectful
      if (i + batchSize < enabledFeeds.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`📊 Total articles collected: ${allArticles.length}`);
    
    // Apply filters and sorting
    let filteredArticles = filterArticlesByAge(allArticles, config.maxAgeHours!);
    console.log(`📅 After age filter: ${filteredArticles.length} articles`);
    
    if (config.enableDeduplication) {
      filteredArticles = deduplicateArticles(filteredArticles);
      console.log(`🔄 After deduplication: ${filteredArticles.length} articles`);
    }
    
    // Sort by relevance and limit results
    filteredArticles = sortArticlesByRelevance(filteredArticles, config.userWatchlist || []);
    filteredArticles = filteredArticles.slice(0, config.maxTotalArticles);
    
    console.log(`📰 Final result: ${filteredArticles.length} articles`);
    return filteredArticles;
    
  } catch (error) {
    console.error('❌ Error fetching news:', error);
    return [];
  }
}

/**
 * Fetch and parse a single RSS feed with retry logic and error handling
 */
async function fetchFeed(feed: RSSFeedConfig, options: NewsProcessingOptions): Promise<ParsedNewsArticle[]> {
  const maxRetries = 2; // Reduced retries to speed up processing
  let lastError: any;
  
  // Check if feed has been failing recently
  const failure = feedFailures.get(feed.name);
  if (failure && failure.count >= 3 && Date.now() - failure.lastAttempt < 300000) { // 5 minutes
    console.log(`⏭️  Skipping ${feed.name} (recent failures)`);
    return [];
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔍 Fetching ${feed.name} (attempt ${attempt}/${maxRetries})`);
      const feedData = await safeParseFeed(feed.url);
      
      if (!feedData || !feedData.items || feedData.items.length === 0) {
        throw new Error('No items in feed');
      }
      
      const articles: ParsedNewsArticle[] = [];
      
      for (const item of feedData.items.slice(0, options.maxArticlesPerFeed)) {
        try {
          const parsedArticle = await parseRSSItem(item, feed);
          if (parsedArticle) {
            articles.push(parsedArticle);
          }
        } catch (error) {
          console.warn(`⚠️  Error parsing article from ${feed.name}:`, (error as Error).message);
        }
      }
      
      // Reset failure count on success
      feedFailures.delete(feed.name);
      return articles;
      
    } catch (error) {
      lastError = error;
      const errorMessage = (error as Error).message;
      console.warn(`⚠️  Attempt ${attempt}/${maxRetries} failed for ${feed.name}: ${errorMessage}`);
      
      // Track failures
      const failure = feedFailures.get(feed.name) || { count: 0, lastAttempt: 0 };
      failure.count++;
      failure.lastAttempt = Date.now();
      feedFailures.set(feed.name, failure);
      
      if (isUnrecoverableError(error)) {
        console.log(`🚫 Unrecoverable error for ${feed.name}, skipping retries`);
        break;
      }
      
      if (attempt < maxRetries) {
        const delay = 2000 * attempt; // Linear backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.error(`❌ Failed to fetch feed ${feed.name} after ${maxRetries} attempts: ${lastError?.message}`);
  return [];
}

/**
 * Safely parse a feed, with a fallback for malformed XML
 */
async function safeParseFeed(url: string) {
  try {
    // Add timeout wrapper
    const fetchPromise = parser.parseURL(url);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Feed fetch timeout')), 20000)
    );
    
    return await Promise.race([fetchPromise, timeoutPromise]) as any;
    
  } catch (error) {
    const errorMessage = (error as Error).message;
    
    if (errorMessage.includes('Invalid character') || 
        errorMessage.includes('Non-whitespace before first tag') ||
        errorMessage.includes('Unexpected end of input')) {
      
      console.warn(`🔧 Malformed XML detected for ${url}. Attempting to clean and re-parse.`);
      
      try {
        // Fetch raw XML and clean it
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; PaperTrader/1.0)',
            'Accept': 'application/rss+xml, application/xml, text/xml',
          },
          signal: AbortSignal.timeout(15000)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        let xmlText = await response.text();
        
        // Clean common XML issues
        xmlText = xmlText
          .replace(/&(?![a-zA-Z0-9#]{1,7};)/g, '&amp;') // Fix unescaped ampersands
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove invalid control characters
          .replace(/^\s*<\?xml[^>]*>\s*/, '') // Remove XML declaration if malformed
          .trim();
        
        // Ensure we have valid XML structure
        if (!xmlText.startsWith('<')) {
          throw new Error('Invalid XML structure');
        }

        return await parser.parseString(xmlText);
        
      } catch (cleanupError) {
        console.error(`🚫 Failed to clean and parse XML for ${url}:`, cleanupError);
        throw cleanupError;
      }
    }
    throw error;
  }
}

/**
 * Check if an error is unrecoverable
 */
function isUnrecoverableError(error: any): boolean {
  const message = (error as Error).message.toLowerCase();
  const unrecoverableCodes = [
    'enotfound', 'econnrefused', '404', '403', '401', 'getaddrinfo', 
    'certificate', 'ssl', 'https', 'dns', 'network', 'timeout'
  ];
  return unrecoverableCodes.some(code => message.includes(code));
}

/**
 * Parse a single RSS item into a news article
 */
async function parseRSSItem(item: any, feed: RSSFeedConfig): Promise<ParsedNewsArticle | null> {
  try {
    // Extract basic information with multiple fallbacks
    const title = item.title || item['dc:title'] || '';
    let summary = item.contentSnippet || item.content || item.summary || item.description || '';
    const link = item.link || item.guid || '';
    const publishedAt = item.pubDate || item.isoDate || item.date || item.updated || new Date().toISOString();
    
    // Skip if essential fields are missing
    if (!title || (!summary && !item.content)) {
      return null;
    }
    
    // Clean HTML from summary if present
    if (summary && typeof summary === 'string') {
      summary = summary.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    
    // Parse publication date with better error handling
    let pubDate: Date;
    try {
      pubDate = new Date(publishedAt);
      if (isNaN(pubDate.getTime())) {
        // Try parsing ISO format
        pubDate = parseISO(publishedAt);
        if (isNaN(pubDate.getTime())) {
          // Fallback to current time
          pubDate = new Date();
        }
      }
    } catch {
      pubDate = new Date();
    }
    
    // Generate unique ID
    const id = generateArticleId(title, link, pubDate);
    
    // Extract tickers
    const extractedTickers = extractTickersFromArticle(title, summary);
    const highConfidenceTickers = filterTickersByConfidence(extractedTickers, 0.5);
    const topTickers = getTopTickers(highConfidenceTickers, 5);
    
    // Analyze sentiment
    const sentimentDetails = analyzeArticleSentiment(title, summary);
    
    // Classify category
    const category = classifyCategory(title, summary, feed.category);
    
    // Calculate relevance score
    const relevanceScore = calculateRelevanceScore(
      title, 
      summary, 
      pubDate, 
      topTickers, 
      sentimentDetails,
      feed.credibility
    );
    
    // Generate summary if needed
    const finalSummary = generateSummary(summary, title);
    
    const article: ParsedNewsArticle = {
      id,
      title: cleanTitle(title),
      summary: finalSummary,
      url: link,
      source: feed.name,
      category,
      publishedAt: pubDate.toISOString(),
      relevanceScore,
      sentiment: sentimentDetails.sentiment,
      tickers: topTickers.map(t => t.symbol),
      rawTitle: title,
      rawSummary: summary,
      sourceCredibility: SOURCE_CREDIBILITY[feed.name] || feed.credibility,
      extractedTickers: topTickers,
      sentimentDetails,
      processingTime: new Date().toISOString()
    };
    
    return article;
    
  } catch (error) {
    console.error('❌ Error parsing RSS item:', error);
    return null;
  }
}

/**
 * Generate unique article ID
 */
function generateArticleId(title: string, link: string, pubDate: Date): string {
  const cleanTitle = title.replace(/[^\w\s]/g, '').toLowerCase().substring(0, 50);
  const cleanLink = link.replace(/https?:\/\//, '').replace(/[^\w\s]/g, '').substring(0, 30);
  const dateStr = pubDate.toISOString().split('T')[0];
  
  // Create hash-like string
  const combined = `${cleanTitle}-${cleanLink}-${dateStr}`;
  return Buffer.from(combined).toString('base64').substring(0, 16);
}

/**
 * Clean and normalize title
 */
function cleanTitle(title: string): string {
  return title
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^[^a-zA-Z0-9]+/, '')
    .replace(/[^a-zA-Z0-9]+$/, '')
    .substring(0, 200); // Limit title length
}

/**
 * Generate summary from content
 */
function generateSummary(content: string, title: string): string {
  if (!content) return '';
  
  // Remove HTML tags if present
  const cleanContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Split into sentences
  const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  // Use first meaningful sentence, or truncate content
  let summary = sentences[0] || cleanContent;
  
  // Remove title from summary if present
  if (title) {
    summary = summary.replace(new RegExp(title, 'gi'), '').trim();
  }
  
  // Limit length
  if (summary.length > 300) {
    summary = summary.substring(0, 297) + '...';
  }
  
  return summary || cleanContent.substring(0, 297) + '...';
}

/**
 * Classify article category
 */
function classifyCategory(title: string, summary: string, defaultCategory: string): string {
  const text = `${title} ${summary}`.toLowerCase();
  
  let bestCategory = defaultCategory;
  let maxScore = 0;
  
  for (const [category, keywords] of Object.entries(CATEGORY_PATTERNS)) {
    let score = 0;
    
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        score += 1;
      }
    }
    
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
    }
  }
  
  return bestCategory;
}

/**
 * Calculate relevance score
 */
function calculateRelevanceScore(
  title: string, 
  summary: string, 
  pubDate: Date, 
  tickers: ExtractedTicker[], 
  sentiment: SentimentResult,
  sourceCredibility: number
): number {
  let score = 0.5; // Base score
  
  // Boost for recent articles
  const ageInHours = (Date.now() - pubDate.getTime()) / (1000 * 60 * 60);
  if (ageInHours < 2) score += 0.3;
  else if (ageInHours < 6) score += 0.2;
  else if (ageInHours < 24) score += 0.1;
  
  // Boost for ticker mentions
  const tickerScore = tickers.reduce((sum, ticker) => sum + ticker.confidence, 0);
  score += Math.min(tickerScore * 0.1, 0.2);
  
  // Boost for strong sentiment
  if (sentiment.confidence > 0.7) score += 0.1;
  
  // Boost for source credibility
  score += sourceCredibility * 0.1;
  
  // Boost for financial keywords
  const financialKeywords = [
    'earnings', 'revenue', 'profit', 'loss', 'merger', 'acquisition', 'ipo',
    'dividend', 'buyback', 'guidance', 'forecast', 'analyst', 'upgrade', 'downgrade'
  ];
  
  const text = `${title} ${summary}`.toLowerCase();
  const keywordCount = financialKeywords.filter(keyword => text.includes(keyword)).length;
  score += Math.min(keywordCount * 0.05, 0.15);
  
  return Math.min(score, 1.0);
}

/**
 * Filter articles by age
 */
function filterArticlesByAge(articles: ParsedNewsArticle[], maxAgeHours: number): ParsedNewsArticle[] {
  const cutoffDate = subHours(new Date(), maxAgeHours);
  
  return articles.filter(article => {
    const pubDate = parseISO(article.publishedAt);
    return isAfter(pubDate, cutoffDate);
  });
}

/**
 * Remove duplicate articles
 */
function deduplicateArticles(articles: ParsedNewsArticle[]): ParsedNewsArticle[] {
  const seen = new Map<string, ParsedNewsArticle>();
  
  for (const article of articles) {
    // Create a more sophisticated deduplication key
    const key = article.title.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 80);
    
    if (!seen.has(key) || 
        (seen.has(key) && article.relevanceScore > seen.get(key)!.relevanceScore)) {
      seen.set(key, article);
    }
  }
  
  return Array.from(seen.values());
}

/**
 * Sort articles by relevance
 */
function sortArticlesByRelevance(articles: ParsedNewsArticle[], userWatchlist: string[]): ParsedNewsArticle[] {
  return articles.sort((a, b) => {
    // Boost articles mentioning user's watchlist
    const aWatchlistScore = a.tickers?.some(ticker => userWatchlist.includes(ticker)) ? 0.2 : 0;
    const bWatchlistScore = b.tickers?.some(ticker => userWatchlist.includes(ticker)) ? 0.2 : 0;
    
    const aFinalScore = a.relevanceScore + aWatchlistScore;
    const bFinalScore = b.relevanceScore + bWatchlistScore;
    
    return bFinalScore - aFinalScore;
  });
}

/**
 * Convert parsed articles to standard NewsArticle format
 */
export function toNewsArticles(articles: ParsedNewsArticle[]): NewsArticle[] {
  return articles.map(article => ({
    id: article.id,
    title: article.title,
    summary: article.summary,
    url: article.url,
    source: article.source,
    category: article.category,
    publishedAt: article.publishedAt,
    imageUrl: article.imageUrl,
    relevanceScore: article.relevanceScore,
    sentiment: article.sentiment,
    tickers: article.tickers
  }));
}

/**
 * Get news statistics
 */
export function getNewsStats(articles: ParsedNewsArticle[]) {
  const total = articles.length;
  if (total === 0) {
    return {
      total: 0,
      avgRelevanceScore: 0,
      sentimentDistribution: { positive: 0, negative: 0, neutral: 0 },
      categoryDistribution: {},
      topSources: [],
      avgTickersPerArticle: 0
    };
  }
  
  const sentimentDistribution = {
    positive: articles.filter(a => a.sentiment === 'positive').length / total,
    negative: articles.filter(a => a.sentiment === 'negative').length / total,
    neutral: articles.filter(a => a.sentiment === 'neutral').length / total
  };
  
  const categoryDistribution: Record<string, number> = {};
  articles.forEach(article => {
    categoryDistribution[article.category] = (categoryDistribution[article.category] || 0) + 1;
  });
  
  const sourceDistribution: Record<string, number> = {};
  articles.forEach(article => {
    sourceDistribution[article.source] = (sourceDistribution[article.source] || 0) + 1;
  });
  
  const topSources = Object.entries(sourceDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([source, count]) => ({ source, count }));
  
  const avgRelevanceScore = articles.reduce((sum, a) => sum + a.relevanceScore, 0) / total;
  const avgTickersPerArticle = articles.reduce((sum, a) => sum + (a.tickers?.length || 0), 0) / total;
  
  return {
    total,
    avgRelevanceScore,
    sentimentDistribution,
    categoryDistribution,
    topSources,
    avgTickersPerArticle
  };
}