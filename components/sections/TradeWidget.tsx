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
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Trade</h2>
      
      <div className="mb-4">
        <label htmlFor="ticker" className="block text-sm font-medium text-gray-700 mb-1">
          Stock Ticker
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="ticker"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
            className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="e.g., AAPL"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading || !searchTerm}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
          >
            {isLoading ? <Spinner size="sm" color="white" /> : 'Search'}
          </button>
        </div>
        {searchError && (
          <p className="mt-1 text-sm text-red-600">{searchError}</p>
        )}
      </div>

      {isLoading && <QuoteSkeleton />}
      
      {currentQuote && !isLoading && (
        <div className="mb-4 p-4 bg-gray-50 rounded-md">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Current Quote</h3>
              <p className="text-sm text-gray-500">{currentQuote.symbol}</p>
              <p className="text-2xl font-bold">${currentQuote.price.toFixed(2)}</p>
            </div>
            <button
              onClick={() => addToWatchlist(currentQuote.symbol)}
              disabled={isInWatchlist(currentQuote.symbol)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                isInWatchlist(currentQuote.symbol)
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
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
        <div className="mb-4">
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
            min="1"
            max="10000"
            className={`w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-offset-2 sm:text-sm ${
              quantityError 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
            }`}
          />
          {quantityError && (
            <p className="mt-1 text-sm text-red-600">{quantityError}</p>
          )}
          {!quantityError && currentQuote && (
            <p className="mt-1 text-sm text-gray-500">
              Total: ${(quantity * currentQuote.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          )}
        </div>
      )}

      {currentQuote && !isLoading && (
        <div className="flex gap-4">
          <button
            onClick={onBuyClick}
            disabled={isTransacting || !!quantityError}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 disabled:cursor-not-allowed flex items-center justify-center min-h-[40px]"
          >
            {isTransacting ? <Spinner size="sm" color="white" /> : 'Buy'}
          </button>
          <button
            onClick={onSellClick}
            disabled={isTransacting || !!quantityError}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 disabled:cursor-not-allowed flex items-center justify-center min-h-[40px]"
          >
            {isTransacting ? <Spinner size="sm" color="white" /> : 'Sell'}
          </button>
        </div>
      )}
    </div>
  );
}
