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
  ReferenceLine,
  Bar,
  ComposedChart,
} from 'recharts';
import { HistoricalData, RechartsTooltipProps } from '@/lib/types';
import Spinner from '@/components/ui/Spinner';

interface PriceChartProps {
  ticker: string | null;
  currentPrice?: number;
}

type ChartType = 'line' | 'candlestick';

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
  const [chartType, setChartType] = useState<ChartType>('line');
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
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {formatTooltipLabel(label)}
          </p>
          <div className="mt-2 space-y-1">
            <p className="text-sm">
              <span className="text-gray-600 dark:text-gray-400">Open:</span> 
              <span className="ml-2 font-medium text-gray-900 dark:text-white">${data.open.toFixed(2)}</span>
            </p>
            <p className="text-sm">
              <span className="text-gray-600 dark:text-gray-400">High:</span> 
              <span className="ml-2 font-medium text-gray-900 dark:text-white">${data.high.toFixed(2)}</span>
            </p>
            <p className="text-sm">
              <span className="text-gray-600 dark:text-gray-400">Low:</span> 
              <span className="ml-2 font-medium text-gray-900 dark:text-white">${data.low.toFixed(2)}</span>
            </p>
            <p className="text-sm">
              <span className="text-gray-600 dark:text-gray-400">Close:</span> 
              <span className="ml-2 font-medium text-gray-900 dark:text-white">${data.close.toFixed(2)}</span>
            </p>
            <p className="text-sm">
              <span className="text-gray-600 dark:text-gray-400">Volume:</span> 
              <span className="ml-2 font-medium text-gray-900 dark:text-white">{data.volume.toLocaleString()}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!ticker) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Price Chart</h2>
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <p className="text-sm">Select a stock to view its price chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Price Chart - {ticker}
        </h2>
        
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handlePeriodChange(option.value)}
                className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors ${
                  selectedPeriod === option.value
                    ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
            <button
              onClick={() => setChartType('line')}
              className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors ${
                chartType === 'line'
                  ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType('candlestick')}
              className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors ${
                chartType === 'candlestick'
                  ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Candle
            </button>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Spinner size="md" />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading chart data...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-2 text-sm">Failed to load chart data</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{error}</p>
            <button
              onClick={() => ticker && fetchHistoricalData(ticker, selectedPeriod)}
              className="mt-2 px-2 py-1 bg-indigo-600 text-white rounded-md text-xs hover:bg-indigo-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {historicalData && historicalData.data.length > 0 && !isLoading && (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart
                data={historicalData.data}
                margin={{ top: 5, right: 20, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date"
                  tickFormatter={formatXAxisTick}
                  stroke="#6b7280"
                  fontSize={10}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  domain={['dataMin - 5', 'dataMax + 5']}
                  stroke="#6b7280"
                  fontSize={10}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {currentPrice && (
                  <ReferenceLine 
                    y={currentPrice} 
                    stroke="#10b981" 
                    strokeDasharray="3 3"
                    label={{ value: "Current", position: "right", fontSize: 10, fill: '#10b981' }}
                  />
                )}
                
                <Line
                  type="monotone"
                  dataKey="close"
                  stroke="#4f46e5"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 4, stroke: '#4f46e5', fill: '#ffffff' }}
                />
              </LineChart>
            ) : (
              <ComposedChart
                data={historicalData.data}
                margin={{ top: 5, right: 20, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date"
                  tickFormatter={formatXAxisTick}
                  stroke="#6b7280"
                  fontSize={10}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  yAxisId="left"
                  domain={['dataMin - 5', 'dataMax + 5']}
                  stroke="#6b7280"
                  fontSize={10}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 'dataMax * 4']}
                  stroke="#6b7280"
                  fontSize={10}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {currentPrice && (
                  <ReferenceLine 
                    y={currentPrice} 
                    stroke="#10b981" 
                    strokeDasharray="3 3"
                    label={{ value: "Current", position: "right", fontSize: 10, fill: '#10b981' }}
                    yAxisId="left"
                  />
                )}
                
                <Bar yAxisId="right" dataKey="volume" barSize={20} fill="#e0e7ff" />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="close"
                  stroke="transparent"
                  strokeWidth={0}
                  dot={false}
                  activeDot={false}
                />
                {historicalData.data.map((entry, index) => (
                  <ReferenceLine
                    key={index}
                    yAxisId="left"
                    x={entry.date}
                    segment={[{ x: entry.date, y: entry.low }, { x: entry.date, y: entry.high }]}
                    stroke={entry.open > entry.close ? '#ef4444' : '#22c55e'}
                    strokeWidth={1}
                  />
                ))}
                {historicalData.data.map((entry, index) => (
                  <ReferenceLine
                    key={index}
                    yAxisId="left"
                    x={entry.date}
                    segment={[{ x: entry.date, y: entry.open }, { x: entry.date, y: entry.close }]}
                    stroke={entry.open > entry.close ? '#ef4444' : '#22c55e'}
                    strokeWidth={4}
                  />
                ))}
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      {historicalData && historicalData.data.length === 0 && !isLoading && (
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <p className="text-sm">No historical data available for {ticker}</p>
        </div>
      )}
    </div>
  );
}
