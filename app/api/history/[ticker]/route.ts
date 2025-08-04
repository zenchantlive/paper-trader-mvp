import { NextResponse } from 'next/server';

// Define interfaces for historical data
interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface HistoricalData {
  symbol: string;
  data: HistoricalDataPoint[];
  period: string;
}

interface YahooFinanceResponse {
  chart: {
    result: Array<{
      meta: {
        symbol: string;
        currency: string;
      };
      timestamp: number[];
      indicators: {
        quote: Array<{
          open: number[];
          high: number[];
          low: number[];
          close: number[];
          volume: number[];
        }>;
      };
    }>;
    error?: any;
  };
}

function getPeriodRange(period: string): { period1: Date; period2: Date; interval: string } {
  const now = new Date();
  const period2 = now;
  let period1: Date;
  let interval: string;

  switch (period) {
    case '1D':
      period1 = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000); // 1 day ago
      interval = '1m';
      break;
    case '1W':
      period1 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 1 week ago
      interval = '1d';
      break;
    case '1M':
      period1 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 1 month ago
      interval = '1d';
      break;
    case '3M':
      period1 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); // 3 months ago
      interval = '1d';
      break;
    case '1Y':
      period1 = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); // 1 year ago
      interval = '1d';
      break;
    default:
      period1 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Default to 1 month
      interval = '1d';
  }

  return { period1, period2, interval };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const resolvedParams = await params;
  const ticker = resolvedParams.ticker.toUpperCase();
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '1M'; // Default to 1 month

  try {
    // Get date range and interval based on period
    const { period1, period2, interval } = getPeriodRange(period);

    // Construct the Yahoo Finance API URL with range parameters
    const yahooFinanceURL = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${Math.floor(period1.getTime() / 1000)}&period2=${Math.floor(period2.getTime() / 1000)}&interval=${interval}`;

    const apiResponse = await fetch(yahooFinanceURL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    });

    if (!apiResponse.ok) {
      return NextResponse.json(
        { error: `Yahoo Finance API Error: ${apiResponse.statusText}` },
        { status: apiResponse.status }
      );
    }

    const data: YahooFinanceResponse = await apiResponse.json();

    // Check for API errors
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      return NextResponse.json(
        { error: `No historical data found for ticker: ${ticker}` },
        { status: 404 }
      );
    }

    const result = data.chart.result[0];
    const timestamps = result.timestamp;
    const quotes = result.indicators.quote[0];

    if (!timestamps || !quotes || timestamps.length === 0) {
      return NextResponse.json(
        { error: `No historical data available for ticker: ${ticker}` },
        { status: 404 }
      );
    }

    // Transform the data into our format
    const transformedData: HistoricalDataPoint[] = timestamps.map((timestamp, index) => ({
      date: new Date(timestamp * 1000).toISOString().split('T')[0], // Format as YYYY-MM-DD
      open: quotes.open[index] || 0,
      high: quotes.high[index] || 0,
      low: quotes.low[index] || 0,
      close: quotes.close[index] || 0,
      volume: quotes.volume[index] || 0
    })).filter(point => point.open > 0 && point.high > 0 && point.low > 0 && point.close > 0); // Filter out invalid data points

    // Sort chronologically (Yahoo Finance data should already be sorted, but just to be sure)
    const sortedData = transformedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const response: HistoricalData = {
      symbol: ticker,
      data: sortedData,
      period
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Historical data API error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred while fetching historical data.' },
      { status: 500 }
    );
  }
}
