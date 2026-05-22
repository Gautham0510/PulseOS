'use client';

import { useEffect, useState } from 'react';
import { TriangleAlert as AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getInvoiceAging, getClientRiskScores, getAnomalyLog } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/formatters';
import DataTable, { Column } from '@/components/shared/DataTable';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

function parseNum(v: string | undefined) { return parseFloat(v ?? '0') || 0; }

type AgingRow = {
  client_name: string; paid: number; bucket_1_30: number; bucket_31_60: number;
  bucket_61_90: number; bucket_90_plus: number; total_ar: number; risk_rating: string; overdue_invoices: number;
};

type ClientRow = {
  client_name: string; total_ar: number; risk_rating: string; risk_score: number;
  overdue_days_max: number; payment_history_score: number; concentration_pct: number;
};

type AnomalyRow = {
  date: string; transaction_id: string; description: string;
  amount: number; category: string; flag_type: string;
};

export default function InvoicesPage() {
  const { activeCurrency, t, locale } = useAppStore();
  const [aging, setAging] = useState<AgingRow[] | null>(null);
  const [clients, setClients] = useState<ClientRow[] | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyRow[] | null>(null);

  const riskBadge = (r: string) => {
    const cfg: Record<string, string> = {
      CRITICAL: 'bg-red-500/20 text-red-400 border border-red-500/30',
      HIGH: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
      MEDIUM: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      LOW: 'bg-green-500/20 text-green-400 border border-green-500/30',
    };
    const labelMap: Record<string, string> = {
      CRITICAL: t.kpi.critical,
      HIGH: t.kpi.high,
      MEDIUM: t.kpi.medium,
      LOW: t.kpi.low,
    };
    return <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase', cfg[r] || '')}>{labelMap[r] || r}</span>;
  };

  const agingColumns: Column<AgingRow>[] = [
    { key: 'client_name', label: t.invoices.client, sortable: true },
    { key: 'paid', label: t.invoices.paid, sortable: true, render: v => <span className="font-mono text-green-400">{formatCurrency(Number(v))}</span> },
    { key: 'bucket_1_30', label: t.invoices.bucket1_30, sortable: true, render: v => Number(v) > 0 ? <span className="font-mono text-yellow-400">{formatCurrency(Number(v))}</span> : <span className="text-[#5a6280]">—</span> },
    { key: 'bucket_31_60', label: t.invoices.bucket31_60, sortable: true, render: v => Number(v) > 0 ? <span className="font-mono text-orange-400">{formatCurrency(Number(v))}</span> : <span className="text-[#5a6280]">—</span> },
    { key: 'bucket_61_90', label: t.invoices.bucket61_90, sortable: true, render: v => Number(v) > 0 ? <span className="font-mono text-red-400">{formatCurrency(Number(v))}</span> : <span className="text-[#5a6280]">—</span> },
    { key: 'bucket_90_plus', label: t.invoices.bucket90_plus, sortable: true, render: v => Number(v) > 0 ? <span className="font-mono font-bold text-red-500">{formatCurrency(Number(v))}</span> : <span className="text-[#5a6280]">—</span> },
    { key: 'total_ar', label: t.invoices.totalAR, sortable: true, render: v => <span className="font-mono font-semibold">{formatCurrency(Number(v))}</span> },
    { key: 'risk_rating', label: t.invoices.risk, render: v => riskBadge(String(v)) },
  ];

  const anomalyColumns: Column<AnomalyRow>[] = [
    { key: 'date', label: t.invoices.date, render: v => formatDate(String(v)) },
    { key: 'transaction_id', label: t.invoices.txnId, render: v => <span className="font-mono text-[11px] text-[#8891aa]">{String(v)}</span> },
    { key: 'description', label: t.invoices.description, className: 'max-w-[260px]' },
    { key: 'amount', label: t.invoices.amount, render: v => <span className="font-mono">{formatCurrency(Number(v))}</span> },
    { key: 'category', label: t.invoices.category },
    {
      key: 'flag_type', label: t.invoices.flag, render: v => {
        const isAnomaly = String(v) === 'ANOMALY';
        const flagLabel = isAnomaly
          ? (locale === 'fr' ? 'ANOMALIE' : 'ANOMALY')
          : (locale === 'fr' ? 'AVERTISSEMENT' : 'WARNING');
        return (
          <span className={cn(
            'text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase',
            isAnomaly ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          )}>{flagLabel}</span>
        );
      }
    },
  ];

  useEffect(() => {
    Promise.all([getInvoiceAging(), getClientRiskScores(), getAnomalyLog()]).then(([a, c, an]) => {
      setAging(a.map(r => ({
        client_name: r.client_name, paid: parseNum(r.paid),
        bucket_1_30: parseNum(r.bucket_1_30), bucket_31_60: parseNum(r.bucket_31_60),
        bucket_61_90: parseNum(r.bucket_61_90), bucket_90_plus: parseNum(r.bucket_90_plus),
        total_ar: parseNum(r.total_ar), risk_rating: r.risk_rating, overdue_invoices: parseNum(r.overdue_invoices),
      })));
      setClients(c.map(r => ({
        client_name: r.client_name, total_ar: parseNum(r.total_ar), risk_rating: r.risk_rating,
        risk_score: parseNum(r.risk_score), overdue_days_max: parseNum(r.overdue_days_max),
        payment_history_score: parseNum(r.payment_history_score), concentration_pct: parseNum(r.concentration_pct),
      })));
      setAnomalies(an.map(r => ({
        date: r.date, transaction_id: r.transaction_id, description: r.description,
        amount: parseNum(r.amount), category: r.category, flag_type: r.flag_type,
      })));
    });
  }, []);

  const hhiFlagged = aging?.some(r => r.risk_rating === 'CRITICAL');

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-bold text-[#e8eaf0]">{t.invoices.title}</h2>
        <p className="text-sm text-[#5a6280]">{t.invoices.subtitle}</p>
      </div>

      {hhiFlagged && (
        <div className="flex items-center gap-2 px-4 py-3 mb-4 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span><strong>{t.invoices.hciWarning}:</strong> {t.invoices.hciDetail}</span>
        </div>
      )}

      <Tabs defaultValue="aging" className="space-y-4">
        <TabsList className="bg-[#1e2130] border border-[#2a2f45] p-1">
          <TabsTrigger value="aging" className="data-[state=active]:bg-[#2a2f45] data-[state=active]:text-white text-[#8891aa]">{t.invoices.tabAging}</TabsTrigger>
          <TabsTrigger value="risk" className="data-[state=active]:bg-[#2a2f45] data-[state=active]:text-white text-[#8891aa]">{t.invoices.tabRisk}</TabsTrigger>
          <TabsTrigger value="anomalies" className="data-[state=active]:bg-[#2a2f45] data-[state=active]:text-white text-[#8891aa]">{t.invoices.tabAnomalies}</TabsTrigger>
        </TabsList>

        <TabsContent value="aging">
          {!aging ? <TableSkeleton /> : (
            <div className="bg-[#1e2130] border border-[#2a2f45] rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[#2a2f45]">
                <h3 className="text-sm font-semibold text-[#e8eaf0]">{t.invoices.tableTitle}</h3>
              </div>
              <DataTable
                columns={agingColumns}
                data={aging}
                rowClassName={r => r.risk_rating === 'CRITICAL' ? 'bg-red-500/5 border-l-2 border-l-red-500' : ''}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="risk">
          {!clients ? <TableSkeleton /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {[...clients].sort((a, b) => b.risk_score - a.risk_score).map(client => (
                <div key={client.client_name} className={cn(
                  'bg-[#1e2130] border rounded-lg p-4 transition-all hover:border-[#3a4060]',
                  client.risk_rating === 'CRITICAL' ? 'border-red-500/40' : 'border-[#2a2f45]'
                )}>
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-sm font-semibold text-[#e8eaf0] leading-tight">{client.client_name}</p>
                    {riskBadge(client.risk_rating)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#5a6280]">{t.invoices.totalAR}</span>
                      <span className="font-mono text-[#e8eaf0] font-semibold">{formatCurrency(client.total_ar)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#5a6280]">{t.invoices.concentration}</span>
                      <span className="text-[#e8eaf0]">{client.concentration_pct.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#5a6280]">{t.invoices.maxOverdue}</span>
                      <span className={client.overdue_days_max > 60 ? 'text-red-400' : 'text-[#e8eaf0]'}>{client.overdue_days_max}{locale === 'fr' ? 'j' : 'd'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#5a6280]">{t.invoices.payHistory}</span>
                      <div className="flex items-center gap-1">
                        <div className="w-16 h-1.5 bg-[#2a2f45] rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-blue-500" style={{ width: `${client.payment_history_score}%` }} />
                        </div>
                        <span className="text-[#8891aa]">{client.payment_history_score}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="anomalies">
          {!anomalies ? <TableSkeleton /> : (
            <div className="bg-[#1e2130] border border-[#2a2f45] rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[#2a2f45] flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#e8eaf0]">{t.invoices.anomalyLogTitle}</h3>
                <span className="text-xs text-[#5a6280]">{anomalies.filter(a => a.flag_type === 'ANOMALY').length} {t.invoices.anomalyCount}</span>
              </div>
              <DataTable
                columns={anomalyColumns}
                data={anomalies}
                rowClassName={r => r.flag_type === 'ANOMALY' ? 'bg-red-500/5' : ''}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
