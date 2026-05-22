'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/formatters';
import { useAppStore } from '@/lib/store';

interface AgingRow {
  client_name: string;
  paid: number;
  bucket_1_30: number;
  bucket_31_60: number;
  bucket_61_90: number;
  bucket_90_plus: number;
  total_ar: number;
}

const COLORS = {
  'Paid': '#22c55e',
  '1-30d': '#eab308',
  '31-60d': '#f97316',
  '61-90d': '#ef4444',
  '90+ days': '#7f1d1d',
};

const CustomTooltip = ({ active, payload }: Record<string, unknown>) => {
  if (!active || !(payload as unknown[])?.length) return null;
  const p = (payload as Array<{ name: string; value: number; payload: { color: string } }>)[0];
  return (
    <div className="bg-[#1e2130] border border-[#2a2f45] rounded-lg p-3 text-xs shadow-xl">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full" style={{ background: p.payload.color }} />
        <span className="text-[#8891aa]">{p.name}</span>
      </div>
      <span className="font-mono font-semibold text-[#e8eaf0]">{formatCurrency(p.value)}</span>
    </div>
  );
};

export default function AgingDonut({ data }: { data: AgingRow[] }) {
  const { t } = useAppStore();

  const buckets = useMemo(() => {
    const b = {
      'Paid': 0, '1-30d': 0, '31-60d': 0, '61-90d': 0, '90+ days': 0
    };
    for (const row of data) {
      b['Paid'] += row.paid;
      b['1-30d'] += row.bucket_1_30;
      b['31-60d'] += row.bucket_31_60;
      b['61-90d'] += row.bucket_61_90;
      b['90+ days'] += row.bucket_90_plus;
    }
    return b;
  }, [data]);

  const nameMap = useMemo<Record<string, string>>(() => ({
    'Paid': t.invoices.paid,
    '1-30d': t.invoices.bucket1_30,
    '31-60d': t.invoices.bucket31_60,
    '61-90d': t.invoices.bucket61_90,
    '90+ days': t.invoices.bucket90_plus,
  }), [t]);

  const chartData = useMemo(() => {
    return Object.entries(buckets).map(([name, value]) => ({
      name: nameMap[name] || name, value, color: COLORS[name as keyof typeof COLORS]
    })).filter(d => d.value > 0);
  }, [buckets, nameMap]);

  const totalAR = useMemo(() => data.reduce((s, r) => s + r.total_ar, 0), [data]);

  return (
    <div className="bg-[#1e2130] border border-[#2a2f45] rounded-lg p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-[#e8eaf0]">{t.dashboard.arAgingDistribution}</h3>
        <p className="text-[11px] text-[#5a6280]">{t.invoices.totalAR}: {formatCurrency(totalAR)}</p>
      </div>
      <div className="relative">
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" strokeWidth={0}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-xs font-bold text-[#e8eaf0]">{formatCurrency(totalAR)}</p>
            <p className="text-[10px] text-[#5a6280]">{t.invoices.totalAR}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1 mt-2">
        {chartData.map(d => (
          <div key={d.name} className="flex items-center gap-1.5 text-[10px]">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
            <span className="text-[#8891aa]">{d.name}</span>
            <span className="ml-auto text-[#e8eaf0] font-mono">{formatCurrency(d.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
