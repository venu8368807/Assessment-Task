'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { formatCurrency, formatPercentage, getGainLossColor } from '@/app/lib/calc';
import { PortfolioResponse } from '@/app/lib/schemas';
import PortfolioTable from './components/PortfolioTable';
import SectorSummary from './components/SectorSummary';
import Charts from './components/Charts';
import ErrorBanner from './components/ErrorBanner';

const fetcher = async (url: string): Promise<PortfolioResponse> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export default function PortfolioDashboard() {
  const [showCharts, setShowCharts] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const { 
    data: portfolio, 
    error, 
    isLoading, 
    mutate 
  } = useSWR<PortfolioResponse>('/api/portfolio', fetcher, {
    refreshInterval: 15000,
    dedupingInterval: 5000,
    revalidateOnFocus: false,
    errorRetryCount: 3,
    errorRetryInterval: 5000,
  });

  useEffect(() => {
    if (portfolio) {
      setLastRefresh(new Date());
    }
  }, [portfolio]);

  const handleRefresh = () => {
    mutate();
  };

  const formatLastRefresh = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Portfolio Dashboard
              </h1>
              <p className="text-sm text-gray-500">
                Live market data with sector analysis
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Last updated: {formatLastRefresh(lastRefresh)}
              </div>
              
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg 
                  className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorBanner 
          error={error?.message}
          onRetry={handleRefresh}
        />

        {portfolio && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Investment</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(portfolio.totals.totalInvestment)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Present Value</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {portfolio.totals.totalPresentValue 
                      ? formatCurrency(portfolio.totals.totalPresentValue)
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Gain/Loss</p>
                  <p className={`text-2xl font-semibold ${getGainLossColor(portfolio.totals.totalGainLoss)}`}>
                    {portfolio.totals.totalGainLoss !== undefined
                      ? `${portfolio.totals.totalGainLoss > 0 ? '+' : ''}${formatCurrency(portfolio.totals.totalGainLoss)}`
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Return</p>
                  <p className={`text-2xl font-semibold ${getGainLossColor(portfolio.totals.totalGainLossPercent)}`}>
                    {portfolio.totals.totalGainLossPercent !== undefined
                      ? `${portfolio.totals.totalGainLossPercent > 0 ? '+' : ''}${formatPercentage(portfolio.totals.totalGainLossPercent)}`
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {portfolio && (
          <SectorSummary 
            sectors={portfolio.sectors}
            totalInvestment={portfolio.totals.totalInvestment}
          />
        )}

        {portfolio && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>
              <button
                onClick={() => setShowCharts(!showCharts)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {showCharts ? 'Hide Charts' : 'Show Charts'}
              </button>
            </div>
            
            {showCharts && (
              <Charts 
                sectors={portfolio.sectors}
                totalInvestment={portfolio.totals.totalInvestment}
              />
            )}
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Portfolio Holdings
          </h2>
          <PortfolioTable 
            holdings={portfolio?.holdings || []}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
}
