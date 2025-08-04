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
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Company Profile</h2>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>Select a stock to view company information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Company Profile - {ticker}</h2>

      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-2 text-gray-600">Loading company data...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-2">Failed to load company data</p>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => ticker && fetchCompanyData(ticker)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {companyData && !isLoading && (
        <div className="space-y-6">
          {/* Company Overview */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">{companyData.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Exchange</p>
                <p className="font-medium">{companyData.exchange}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Sector</p>
                <p className="font-medium">{companyData.sector}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Industry</p>
                <p className="font-medium">{companyData.industry}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Country</p>
                <p className="font-medium">{companyData.country}</p>
              </div>
            </div>
            
            {companyData.description && companyData.description !== 'No description available' && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Description</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {companyData.description.length > 300 
                    ? `${companyData.description.substring(0, 300)}...` 
                    : companyData.description
                  }
                </p>
              </div>
            )}
          </div>

          {/* Key Metrics */}
          <div>
            <h4 className="text-md font-semibold mb-3 text-gray-900">Key Metrics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-xs text-gray-600">Market Cap</p>
                <p className="font-semibold">{formatNumber(companyData.marketCapitalization)}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-xs text-gray-600">P/E Ratio</p>
                <p className="font-semibold">{formatRatio(companyData.peRatio)}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-xs text-gray-600">EPS</p>
                <p className="font-semibold">${formatRatio(companyData.eps)}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-xs text-gray-600">Beta</p>
                <p className="font-semibold">{formatRatio(companyData.beta)}</p>
              </div>
            </div>
          </div>

          {/* Financial Ratios */}
          <div>
            <h4 className="text-md font-semibold mb-3 text-gray-900">Financial Ratios</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Profit Margin</p>
                <p className="font-medium">{formatPercentage(companyData.profitMargin)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Operating Margin</p>
                <p className="font-medium">{formatPercentage(companyData.operatingMarginTTM)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ROE</p>
                <p className="font-medium">{formatPercentage(companyData.returnOnEquityTTM)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ROA</p>
                <p className="font-medium">{formatPercentage(companyData.returnOnAssetsTTM)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">P/B Ratio</p>
                <p className="font-medium">{formatRatio(companyData.priceToBookRatio)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">P/S Ratio</p>
                <p className="font-medium">{formatRatio(companyData.priceToSalesRatioTTM)}</p>
              </div>
            </div>
          </div>

          {/* Stock Performance */}
          <div>
            <h4 className="text-md font-semibold mb-3 text-gray-900">Stock Performance</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">52W High</p>
                <p className="font-medium">${formatRatio(companyData.weekHigh52)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">52W Low</p>
                <p className="font-medium">${formatRatio(companyData.weekLow52)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">50D MA</p>
                <p className="font-medium">${formatRatio(companyData.movingAverage50Day)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">200D MA</p>
                <p className="font-medium">${formatRatio(companyData.movingAverage200Day)}</p>
              </div>
            </div>
          </div>

          {/* Dividend Info */}
          {companyData.dividendPerShare !== 'N/A' && companyData.dividendPerShare !== '0' && (
            <div>
              <h4 className="text-md font-semibold mb-3 text-gray-900">Dividend Information</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Dividend Per Share</p>
                  <p className="font-medium">${companyData.dividendPerShare}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Dividend Yield</p>
                  <p className="font-medium">{formatPercentage(companyData.dividendYield)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ex-Dividend Date</p>
                  <p className="font-medium">{companyData.exDividendDate}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}