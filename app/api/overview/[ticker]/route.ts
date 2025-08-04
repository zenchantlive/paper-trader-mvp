import { NextResponse } from 'next/server';
import { ApiError, CompanyOfficer } from '@/lib/types';

// Define interface for company overview data
interface CompanyOverview {
  symbol: string;
  name: string;
  description: string;
  exchange: string;
  currency: string;
  country: string;
  sector: string;
  industry: string;
  marketCapitalization: string;
  peRatio: string;
  pegRatio: string;
  bookValue: string;
  dividendPerShare: string;
  dividendYield: string;
  eps: string;
  revenuePerShareTTM: string;
  profitMargin: string;
  operatingMarginTTM: string;
  returnOnAssetsTTM: string;
  returnOnEquityTTM: string;
  revenueTTM: string;
  grossProfitTTM: string;
  dilutedEPSTTM: string;
  quarterlyEarningsGrowthYOY: string;
  quarterlyRevenueGrowthYOY: string;
  analystTargetPrice: string;
  trailingPE: string;
  forwardPE: string;
  priceToSalesRatioTTM: string;
  priceToBookRatio: string;
  evToRevenue: string;
  evToEBITDA: string;
  beta: string;
  weekHigh52: string;
  weekLow52: string;
  movingAverage50Day: string;
  movingAverage200Day: string;
  sharesOutstanding: string;
  dividendDate: string;
  exDividendDate: string;
}

