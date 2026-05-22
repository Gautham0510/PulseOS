'use client';

import { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line
} from 'recharts';
import { getMonthlyCashflow } from '@/lib/api';
import { formatCurrency, formatMonthLabel } from '@/lib/formatters';
import MetricCard from '@/components/shared/MetricCard';
import DataTable, { Column } from '@/components/shared/DataTable';
import { ChartSkeleton, CardSkeleton, TableSkeleton } from '@/components/shared/LoadingSkeleton';

import { useAppStore } from '@/lib/store';

function parseNum(v: string | undefined) { return parseFloat(v ?? '0') || 0; }

type CashflowRow = {
  year_month: string;
  total_inflow: number;
  total_outflow: number;
  net_cashflow: number;
  running_balance: number;
  mom_change_pct: number;
  label: string;
};

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
            <span className="text-[#8891aa] capitalize">{item.name}</span>
          </span>
          <span className="font-mono font-semibold text-[#e8eaf0]">{formatCurrency(item.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function CashflowPage() {
  const { activeCurrency, t } = useAppStore();
  const [data, setData] = useState<CashflowRow[] | null>(null);

  const columns: Column<CashflowRow>[] = [
    { key: 'year_month', label: t.cashflow.month, sortable: true, render: v => formatMonthLabel(String(v)) },
    { key: 'total_inflow', label: t.cashflow.inflow, sortable: true, render: v => <span className="text-green-400 font-mono">{formatCurrency(Number(v))}</span> },
    { key: 'total_outflow', label: t.cashflow.outflow, sortable: true, render: v => <span className="text-red-400 font-mono">{formatCurrency(Number(v))}</span> },
    { key: 'net_cashflow', label: t.cashflow.net, sortable: true, render: v => <span className={`font-mono font-semibold ${Number(v) >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(Number(v))}</span> },
    { key: 'running_balance', label: t.cashflow.balance, sortable: true, render: v => <span className="font-mono text-[#e8eaf0]">{formatCurrency(Number(v))}</span> },
    { key: 'mom_change_pct', label: t.cashflow.momPct, sortable: true, render: v => <span className={`text-xs ${Number(v) >= 0 ? 'text-green-400' : 'text-red-400'}`}>{Number(v) > 0 ? '+' : ''}{Number(v).toFixed(1)}%</span> },
  ];

  useEffect(() => {
    getMonthlyCashflow().then(rows => {
      const parsed = rows.map(r => ({
        year_month: r.year_month,
        total_inflow: parseNum(r.total_inflow),
        total_outflow: parseNum(r.total_outflow),
        net_cashflow: parseNum(r.net_cashflow),
        running_balance: parseNum(r.running_balance ?? r.closing_balance ?? r.cumulative_balance),
        mom_change_pct: parseNum(r.mom_change_pct),
        label: formatMonthLabel(r.year_month),
      }));
      // Compute mom_change_pct if not in data
      parsed.forEach((row, i) => {
        if (row.mom_change_pct === 0 && i > 0) {
          const prev = parsed[i - 1].net_cashflow;
          row.mom_change_pct = prev !== 0 ? ((row.net_cashflow - prev) / Math.abs(prev)) * 100 : 0;
        }
      });
      setData(parsed);
    });
  }, []);

  const totalInflow = data?.reduce((s, r) => s + r.total_inflow, 0) ?? 0;
  const totalOutflow = data?.reduce((s, r) => s + r.total_outflow, 0) ?? 0;
  const netPosition = totalInflow - totalOutflow;
  const avgBurn = data ? data.slice(-6).reduce((s, r) => s + r.total_outflow, 0) / 6 : 0;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-bold text-[#e8eaf0]">{t.cashflow.title}</h2>
        <p className="text-sm text-[#5a6280]">{t.cashflow.subtitle}</p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
        {data ? (
          <>
            <MetricCard label={t.cashflow.totalInflow} value={formatCurrency(totalInflow)} trend="up" trendValue="YTD" />
            <MetricCard label={t.cashflow.totalOutflow} value={formatCurrency(totalOutflow)} trend="down" />
            <MetricCard label={t.cashflow.netPosition} value={formatCurrency(netPosition)} badgeColor={netPosition >= 0 ? 'green' : 'red'} />
            <MetricCard label={t.cashflow.avgBurn} value={formatCurrency(avgBurn)} trend="up" trendValue="+5.2%" />
          </>
        ) : Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>

      {/* Main chart */}
      {!data ? <ChartSkeleton className="h-[320px] mb-4" /> : (
        <div className="bg-[#1e2130] border border-[#2a2f45] rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#e8eaf0]">{t.cashflow.chartTitle}</h3>
            <div className="flex items-center gap-3 text-[11px] text-[#8891aa]">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" />{t.cashflow.inflow}</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" />{t.cashflow.outflow}</span>
              <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-white" />{t.cashflow.net}</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="inflowG2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="outflowG2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2f45" />
              <XAxis dataKey="label" tick={{ fill: '#5a6280', fontSize: 9 }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tickFormatter={v => formatCurrency(v)} tick={{ fill: '#5a6280', fontSize: 10 }} tickLine={false} axisLine={false} width={56} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="total_inflow" name={t.cashflow.inflow} fill="url(#inflowG2)" stroke="#22c55e" strokeWidth={1.5} />
              <Area type="monotone" dataKey="total_outflow" name={t.cashflow.outflow} fill="url(#outflowG2)" stroke="#ef4444" strokeWidth={1.5} />
              <Line type="monotone" dataKey="net_cashflow" name={t.cashflow.net} stroke="#ffffff" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      {!data ? <TableSkeleton /> : (
        <div className="bg-[#1e2130] border border-[#2a2f45] rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-[#2a2f45]">
            <h3 className="text-sm font-semibold text-[#e8eaf0]">{t.cashflow.tableTitle}</h3>
          </div>
          <DataTable columns={columns} data={[...data].reverse()} />
        </div>
      )}
    </div>
  );
}
