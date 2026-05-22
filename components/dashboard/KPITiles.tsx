'use client';

import { formatCurrency } from '@/lib/formatters';
import MetricCard from '@/components/shared/MetricCard';
import { useAppStore } from '@/lib/store';

interface KPISnapshot {
  current_balance_eur: number;
  cash_runway_months: number;
  avg_monthly_burn_eur: number;
  dso_days: number;
  hhi_score: number;
  hhi_flag: boolean;
  anomalies_flagged: number;
}

export default function KPITiles({ kpi }: { kpi: KPISnapshot }) {
  const { t, locale } = useAppStore();
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
      <MetricCard
        label={t.kpi.currentBalance}
        value={formatCurrency(kpi.current_balance_eur)}
        trend="down"
        trendValue={`${formatCurrency(-330000)} ${locale === 'fr' ? 'M/M' : 'MoM'}`}
      />
      <MetricCard
        label={t.kpi.cashRunway}
        value={`${kpi.cash_runway_months}mo`}
        badge={kpi.cash_runway_months < 3 ? t.kpi.critical : kpi.cash_runway_months < 5 ? t.kpi.low : undefined}
        badgeColor={kpi.cash_runway_months < 3 ? 'red' : 'amber'}
        subtext={t.kpi.atCurrentBurn}
        trend="down"
        trendValue="-0.3mo"
      />
      <MetricCard
        label={t.kpi.monthlyBurn}
        value={formatCurrency(kpi.avg_monthly_burn_eur)}
        trend="up"
        trendValue="+8.2%"
        subtext={t.kpi.avg3m}
      />
      <MetricCard
        label={t.kpi.dso}
        value={`${kpi.dso_days}d`}
        badge={kpi.dso_days > 60 ? t.kpi.high : undefined}
        badgeColor="amber"
        trend="up"
        trendValue={locale === 'fr' ? '+4j M/M' : '+4d MoM'}
      />
      <MetricCard
        label={t.kpi.hhiScore}
        value={kpi.hhi_score.toFixed(2)}
        badge={kpi.hhi_flag ? t.kpi.highRisk : t.kpi.lowRisk}
        badgeColor={kpi.hhi_flag ? 'red' : 'green'}
        subtext={t.kpi.concentration}
      />
      <MetricCard
        label={t.kpi.anomalies}
        value={String(kpi.anomalies_flagged)}
        alertDot={kpi.anomalies_flagged > 0}
        badge={kpi.anomalies_flagged > 0 ? t.kpi.flagged : undefined}
        badgeColor="red"
        subtext={t.kpi.thisPeriod}
      />
    </div>
  );
}
