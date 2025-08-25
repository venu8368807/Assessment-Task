import { formatCurrency, formatPercentage, getGainLossColor } from '@/app/lib/calc';

interface NumberCellProps {
  value: number | undefined;
  type: 'currency' | 'percentage' | 'number';
  className?: string;
  showSign?: boolean;
  isGainLoss?: boolean;
}

export default function NumberCell({ 
  value, 
  type, 
  className = '', 
  showSign = false,
  isGainLoss = false 
}: NumberCellProps) {
  if (value === undefined || value === null) {
    return (
      <span className={`text-gray-400 italic ${className}`}>
        N/A
      </span>
    );
  }

  let displayValue: string;
  let colorClass = '';

  switch (type) {
    case 'currency':
      displayValue = formatCurrency(value);
      break;
    case 'percentage':
      displayValue = formatPercentage(value);
      break;
    case 'number':
      displayValue = value.toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
      break;
    default:
      displayValue = value.toString();
  }

  if (showSign && value !== 0) {
    const sign = value > 0 ? '+' : '';
    displayValue = `${sign}${displayValue}`;
  }

  if (isGainLoss) {
    colorClass = getGainLossColor(value);
  }

  return (
    <span className={`tabular-nums font-medium ${colorClass} ${className}`}>
      {displayValue}
    </span>
  );
}
