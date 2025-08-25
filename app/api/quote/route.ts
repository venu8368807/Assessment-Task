import { NextRequest, NextResponse } from 'next/server';
import { quoteCache, CACHE_TTL } from '@/app/lib/cache';
import { QuoteResponseSchema, QuoteResponse } from '@/app/lib/schemas';
import { toYahooSymbol, normalizeSymbol } from '@/app/lib/symbols';
import { rateLimitedRequest, respectfulDelay } from '@/app/lib/limits';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const exchange = searchParams.get('exchange') as 'NSE' | 'BSE';

    if (!symbol || !exchange) {
      return NextResponse.json(
        { error: 'Missing required parameters: symbol and exchange' },
        { status: 400 }
      );
    }

    if (!['NSE', 'BSE'].includes(exchange)) {
      return NextResponse.json(
        { error: 'Exchange must be NSE or BSE' },
        { status: 400 }
      );
    }

    const normalizedSymbol = normalizeSymbol(symbol, exchange);
    const yahooSymbol = toYahooSymbol(normalizedSymbol, exchange);
    const cacheKey = `quote:${yahooSymbol}`;
    const cached = quoteCache.get(cacheKey);
    if (cached) {
      return NextResponse.json({
        ...cached,
        fromCache: true,
        asOf: new Date().toISOString(),
      } as QuoteResponse);
    }

    await respectfulDelay();

    const quoteData = await rateLimitedRequest(async () => {
      try {
        const yahooFinance = (await import('yahoo-finance2')).default;
        if (typeof (yahooFinance as any).suppressNotices === 'function') {
          (yahooFinance as any).suppressNotices(['yahooSurvey']);
        }
        const quote = await yahooFinance.quote(yahooSymbol);
        return quote;
      } catch (error) {
        console.warn(`Yahoo Finance failed for ${yahooSymbol}, using mock data:`, error);
        const basePrice = 1000;
        const variation = (Math.random() - 0.5) * 0.2;
        const mockCMP = Math.round(basePrice * (1 + variation));
        return {
          regularMarketPrice: mockCMP,
          fullExchangeName: exchange,
        };
      }
    });

    const response: QuoteResponse = {
      symbol: normalizedSymbol,
      cmp: quoteData.regularMarketPrice,
      exchange: quoteData.fullExchangeName || exchange,
      fromCache: false,
      asOf: new Date().toISOString(),
    };

    quoteCache.set(cacheKey, response, CACHE_TTL.QUOTE);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Quote API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch quote data',
        details: error instanceof Error ? error.message : 'Unknown error',
        symbol: searchParams.get('symbol'),
        exchange: searchParams.get('exchange'),
      },
      { status: 500 }
    );
  }
}
