import { NextResponse } from 'next/server';

// Define a type for the transformed quote data for better type safety
interface TransformedQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

interface YahooFinanceResponse {
  chart: {
    result: Array<{
      meta: {
        symbol: string;
        regularMarketPrice: number;
        regularMarketChange: number;
        regularMarketChangePercent: number;
        currency: string;
        marketState: string;
      };
    }>;
    error?: any;
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    // Step 1: Extract the ticker from the dynamic route parameter
    const resolvedParams = await params;
    const ticker = resolvedParams.ticker.toUpperCase();

    // Step 2: Construct the Yahoo Finance API URL
    const yahooFinanceURL = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`;

    const apiResponse = await fetch(yahooFinanceURL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      // Use Next.js's revalidation feature to cache the response for a short period
      next: { revalidate: 30 } // Revalidate every 30 seconds for near real-time data
    });

    if (!apiResponse.ok) {
      // If the API itself returns an error (e.g., 4xx or 5xx)
      return NextResponse.json(
        { error: `Yahoo Finance API Error: ${apiResponse.statusText}` },
        { status: apiResponse.status }
      );
    }

    const data: YahooFinanceResponse = await apiResponse.json();
    
    // Debug: Log the actual response from Yahoo Finance
    console.log(`Yahoo Finance response for ${ticker}:`, JSON.stringify(data, null, 2));

    // Step 4: Validate and transform the response before sending it to the client
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      console.log(`No chart data found for ${ticker}. Full response:`, data);
      return NextResponse.json(
        { error: `No data found for ticker: ${ticker}. It may be an invalid symbol.` },
        { status: 404 }
      );
    }

    const result = data.chart.result[0];
    const meta = result.meta;

    // Check if the market is open and we have valid data
    if (!meta.regularMarketPrice) {
      return NextResponse.json(
        { error: `Price data not available for ticker: ${ticker}. Market may be closed.` },
        { status: 404 }
      );
    }

    const transformedData: TransformedQuote = {
      symbol: meta.symbol,
      price: meta.regularMarketPrice,
      change: meta.regularMarketChange || 0,
      changePercent: meta.regularMarketChangePercent || 0,
    };

    // Step 5: Forward the clean, transformed data to the client
    return NextResponse.json(transformedData);

  } catch (error) {
    // Handle network errors or other unexpected issues
    console.error('Yahoo Finance API error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
