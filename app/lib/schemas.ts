import { z } from 'zod';

export const HoldingInputSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  name: z.string().min(1, 'Name is required'),
  sector: z.string().min(1, 'Sector is required'),
  purchasePrice: z.number().positive('Purchase price must be positive'),
  qty: z.number().positive('Quantity must be positive'),
  exchange: z.enum(['NSE', 'BSE'], {
    errorMap: () => ({ message: 'Exchange must be NSE or BSE' }),
  }),
});

export const QuoteResponseSchema = z.object({
  symbol: z.string(),
  cmp: z.number().positive().optional(),
  exchange: z.string().optional(),
  fromCache: z.boolean(),
  asOf: z.string().datetime(),
  error: z.string().optional(),
});

export const MetricsResponseSchema = z.object({
  symbol: z.string(),
  peRatio: z.number().positive().optional(),
  latestEarnings: z.string().optional(),
  fromCache: z.boolean(),
  asOf: z.string().datetime(),
  error: z.string().optional(),
});

export const HoldingEnrichedSchema = HoldingInputSchema.extend({
  investment: z.number().positive(),
  cmp: z.number().positive().optional(),
  presentValue: z.number().positive().optional(),
  gainLoss: z.number().optional(),
  peRatio: z.number().positive().optional(),
  latestEarnings: z.string().optional(),
  stale: z.boolean().optional(),
  portfolioPercent: z.number().optional(),
});

export const PortfolioResponseSchema = z.object({
  holdings: z.array(HoldingEnrichedSchema),
  totals: z.object({
    totalInvestment: z.number(),
    totalPresentValue: z.number().optional(),
    totalGainLoss: z.number().optional(),
    totalGainLossPercent: z.number().optional(),
  }),
  sectors: z.record(z.object({
    holdings: z.array(HoldingEnrichedSchema),
    investment: z.number(),
    presentValue: z.number().optional(),
    gainLoss: z.number().optional(),
    gainLossPercent: z.number().optional(),
  })),
  lastUpdated: z.string().datetime(),
});

export type HoldingInput = z.infer<typeof HoldingInputSchema>;
export type HoldingEnriched = z.infer<typeof HoldingEnrichedSchema>;
export type QuoteResponse = z.infer<typeof QuoteResponseSchema>;
export type MetricsResponse = z.infer<typeof MetricsResponseSchema>;
export type PortfolioResponse = z.infer<typeof PortfolioResponseSchema>;
