'use client';

import { useState, useEffect } from 'react';
import { CompanyOverview } from '@/lib/types';
import Spinner from '@/components/ui/Spinner';

interface CompanyProfileProps {
  ticker: string | null;
}

export default function CompanyProfile({ ticker }: CompanyProfileProps) {
  const [companyData, setCompanyData] = useState<CompanyOverview | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanyData = async (symbol: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/overview/${symbol}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch company data');
      }

      const data: CompanyOverview = await response.json();
      setCompanyData(data);
    } catch (err) {
      console.error('Error fetching company data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load company data');
      setCompanyData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (ticker) {
      fetchCompanyData(ticker);
    } else {
      setCompanyData(null);
      setError(null);
    }
  }, [ticker]);

  const formatNumber = (value: string): string => {
    if (value === 'N/A' || value === 'None' || !value) return 'N/A';
    
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    
    if (num >= 1e12) {
      return `$${(num / 1e12).toFixed(2)}T`;
    } else if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(2)}B`;
    } else if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(2)}M`;
    } else {
      return `$${num.toLocaleString()}`;
    }
  };

  const formatPercentage = (value: string): string => {
    if (value === 'N/A' || value === 'None' || !value) return 'N/A';
    
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    
    return `${(num * 100).toFixed(2)}%`;
  };

  const formatRatio = (value: string): string => {
    if (value === 'N/A' || value === 'None' || !value) return 'N/A';
    
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    
    return num.toFixed(2);
  };

  if (!ticker) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Company Profile</h2>
        <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
          <p className="text-sm">Select a stock to view company information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Company Profile - {ticker}</h2>

      {isLoading && (
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <Spinner size="md" />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading company data...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-2 text-sm">Failed to load company data</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{error}</p>
            <button
              onClick={() => ticker && fetchCompanyData(ticker)}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-xs hover:bg-indigo-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {companyData && !isLoading && (
        <div className="space-y-4">
          {/* Company Overview */}
          <div>
            <h3 className="text-base font-semibold mb-2 text-gray-900 dark:text-white">{companyData.name}</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Exchange</p>
                <p className="font-medium text-sm text-gray-900 dark:text-white">{companyData.exchange}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Sector</p>
                <p className="font-medium text-sm text-gray-900 dark:text-white">{companyData.sector}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Industry</p>
                <p className="font-medium text-sm text-gray-900 dark:text-white">{companyData.industry}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Country</p>
                <p className="font-medium text-sm text-gray-900 dark:text-white">{companyData.country}</p>
              </div>
            </div>
            
            {companyData.description && companyData.description !== 'No description available' && (
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Description</p>
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                  {companyData.description.length > 200 
                    ? `${companyData.description.substring(0, 200)}...` 
                    : companyData.description
                  }
                </p>
              </div>
            )}
          </div>

          {/* Key Metrics */}
          <div>
            <h4 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Key Metrics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
                <p className="text-xs text-gray-600 dark:text-gray-400">Market Cap</p>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{formatNumber(companyData.marketCapitalization)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
                <p className="text-xs text-gray-600 dark:text-gray-400">P/E Ratio</p>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{formatRatio(companyData.peRatio)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
                <p className="text-xs text-gray-600 dark:text-gray-400">EPS</p>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">${formatRatio(companyData.eps)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
                <p className="text-xs text-gray-600 dark:text-gray-400">Beta</p>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{formatRatio(companyData.beta)}</p>
              </div>
            </div>
          </div>

          {/* Financial Ratios */}
          <div>
            <h4 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Financial Ratios</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Profit Margin</p>
                <p className="font-medium text-sm text-gray-900 dark:text-white">{formatPercentage(companyData.profitMargin)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Operating Margin</p>
                <p className="font-medium text-sm text-gray-900 dark:text-white">{formatPercentage(companyData.operatingMarginTTM)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">ROE</p>
                <p className="font-medium text-sm text-gray-900 dark:text-white">{formatPercentage(companyData.returnOnEquityTTM)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">ROA</p>
                <p className="font-medium text-sm text-gray-900 dark:text-white">{formatPercentage(companyData.returnOnAssetsTTM)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">P/B Ratio</p>
                <p className="font-medium text-sm text-gray-900 dark:text-white">{formatRatio(companyData.priceToBookRatio)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">P/S Ratio</p>
                <p className="font-medium text-sm text-gray-900 dark:text-white">{formatRatio(companyData.priceToSalesRatioTTM)}</p>
              </div>
            </div>
          </div>

          {/* Stock Performance */}
          <div>
            <h4 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Stock Performance</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">52W High</p>
                <p className="font-medium text-sm text-gray-900 dark:text-white">${formatRatio(companyData.weekHigh52)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">52W Low</p>
                <p className="font-medium text-sm text-gray-900 dark:text-white">${formatRatio(companyData.weekLow52)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">50D MA</p>
                <p className="font-medium text-sm text-gray-900 dark:text-white">${formatRatio(companyData.movingAverage50Day)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">200D MA</p>
                <p className="font-medium text-sm text-gray-900 dark:text-white">${formatRatio(companyData.movingAverage200Day)}</p>
              </div>
            </div>
          </div>

          {/* Dividend Info */}
          {companyData.dividendPerShare !== 'N/A' && companyData.dividendPerShare !== '0' && (
            <div>
              <h4 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Dividend Information</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Dividend Per Share</p>
                  <p className="font-medium text-sm text-gray-900 dark:text-white">${companyData.dividendPerShare}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Dividend Yield</p>
                  <p className="font-medium text-sm text-gray-900 dark:text-white">{formatPercentage(companyData.dividendYield)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Ex-Dividend Date</p>
                  <p className="font-medium text-sm text-gray-900 dark:text-white">{companyData.exDividendDate}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
