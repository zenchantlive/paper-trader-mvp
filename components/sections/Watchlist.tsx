'use client';

import { useState, useEffect } from 'react';
import { Quote } from '@/lib/types';
import Spinner from '@/components/ui/Spinner';

interface WatchlistProps {
  watchlist: string[];
  removeFromWatchlist: (ticker: string) => void;
  onTickerClick: (ticker: string) => void;
}

interface WatchlistItem extends Quote {
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  priceChange?: number;
  priceChangePercent?: number;
}

export default function Watchlist({ watchlist, removeFromWatchlist, onTickerClick }: WatchlistProps) {
  const [watchlistData, setWatchlistData] = useState<Record<string, WatchlistItem>>({});
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  const fetchQuoteForTicker = async (ticker: string) => {
    setWatchlistData(prev => ({
      ...prev,
      [ticker]: {
        ...prev[ticker],
        isLoading: true,
        error: null
      }
    }));

    try {
      const response = await fetch(`/api/quote/${ticker}`);
      if (!response.ok) {
        throw new Error('Failed to fetch quote');
      }
      
      const quote: Quote = await response.json();
      const previousPrice = watchlistData[ticker]?.price;
      
      setWatchlistData(prev => ({
        ...prev,
        [ticker]: {
          ...quote,
          isLoading: false,
          error: null,
          lastUpdated: new Date(),
          priceChange: previousPrice ? quote.price - previousPrice : undefined,
          priceChangePercent: previousPrice ? ((quote.price - previousPrice) / previousPrice) * 100 : undefined
        }
      }));
    } catch (error) {
      setWatchlistData(prev => ({
        ...prev,
        [ticker]: {
          ...prev[ticker],
          isLoading: false,
          error: 'Failed to load'
        }
      }));
    }
  };

  const updateAllPrices = async () => {
    if (watchlist.length === 0) return;
    
    setLastUpdateTime(new Date());
    
    // Update all tickers in parallel
    await Promise.all(
      watchlist.map(ticker => fetchQuoteForTicker(ticker))
    );
  };

  // Initialize watchlist data when watchlist changes
  useEffect(() => {
    watchlist.forEach(ticker => {
      if (!watchlistData[ticker]) {
        setWatchlistData(prev => ({
          ...prev,
          [ticker]: {
            symbol: ticker,
            price: 0,
            isLoading: true,
            error: null,
            lastUpdated: null
          }
        }));
      }
    });

    // Remove data for tickers no longer in watchlist
    setWatchlistData(prev => {
      const filtered: Record<string, WatchlistItem> = {};
      watchlist.forEach(ticker => {
        if (prev[ticker]) {
          filtered[ticker] = prev[ticker];
        }
      });
      return filtered;
    });
  }, [watchlist]);

  // Initial load and periodic updates
  useEffect(() => {
    if (watchlist.length > 0) {
      updateAllPrices();
      
      // Update prices every 60 seconds
      const interval = setInterval(updateAllPrices, 60000);
      return () => clearInterval(interval);
    }
  }, [watchlist]);

  const formatPriceChange = (change: number, changePercent: number) => {
    const isPositive = change >= 0;
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
    const symbol = isPositive ? '+' : '';
    
    return (
      <div className={`text-sm ${colorClass} font-medium`}>
        <div>{symbol}${change.toFixed(2)}</div>
        <div>({symbol}{changePercent.toFixed(2)}%)</div>
      </div>
    );
  };

  if (watchlist.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Watchlist</h2>
        <div className="text-center py-8 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <p>Your watchlist is empty</p>
          <p className="text-sm mt-1">Search for stocks and add them to your watchlist to track their prices</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Watchlist</h2>
        
        <div className="flex items-center gap-4">
          {lastUpdateTime && (
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdateTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          )}
          <button
            onClick={updateAllPrices}
            className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md text-sm hover:bg-indigo-200 transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {watchlist.map(ticker => {
          const item = watchlistData[ticker];
          
          return (
            <div key={ticker} className="flex items-center justify-between p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => onTickerClick(ticker)}
                  className="text-left hover:text-indigo-600 transition-colors"
                >
                  <h3 className="font-semibold text-lg">{ticker}</h3>
                </button>
                
                {item?.isLoading && (
                  <Spinner size="sm" />
                )}
                
                {item?.error && (
                  <span className="text-sm text-red-600">{item.error}</span>
                )}
              </div>

              <div className="flex items-center gap-4">
                {item && !item.isLoading && !item.error && (
                  <>
                    <div className="text-right">
                      <div className="text-xl font-bold">${item.price.toFixed(2)}</div>
                      {item.priceChange !== undefined && item.priceChangePercent !== undefined && (
                        formatPriceChange(item.priceChange, item.priceChangePercent)
                      )}
                    </div>
                  </>
                )}

                <button
                  onClick={() => removeFromWatchlist(ticker)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Remove from watchlist"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-center text-sm text-gray-500">
        Prices update automatically every 60 seconds
      </div>
    </div>
  );
}