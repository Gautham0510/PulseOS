'use client';

import { useEffect, useState } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceDot
} from 'recharts';
import { getPlWithMetrics } from '@/lib/api';
import { formatCurrency, formatPct, formatMonthLabel } from '@/lib/formatters';
import MetricCard from '@/components/shared/MetricCard';
import DataTable, { Column } from '@/components/shared/DataTable';
import { ChartSkeleton, CardSkeleton } from '@/components/shared/LoadingSkeleton';
import { useAppStore } from '@/lib/store';

function parseNum(v: string | undefined) { return parseFloat(v ?? '0') || 0; }

type PLRow = {
  year_month: string; revenue: number; cogs: number; gross_profit: number;
  gross_margin_pct: number; opex: number; ebit: number; ebit_margin_pct: number;
  net_profit: number; net_margin_pct: number; ebit_anomaly_flag: boolean; label: string;
};

const CustomTooltip = ({ active, payload, label }: Record<string, unknown>) => {
  if (!active || !(payload as unknown[])?.length) return null;
  const p = payload as Array<{ name: string; value: number; color: string; dataKey: string }>;
  return (
    <div className="bg-[#1e2130] border border-[#2a2f45] rounded-lg p-3 text-xs shadow-xl min-w-[160px]">
      <p className="text-[#5a6280] mb-2 font-medium">{String(label)}</p>
      {p.map(item => (
        <div key={item.dataKey} className="flex items-center justify-between gap-3 mb-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm" style={{ background: item.color }} />
            <span className="text-[#8891aa]">{item.name}</span>
          </span>
          <span className="font-mono font-semibold text-[#e8eaf0]">
            {item.dataKey.includes('margin') || item.dataKey.includes('pct')
              ? formatPct(item.value) : formatCurrency(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

function annualSummary(data: PLRow[], year: number) {
  const rows = data.filter(r => r.year_month.startsWith(String(year)));
  if (!rows.length) return null;
  const rev = rows.reduce((s, r) => s + r.revenue, 0);
  const gp = rows.reduce((s, r) => s + r.gross_profit, 0);
  const ebit = rows.reduce((s, r) => s + r.ebit, 0);
  return { rev, gm: (gp / rev) * 100, ebit, ebitM: (ebit / rev) * 100 };
}

export default function PLPage() {
  const { activeCurrency, t } = useAppStore();
  const [data, setData] = useState<PLRow[] | null>(null);

  const tableColumns: Column<PLRow>[] = [
    { key: 'year_month', label: t.pl.month, sortable: true, render: v => formatMonthLabel(String(v)) },
    { key: 'revenue', label: t.pl.revenue, sortable: true, render: v => <span className="font-mono">{formatCurrency(Number(v))}</span> },
    { key: 'gross_profit', label: t.pl.grossProfit, sortable: true, render: v => <span className="font-mono">{formatCurrency(Number(v))}</span> },
    { key: 'gross_margin_pct', label: t.pl.gmPct, sortable: true, render: v => <span className="text-sky-400">{formatPct(Number(v))}</span> },
    { key: 'ebit', label: t.pl.ebit, sortable: true, render: v => <span className="font-mono">{formatCurrency(Number(v))}</span> },
    { key: 'ebit_margin_pct', label: t.pl.ebitPct, sortable: true, render: v => <span className="text-blue-400">{formatPct(Number(v))}</span> },
    { key: 'net_profit', label: t.pl.netProfit, sortable: true, render: v => <span className="font-mono font-semibold text-green-400">{formatCurrency(Number(v))}</span> },
    { key: 'net_margin_pct', label: t.pl.netPct, sortable: true, render: v => formatPct(Number(v)) },
  ];

  useEffect(() => {
    getPlWithMetrics().then(rows => {
      setData(rows.map(r => ({
        year_month: r.year_month,
        revenue: parseNum(r.revenue),
        cogs: parseNum(r.cogs),
        gross_profit: parseNum(r.gross_profit),
        gross_margin_pct: parseNum(r.gross_margin_pct),
        opex: parseNum(r.opex),
        ebit: parseNum(r.ebit),
        ebit_margin_pct: parseNum(r.ebit_margin_pct),
        net_profit: parseNum(r.net_profit),
        net_margin_pct: parseNum(r.net_margin_pct),
        ebit_anomaly_flag: r.ebit_anomaly_flag === 'true',
        label: formatMonthLabel(r.year_month),
      })));
    });
  }, []);

  const s2023 = data ? annualSummary(data, 2023) : null;
  const s2024 = data ? annualSummary(data, 2024) : null;
  const s2025 = data ? annualSummary(data, 2025) : null;
  const anomalies = data?.filter(d => d.ebit_anomaly_flag) ?? [];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-bold text-[#e8eaf0]">{t.pl.title}</h2>
        <p className="text-sm text-[#5a6280]">{t.pl.subtitle}</p>
      </div>

      {/* Annual summaries */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[{ year: 2023, s: s2023 }, { year: 2024, s: s2024 }, { year: 2025, s: s2025 }].map(({ year, s }) => (
          !s ? <CardSkeleton key={year} /> : (
            <div key={year} className="bg-[#1e2130] border border-[#2a2f45] rounded-lg p-4">
              <p className="text-[11px] text-[#5a6280] font-semibold uppercase tracking-wider mb-3">{year}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#8891aa]">{t.pl.revenue}</span>
                  <span className="font-mono text-[#e8eaf0]">{formatCurrency(s.rev)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#8891aa]">{t.pl.grossProfit}</span>
                  <span className="text-sky-400 font-semibold">{formatPct(s.gm)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#8891aa]">{t.pl.ebit}</span>
                  <span className="text-blue-400 font-semibold">{formatPct(s.ebitM)}</span>
                </div>
              </div>
            </div>
          )
        ))}
      </div>

      {/* Chart */}
      {!data ? <ChartSkeleton className="h-[340px] mb-4" /> : (
        <div className="bg-[#1e2130] border border-[#2a2f45] rounded-lg p-4 mb-4">
          <h3 className="text-sm font-semibold text-[#e8eaf0] mb-4">{t.pl.chartTitle}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2f45" />
              <XAxis dataKey="label" tick={{ fill: '#5a6280', fontSize: 9 }} tickLine={false} axisLine={false} interval={5} />
              <YAxis yAxisId="left" tickFormatter={v => formatCurrency(v)} tick={{ fill: '#5a6280', fontSize: 10 }} tickLine={false} axisLine={false} width={56} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={v => `${v}%`} tick={{ fill: '#5a6280', fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 50]} width={36} />
              <Tooltip content={<CustomTooltip />} />
              <Bar yAxisId="left" dataKey="revenue" name={t.pl.revenue} fill="#1d4ed8" fillOpacity={0.6} radius={[2, 2, 0, 0]} barSize={8} />
              <Bar yAxisId="left" dataKey="gross_profit" name={t.pl.grossProfit} fill="#0ea5e9" fillOpacity={0.7} radius={[2, 2, 0, 0]} barSize={8} />
              <Bar yAxisId="left" dataKey="ebit" name={t.pl.ebit} fill="#06b6d4" fillOpacity={0.8} radius={[2, 2, 0, 0]} barSize={8} />
              <Bar yAxisId="left" dataKey="net_profit" name={t.pl.netProfit} fill="#22c55e" fillOpacity={0.9} radius={[2, 2, 0, 0]} barSize={8} />
              <Line yAxisId="right" type="monotone" dataKey="gross_margin_pct" name={t.pl.gmPct} stroke="#38bdf8" strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="ebit_margin_pct" name={t.pl.ebitPct} stroke="#818cf8" strokeWidth={2} dot={false} strokeDasharray="4 3" />
              {anomalies.map(a => (
                <ReferenceDot key={a.year_month} yAxisId="left" x={a.label} y={0} r={4} fill="#ef4444" stroke="none" label={{ value: '!', fill: '#ef4444', fontSize: 10 }} />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      {data && (
        <div className="bg-[#1e2130] border border-[#2a2f45] rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-[#2a2f45]">
            <h3 className="text-sm font-semibold text-[#e8eaf0]">{t.pl.tableTitle}</h3>
          </div>
          <DataTable
            columns={tableColumns}
            data={[...data].reverse()}
            rowClassName={row => row.ebit_anomaly_flag ? 'bg-red-500/5' : ''}
          />
        </div>
      )}
    </div>
  );
}
