'use client';

import { useState, useEffect } from 'react';
import { getMetricsSummary } from '@/lib/api';
import { formatCurrency, formatPct } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { CircleCheck as CheckCircle, CircleAlert as AlertCircle, RefreshCw } from 'lucide-react';
import { useAppStore } from '@/lib/store';

type Baseline = {
  revenue: number; cogs: number; gross_profit: number;
  gross_margin_pct: number; opex: number; ebit: number;
  net_profit: number; cash_balance: number; monthly_burn: number;
};

type Sliders = {
  revenueChange: number; cogsChange: number; opexChange: number;
  fxImpact: number; newHeadcount: number;
};

const PRESETS: Record<string, Sliders> = {
  base: { revenueChange: 0, cogsChange: 0, opexChange: 0, fxImpact: 0, newHeadcount: 0 },
  bear: { revenueChange: -20, cogsChange: 10, opexChange: 5, fxImpact: -10, newHeadcount: 0 },
  bull: { revenueChange: 15, cogsChange: -5, opexChange: -3, fxImpact: 5, newHeadcount: 2 },
  recession: { revenueChange: -35, cogsChange: 15, opexChange: 10, fxImpact: -20, newHeadcount: 0 },
};

function SliderRow({ label, value, min, max, step = 1, onChange, unit = '%' }: {
  label: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void; unit?: string;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-[#8891aa]">{label}</span>
        <span className={cn(
          'text-xs font-mono font-semibold px-2 py-0.5 rounded',
          value > 0 ? 'text-green-400 bg-green-500/10' : value < 0 ? 'text-red-400 bg-red-500/10' : 'text-[#8891aa] bg-[#2a2f45]'
        )}>
          {value > 0 ? '+' : ''}{value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-[#2a2f45]"
        style={{ accentColor: value > 0 ? '#22c55e' : value < 0 ? '#ef4444' : '#3b82f6' }}
      />
      <div className="flex justify-between text-[10px] text-[#3a4060] mt-0.5">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

function ResultRow({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: 'pos' | 'neg' | 'warn' }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#2a2f45] last:border-0">
      <span className="text-sm text-[#8891aa]">{label}</span>
      <div className="text-right">
        <span className={cn(
          'text-sm font-bold font-mono',
          highlight === 'pos' ? 'text-green-400' : highlight === 'neg' ? 'text-red-400' : highlight === 'warn' ? 'text-amber-400' : 'text-[#e8eaf0]'
        )}>{value}</span>
        {sub && <p className="text-[10px] text-[#5a6280]">{sub}</p>}
      </div>
    </div>
  );
}

export default function ScenariosPage() {
  const { activeCurrency, t, locale } = useAppStore();
  const [baseline, setBaseline] = useState<Baseline | null>(null);
  const [s, setS] = useState<Sliders>(PRESETS.base);

  useEffect(() => {
    getMetricsSummary().then(m => {
      const lm = m.latest_month as Record<string, number>;
      const kpi = m.kpi_snapshot as Record<string, number>;
      setBaseline({
        revenue: lm.revenue, cogs: lm.cogs, gross_profit: lm.gross_profit,
        gross_margin_pct: lm.gross_margin_pct, opex: lm.opex, ebit: lm.ebit,
        net_profit: lm.net_profit, cash_balance: kpi.current_balance_eur,
        monthly_burn: kpi.avg_monthly_burn_eur,
      });
    });
  }, []);

  function applyPreset(key: string) {
    setS(PRESETS[key]);
  }

  function update(key: keyof Sliders) {
    return (v: number) => setS(prev => ({ ...prev, [key]: v }));
  }

  const proj = baseline ? (() => {
    const headcostMonthly = (s.newHeadcount * 35000) / 12;
    const rev = baseline.revenue * (1 + s.revenueChange / 100);
    const cogs = baseline.cogs * (1 + s.cogsChange / 100);
    const fxAdj = rev * (s.fxImpact / 100);
    const adjustedRev = rev + fxAdj;
    const gp = adjustedRev - cogs;
    const gmPct = (gp / adjustedRev) * 100;
    const opex = baseline.opex * (1 + s.opexChange / 100) + headcostMonthly;
    const ebit = gp - opex;
    const ebitM = (ebit / adjustedRev) * 100;
    const netProfit = ebit * 0.75;
    const projBurn = cogs + opex;
    const runway = baseline.cash_balance / projBurn;
    const runwayDelta = runway - (baseline.cash_balance / baseline.monthly_burn);
    const canHire = runway >= 6 && netProfit > 0;
    return { rev: adjustedRev, gp, gmPct, opex, ebit, ebitM, netProfit, runway, runwayDelta, canHire };
  })() : null;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-bold text-[#e8eaf0]">{t.scenarios.title}</h2>
        <p className="text-sm text-[#5a6280]">{t.scenarios.subtitle}</p>
      </div>

      {/* Presets */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: 'base', label: t.scenarios.baseCase },
          { key: 'bear', label: t.scenarios.bearCase },
          { key: 'bull', label: t.scenarios.bullCase },
          { key: 'recession', label: t.scenarios.recession },
        ].map(p => (
          <button
            key={p.key}
            onClick={() => applyPreset(p.key)}
            className="px-4 py-1.5 text-xs font-medium rounded-md border border-[#2a2f45] bg-[#1e2130] text-[#8891aa] hover:border-[#3a4060] hover:text-[#e8eaf0] transition-all"
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={() => applyPreset('base')}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-md border border-[#2a2f45] bg-[#1e2130] text-[#5a6280] hover:text-[#e8eaf0] transition-all"
        >
          <RefreshCw className="w-3 h-3" />
          {t.scenarios.reset}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Sliders */}
        <div className="bg-[#1e2130] border border-[#2a2f45] rounded-lg p-5">
          <h3 className="text-sm font-semibold text-[#e8eaf0] mb-5">{t.scenarios.parameters}</h3>
          <SliderRow label={t.scenarios.revenueChange} value={s.revenueChange} min={-50} max={50} onChange={update('revenueChange')} />
          <SliderRow label={t.scenarios.cogsChange} value={s.cogsChange} min={-30} max={30} onChange={update('cogsChange')} />
          <SliderRow label={t.scenarios.opexChange} value={s.opexChange} min={-30} max={30} onChange={update('opexChange')} />
          <SliderRow label={t.scenarios.fxImpact} value={s.fxImpact} min={-20} max={20} onChange={update('fxImpact')} />
          <SliderRow label={t.scenarios.newHeadcount} value={s.newHeadcount} min={0} max={20} step={1} onChange={update('newHeadcount')} unit={" " + t.scenarios.people} />
          {s.newHeadcount > 0 && (
            <div className="bg-[#13161f] border border-[#2a2f45] rounded p-2 mt-2 text-xs text-[#8891aa]">
              {t.scenarios.additionalCost}: {formatCurrency(s.newHeadcount * 35000 / 12)}/{t.scenarios.month} ({formatCurrency(s.newHeadcount * 35000)}/{t.common.year.toLowerCase()})
            </div>
          )}
        </div>

        {/* Results */}
        <div className="bg-[#1e2130] border border-[#2a2f45] rounded-lg p-5">
          <h3 className="text-sm font-semibold text-[#e8eaf0] mb-5">{t.scenarios.outcomes}</h3>
          {!proj || !baseline ? (
            <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-10 animate-pulse bg-[#2a2f45] rounded" />)}</div>
          ) : (
            <>
              <ResultRow
                label={t.scenarios.projRevenue}
                value={formatCurrency(proj.rev)}
                sub={`${proj.rev > baseline.revenue ? '+' : ''}${formatCurrency(proj.rev - baseline.revenue)} ${t.scenarios.vsBase}`}
                highlight={proj.rev >= baseline.revenue ? 'pos' : 'neg'}
              />
              <ResultRow
                label={t.scenarios.projGrossMargin}
                value={formatPct(proj.gmPct)}
                sub={`${proj.gmPct > baseline.gross_margin_pct ? '+' : ''}${(proj.gmPct - baseline.gross_margin_pct).toFixed(1)}pp ${t.scenarios.vsBase}`}
                highlight={proj.gmPct >= 35 ? 'pos' : 'neg'}
              />
              <ResultRow
                label={t.scenarios.projEbit}
                value={formatCurrency(proj.ebit)}
                sub={formatPct(proj.ebitM) + ' ' + t.scenarios.margin}
                highlight={proj.ebit > 0 ? 'pos' : 'neg'}
              />
              <ResultRow
                label={t.scenarios.projNetProfit}
                value={formatCurrency(proj.netProfit)}
                highlight={proj.netProfit > 0 ? 'pos' : 'neg'}
              />
              <ResultRow
                label={t.scenarios.cashRunway}
                value={`${proj.runway.toFixed(1)} ${proj.runway === 1 ? t.scenarios.month : t.scenarios.months}`}
                sub={`${proj.runwayDelta >= 0 ? '+' : ''}${proj.runwayDelta.toFixed(1)}${locale === 'fr' ? ' mois' : 'mo'} ${t.scenarios.vsCurrent}`}
                highlight={proj.runway >= 6 ? 'pos' : proj.runway >= 3 ? 'warn' : 'neg'}
              />

              {/* Hire affordability */}
              <div className={cn(
                'mt-4 flex items-center gap-3 p-3 rounded-lg border',
                proj.canHire
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              )}>
                {proj.canHire
                  ? <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  : <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                }
                <div>
                  <p className={cn('text-sm font-semibold', proj.canHire ? 'text-green-400' : 'text-red-400')}>
                    {proj.canHire ? t.scenarios.canHire : t.scenarios.cashRisk}
                  </p>
                  <p className="text-xs text-[#8891aa]">
                    {proj.canHire
                      ? (locale === 'fr'
                          ? `L'autonomie de ${proj.runway.toFixed(1)} mois permet de maintenir le plan d'embauche.`
                          : `Runway of ${proj.runway.toFixed(1)}mo supports current headcount plan.`
                        )
                      : (locale === 'fr'
                          ? `L'autonomie de ${proj.runway.toFixed(1)} mois est inférieure au seuil de sécurité (6 mois).`
                          : `Runway of ${proj.runway.toFixed(1)}mo is below safe threshold (6mo).`
                        )
                    }
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
