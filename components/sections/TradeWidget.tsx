'use client';

import { useState } from 'react';
import { Quote } from '@/lib/types';
import Spinner, { QuoteSkeleton } from '@/components/ui/Spinner';

interface TradeWidgetProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleSearch: () => void;
  currentQuote: Quote | null;
  isLoading: boolean;
  handleTradeConfirmation: (ticker: string, quantity: number, price: number, type: 'buy' | 'sell') => void;
  searchError: string | null;
  isTransacting: boolean;
  addToWatchlist: (ticker: string) => void;
  isInWatchlist: (ticker: string) => boolean;
}

export default function TradeWidget({
  searchTerm,
  setSearchTerm,
  handleSearch,
  currentQuote,
  isLoading,
  handleTradeConfirmation,
  searchError,
  isTransacting,
  addToWatchlist,
  isInWatchlist,
}: TradeWidgetProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [quantityError, setQuantityError] = useState<string | null>(null);

  const validateQuantity = (value: number): boolean => {
    if (value <= 0) {
      setQuantityError('Quantity must be greater than 0');
      return false;
    }
    if (!Number.isInteger(value)) {
      setQuantityError('Quantity must be a whole number');
      return false;
    }
    if (value > 10000) {
      setQuantityError('Maximum quantity is 10,000 shares');
      return false;
    }
    setQuantityError(null);
    return true;
  };

  const onBuyClick = () => {
    if (currentQuote && validateQuantity(quantity)) {
      handleTradeConfirmation(currentQuote.symbol, quantity, currentQuote.price, 'buy');
    }
  };

  const onSellClick = () => {
    if (currentQuote && validateQuantity(quantity)) {
      handleTradeConfirmation(currentQuote.symbol, quantity, currentQuote.price, 'sell');
    }
  };

  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value) || 1;
    setQuantity(numValue);
    if (value) {
      validateQuantity(numValue);
    } else {
      setQuantityError(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Trade</h2>
      
      <div className="mb-3">
        <label htmlFor="ticker" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Stock Ticker
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="ticker"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
            className="flex-grow p-1.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="e.g., AAPL"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading || !searchTerm}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center min-w-[70px]"
          >
            {isLoading ? <Spinner size="sm" color="white" /> : 'Search'}
          </button>
        </div>
        {searchError && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{searchError}</p>
        )}
      </div>

      {isLoading && <QuoteSkeleton />}
      
      {currentQuote && !isLoading && (
        <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-900 dark:text-white">Current Quote</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{currentQuote.symbol}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">${currentQuote.price.toFixed(2)}</p>
            </div>
            <button
              onClick={() => addToWatchlist(currentQuote.symbol)}
              disabled={isInWatchlist(currentQuote.symbol)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                isInWatchlist(currentQuote.symbol)
                  ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800'
              }`}
              title={isInWatchlist(currentQuote.symbol) ? 'Already in watchlist' : 'Add to watchlist'}
            >
              {isInWatchlist(currentQuote.symbol) ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}

      {currentQuote && !isLoading && (
        <div className="mb-3">
          <label htmlFor="quantity" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Quantity
          </label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
            min="1"
            max="10000"
            className={`w-full p-1.5 border rounded-md shadow-sm focus:ring-2 focus:ring-offset-2 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
              quantityError 
                ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'
            }`}
          />
          {quantityError && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{quantityError}</p>
          )}
          {!quantityError && currentQuote && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Total: ${(quantity * currentQuote.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          )}
        </div>
      )}

      {currentQuote && !isLoading && (
        <div className="flex gap-2">
          <button
            onClick={onBuyClick}
            disabled={isTransacting || !!quantityError}
            className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 disabled:cursor-not-allowed flex items-center justify-center min-h-[36px]"
          >
            {isTransacting ? <Spinner size="sm" color="white" /> : 'Buy'}
          </button>
          <button
            onClick={onSellClick}
            disabled={isTransacting || !!quantityError}
            className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 disabled:cursor-not-allowed flex items-center justify-center min-h-[36px]"
          >
            {isTransacting ? <Spinner size="sm" color="white" /> : 'Sell'}
          </button>
        </div>
      )}
    </div>
  );
}