interface YahooFinanceQuoteSummary {
  quoteSummary: {
    result: Array<{
      assetProfile: {
        address: string;
        city: string;
        state: string;
        zip: string;
        country: string;
        phone: string;
        website: string;
        industry: string;
        sector: string;
        longBusinessSummary: string;
        fullTimeEmployees: number;
        companyOfficers: CompanyOfficer[];
      };
      summaryDetail: {
        previousClose: number;
        regularMarketOpen: number;
        twoHundredDayAverage: number;
        fiftyDayAverage: number;
        fiftyTwoWeekHigh: number;
        fiftyTwoWeekLow: number;
        marketCap: number;
        sharesOutstanding: number;
        dividendRate: number;
        dividendYield: number;
        exDividendDate: number;
        payoutRatio: number;
        beta: number;
        trailingPE: number;
        forwardPE: number;
        volume: number;
        averageVolume: number;
        averageVolume10days: number;
        bid: number;
        ask: number;
        bidSize: number;
        askSize: number;
        dayRange: string;
        fiftyTwoWeekRange: string;
        dividendDate: number;
      };
      defaultKeyStatistics: {
        priceToBook: number;
        enterpriseToRevenue: number;
        enterpriseToEbitda: number;
        forwardEps: number;
        pegRatio: number;
        earningsQuarterlyGrowth: number;
        revenueQuarterlyGrowth: number;
        bookValue: number;
        profitMargins: number;
        operatingMargins: number;
        returnOnAssets: number;
        returnOnEquity: number;
        revenuePerShare: number;
      };
      financialData: {
        currentRatio: number;
        debtToEquity: number;
        returnOnEquity: number;
        operatingCashflow: number;
        leveredFreeCashflow: number;
        grossMargins: number;
        ebitdaMargins: number;
        operatingMargins: number;
        profitMargins: number;
        financialCurrency: string;
      };
    }>;
    error?: ApiError;
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const resolvedParams = await params;
  const ticker = resolvedParams.ticker.toUpperCase();

  try {
    // Try to get comprehensive company data from quoteSummary endpoint
    const overviewData = await getCompanyOverviewFromQuoteSummary(ticker);
    if (overviewData) {
      return NextResponse.json(overviewData);
    }

    // Fallback: Get basic data from quote endpoint
    const fallbackData = await getFallbackCompanyData(ticker);
    return NextResponse.json(fallbackData);

  } catch (error) {
    console.error('Company overview API error:', error);
    
    // Final fallback: Return minimal data
    const minimalData: CompanyOverview = {
      symbol: ticker,
      name: ticker,
      description: 'Company data temporarily unavailable',
      exchange: 'N/A',
      currency: 'USD',
      country: 'N/A',
      sector: 'N/A',
      industry: 'N/A',
      marketCapitalization: 'N/A',
      peRatio: 'N/A',
      pegRatio: 'N/A',
      bookValue: 'N/A',
      dividendPerShare: 'N/A',
      dividendYield: 'N/A',
      eps: 'N/A',
      revenuePerShareTTM: 'N/A',
      profitMargin: 'N/A',
      operatingMarginTTM: 'N/A',
      returnOnAssetsTTM: 'N/A',
      returnOnEquityTTM: 'N/A',
      revenueTTM: 'N/A',
      grossProfitTTM: 'N/A',
      dilutedEPSTTM: 'N/A',
      quarterlyEarningsGrowthYOY: 'N/A',
      quarterlyRevenueGrowthYOY: 'N/A',
      analystTargetPrice: 'N/A',
      trailingPE: 'N/A',
      forwardPE: 'N/A',
      priceToSalesRatioTTM: 'N/A',
      priceToBookRatio: 'N/A',
      evToRevenue: 'N/A',
      evToEBITDA: 'N/A',
      beta: 'N/A',
      weekHigh52: 'N/A',
      weekLow52: 'N/A',
      movingAverage50Day: 'N/A',
      movingAverage200Day: 'N/A',
      sharesOutstanding: 'N/A',
      dividendDate: 'N/A',
      exDividendDate: 'N/A'
    };

    return NextResponse.json(minimalData);
  }
}

async function getCompanyOverviewFromQuoteSummary(ticker: string): Promise<CompanyOverview | null> {
  try {
    const modules = 'assetProfile,summaryDetail,defaultKeyStatistics,financialData';
    const yahooFinanceURL = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=${modules}`;

    const apiResponse = await fetch(yahooFinanceURL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        'Cache-Control': 'max-age=0',
        'Referer': `https://finance.yahoo.com/quote/${ticker}`
      }
    });

    if (!apiResponse.ok) {
      console.warn(`QuoteSummary endpoint failed for ${ticker}: ${apiResponse.status}`);
      return null;
    }

    const data: YahooFinanceQuoteSummary = await apiResponse.json();

    if (!data.quoteSummary || !data.quoteSummary.result || data.quoteSummary.result.length === 0) {
      console.warn(`No quoteSummary data found for ${ticker}`);
      return null;
    }

    const result = data.quoteSummary.result[0];
    const assetProfile = result.assetProfile || {};
    const summaryDetail = result.summaryDetail || {};
    const defaultKeyStats = result.defaultKeyStatistics || {};
    const financialData = result.financialData || {};

    return {
      symbol: ticker,
      name: assetProfile.longBusinessSummary ? extractCompanyName(assetProfile.longBusinessSummary) : ticker,
      description: assetProfile.longBusinessSummary || 'No description available',
      exchange: 'N/A',
      currency: financialData.financialCurrency || 'USD',
      country: assetProfile.country || 'N/A',
      sector: assetProfile.sector || 'N/A',
      industry: assetProfile.industry || 'N/A',
      marketCapitalization: summaryDetail.marketCap ? formatNumber(summaryDetail.marketCap) : 'N/A',
      peRatio: summaryDetail.trailingPE ? summaryDetail.trailingPE.toString() : 'N/A',
      pegRatio: defaultKeyStats.pegRatio ? defaultKeyStats.pegRatio.toString() : 'N/A',
      bookValue: defaultKeyStats.bookValue ? defaultKeyStats.bookValue.toString() : 'N/A',
      dividendPerShare: summaryDetail.dividendRate ? summaryDetail.dividendRate.toString() : 'N/A',
      dividendYield: summaryDetail.dividendYield ? (summaryDetail.dividendYield * 100).toFixed(2) + '%' : 'N/A',
      eps: defaultKeyStats.forwardEps ? defaultKeyStats.forwardEps.toString() : 'N/A',
      revenuePerShareTTM: defaultKeyStats.revenuePerShare ? defaultKeyStats.revenuePerShare.toString() : 'N/A',
      profitMargin: financialData.profitMargins ? (financialData.profitMargins * 100).toFixed(2) + '%' : 'N/A',
      operatingMarginTTM: financialData.operatingMargins ? (financialData.operatingMargins * 100).toFixed(2) + '%' : 'N/A',
      returnOnAssetsTTM: defaultKeyStats.returnOnAssets ? (defaultKeyStats.returnOnAssets * 100).toFixed(2) + '%' : 'N/A',
      returnOnEquityTTM: defaultKeyStats.returnOnEquity ? (defaultKeyStats.returnOnEquity * 100).toFixed(2) + '%' : 'N/A',
      revenueTTM: 'N/A',
      grossProfitTTM: 'N/A',
      dilutedEPSTTM: 'N/A',
      quarterlyEarningsGrowthYOY: defaultKeyStats.earningsQuarterlyGrowth ? (defaultKeyStats.earningsQuarterlyGrowth * 100).toFixed(2) + '%' : 'N/A',
      quarterlyRevenueGrowthYOY: defaultKeyStats.revenueQuarterlyGrowth ? (defaultKeyStats.revenueQuarterlyGrowth * 100).toFixed(2) + '%' : 'N/A',
      analystTargetPrice: 'N/A',
      trailingPE: summaryDetail.trailingPE ? summaryDetail.trailingPE.toString() : 'N/A',
      forwardPE: summaryDetail.forwardPE ? summaryDetail.forwardPE.toString() : 'N/A',
      priceToSalesRatioTTM: 'N/A',
      priceToBookRatio: defaultKeyStats.priceToBook ? defaultKeyStats.priceToBook.toString() : 'N/A',
      evToRevenue: defaultKeyStats.enterpriseToRevenue ? defaultKeyStats.enterpriseToRevenue.toString() : 'N/A',
      evToEBITDA: defaultKeyStats.enterpriseToEbitda ? defaultKeyStats.enterpriseToEbitda.toString() : 'N/A',
      beta: summaryDetail.beta ? summaryDetail.beta.toString() : 'N/A',
      weekHigh52: summaryDetail.fiftyTwoWeekHigh ? summaryDetail.fiftyTwoWeekHigh.toString() : 'N/A',
      weekLow52: summaryDetail.fiftyTwoWeekLow ? summaryDetail.fiftyTwoWeekLow.toString() : 'N/A',
      movingAverage50Day: summaryDetail.fiftyDayAverage ? summaryDetail.fiftyDayAverage.toString() : 'N/A',
      movingAverage200Day: summaryDetail.twoHundredDayAverage ? summaryDetail.twoHundredDayAverage.toString() : 'N/A',
      sharesOutstanding: summaryDetail.sharesOutstanding ? formatNumber(summaryDetail.sharesOutstanding) : 'N/A',
      dividendDate: summaryDetail.dividendDate ? new Date(summaryDetail.dividendDate * 1000).toISOString().split('T')[0] : 'N/A',
      exDividendDate: summaryDetail.exDividendDate ? new Date(summaryDetail.exDividendDate * 1000).toISOString().split('T')[0] : 'N/A'
    };

  } catch (error) {
    console.warn(`Error fetching quoteSummary for ${ticker}:`, error);
    return null;
  }
}

