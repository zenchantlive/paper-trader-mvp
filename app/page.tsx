'use client'; // This directive is necessary for components using hooks

import { useState, useEffect } from 'react';
import { Portfolio, Holding, Quote, TradeConfirmation, Transaction } from '@/lib/types'; // Corrected import path
import PortfolioSection from '@/components/sections/Portfolio';
import TradeWidget from '@/components/sections/TradeWidget';
import PriceChart from '@/components/sections/PriceChart';
import TransactionHistory from '@/components/sections/TransactionHistory';
import Watchlist from '@/components/sections/Watchlist';
import CompanyProfile from '@/components/sections/CompanyProfile';
import NewsFeed from '@/components/sections/NewsFeed';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import Toast, { useToast } from '@/components/ui/Toast';

export default function Home() {
  const [portfolio, setPortfolio] = useState<Portfolio>({
    cash: 100000,
    holdings: [],
    totalValue: 100000,
  });

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [tradeError, setTradeError] = useState<string | null>(null);
  const [isTransacting, setIsTransacting] = useState<boolean>(false);
  const [priceCache, setPriceCache] = useState<Record<string, Quote>>({});
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  const [pendingTrade, setPendingTrade] = useState<TradeConfirmation | null>(null);
  const [transactionHistory, setTransactionHistory] = useState<Transaction[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  
  const { toast, showToast, hideToast } = useToast();

  const resetAllData = () => {
    // Clear all localStorage data
    localStorage.removeItem('paper-trader-watchlist');
    localStorage.removeItem('paper-trader-portfolio');
    localStorage.removeItem('paper-trader-transactions');
    
    // Reset all state to initial values
    setPortfolio({
      cash: 100000,
      holdings: [],
      totalValue: 100000,
    });
    setTransactionHistory([]);
    setWatchlist([]);
    setCurrentQuote(null);
    setSearchTerm('');
    setSearchError(null);
    setTradeError(null);
    setPriceCache({});
    
    showToast('All data has been reset successfully', 'success');
  };

  // Load data from localStorage on component mount
  useEffect(() => {
    // Load watchlist
    const savedWatchlist = localStorage.getItem('paper-trader-watchlist');
    if (savedWatchlist) {
      try {
        const parsedWatchlist = JSON.parse(savedWatchlist);
        if (Array.isArray(parsedWatchlist)) {
          setWatchlist(parsedWatchlist);
        }
      } catch (error) {
        console.error('Error parsing watchlist from localStorage:', error);
      }
    }

    // Load portfolio
    const savedPortfolio = localStorage.getItem('paper-trader-portfolio');
    if (savedPortfolio) {
      try {
        const parsedPortfolio = JSON.parse(savedPortfolio);
        if (parsedPortfolio && typeof parsedPortfolio === 'object') {
          setPortfolio(parsedPortfolio);
        }
      } catch (error) {
        console.error('Error parsing portfolio from localStorage:', error);
      }
    }

    // Load transaction history
    const savedTransactions = localStorage.getItem('paper-trader-transactions');
    if (savedTransactions) {
      try {
        const parsedTransactions = JSON.parse(savedTransactions);
        if (Array.isArray(parsedTransactions)) {
          // Convert timestamp strings back to Date objects
          const transactionsWithDates = parsedTransactions.map(t => ({
            ...t,
            timestamp: new Date(t.timestamp)
          }));
          setTransactionHistory(transactionsWithDates);
        }
      } catch (error) {
        console.error('Error parsing transactions from localStorage:', error);
      }
    }
  }, []);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('paper-trader-watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // Save portfolio to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('paper-trader-portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  // Save transaction history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('paper-trader-transactions', JSON.stringify(transactionHistory));
  }, [transactionHistory]);

  const generateTransactionId = (): string => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const addTransaction = (ticker: string, type: 'buy' | 'sell', quantity: number, price: number) => {
    const transaction: Transaction = {
      id: generateTransactionId(),
      ticker,
      type,
      quantity,
      price,
      total: quantity * price,
      timestamp: new Date()
    };
    
    setTransactionHistory(prev => [transaction, ...prev]); // Add to beginning for chronological order
  };

  const addToWatchlist = (ticker: string) => {
    if (!watchlist.includes(ticker)) {
      setWatchlist(prev => [...prev, ticker]);
      showToast(`${ticker} added to watchlist`, 'success');
    } else {
      showToast(`${ticker} is already in your watchlist`, 'info');
    }
  };

  const removeFromWatchlist = (ticker: string) => {
    setWatchlist(prev => prev.filter(t => t !== ticker));
    showToast(`${ticker} removed from watchlist`, 'info');
  };

  const isInWatchlist = (ticker: string) => {
    return watchlist.includes(ticker);
  };

  const handleWatchlistTickerClick = async (ticker: string) => {
    setSearchTerm(ticker);
    setIsLoading(true);
    setSearchError(null);
    setTradeError(null);
    setCurrentQuote(null);

    try {
      const response = await fetch(`/api/quote/${ticker}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to fetch quote.');
      }
      const data: Quote = await response.json();
      setCurrentQuote(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSearchError(err.message);
      } else {
        setSearchError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm) return;
    setIsLoading(true);
    setSearchError(null);
    setTradeError(null); // Clear trade error when a new search is made
    setCurrentQuote(null);

    try {
      const response = await fetch(`/api/quote/${searchTerm}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to fetch quote.');
      }
      const data: Quote = await response.json();
      setCurrentQuote(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSearchError(err.message);
      } else {
        setSearchError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuy = async (ticker: string, quantity: number, price: number) => {
    const cost = quantity * price;

    if (portfolio.cash < cost) {
      setTradeError('Not enough funds for this purchase.');
      return;
    }

    setIsTransacting(true);
    // Simulate network delay for a more realistic feel
    await new Promise(resolve => setTimeout(resolve, 500));

    setPortfolio(prevPortfolio => {
      const existingHolding = prevPortfolio.holdings.find(h => h.ticker === ticker);
      let newHoldings: Holding[];

      if (existingHolding) {
        // Update existing holding
        const totalShares = existingHolding.shares + quantity;
        const totalCost = (existingHolding.averagePrice * existingHolding.shares) + cost;
        const newAveragePrice = totalCost / totalShares;
        
        newHoldings = prevPortfolio.holdings.map(h => 
          h.ticker === ticker 
            ? { ...h, shares: totalShares, averagePrice: newAveragePrice } 
            : h
        );
      } else {
        // Add new holding
        const newHolding: Holding = { ticker, shares: quantity, averagePrice: price };
        newHoldings = [...prevPortfolio.holdings, newHolding];
      }

      return {
        ...prevPortfolio,
        cash: prevPortfolio.cash - cost,
        holdings: newHoldings,
      };
    });
    
    // Add transaction to history
    addTransaction(ticker, 'buy', quantity, price);
    
    showToast(`Successfully bought ${quantity} shares of ${ticker}`, 'success');
    setIsTransacting(false);
  };

  const handleSell = async (ticker: string, quantity: number, price: number) => {
    const existingHolding = portfolio.holdings.find(h => h.ticker === ticker);

    if (!existingHolding || existingHolding.shares < quantity) {
      setTradeError('Error: Not enough shares to sell.');
      return;
    }

    const proceeds = quantity * price;
    setIsTransacting(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    setPortfolio(prevPortfolio => {
      let newHoldings: Holding[];
      
      if (existingHolding.shares === quantity) {
        // Remove holding completely
        newHoldings = prevPortfolio.holdings.filter(h => h.ticker !== ticker);
      } else {
        // Reduce shares of existing holding
        newHoldings = prevPortfolio.holdings.map(h => 
          h.ticker === ticker 
            ? { ...h, shares: h.shares - quantity } 
            : h
        );
      }

      return {
        ...prevPortfolio,
        cash: prevPortfolio.cash + proceeds,
        holdings: newHoldings,
      };
    });
    
    // Add transaction to history
    addTransaction(ticker, 'sell', quantity, price);
    
    showToast(`Successfully sold ${quantity} shares of ${ticker}`, 'success');
    setIsTransacting(false);
  };

  const handleTradeConfirmation = (ticker: string, quantity: number, price: number, type: 'buy' | 'sell') => {
    const total = quantity * price;
    const currentHolding = portfolio.holdings.find(h => h.ticker === ticker);
    
    const tradeData: TradeConfirmation = {
      ticker,
      quantity,
      price,
      type,
      total,
      currentHolding,
    };

    setPendingTrade(tradeData);
    setShowConfirmationModal(true);
  };

  const executeConfirmedTrade = async () => {
    if (!pendingTrade) return;

    setShowConfirmationModal(false);
    
    if (pendingTrade.type === 'buy') {
      await handleBuy(pendingTrade.ticker, pendingTrade.quantity, pendingTrade.price);
    } else {
      await handleSell(pendingTrade.ticker, pendingTrade.quantity, pendingTrade.price);
    }
    
    setPendingTrade(null);
  };

  const cancelTrade = () => {
    setShowConfirmationModal(false);
    setPendingTrade(null);
  };

  useEffect(() => {
    const updatePortfolioValue = async () => {
      if (portfolio.holdings.length === 0) {
        setPortfolio(p => ({ ...p, totalValue: p.cash }));
        return;
      }

      let holdingsValue = 0;
      const newPriceCache = { ...priceCache };

      for (const holding of portfolio.holdings) {
        try {
          const response = await fetch(`/api/quote/${holding.ticker}`);
          if (response.ok) {
            const quote: Quote = await response.json();
            holdingsValue += quote.price * holding.shares;
            newPriceCache[holding.ticker] = quote;
          } else {
            // If a fetch fails, use the last known price from cache
            holdingsValue += (priceCache[holding.ticker]?.price || holding.averagePrice) * holding.shares;
          }
        } catch (error) {
          console.error(`Failed to refresh price for ${holding.ticker}`, error);
          holdingsValue += (priceCache[holding.ticker]?.price || holding.averagePrice) * holding.shares;
        }
      }
      
      setPriceCache(newPriceCache);
      setPortfolio(p => ({ ...p, totalValue: p.cash + holdingsValue }));
    };

    // Set up the interval to run the update function
    const intervalId = setInterval(updatePortfolioValue, 60000); // Refresh every 60 seconds

    // CRITICAL: Return the cleanup function
    // This function will be called when the component unmounts or before the effect re-runs
    return () => {
      clearInterval(intervalId);
    };
  }, [portfolio.holdings, priceCache]); // Rerun effect if holdings change

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (tradeError) {
      timer = setTimeout(() => {
        setTradeError(null);
      }, 5000); // Clear error after 5 seconds
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [tradeError]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (searchError) {
      timer = setTimeout(() => {
        setSearchError(null);
      }, 5000); // Clear error after 5 seconds
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [searchError]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Paper Trader MVP</h1>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Portfolio Value: <span className="font-semibold text-indigo-600">${portfolio.totalValue.toLocaleString()}</span>
              </div>
              <div className="text-sm text-gray-600">
                Cash: <span className="font-semibold text-green-600">${portfolio.cash.toLocaleString()}</span>
              </div>
              <button
                onClick={resetAllData}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                title="Reset all data and start fresh"
              >
                Reset Data
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-8">
      
        {/* Trading Section */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TradeWidget
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleSearch={handleSearch}
          currentQuote={currentQuote}
          isLoading={isLoading}
          handleTradeConfirmation={handleTradeConfirmation}
          searchError={searchError}
          isTransacting={isTransacting}
          addToWatchlist={addToWatchlist}
          isInWatchlist={isInWatchlist}
        />
        
            <PortfolioSection portfolio={portfolio} />
          </div>
        </section>

        {/* Chart Section */}
        <section>
          <PriceChart 
            ticker={currentQuote?.symbol || null} 
            currentPrice={currentQuote?.price}
          />
        </section>

        {/* Activity Section */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <TransactionHistory transactions={transactionHistory} />
            <Watchlist 
              watchlist={watchlist}
              removeFromWatchlist={removeFromWatchlist}
              onTickerClick={handleWatchlistTickerClick}
            />
          </div>
        </section>

        {/* Information Section */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CompanyProfile ticker={currentQuote?.symbol || null} />
            <NewsFeed onTickerClick={handleWatchlistTickerClick} />
          </div>
        </section>

        {/* Error Messages */}
        {searchError && (
          <div className="p-4 bg-red-100 text-red-700 rounded-md text-center">
            {searchError}
          </div>
        )}
        {tradeError && (
          <div className="p-4 bg-red-100 text-red-700 rounded-md text-center">
            {tradeError}
          </div>
        )}
      </main>
      
      {/* Modals and Overlays */}
      {pendingTrade && (
        <ConfirmationModal
          isOpen={showConfirmationModal}
          tradeData={pendingTrade}
          userCash={portfolio.cash}
          onConfirm={executeConfirmedTrade}
          onCancel={cancelTrade}
        />
      )}
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />
      )}
    </div>
  );
}
