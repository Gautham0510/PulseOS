'use client';

import { useState } from 'react';
import { Download, FileText, TrendingUp, ChartBar as FileBarChart, CircleCheck as CheckCircle, Loader as Loader2 } from 'lucide-react';
import { getMetricsSummary, getMonthlyCashflow, getInvoiceAging, getClientRiskScores } from '@/lib/api';
import { useAppStore } from '@/lib/store';

type ReportStatus = 'idle' | 'generating' | 'done';

function ReportCard({
  icon: Icon, title, description, lastGenerated, onGenerate, status
}: {
  icon: React.ElementType; title: string; description: string;
  lastGenerated: string; onGenerate: () => void; status: ReportStatus;
}) {
  const { t } = useAppStore();
  return (
    <div className="bg-[#1e2130] border border-[#2a2f45] rounded-lg p-5 hover:border-[#3a4060] transition-all">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-600/30 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#e8eaf0]">{title}</h3>
          <p className="text-xs text-[#5a6280] mt-0.5">{description}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-[#3a4060]">
          {status === 'done' ? t.reports.generatedNow : lastGenerated}
        </p>
        <button
          onClick={onGenerate}
          disabled={status === 'generating'}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-md transition-colors"
        >
          {status === 'generating' ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" />{t.reports.generating}</>
          ) : status === 'done' ? (
            <><CheckCircle className="w-3.5 h-3.5" />{t.reports.download}</>
          ) : (
            <><Download className="w-3.5 h-3.5" />{t.reports.generate}</>
          )}
        </button>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { t } = useAppStore();
  const [statuses, setStatuses] = useState<Record<string, ReportStatus>>({
    health: 'idle', aging: 'idle', cashflow: 'idle',
  });

  function setStatus(key: string, v: ReportStatus) {
    setStatuses(p => ({ ...p, [key]: v }));
  }

  async function generateHealthReport() {
    setStatus('health', 'generating');
    const data = await getMetricsSummary();
    await new Promise(r => setTimeout(r, 1200));
    const content = JSON.stringify({ report: 'Financial Health Summary', generated: new Date().toISOString(), data }, null, 2);
    triggerDownload(content, 'financial-health-summary.json');
    setStatus('health', 'done');
  }

  async function generateAgingReport() {
    setStatus('aging', 'generating');
    const [aging, clients] = await Promise.all([getInvoiceAging(), getClientRiskScores()]);
    await new Promise(r => setTimeout(r, 1000));
    const content = JSON.stringify({ report: 'Invoice Aging Report', generated: new Date().toISOString(), aging, clients }, null, 2);
    triggerDownload(content, 'invoice-aging-report.json');
    setStatus('aging', 'done');
  }

  async function generateCashflowReport() {
    setStatus('cashflow', 'generating');
    const data = await getMonthlyCashflow();
    await new Promise(r => setTimeout(r, 900));
    const last12 = data.slice(-12);
    const content = JSON.stringify({ report: 'Cash Flow Statement', generated: new Date().toISOString(), period: '12-month rolling', data: last12 }, null, 2);
    triggerDownload(content, 'cashflow-statement.json');
    setStatus('cashflow', 'done');
  }

  function triggerDownload(content: string, filename: string) {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-bold text-[#e8eaf0]">{t.reports.title}</h2>
        <p className="text-sm text-[#5a6280]">{t.reports.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        <ReportCard
          icon={FileText}
          title={t.reports.healthTitle}
          description={t.reports.healthDesc}
          lastGenerated={t.reports.lastGenerated}
          onGenerate={generateHealthReport}
          status={statuses.health}
        />
        <ReportCard
          icon={FileBarChart}
          title={t.reports.agingTitle}
          description={t.reports.agingDesc}
          lastGenerated={t.reports.lastGenerated}
          onGenerate={generateAgingReport}
          status={statuses.aging}
        />
        <ReportCard
          icon={TrendingUp}
          title={t.reports.cashflowTitle}
          description={t.reports.cashflowDesc}
          lastGenerated={t.reports.lastGenerated}
          onGenerate={generateCashflowReport}
          status={statuses.cashflow}
        />
      </div>

      {/* Info box */}
      <div className="bg-[#1e2130] border border-[#2a2f45] rounded-lg p-4">
        <p className="text-xs font-semibold text-[#5a6280] uppercase tracking-wider mb-2">{t.reports.note}</p>
        <p className="text-sm text-[#8891aa]">
          {t.reports.noteText}
        </p>
      </div>
    </div>
  );
}
