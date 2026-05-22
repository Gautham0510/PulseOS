'use client';

import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot
} from 'recharts';
import { formatPct, formatMonthLabel } from '@/lib/formatters';
import { useAppStore } from '@/lib/store';

interface PLRow {
  year_month: string;
  gross_margin_pct: number;
  gross_margin_3m_avg: number;
  ebit_anomaly_flag: boolean;
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
          <span className="font-mono font-semibold text-[#e8eaf0]">{formatPct(item.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function MarginTrend({ data }: { data: PLRow[] }) {
  const { t } = useAppStore();
  const formatted = useMemo(() => {
    return data.map(d => ({
      ...d,
      label: formatMonthLabel(d.year_month),
    }));
  }, [data]);

  const anomalies = useMemo(() => {
    return formatted.filter(d => d.ebit_anomaly_flag);
  }, [formatted]);

  return (
    <div className="bg-[#1e2130] border border-[#2a2f45] rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#e8eaf0]">{t.dashboard.grossMarginTrend}</h3>
          <p className="text-[11px] text-[#5a6280]">{t.dashboard.months36}</p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[#8891aa]">
          <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-sky-400" />{t.dashboard.actual}</span>
          <span className="flex items-center gap-1.5"><span className="w-5 h-px bg-sky-700 border-t border-dashed border-sky-700" />{t.dashboard.avg3m}</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" />{t.dashboard.anomaly}</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={formatted} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2f45" />
          <XAxis dataKey="label" tick={{ fill: '#5a6280', fontSize: 10 }} tickLine={false} axisLine={false} interval={7} />
          <YAxis tickFormatter={v => `${v}%`} tick={{ fill: '#5a6280', fontSize: 10 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} width={36} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="gross_margin_pct" name={t.dashboard.actual} stroke="#38bdf8" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="gross_margin_3m_avg" name={t.dashboard.avg3m} stroke="#0369a1" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
          {anomalies.map(a => (
            <ReferenceDot key={a.year_month} x={a.label} y={a.gross_margin_pct} r={4} fill="#ef4444" stroke="none" />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
