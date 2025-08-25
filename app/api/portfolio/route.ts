import { NextRequest, NextResponse } from 'next/server';
import { HoldingInputSchema, PortfolioResponseSchema, PortfolioResponse, HoldingEnriched } from '@/app/lib/schemas';
import { enrichHoldings, groupBySector, computeSectorTotals, computePortfolioTotals } from '@/app/lib/calc';
import { rateLimitedRequest } from '@/app/lib/limits';

export async function POST(request: NextRequest) {
  try {
    let holdings: any[] = [];

    try {
      const body = await request.json();
      if (Array.isArray(body)) {
        holdings = body;
      }
    } catch {
      const seedData = await import('@/data/holdings.json');
      holdings = seedData.default;
    }

    const validatedHoldings = holdings.map((holding, index) => {
      try {
        return HoldingInputSchema.parse(holding);
      } catch (error) {
        throw new Error(`Invalid holding at index ${index}: ${error}`);
      }
    });

    const enrichedHoldings = enrichHoldings(validatedHoldings);

    const enrichedWithLiveData = await Promise.all(
      enrichedHoldings.map(async (holding) => {
        try {
          const [quoteResponse, metricsResponse] = await Promise.allSettled([
            rateLimitedRequest(async () => {
              const response = await fetch(
                `${request.nextUrl.origin}/api/quote?symbol=${holding.symbol}&exchange=${holding.exchange}`
              );
              if (!response.ok) throw new Error(`Quote API failed: ${response.statusText}`);
              return response.json();
            }),
            rateLimitedRequest(async () => {
              const response = await fetch(
                `${request.nextUrl.origin}/api/metrics?symbol=${holding.symbol}&exchange=${holding.exchange}`
              );
              if (!response.ok) throw new Error(`Metrics API failed: ${response.statusText}`);
              return response.json();
            }),
          ]);

          let cmp: number | undefined;
          let stale = false;
          if (quoteResponse.status === 'fulfilled') {
            cmp = quoteResponse.value.cmp;
            stale = quoteResponse.value.fromCache || false;
          }

          let peRatio: number | undefined;
          let latestEarnings: string | undefined;
          if (metricsResponse.status === 'fulfilled') {
            peRatio = metricsResponse.value.peRatio;
            latestEarnings = metricsResponse.value.latestEarnings;
          }

          const presentValue = cmp ? cmp * holding.qty : undefined;
          const gainLoss = presentValue ? presentValue - holding.investment : undefined;

          return {
            ...holding,
            cmp,
            presentValue,
            gainLoss,
            peRatio,
            latestEarnings,
            stale,
          } as HoldingEnriched;
        } catch (error) {
          console.error(`Error fetching data for ${holding.symbol}:`, error);
          return {
            ...holding,
            cmp: undefined,
            presentValue: undefined,
            gainLoss: undefined,
            peRatio: undefined,
            latestEarnings: undefined,
            stale: false,
          } as HoldingEnriched;
        }
      })
    );

    const sectorGroups = groupBySector(enrichedWithLiveData);

    const sectors: Record<string, any> = {};
    for (const [sectorName, sectorHoldings] of Object.entries(sectorGroups)) {
      const totals = computeSectorTotals(sectorHoldings);
      sectors[sectorName] = {
        holdings: sectorHoldings,
        ...totals,
      };
    }

    const totals = computePortfolioTotals(enrichedWithLiveData);

    const holdingsWithPercentages = enrichedWithLiveData.map(holding => ({
      ...holding,
      portfolioPercent: totals.totalInvestment > 0 
        ? (holding.investment / totals.totalInvestment) * 100 
        : undefined,
    }));

    const response: PortfolioResponse = {
      holdings: holdingsWithPercentages,
      totals,
      sectors,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Portfolio API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process portfolio data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const seedData = await import('@/data/holdings.json');
    const holdings = seedData.default;

    const validatedHoldings = holdings.map((holding, index) => {
      try {
        return HoldingInputSchema.parse(holding);
      } catch (error) {
        throw new Error(`Invalid holding at index ${index}: ${error}`);
      }
    });

    const enrichedHoldings = enrichHoldings(validatedHoldings);

    const sectorGroups = groupBySector(enrichedHoldings);

    const sectors: Record<string, any> = {};
    for (const [sectorName, sectorHoldings] of Object.entries(sectorGroups)) {
      const totals = computeSectorTotals(sectorHoldings);
      sectors[sectorName] = {
        holdings: sectorHoldings,
        ...totals,
      };
    }

    const totals = computePortfolioTotals(enrichedHoldings);

    const response: PortfolioResponse = {
      holdings: enrichedHoldings,
      totals,
      sectors,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Portfolio GET API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process portfolio data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
