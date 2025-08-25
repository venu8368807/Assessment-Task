import { HoldingInput, HoldingEnriched } from './schemas';

export function computeInvestment(holding: HoldingInput): number {
  return holding.purchasePrice * holding.qty;
}

export function computePresentValue(holding: HoldingEnriched): number | undefined {
  if (!holding.cmp) return undefined;
  return holding.cmp * holding.qty;
}

export function computeGainLoss(holding: HoldingEnriched): number | undefined {
  const presentValue = computePresentValue(holding);
  if (presentValue === undefined) return undefined;
  return presentValue - holding.investment;
}

export function computeGainLossPercent(holding: HoldingEnriched): number | undefined {
  const gainLoss = computeGainLoss(holding);
  if (gainLoss === undefined || holding.investment === 0) return undefined;
  return (gainLoss / holding.investment) * 100;
}

export function computePortfolioPercent(
  holding: HoldingEnriched,
  totalInvestment: number
): number | undefined {
  if (totalInvestment === 0) return undefined;
  return (holding.investment / totalInvestment) * 100;
}

export function groupBySector(holdings: HoldingEnriched[]): Record<string, HoldingEnriched[]> {
  return holdings.reduce((groups, holding) => {
    const sector = holding.sector;
    if (!groups[sector]) {
      groups[sector] = [];
    }
    groups[sector].push(holding);
    return groups;
  }, {} as Record<string, HoldingEnriched[]>);
}

export function computeSectorTotals(sectorHoldings: HoldingEnriched[]): {
  investment: number;
  presentValue: number | undefined;
  gainLoss: number | undefined;
  gainLossPercent: number | undefined;
} {
  const investment = sectorHoldings.reduce((sum, holding) => sum + holding.investment, 0);
  const presentValues = sectorHoldings
    .map(holding => computePresentValue(holding))
    .filter((value): value is number => value !== undefined);
  const presentValue = presentValues.length > 0 
    ? presentValues.reduce((sum, value) => sum + value, 0)
    : undefined;
  const gainLoss = presentValue !== undefined ? presentValue - investment : undefined;
  const gainLossPercent = gainLoss !== undefined && investment > 0 
    ? (gainLoss / investment) * 100 
    : undefined;
  return {
    investment,
    presentValue,
    gainLoss,
    gainLossPercent,
  };
}

export function computePortfolioTotals(holdings: HoldingEnriched[]): {
  totalInvestment: number;
  totalPresentValue: number | undefined;
  totalGainLoss: number | undefined;
  totalGainLossPercent: number | undefined;
} {
  const totalInvestment = holdings.reduce((sum, holding) => sum + holding.investment, 0);
  const presentValues = holdings
    .map(holding => computePresentValue(holding))
    .filter((value): value is number => value !== undefined);
  const totalPresentValue = presentValues.length > 0 
    ? presentValues.reduce((sum, value) => sum + value, 0)
    : undefined;
  const totalGainLoss = totalPresentValue !== undefined 
    ? totalPresentValue - totalInvestment 
    : undefined;
  const totalGainLossPercent = totalGainLoss !== undefined && totalInvestment > 0 
    ? (totalGainLoss / totalInvestment) * 100 
    : undefined;
  return {
    totalInvestment,
    totalPresentValue,
    totalGainLoss,
    totalGainLossPercent,
  };
}

export function enrichHoldings(holdings: HoldingInput[]): HoldingEnriched[] {
  return holdings.map(holding => ({
    ...holding,
    investment: computeInvestment(holding),
  }));
}

export function formatCurrency(value: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

export function getGainLossColor(value: number | undefined): string {
  if (value === undefined || value === 0) return 'text-gray-600';
  return value > 0 ? 'text-green-600' : 'text-red-600';
}

export function getGainLossBgColor(value: number | undefined): string {
  if (value === undefined || value === 0) return 'bg-gray-100';
  return value > 0 ? 'bg-green-50' : 'bg-red-50';
}
