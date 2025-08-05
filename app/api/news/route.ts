import { NextResponse } from 'next/server';
import { fetchAndParseNews, toNewsArticles, getNewsStats, NewsProcessingOptions } from '@/lib/news/newsParser';
import { getFeedStatus } from '@/lib/news/rssFeeds';
import { NewsArticle } from '@/lib/types';

// Enhanced in-memory cache with metadata
interface CacheEntry {
  data: NewsArticle[];
  timestamp: number;
  stats: any;
  feedStatus: any;
  expiresAt: number;
}

let newsCache: CacheEntry | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes for real-time news
const STALE_WHILE_REVALIDATE = 10 * 60 * 1000; // 10 minutes for stale data

// Rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = requestCounts.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  userLimit.count++;
  return true;
}

function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIP || 'unknown';
}

export async function GET(request: Request) {
  const startTime = Date.now();
  
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          retryAfter: 60
        },
        { 
          status: 429,
          headers: { 'Retry-After': '60' }
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100); // Cap at 100
    const minConfidence = parseFloat(searchParams.get('minConfidence') || '0.5');
    const maxAgeHours = parseInt(searchParams.get('maxAgeHours') || '24');
    const includeStats = searchParams.get('includeStats') === 'true';
    const forceRefresh = searchParams.get('refresh') === 'true';
    
    console.log(`📡 News API request: category=${category}, limit=${limit}, minConfidence=${minConfidence}, maxAge=${maxAgeHours}h`);
    
    // Check cache first (unless force refresh)
    const now = Date.now();
    const cacheValid = newsCache !== null && (now - newsCache.timestamp) < CACHE_DURATION;
    const cacheStale = newsCache !== null && (now - newsCache.timestamp) < STALE_WHILE_REVALIDATE;
    
    if (!forceRefresh && cacheValid) {
      console.log('📋 Serving cached news data');
      
      let filteredNews = filterAndSortNews(newsCache!.data, category, minConfidence, limit);
      
      const response = NextResponse.json({
        success: true,
        articles: filteredNews,
        total: filteredNews.length,
        lastUpdated: new Date(newsCache!.timestamp).toISOString(),
        cached: true,
        processingTime: Date.now() - startTime,
        ...(includeStats && { 
          stats: newsCache!.stats,
          feedStatus: newsCache!.feedStatus 
        })
      });
      
      response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
      return response;
    }
    
    // Fetch fresh news from RSS feeds
    console.log('🔄 Fetching fresh news data...');
    
    const options: NewsProcessingOptions = {
      maxArticlesPerFeed: 15,
      maxTotalArticles: 150, // Increased for better variety
      minConfidence,
      maxAgeHours,
      enableDeduplication: true,
      userWatchlist: [] // Could be populated from user session in the future
    };
    
    try {
      const parsedArticles = await fetchAndParseNews(options);
      const articles = toNewsArticles(parsedArticles);
      const stats = getNewsStats(parsedArticles);
      const feedStatus = getFeedStatus();
      
      console.log(`✅ Successfully fetched ${articles.length} articles`);
      
      // Update cache
      newsCache = {
        data: articles,
        timestamp: now,
        stats,
        feedStatus,
        expiresAt: now + CACHE_DURATION
      };
      
      // Apply filters
      let filteredNews = filterAndSortNews(articles, category, minConfidence, limit);
      
      const response = NextResponse.json({
        success: true,
        articles: filteredNews,
        total: filteredNews.length,
        lastUpdated: new Date().toISOString(),
        cached: false,
        processingTime: Date.now() - startTime,
        ...(includeStats && { 
          stats,
          feedStatus 
        })
      });
      
      // Cache headers
      response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
      return response;
      
    } catch (fetchError) {
      console.error('❌ Error fetching fresh news:', fetchError);
      
      // Return stale cache if available
      if (cacheStale) {
        console.log('🔄 Returning stale cached data due to fetch error');
        
        let filteredNews = filterAndSortNews(newsCache!.data, category, minConfidence, limit);
        
        const response = NextResponse.json({
          success: true,
          articles: filteredNews,
          total: filteredNews.length,
          lastUpdated: new Date(newsCache!.timestamp).toISOString(),
          cached: true,
          stale: true,
          error: 'Fresh data unavailable, returning cached data',
          processingTime: Date.now() - startTime,
          ...(includeStats && { 
            stats: newsCache!.stats,
            feedStatus: newsCache!.feedStatus 
          })
        });
        
        response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
        return response;
      }
      
      throw fetchError;
    }
    
  } catch (error) {
    console.error('❌ News API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isTimeout = errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT');
    const isNetworkError = errorMessage.includes('ENOTFOUND') || errorMessage.includes('ECONNREFUSED');
    
    let userMessage = 'Failed to fetch news data';
    let statusCode = 500;
    
    if (isTimeout) {
      userMessage = 'News service is temporarily slow. Please try again.';
      statusCode = 503;
    } else if (isNetworkError) {
      userMessage = 'News service is temporarily unavailable. Please try again later.';
      statusCode = 503;
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: userMessage,
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        articles: [],
        total: 0,
        lastUpdated: new Date().toISOString(),
        processingTime: Date.now() - startTime
      },
      { status: statusCode }
    );
  }
}

/**
 * Filter and sort news articles based on parameters
 */
function filterAndSortNews(
  articles: NewsArticle[], 
  category: string | null, 
  minConfidence: number, 
  limit: number
): NewsArticle[] {
  let filteredNews = [...articles];
  
  // Filter by category if specified
  if (category && category !== 'all') {
    filteredNews = filteredNews.filter(article => 
      article.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  // Filter by minimum confidence
  filteredNews = filteredNews.filter(article => 
    article.relevanceScore >= minConfidence
  );
  
  // Sort by published date (most recent first) and relevance
  filteredNews.sort((a, b) => {
    const dateA = new Date(a.publishedAt).getTime();
    const dateB = new Date(b.publishedAt).getTime();
    const relevanceDiff = b.relevanceScore - a.relevanceScore;
    
    // Prioritize recency, but boost high-relevance articles
    if (Math.abs(dateA - dateB) > 2 * 60 * 60 * 1000) { // More than 2 hours difference
      return dateB - dateA;
    }
    return relevanceDiff;
  });
  
  // Limit results
  return filteredNews.slice(0, limit);
}

/**
 * Health check endpoint
 */
export async function HEAD(request: Request) {
  try {
    const feedStatus = getFeedStatus();
    const healthyFeeds = feedStatus.enabled;
    
    // Consider service healthy if we have at least 3 working feeds
    if (healthyFeeds >= 3) {
      return new NextResponse(null, { 
        status: 200,
        headers: {
          'X-Service-Status': 'healthy',
          'X-Feed-Count': healthyFeeds.toString(),
          'Cache-Control': 'no-cache'
        }
      });
    }
    
    return new NextResponse(null, { 
      status: 503,
      headers: {
        'X-Service-Status': 'degraded',
        'X-Feed-Count': healthyFeeds.toString(),
        'Retry-After': '300'
      }
    });
    
  } catch (error) {
    return new NextResponse(null, { 
      status: 503,
      headers: {
        'X-Service-Status': 'error',
        'Retry-After': '300'
      }
    });
  }
}

/**
 * OPTIONS for CORS support
 */
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}