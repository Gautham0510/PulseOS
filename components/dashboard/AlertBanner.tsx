'use client';

import { useState } from 'react';
import { TriangleAlert as AlertTriangle, CircleAlert as AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { formatCurrency } from '@/lib/formatters';

interface Alert {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  message: string;
  category: string;
}

const severityConfig = {
  CRITICAL: { color: 'border-red-500/40 bg-red-500/10 text-red-300', icon: AlertCircle, dot: 'bg-red-500' },
  HIGH: { color: 'border-amber-500/40 bg-amber-500/10 text-amber-300', icon: AlertTriangle, dot: 'bg-amber-500' },
  MEDIUM: { color: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300', icon: Info, dot: 'bg-yellow-500' },
};

export default function AlertBanner({ alerts }: { alerts: Alert[] }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const { activeCurrency, locale } = useAppStore();

  const formattedAlerts = alerts.map(alert => {
    let msg = alert.message;
    if (alert.message.includes('Cash balance is negative')) {
      const formatted = formatCurrency(-6097929.95, activeCurrency);
      msg = locale === 'fr'
        ? `Le solde de trésorerie est négatif (${formatted}). L'entreprise est en déficit.`
        : `Cash balance is negative (${formatted}). Business is in deficit.`;
    } else if (alert.message.includes('Cash runway is negative')) {
      msg = locale === 'fr'
        ? `L'autonomie de trésorerie est négative (-11,5 mois). Action immédiate requise.`
        : `Cash runway is negative (-11.5 months). Immediate action required.`;
    } else if (alert.message.includes('DSO at 75.1 days')) {
      msg = locale === 'fr'
        ? `Le DSO de 75,1 jours dépasse le seuil orange de 60 jours. Retard de recouvrement AR.`
        : `DSO at 75.1 days exceeds 60-day amber threshold. AR collection lagging.`;
    } else if (alert.message.includes('HHI score 2598.9')) {
      msg = locale === 'fr'
        ? `Le score HHI de 2598,9 signale un risque élevé de concentration de clients.`
        : `HHI score 2598.9 signals high client concentration risk.`;
    } else if (alert.message.includes('anomalies flagged')) {
      msg = locale === 'fr'
        ? `3 anomalies signalées dans le journal des transactions nécessitant un examen.`
        : `3 anomalies flagged in transaction log requiring review.`;
    }
    return { ...alert, message: msg };
  });

  const visible = formattedAlerts.filter(a => !dismissed.has(a.id));
  if (visible.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
      {visible.map(alert => {
        const cfg = severityConfig[alert.severity];
        const Icon = cfg.icon;
        return (
          <div
            key={alert.id}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg border text-xs whitespace-nowrap flex-shrink-0',
              cfg.color
            )}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', cfg.dot)} />
            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="font-medium mr-1">{alert.severity}</span>
            <span className="opacity-80">{alert.message}</span>
            <button
              onClick={() => setDismissed(s => { const n = new Set(Array.from(s)); n.add(alert.id); return n; })}
              className="ml-1 opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
