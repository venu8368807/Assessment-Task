import { NextRequest, NextResponse } from 'next/server';
import { metricsCache, CACHE_TTL } from '@/app/lib/cache';
import { MetricsResponseSchema, MetricsResponse } from '@/app/lib/schemas';
import { normalizeSymbol } from '@/app/lib/symbols';
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
    const cacheKey = `metrics:${normalizedSymbol}:${exchange}`;
    const cached = metricsCache.get(cacheKey);
    if (cached) {
      return NextResponse.json({
        ...cached,
        fromCache: true,
        asOf: new Date().toISOString(),
      } as MetricsResponse);
    }

    await respectfulDelay();

    const mockMetricsData = await rateLimitedRequest(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      const peRatio = Math.round((Math.random() * 40 + 10) * 10) / 10;
      const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
      const years = ['2024', '2025'];
      const quarter = quarters[Math.floor(Math.random() * quarters.length)];
      const year = years[Math.floor(Math.random() * years.length)];
      const latestEarnings = `${quarter} FY${year}`;
      return { peRatio, latestEarnings };
    });

    const response: MetricsResponse = {
      symbol: normalizedSymbol,
      peRatio: mockMetricsData.peRatio,
      latestEarnings: mockMetricsData.latestEarnings,
      fromCache: false,
      asOf: new Date().toISOString(),
    };

    metricsCache.set(cacheKey, response, CACHE_TTL.METRICS);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Metrics API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch metrics data',
        details: error instanceof Error ? error.message : 'Unknown error',
        symbol: searchParams.get('symbol'),
        exchange: searchParams.get('exchange'),
      },
      { status: 500 }
    );
  }
}
