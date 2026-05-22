'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { formatCurrency } from '@/lib/formatters';
import { useAppStore } from '@/lib/store';

interface ClientRow {
  client_name: string;
  total_ar: number;
  risk_rating: string;
  risk_pct: number;
}

const riskColors: Record<string, string> = {
  LOW: '#22c55e',
  MEDIUM: '#eab308',
  HIGH: '#f97316',
  CRITICAL: '#ef4444',
};

const CustomTooltip = ({ active, payload }: Record<string, unknown>) => {
  const { t } = useAppStore();
  if (!active || !(payload as unknown[])?.length) return null;
  const p = (payload as Array<{ payload: ClientRow & { color: string }; value: number }>)[0];
  const row = p.payload;
  const labelMap: Record<string, string> = {
    CRITICAL: t.kpi.critical,
    HIGH: t.kpi.high,
    MEDIUM: t.kpi.medium,
    LOW: t.kpi.low,
  };
  return (
    <div className="bg-[#1e2130] border border-[#2a2f45] rounded-lg p-3 text-xs shadow-xl">
      <p className="font-semibold text-[#e8eaf0] mb-1">{row.client_name}</p>
      <p className="text-[#8891aa]">AR: <span className="text-[#e8eaf0] font-mono">{formatCurrency(row.total_ar)}</span></p>
      <p className="text-[#8891aa]">{t.invoices.concentration}: <span className="text-[#e8eaf0]">{row.risk_pct}%</span></p>
      <p className="text-[#8891aa]">{t.invoices.risk}: <span style={{ color: row.color }} className="font-semibold">{labelMap[row.risk_rating] || row.risk_rating}</span></p>
    </div>
  );
};

export default function ClientConcentration({ data }: { data: ClientRow[] }) {
  const { t } = useAppStore();
  const formatted = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.total_ar - a.total_ar).slice(0, 7);
    return sorted.map(d => ({
      ...d,
      color: riskColors[d.risk_rating] || '#3b82f6',
      name: d.client_name.length > 16 ? d.client_name.slice(0, 14) + '…' : d.client_name,
    }));
  }, [data]);

  return (
    <div className="bg-[#1e2130] border border-[#2a2f45] rounded-lg p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-[#e8eaf0]">{t.dashboard.clientArConcentration}</h3>
        <p className="text-[11px] text-[#5a6280]">{t.dashboard.byRiskRating}</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={formatted} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2f45" horizontal={false} />
          <XAxis type="number" tickFormatter={v => formatCurrency(v)} tick={{ fill: '#5a6280', fontSize: 9 }} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fill: '#8891aa', fontSize: 10 }} tickLine={false} axisLine={false} width={100} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="total_ar" radius={[0, 3, 3, 0]}>
            {formatted.map((entry, i) => (
              <Cell key={i} fill={entry.color} fillOpacity={0.85} />
            ))}
            <LabelList dataKey="risk_pct" position="right" formatter={(v: number) => `${v}%`} style={{ fill: '#8891aa', fontSize: 10 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
