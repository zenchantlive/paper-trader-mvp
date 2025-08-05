'use client';

import { useState, useEffect } from 'react';
import { NewsArticle } from '@/lib/types';
import Spinner from '@/components/ui/Spinner';

interface NewsFeedProps {
  onTickerClick?: (ticker: string) => void;
}

interface NewsResponse {
  articles: NewsArticle[];
  total: number;
  lastUpdated: string;
  cached?: boolean;
  stats?: any;
}

const CATEGORIES = [
  { value: 'all', label: 'All News' },
  { value: 'Markets', label: 'Markets' },
  { value: 'Economy', label: 'Economy' },
  { value: 'Commodities', label: 'Commodities' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Automotive', label: 'Automotive' },
  { value: 'Banking', label: 'Banking' },
  { value: 'Cryptocurrency', label: 'Crypto' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Retail', label: 'Retail' },
  { value: 'Business', label: 'Business' }
];

export default function NewsFeed({ onTickerClick }: NewsFeedProps) {
  const [newsData, setNewsData] = useState<NewsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const fetchNews = async (category: string = 'all') => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        category,
        limit: '8'
      });
      
      const response = await fetch(`/api/news?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch news');
      }

      const data: NewsResponse = await response.json();
      setNewsData(data);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(err instanceof Error ? err.message : 'Failed to load news');
      setNewsData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(selectedCategory);
    
    // Set up auto-refresh every 2 minutes if enabled
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchNews(selectedCategory);
      }, 2 * 60 * 1000); // 2 minutes
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedCategory, autoRefresh]);

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const publishedAt = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - publishedAt.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) { // 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  };

  const getSentimentColor = (sentiment: string): string => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'negative':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
          </svg>
        );
      case 'negative':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM6.293 9.293a1 1 0 011.414 0L9 10.586V7a1 1 0 112 0v3.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Market News</h2>
        
        <div className="flex items-center gap-4">
          {newsData?.lastUpdated && (
            <div className="flex items-center gap-2">
              {newsData.cached && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-xs">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Cached
                </span>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Updated: {new Date(newsData.lastUpdated).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1 rounded-md text-sm transition-colors flex items-center gap-1 ${
                autoRefresh 
                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Auto {autoRefresh ? 'On' : 'Off'}
            </button>
            <button
              onClick={() => fetchNews(selectedCategory)}
              className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-md text-sm hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.value
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading news...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-2">Failed to load news</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => fetchNews(selectedCategory)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {newsData && newsData.articles.length > 0 && !isLoading && (
        <div className="space-y-4">
          {newsData.articles.map((article) => (
            <div key={article.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 leading-tight">
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      {article.title}
                    </a>
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                    {article.summary}
                  </p>
                </div>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{article.source}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{formatTimeAgo(article.publishedAt)}</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(article.sentiment)}`}>
                    {getSentimentIcon(article.sentiment)}
                    {article.sentiment}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {Math.round(article.relevanceScore * 100)}%
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {article.category}
                  </span>
                </div>

                {article.tickers && article.tickers.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {article.tickers.map((ticker) => (
                      <button
                        key={ticker}
                        onClick={() => onTickerClick?.(ticker)}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                      >
                        {ticker}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {newsData && newsData.articles.length === 0 && !isLoading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>No news articles found for the selected category.</p>
        </div>
      )}
    </div>
  );
}
