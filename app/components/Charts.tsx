'use client';

import { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { HoldingEnriched } from '@/app/lib/schemas';
import { formatCurrency, formatPercentage } from '@/app/lib/calc';

interface ChartsProps {
  sectors: Record<string, {
    holdings: HoldingEnriched[];
    investment: number;
    presentValue?: number;
    gainLoss?: number;
    gainLossPercent?: number;
  }>;
  totalInvestment: number;
}

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
];

export default function Charts({ sectors, totalInvestment }: ChartsProps) {
  const [activeChart, setActiveChart] = useState<'allocation' | 'performance'>('allocation');

  const allocationData = Object.entries(sectors)
    .map(([sectorName, sectorData]) => ({
      name: sectorName,
      value: sectorData.investment,
      percentage: totalInvestment > 0 ? (sectorData.investment / totalInvestment) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  const performanceData = Object.entries(sectors)
    .map(([sectorName, sectorData]) => ({
      name: sectorName,
      gainLoss: sectorData.gainLoss || 0,
      gainLossPercent: sectorData.gainLossPercent || 0,
      investment: sectorData.investment,
    }))
    .sort((a, b) => Math.abs(b.gainLoss) - Math.abs(a.gainLoss));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      if (activeChart === 'allocation') {
        return (
          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
            <p className="font-medium text-gray-900">{label}</p>
            <p className="text-sm text-gray-600">
              Investment: {formatCurrency(data.value)}
            </p>
            <p className="text-sm text-gray-600">
              Allocation: {formatPercentage(data.percentage)}
            </p>
          </div>
        );
      } else {
        return (
          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
            <p className="font-medium text-gray-900">{label}</p>
            <p className="text-sm text-gray-600">
              Gain/Loss: {formatCurrency(data.gainLoss)}
            </p>
            <p className="text-sm text-gray-600">
              Return: {formatPercentage(data.gainLossPercent)}
            </p>
            <p className="text-sm text-gray-600">
              Investment: {formatCurrency(data.investment)}
            </p>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Portfolio Analytics</h2>
        
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveChart('allocation')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              activeChart === 'allocation'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Allocation
          </button>
          <button
            onClick={() => setActiveChart('performance')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              activeChart === 'performance'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Performance
          </button>
        </div>
      </div>

      <div className="h-80">
        {activeChart === 'allocation' ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={allocationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {allocationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value)}
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="gainLoss" 
                fill={(entry: any) => entry.gainLoss >= 0 ? '#10B981' : '#EF4444'}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-4">
        {activeChart === 'allocation' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {allocationData.map((entry, index) => (
              <div key={entry.name} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-gray-600 truncate">
                  {entry.name}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-sm text-gray-500">
            <p>Green bars indicate gains, red bars indicate losses</p>
            <p className="mt-1">
              Total portfolio value: {formatCurrency(totalInvestment)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
