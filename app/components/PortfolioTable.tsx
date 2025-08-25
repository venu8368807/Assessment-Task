'use client';

import { useMemo, useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from '@tanstack/react-table';
import { HoldingEnriched } from '@/app/lib/schemas';
import NumberCell from './NumberCell';

interface PortfolioTableProps {
  holdings: HoldingEnriched[];
  isLoading?: boolean;
}

const columnHelper = createColumnHelper<HoldingEnriched>();

export default function PortfolioTable({ holdings, isLoading = false }: PortfolioTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Particulars',
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="font-medium text-gray-900 truncate">
              {row.original.name}
            </div>
            <div className="text-sm text-gray-500">
              {row.original.symbol}
            </div>
          </div>
        ),
        size: 200,
      }),
      columnHelper.accessor('purchasePrice', {
        header: 'Purchase Price',
        cell: ({ getValue }) => (
          <NumberCell value={getValue()} type="currency" />
        ),
        size: 120,
      }),
      columnHelper.accessor('qty', {
        header: 'Qty',
        cell: ({ getValue }) => (
          <span className="tabular-nums font-medium">
            {getValue().toLocaleString()}
          </span>
        ),
        size: 80,
      }),
      columnHelper.accessor('investment', {
        header: 'Investment',
        cell: ({ getValue }) => (
          <NumberCell value={getValue()} type="currency" />
        ),
        size: 120,
      }),
      columnHelper.accessor('portfolioPercent', {
        header: 'Portfolio %',
        cell: ({ getValue }) => (
          <NumberCell value={getValue()} type="percentage" />
        ),
        size: 100,
      }),
      columnHelper.accessor('exchange', {
        header: 'Exchange',
        cell: ({ getValue }) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {getValue()}
          </span>
        ),
        size: 80,
      }),
      columnHelper.accessor('cmp', {
        header: 'CMP',
        cell: ({ getValue, row }) => (
          <div className="flex items-center space-x-1">
            <NumberCell value={getValue()} type="currency" />
            {row.original.stale && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                stale
              </span>
            )}
          </div>
        ),
        size: 100,
      }),
      columnHelper.accessor('presentValue', {
        header: 'Present Value',
        cell: ({ getValue }) => (
          <NumberCell value={getValue()} type="currency" />
        ),
        size: 120,
      }),
      columnHelper.accessor('gainLoss', {
        header: 'Gain/Loss',
        cell: ({ getValue }) => (
          <NumberCell 
            value={getValue()} 
            type="currency" 
            showSign={true}
            isGainLoss={true}
          />
        ),
        size: 120,
      }),
      columnHelper.accessor('peRatio', {
        header: 'P/E Ratio',
        cell: ({ getValue }) => (
          <NumberCell value={getValue()} type="number" />
        ),
        size: 100,
      }),
      columnHelper.accessor('latestEarnings', {
        header: 'Latest Earnings',
        cell: ({ getValue }) => (
          <span className="text-sm text-gray-900">
            {getValue() || 'N/A'}
          </span>
        ),
        size: 150,
      }),
    ],
    []
  );

  const table = useReactTable({
    data: holdings,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-12"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-100 h-16 border-t border-gray-200"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="table-container">
        <table className="w-full">
          <thead className="sticky-header">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center space-x-1 ${
                          header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <span>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </span>
                        {header.column.getCanSort() && (
                          <span className="text-gray-400">
                            {{
                              asc: '↑',
                              desc: '↓',
                            }[header.column.getIsSorted() as string] ?? '↕'}
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 text-sm text-gray-900"
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {holdings.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No holdings found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding some holdings to your portfolio.
          </p>
        </div>
      )}
    </div>
  );
}
