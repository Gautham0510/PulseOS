'use client';

import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { formatCurrency, formatMonthLabel } from '@/lib/formatters';
import { useAppStore } from '@/lib/store';

interface BudgetRow {
  year_month: string;
  actual_revenue: number;
  budget_revenue: number;
  variance_pct: number;
}

const CustomTooltip = ({ active, payload, label }: Record<string, unknown>) => {
  if (!active || !(payload as unknown[])?.length) return null;
  const p = payload as Array<{ name: string; value: number; color: string }>;
  return (
    <div className="bg-[#1e2130] border border-[#2a2f45] rounded-lg p-3 text-xs shadow-xl">
      <p className="text-[#5a6280] mb-2 font-medium">{String(label)}</p>
      {p.map(item => (
        <div key={item.name} className="flex items-center justify-between gap-4 mb-1">
          <span className="text-[#8891aa]">{item.name}</span>
          <span className="font-mono font-semibold text-[#e8eaf0]">{formatCurrency(item.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function BudgetVsActual({ data }: { data: BudgetRow[] }) {
  const { t } = useAppStore();
  const formatted = useMemo(() => {
    return data.map(d => ({
      ...d,
      label: formatMonthLabel(d.year_month),
      color: d.variance_pct < -5 ? '#ef4444' : d.variance_pct > 5 ? '#22c55e' : '#3b82f6',
    }));
  }, [data]);

  return (
    <div className="bg-[#1e2130] border border-[#2a2f45] rounded-lg p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#e8eaf0]">{t.dashboard.revenueVsBudget}</h3>
          <p className="text-[11px] text-[#5a6280]">{t.dashboard.ytd2025}</p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[#8891aa]">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-blue-500" />{t.dashboard.actual}</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm" style={{ backgroundColor: 'var(--budget-bar)' }} />{t.dashboard.budget}</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={formatted} margin={{ top: 5, right: 5, left: 0, bottom: 0 }} barCategoryGap="25%">
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: 'var(--text-extra-muted)', fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={v => formatCurrency(v)} tick={{ fill: 'var(--text-extra-muted)', fontSize: 10 }} tickLine={false} axisLine={false} width={56} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="budget_revenue" name={t.dashboard.budget} fill="var(--budget-bar)" radius={[3, 3, 0, 0]} />
          <Bar dataKey="actual_revenue" name={t.dashboard.actual} radius={[3, 3, 0, 0]}>
            {formatted.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
