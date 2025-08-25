export function toYahooSymbol(symbol: string, exchange: 'NSE' | 'BSE'): string {
  const cleanSymbol = symbol.trim().toUpperCase();
  const nseExceptions = ['NIFTY', 'BANKNIFTY', 'SENSEX'];
  if (exchange === 'NSE' && nseExceptions.includes(cleanSymbol)) {
    return cleanSymbol;
  }
  switch (exchange) {
    case 'NSE':
      return `${cleanSymbol}.NS`;
    case 'BSE':
      return `${cleanSymbol}.BO`;
    default:
      return cleanSymbol;
  }
}

export function toGoogleQuotePath(symbol: string, exchange: 'NSE' | 'BSE'): string {
  const cleanSymbol = symbol.trim().toUpperCase();
  return `${cleanSymbol}:${exchange}`;
}

export function buildGoogleFinanceUrl(symbol: string, exchange: 'NSE' | 'BSE'): string {
  const quotePath = toGoogleQuotePath(symbol, exchange);
  return `https://www.google.com/finance/quote/${quotePath}`;
}

export const NSE_SYMBOL_MAPPINGS: Record<string, string> = {
  'RELIANCE': 'RELIANCE',
  'TCS': 'TCS',
  'HDFCBANK': 'HDFCBANK',
  'INFY': 'INFY',
  'ICICIBANK': 'ICICIBANK',
  'ITC': 'ITC',
  'BHARTIARTL': 'BHARTIARTL',
  'AXISBANK': 'AXISBANK',
  'MARUTI': 'MARUTI',
  'SUNPHARMA': 'SUNPHARMA',
  'WIPRO': 'WIPRO',
  'ULTRACEMCO': 'ULTRACEMCO',
  'TITAN': 'TITAN',
  'BAJFINANCE': 'BAJFINANCE',
  'NESTLEIND': 'NESTLEIND',
  'POWERGRID': 'POWERGRID',
  'ASIANPAINT': 'ASIANPAINT',
  'HINDUNILVR': 'HINDUNILVR',
  'JSWSTEEL': 'JSWSTEEL',
  'TATAMOTORS': 'TATAMOTORS',
};

export function normalizeSymbol(symbol: string, exchange: 'NSE' | 'BSE'): string {
  const cleanSymbol = symbol.trim().toUpperCase();
  if (exchange === 'NSE' && NSE_SYMBOL_MAPPINGS[cleanSymbol]) {
    return NSE_SYMBOL_MAPPINGS[cleanSymbol];
  }
  return cleanSymbol;
}

export function parseCombinedSymbol(combinedSymbol: string): {
  symbol: string;
  exchange: 'NSE' | 'BSE';
} | null {
  const parts = combinedSymbol.split(/[.:]/);
  if (parts.length !== 2) {
    return null;
  }
  const [symbol, exchange] = parts;
  if (exchange === 'NS' || exchange === 'NSE') {
    return { symbol: symbol.toUpperCase(), exchange: 'NSE' };
  }
  if (exchange === 'BO' || exchange === 'BSE') {
    return { symbol: symbol.toUpperCase(), exchange: 'BSE' };
  }
  return null;
}
