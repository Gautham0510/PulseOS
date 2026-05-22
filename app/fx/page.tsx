'use client';

import { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot
} from 'recharts';
import { getFxAnalysis } from '@/lib/api';
import { formatCurrency, formatMonthLabel } from '@/lib/formatters';
import MetricCard from '@/components/shared/MetricCard';
import { ChartSkeleton, CardSkeleton } from '@/components/shared/LoadingSkeleton';
import { useAppStore } from '@/lib/store';

function parseNum(v: string | undefined) { return parseFloat(v ?? '0') || 0; }

type FXRow = {
  year_month: string; eur_inr_rate: number; eur_aed_rate: number;
  eur_revenue_pct: number; inr_revenue_pct: number; aed_revenue_pct: number;
  fx_impact_eur: number; cumulative_fx_impact: number; fx_flag: boolean; label: string;
};

const CustomTooltip = ({ active, payload, label }: Record<string, unknown>) => {
  if (!active || !(payload as unknown[])?.length) return null;
  const p = payload as Array<{ name: string; value: number; color: string; dataKey: string }>;
  return (
    <div className="bg-[#1e2130] border border-[#2a2f45] rounded-lg p-3 text-xs shadow-xl">
      <p className="text-[#5a6280] mb-2 font-medium">{String(label)}</p>
      {p.map(item => (
        <div key={item.dataKey} className="flex items-center justify-between gap-4 mb-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
            <span className="text-[#8891aa]">{item.name}</span>
          </span>
          <span className="font-mono font-semibold text-[#e8eaf0]">
            {item.dataKey.includes('impact') ? formatCurrency(item.value) : item.value.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function FXPage() {
  const { activeCurrency, t, locale } = useAppStore();
  const [data, setData] = useState<FXRow[] | null>(null);

  useEffect(() => {
    getFxAnalysis().then(rows => {
      setData(rows.map(r => ({
        year_month: r.year_month,
        eur_inr_rate: parseNum(r.eur_inr_rate),
        eur_aed_rate: parseNum(r.eur_aed_rate),
        eur_revenue_pct: parseNum(r.eur_revenue_pct),
        inr_revenue_pct: parseNum(r.inr_revenue_pct),
        aed_revenue_pct: parseNum(r.aed_revenue_pct),
        fx_impact_eur: parseNum(r.fx_impact_eur),
        cumulative_fx_impact: parseNum(r.cumulative_fx_impact),
        fx_flag: r.fx_flag === 'true',
        label: formatMonthLabel(r.year_month),
      })));
    });
  }, []);

  const latest = data?.[data.length - 1];
  const cumulativeFx = latest?.cumulative_fx_impact ?? 0;
  const mostVolatile = data?.reduce((a, b) => Math.abs(a.fx_impact_eur) > Math.abs(b.fx_impact_eur) ? a : b);
  const flagged = data?.filter(d => d.fx_flag) ?? [];

  const donutData = latest ? [
    { name: 'EUR', value: latest.eur_revenue_pct, color: '#3b82f6' },
    { name: 'INR', value: latest.inr_revenue_pct, color: '#f59e0b' },
    { name: 'AED', value: latest.aed_revenue_pct, color: '#22c55e' },
  ] : [];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-bold text-[#e8eaf0]">{t.fx.title}</h2>
        <p className="text-sm text-[#5a6280]">{t.fx.subtitle}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
        {!data ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />) : (
          <>
            <MetricCard
              label={t.fx.cumulativeFx}
              value={formatCurrency(cumulativeFx)}
              badgeColor={cumulativeFx >= 0 ? 'green' : 'red'}
              badge={cumulativeFx >= 0 ? t.fx.gain : t.fx.loss}
            />
            <MetricCard
              label={t.fx.mostVolatile}
              value={mostVolatile?.label ?? '—'}
              subtext={formatCurrency(mostVolatile?.fx_impact_eur ?? 0)}
            />
            <MetricCard
              label={t.fx.eurInr}
              value={latest?.eur_inr_rate.toFixed(2) ?? '—'}
              trend="down"
              trendValue={locale === 'fr' ? 'vs 88,2 (2023)' : 'vs 88.2 (2023)'}
            />
            <MetricCard
              label={t.fx.eurAed}
              value={latest?.eur_aed_rate.toFixed(2) ?? '—'}
              trend="down"
              trendValue={locale === 'fr' ? 'vs 3,94 (2023)' : 'vs 3.94 (2023)'}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-12 gap-4 mb-4">
        {/* Donut */}
        <div className="col-span-12 sm:col-span-4 bg-[#1e2130] border border-[#2a2f45] rounded-lg p-4">
          <h3 className="text-sm font-semibold text-[#e8eaf0] mb-1">{t.fx.revByCurrency}</h3>
          <p className="text-[11px] text-[#5a6280] mb-3">{t.fx.latestMonth}</p>
          {!data ? <div className="h-48 animate-pulse bg-[#2a2f45] rounded" /> : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={45} outerRadius={68} dataKey="value" strokeWidth={0}>
                    {donutData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v}%`, '']} contentStyle={{ background: '#1e2130', border: '1px solid #2a2f45', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {donutData.map(d => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                      <span className="text-[#8891aa]">{d.name}</span>
                    </span>
                    <span className="text-[#e8eaf0] font-mono">{d.value}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* FX Rate chart */}
        <div className="col-span-12 sm:col-span-8 bg-[#1e2130] border border-[#2a2f45] rounded-lg p-4">
          <h3 className="text-sm font-semibold text-[#e8eaf0] mb-1">{t.fx.rateChart}</h3>
          <p className="text-[11px] text-[#5a6280] mb-3">{t.fx.trend36}</p>
          {!data ? <div className="h-48 animate-pulse bg-[#2a2f45] rounded" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f45" />
                <XAxis dataKey="label" tick={{ fill: '#5a6280', fontSize: 9 }} tickLine={false} axisLine={false} interval={6} />
                <YAxis yAxisId="inr" tick={{ fill: '#5a6280', fontSize: 10 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} width={36} />
                <YAxis yAxisId="aed" orientation="right" tick={{ fill: '#5a6280', fontSize: 10 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} width={36} />
                <Tooltip content={<CustomTooltip />} />
                <Line yAxisId="inr" type="monotone" dataKey="eur_inr_rate" name="EUR/INR" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line yAxisId="aed" type="monotone" dataKey="eur_aed_rate" name="EUR/AED" stroke="#22c55e" strokeWidth={2} dot={false} />
                {flagged.map(f => (
                  <ReferenceDot key={f.year_month} yAxisId="inr" x={f.label} y={f.eur_inr_rate} r={4} fill="#ef4444" stroke="none" />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* FX Impact bar chart */}
      {!data ? <ChartSkeleton className="h-[260px]" /> : (
        <div className="bg-[#1e2130] border border-[#2a2f45] rounded-lg p-4">
          <h3 className="text-sm font-semibold text-[#e8eaf0] mb-1">{t.fx.monthlyImpact}</h3>
          <p className="text-[11px] text-[#5a6280] mb-4">{t.fx.positiveNote}</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2f45" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#5a6280', fontSize: 9 }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tickFormatter={v => formatCurrency(v)} tick={{ fill: '#5a6280', fontSize: 10 }} tickLine={false} axisLine={false} width={56} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="fx_impact_eur" name={locale === 'fr' ? 'Impact FX' : 'FX Impact'} radius={[2, 2, 0, 0]}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.fx_impact_eur >= 0 ? '#22c55e' : '#ef4444'} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
