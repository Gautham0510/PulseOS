import { useAppStore } from './store';

export const CURRENCY_RATES: Record<string, number> = {
  EUR: 1,
  INR: 82.69,
  AED: 4.10,
};

export function formatCurrency(value: number, currency?: string): string {
  const activeCurrency = currency || useAppStore.getState().activeCurrency || 'EUR';
  const symbol = activeCurrency === 'EUR' ? '€' : activeCurrency === 'INR' ? '₹' : 'AED ';
  const rate = CURRENCY_RATES[activeCurrency] ?? 1;
  const convertedValue = value * rate;
  
  const absValue = Math.abs(convertedValue);
  const sign = convertedValue < 0 ? '-' : '';

  if (absValue >= 1_000_000) {
    return `${sign}${symbol}${(absValue / 1_000_000).toFixed(1)}M`;
  }
  if (absValue >= 1_000) {
    return `${sign}${symbol}${(absValue / 1_000).toFixed(0)}k`;
  }
  return `${sign}${symbol}${absValue.toFixed(0)}`;
}

export function formatPct(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  const locale = useAppStore.getState().locale || 'en';
  const localeCode = locale === 'fr' ? 'fr-FR' : 'en-GB';
  return date.toLocaleDateString(localeCode, { month: 'short', year: '2-digit' });
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const locale = useAppStore.getState().locale || 'en';
  const localeCode = locale === 'fr' ? 'fr-FR' : 'en-GB';
  return d.toLocaleDateString(localeCode, { day: '2-digit', month: 'short', year: 'numeric' });
}

export function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n');
  const headers = splitCsvLine(lines[0]).map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = splitCsvLine(line);
    return Object.fromEntries(headers.map((h, i) => [h, (values[i] ?? '').trim()]));
  });
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
