import { formatCurrency, formatPercentage, getGainLossColor, getGainLossBgColor } from '@/app/lib/calc';
import { HoldingEnriched } from '@/app/lib/schemas';

interface SectorSummaryProps {
  sectors: Record<string, {
    holdings: HoldingEnriched[];
    investment: number;
    presentValue?: number;
    gainLoss?: number;
    gainLossPercent?: number;
  }>;
  totalInvestment: number;
}

export default function SectorSummary({ sectors, totalInvestment }: SectorSummaryProps) {
  const sectorEntries = Object.entries(sectors).sort((a, b) => {
    return b[1].investment - a[1].investment;
  });

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Sector Overview
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sectorEntries.map(([sectorName, sectorData]) => {
          const sectorWeight = totalInvestment > 0 
            ? (sectorData.investment / totalInvestment) * 100 
            : 0;
          
          const gainLossColor = getGainLossColor(sectorData.gainLoss);
          const bgColor = getGainLossBgColor(sectorData.gainLoss);

          return (
            <div
              key={sectorName}
              className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow ${bgColor}`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900 truncate">
                  {sectorName}
                </h3>
                <span className="text-sm text-gray-500">
                  {sectorWeight.toFixed(1)}%
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Investment:</span>
                  <span className="font-medium tabular-nums">
                    {formatCurrency(sectorData.investment)}
                  </span>
                </div>

                {sectorData.presentValue !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Present Value:</span>
                    <span className="font-medium tabular-nums">
                      {formatCurrency(sectorData.presentValue)}
                    </span>
                  </div>
                )}

                {sectorData.gainLoss !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Gain/Loss:</span>
                    <span className={`font-medium tabular-nums ${gainLossColor}`}>
                      {sectorData.gainLoss > 0 ? '+' : ''}
                      {formatCurrency(sectorData.gainLoss)}
                    </span>
                  </div>
                )}

                {sectorData.gainLossPercent !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Return:</span>
                    <span className={`font-medium tabular-nums ${gainLossColor}`}>
                      {sectorData.gainLossPercent > 0 ? '+' : ''}
                      {formatPercentage(sectorData.gainLossPercent)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Holdings:</span>
                  <span className="font-medium">
                    {sectorData.holdings.length}
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${sectorWeight}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sectorEntries.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No sectors found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Add some holdings to see sector breakdown.
          </p>
        </div>
      )}
    </div>
  );
}
