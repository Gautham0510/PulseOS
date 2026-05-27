'use client';

import { useEffect, useState } from 'react';
import AlertBanner from '@/components/dashboard/AlertBanner';
import KPITiles from '@/components/dashboard/KPITiles';
import CashFlowChart from '@/components/dashboard/CashFlowChart';
import BudgetVsActual from '@/components/dashboard/BudgetVsActual';
import MarginTrend from '@/components/dashboard/MarginTrend';
import AgingDonut from '@/components/dashboard/AgingDonut';
import ClientConcentration from '@/components/dashboard/ClientConcentration';
import { ChartSkeleton, CardSkeleton } from '@/components/shared/LoadingSkeleton';
import { useAppStore } from '@/lib/store';
import {
  getMetricsSummary, getMonthlyCashflow, getBudgetVsActual,
  getPlWithMetrics, getInvoiceAging, getClientRiskScores
} from '@/lib/api';

function parseNum(v: string | undefined) {
  return parseFloat(v ?? '0') || 0;
}

export default function Dashboard() {
  const { activeCurrency } = useAppStore();
  const [metrics, setMetrics] = useState<Record<string, unknown> | null>(null);
  const [cashflow, setCashflow] = useState<Record<string, string>[] | null>(null);
  const [budget, setBudget] = useState<Record<string, string>[] | null>(null);
  const [pl, setPl] = useState<Record<string, string>[] | null>(null);
  const [aging, setAging] = useState<Record<string, string>[] | null>(null);
  const [clients, setClients] = useState<Record<string, string>[] | null>(null);

  useEffect(() => {
    Promise.all([
      getMetricsSummary(),
      getMonthlyCashflow(),
      getBudgetVsActual(),
      getPlWithMetrics(),
      getInvoiceAging(),
      getClientRiskScores(),
    ]).then(([m, c, b, p, a, cl]) => {
      setMetrics(m);
      setCashflow(c);
      setBudget(b);
      setPl(p);
      setAging(a);
      setClients(cl);
    });
  }, []);

  const loading = !metrics || !cashflow || !budget || !pl || !aging || !clients;
  const kpi = metrics ? (metrics.kpi_snapshot as Record<string, unknown>) : null;
  const alerts = metrics ? (metrics.alerts as Array<{ id: string; severity: string; message: string; category: string }>) : [];

  const cashflowParsed = cashflow?.map(r => ({
    year_month: r.year_month,
    total_inflow: parseNum(r.total_inflow),
    total_outflow: parseNum(r.total_outflow),
    net_cashflow: parseNum(r.net_cashflow),
  })) ?? [];

  const budgetParsed = budget?.map(r => ({
    year_month: r.year_month,
    actual_revenue: parseNum(r.actual_revenue),
    budget_revenue: parseNum(r.budget_revenue),
    variance_pct: parseNum(r.variance_pct),
  })) ?? [];

  const plParsed = pl?.map(r => ({
    year_month: r.year_month,
    gross_margin_pct: parseNum(r.gross_margin_pct),
    gross_margin_3m_avg: parseNum(r.gross_margin_3m_avg),
    ebit_anomaly_flag: r.ebit_anomaly_flag === 'true',
  })) ?? [];

  const agingParsed = aging?.map(r => ({
    client_name: r.client_name,
    paid: parseNum(r.paid),
    bucket_1_30: parseNum(r.bucket_1_30),
    bucket_31_60: parseNum(r.bucket_31_60),
    bucket_61_90: parseNum(r.bucket_61_90),
    bucket_90_plus: parseNum(r.bucket_90_plus),
    total_ar: parseNum(r.total_ar),
  })) ?? [];

  const clientsParsed = clients?.map(r => ({
    client_name: r.client_name,
    total_ar: parseNum(r.total_ar),
    risk_rating: r.risk_rating,
    risk_pct: parseNum(r.concentration_pct),
  })) ?? [];

  return (
    <div>
      {alerts.length > 0 && (
        <AlertBanner alerts={alerts as Array<{ id: string; severity: 'CRITICAL' | 'HIGH' | 'MEDIUM'; message: string; category: string }>} />
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <KPITiles kpi={{
          current_balance_eur: kpi!.current_balance_eur as number,
          cash_runway_months: kpi!.cash_runway_months as number,
          avg_monthly_burn_eur: kpi!.avg_monthly_burn_eur as number,
          dso_days: kpi!.dso_days as number,
          hhi_score: kpi!.hhi_score as number,
          hhi_flag: kpi!.hhi_flag as boolean,
          anomalies_flagged: kpi!.anomalies_flagged as number,
        }} />
      )}

      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-12 xl:col-span-7">
          {loading ? <ChartSkeleton className="h-[290px]" /> : <CashFlowChart data={cashflowParsed} />}
        </div>
        <div className="col-span-12 xl:col-span-5">
          {loading ? <ChartSkeleton className="h-[290px]" /> : <BudgetVsActual data={budgetParsed} />}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-5">
          {loading ? <ChartSkeleton className="h-[270px]" /> : <MarginTrend data={plParsed} />}
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          {loading ? <ChartSkeleton className="h-[270px]" /> : <AgingDonut data={agingParsed} />}
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-4">
          {loading ? <ChartSkeleton className="h-[270px]" /> : <ClientConcentration data={clientsParsed} />}
        </div>
      </div>
    </div>
  );
}
