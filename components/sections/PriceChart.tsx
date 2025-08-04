'use client';

import { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine 
} from 'recharts';
import { HistoricalData, RechartsTooltipProps } from '@/lib/types';
import Spinner from '@/components/ui/Spinner';

interface PriceChartProps {
  ticker: string | null;
  currentPrice?: number;
}

const PERIOD_OPTIONS = [
  { value: '1D', label: '1D' },
  { value: '1W', label: '1W' },
  { value: '1M', label: '1M' },
  { value: '3M', label: '3M' },
  { value: '1Y', label: '1Y' }
];

export default function PriceChart({ ticker, currentPrice }: PriceChartProps) {
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1M');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistoricalData = async (symbol: string, period: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/history/${symbol}?period=${period}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch historical data');
      }

      const data: HistoricalData = await response.json();
      setHistoricalData(data);
    } catch (err) {
      console.error('Error fetching historical data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load chart data');
      setHistoricalData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (ticker) {
      fetchHistoricalData(ticker, selectedPeriod);
    } else {
      setHistoricalData(null);
      setError(null);
    }
  }, [ticker, selectedPeriod]);

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  const formatXAxisTick = (tickItem: string) => {
    const date = new Date(tickItem);
    if (selectedPeriod === '1D') {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (selectedPeriod === '1W' || selectedPeriod === '1M') {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: '2-digit'
      });
    }
  };

  const formatTooltipLabel = (label: string | undefined) => {
    if (!label) return '';
    const date = new Date(label);
    if (selectedPeriod === '1D') {
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const CustomTooltip = ({ active, payload, label }: RechartsTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">
            {formatTooltipLabel(label)}
          </p>
          <div className="mt-2 space-y-1">
            <p className="text-sm">
              <span className="text-gray-600">Open:</span> 
              <span className="ml-2 font-medium">${data.open.toFixed(2)}</span>
            </p>
            <p className="text-sm">
              <span className="text-gray-600">High:</span> 
              <span className="ml-2 font-medium">${data.high.toFixed(2)}</span>
            </p>
            <p className="text-sm">
              <span className="text-gray-600">Low:</span> 
              <span className="ml-2 font-medium">${data.low.toFixed(2)}</span>
            </p>
            <p className="text-sm">
              <span className="text-gray-600">Close:</span> 
              <span className="ml-2 font-medium">${data.close.toFixed(2)}</span>
            </p>
            <p className="text-sm">
              <span className="text-gray-600">Volume:</span> 
              <span className="ml-2 font-medium">{data.volume.toLocaleString()}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!ticker) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Price Chart</h2>
        <div className="flex items-center justify-center h-80 text-gray-500">
          <p>Select a stock to view its price chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">
          Price Chart - {ticker}
        </h2>
        
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handlePeriodChange(option.value)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === option.value
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-80">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-2 text-gray-600">Loading chart data...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center h-80">
          <div className="text-center">
            <p className="text-red-600 mb-2">Failed to load chart data</p>
            <p className="text-sm text-gray-500">{error}</p>
            <button
              onClick={() => ticker && fetchHistoricalData(ticker, selectedPeriod)}
              className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {historicalData && historicalData.data.length > 0 && !isLoading && (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={historicalData.data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date"
                tickFormatter={formatXAxisTick}
                stroke="#6b7280"
                fontSize={12}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={['dataMin - 5', 'dataMax + 5']}
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {currentPrice && (
                <ReferenceLine 
                  y={currentPrice} 
                  stroke="#10b981" 
                  strokeDasharray="5 5"
                  label={{ value: "Current", position: "right" }}
                />
              )}
              
              <Line
                type="monotone"
                dataKey="close"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: '#4f46e5', fill: '#ffffff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {historicalData && historicalData.data.length === 0 && !isLoading && (
        <div className="flex items-center justify-center h-80 text-gray-500">
          <p>No historical data available for {ticker}</p>
        </div>
      )}
    </div>
  );
}
