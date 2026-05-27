'use client';

import { useMemo } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart, Area
} from 'recharts';
import { formatCurrency, formatMonthLabel } from '@/lib/formatters';
import { useAppStore } from '@/lib/store';

interface CashflowRow {
  year_month: string;
  total_inflow: number;
  total_outflow: number;
  net_cashflow: number;
}

const CustomTooltip = ({ active, payload, label }: Record<string, unknown>) => {
  if (!active || !(payload as unknown[])?.length) return null;
  const p = payload as Array<{ name: string; value: number; color: string }>;
  return (
    <div className="bg-[#1e2130] border border-[#2a2f45] rounded-lg p-3 text-xs shadow-xl">
      <p className="text-[#5a6280] mb-2 font-medium">{String(label)}</p>
      {p.map(item => (
        <div key={item.name} className="flex items-center justify-between gap-4 mb-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
            <span className="text-[#8891aa]">{item.name}</span>
          </span>
          <span className="font-mono font-semibold text-[#e8eaf0]">{formatCurrency(item.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function CashFlowChart({ data }: { data: CashflowRow[] }) {
  const { t } = useAppStore();
  const formatted = useMemo(() => {
    return data.map(d => ({
      ...d,
      label: formatMonthLabel(d.year_month),
    }));
  }, [data]);

  return (
    <div className="bg-[#1e2130] border border-[#2a2f45] rounded-lg p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#e8eaf0]">{t.dashboard.cashFlowTimeline}</h3>
          <p className="text-[11px] text-[#5a6280]">{t.dashboard.timelineSub}</p>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" />{t.cashflow.inflow}</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" />{t.cashflow.outflow}</span>
          <span className="flex items-center gap-1.5"><span className="w-6 h-0.5 bg-white" />{t.cashflow.net}</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={formatted} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis dataKey="label" tick={{ fill: 'var(--text-extra-muted)', fontSize: 10 }} tickLine={false} axisLine={false} interval={5} />
          <YAxis tickFormatter={v => formatCurrency(v)} tick={{ fill: 'var(--text-extra-muted)', fontSize: 10 }} tickLine={false} axisLine={false} width={56} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="total_inflow" name={t.cashflow.inflow} fill="url(#inflowGrad)" stroke="#22c55e" strokeWidth={1.5} />
          <Area type="monotone" dataKey="total_outflow" name={t.cashflow.outflow} fill="url(#outflowGrad)" stroke="#ef4444" strokeWidth={1.5} />
          <Line type="monotone" dataKey="net_cashflow" name={t.cashflow.net} stroke="var(--net-cashflow-line)" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