async function getFallbackCompanyData(ticker: string): Promise<CompanyOverview> {
  try {
    // Try to get basic data from the quote endpoint
    const quoteURL = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;
    
    const quoteResponse = await fetch(quoteURL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Referer': `https://finance.yahoo.com/quote/${ticker}`
      }
    });

    if (quoteResponse.ok) {
      const quoteData = await quoteResponse.json();
      const meta = quoteData.chart?.result?.[0]?.meta;
      
      if (meta) {
        return {
          symbol: ticker,
          name: meta.longName || meta.shortName || ticker,
          description: `${meta.longName || meta.shortName || ticker} is a publicly traded company.`,
          exchange: meta.exchangeName || 'N/A',
          currency: meta.currency || 'USD',
          country: 'N/A',
          sector: 'N/A',
          industry: 'N/A',
          marketCapitalization: meta.marketCap ? formatNumber(meta.marketCap) : 'N/A',
          peRatio: 'N/A',
          pegRatio: 'N/A',
          bookValue: 'N/A',
          dividendPerShare: 'N/A',
          dividendYield: 'N/A',
          eps: 'N/A',
          revenuePerShareTTM: 'N/A',
          profitMargin: 'N/A',
          operatingMarginTTM: 'N/A',
          returnOnAssetsTTM: 'N/A',
          returnOnEquityTTM: 'N/A',
          revenueTTM: 'N/A',
          grossProfitTTM: 'N/A',
          dilutedEPSTTM: 'N/A',
          quarterlyEarningsGrowthYOY: 'N/A',
          quarterlyRevenueGrowthYOY: 'N/A',
          analystTargetPrice: 'N/A',
          trailingPE: 'N/A',
          forwardPE: 'N/A',
          priceToSalesRatioTTM: 'N/A',
          priceToBookRatio: 'N/A',
          evToRevenue: 'N/A',
          evToEBITDA: 'N/A',
          beta: 'N/A',
          weekHigh52: meta.fiftyTwoWeekHigh ? meta.fiftyTwoWeekHigh.toString() : 'N/A',
          weekLow52: meta.fiftyTwoWeekLow ? meta.fiftyTwoWeekLow.toString() : 'N/A',
          movingAverage50Day: 'N/A',
          movingAverage200Day: 'N/A',
          sharesOutstanding: meta.sharesOutstanding ? formatNumber(meta.sharesOutstanding) : 'N/A',
          dividendDate: 'N/A',
          exDividendDate: 'N/A'
        };
      }
    }
  } catch (error) {
    console.warn(`Fallback quote endpoint failed for ${ticker}:`, error);
  }

  // Ultimate fallback
  return {
    symbol: ticker,
    name: ticker,
    description: 'Company data unavailable',
    exchange: 'N/A',
    currency: 'USD',
    country: 'N/A',
    sector: 'N/A',
    industry: 'N/A',
    marketCapitalization: 'N/A',
    peRatio: 'N/A',
    pegRatio: 'N/A',
    bookValue: 'N/A',
    dividendPerShare: 'N/A',
    dividendYield: 'N/A',
    eps: 'N/A',
    revenuePerShareTTM: 'N/A',
    profitMargin: 'N/A',
    operatingMarginTTM: 'N/A',
    returnOnAssetsTTM: 'N/A',
    returnOnEquityTTM: 'N/A',
    revenueTTM: 'N/A',
    grossProfitTTM: 'N/A',
    dilutedEPSTTM: 'N/A',
    quarterlyEarningsGrowthYOY: 'N/A',
    quarterlyRevenueGrowthYOY: 'N/A',
    analystTargetPrice: 'N/A',
    trailingPE: 'N/A',
    forwardPE: 'N/A',
    priceToSalesRatioTTM: 'N/A',
    priceToBookRatio: 'N/A',
    evToRevenue: 'N/A',
    evToEBITDA: 'N/A',
    beta: 'N/A',
    weekHigh52: 'N/A',
    weekLow52: 'N/A',
    movingAverage50Day: 'N/A',
    movingAverage200Day: 'N/A',
    sharesOutstanding: 'N/A',
    dividendDate: 'N/A',
    exDividendDate: 'N/A'
  };
}

// Helper function to extract company name from description
function extractCompanyName(description: string): string {
  // Simple extraction - in a real app, you might want more sophisticated parsing
  const sentences = description.split('.');
  if (sentences.length > 0) {
    const firstSentence = sentences[0];
    // Look for company name patterns (e.g., "Apple Inc. is..." or "Microsoft Corporation...")
    const match = firstSentence.match(/^([A-Z][a-zA-Z\s&]+Inc|Corp|Ltd|LLC|Company|Corporation)/);
    if (match) {
      return match[1].trim();
    }
  }
  return 'Unknown Company';
}

// Helper function to format large numbers
function formatNumber(num: number): string {
  if (num >= 1e12) {
    return (num / 1e12).toFixed(2) + 'T';
  } else if (num >= 1e9) {
    return (num / 1e9).toFixed(2) + 'B';
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(2) + 'M';
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(2) + 'K';
  }
  return num.toString();
}
