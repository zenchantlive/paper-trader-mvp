import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const resolvedParams = await params;
    const ticker = resolvedParams.ticker.toUpperCase();
    
    console.log(`Simple API: Received request for ticker: ${ticker}`);
    
    // Return mock data for now to test if the route works
    return NextResponse.json({
      symbol: ticker,
      price: 150.00 + Math.random() * 50, // Mock price
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Simple API error:', error);
    return NextResponse.json(
      { error: 'Simple API failed' },
      { status: 500 }
    );
  }
}