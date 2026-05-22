import { parseCsv, formatCurrency } from './formatters';
import { useAppStore } from './store';

const BASE = '/data';

async function fetchJson(path: string) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
  return res.json();
}

async function fetchCsv(path: string): Promise<Record<string, string>[]> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
  const text = await res.text();
  return parseCsv(text);
}

export async function getMetricsSummary() {
  return fetchJson(`${BASE}/metrics_summary.json`);
}

export async function getMonthlyCashflow() {
  return fetchCsv(`${BASE}/monthly_cashflow.csv`);
}

export async function getInvoiceAging() {
  return fetchCsv(`${BASE}/invoice_aging_report.csv`);
}

export async function getClientRiskScores() {
  return fetchCsv(`${BASE}/client_risk_scores.csv`);
}

export async function getFxAnalysis() {
  return fetchCsv(`${BASE}/fx_analysis.csv`);
}

export async function getBudgetVsActual() {
  return fetchCsv(`${BASE}/budget_vs_actual.csv`);
}

export async function getPlWithMetrics() {
  return fetchCsv(`${BASE}/pl_with_metrics.csv`);
}

export async function getAnomalyLog() {
  return fetchCsv(`${BASE}/anomaly_log.csv`);
}

export function getMockAiResponse(message: string, metrics?: Record<string, unknown>): string {
  const state = useAppStore.getState();
  const locale = state.locale || 'en';
  
  const lower = message.toLowerCase();
  const runway = metrics?.cash_runway_months ?? 3.8;
  const margin = metrics?.gross_margin_pct ?? 38.4;

  const runwayKeywords = ['runway', 'autonomie', 'trésorerie', 'dépens'];
  const marginKeywords = ['margin', 'marge', 'brute'];
  const hireKeywords = ['hire', 'headcount', 'people', 'embauch', 'recrut', 'personne'];
  const overdueKeywords = ['overdue', 'invoice', 'facture', 'retard'];
  const fxKeywords = ['fx', 'currency', 'devise', 'change', 'taux'];

  const hasKeyword = (keywords: string[]) => keywords.some(k => lower.includes(k));

  if (locale === 'fr') {
    if (hasKeyword(runwayKeywords)) {
      return `Sur la base des données actuelles, votre autonomie de trésorerie est de **${runway} mois** au rythme de dépenses actuel de ${formatCurrency(326000)}/mois. Avec un solde courant de ${formatCurrency(1240000)}, vous devriez prioriser le recouvrement des créances des clients en retard — en particulier Meridian Tech GmbH (${formatCurrency(142000)}, en retard de 97 jours). Le recouvrement de ces seuls fonds prolongerait l'autonomie d'environ 0,4 mois.`;
    }
    if (hasKeyword(marginKeywords)) {
      return `La marge brute est actuellement de **${margin}%**, ce qui se situe dans votre fourchette historique de 36–39%. La moyenne mobile sur 3 mois est de 37,2%. Notez que le COGS a bondi de 8,2% MoM en octobre — cela est signalé comme une anomalie et justifie un examen de vos contrats de fournisseurs de matières premières avant la fin de l'année.`;
    }
    if (hasKeyword(hireKeywords)) {
      return `Avec une autonomie de trésorerie actuelle de **${runway} mois** et des dépenses de ${formatCurrency(326000)}/mois, chaque recrutement supplémentaire ajoute environ ${formatCurrency(35000)}/an (${formatCurrency(2917)}/mois) aux coûts fixes. Embaucher 2 personnes réduirait votre autonomie d'environ **0,2 mois**. Compte tenu de la trajectoire actuelle, c'est faisable mais serré — je recommanderais de sécuriser d'abord la créance de Meridian Tech pour créer une marge de sécurité.`;
    }
    if (hasKeyword(overdueKeywords)) {
      return `Vous avez **3 clients** avec des factures en retard :\n- **Meridian Tech GmbH** : ${formatCurrency(142000)}, 90 jours et + (CRITIQUE)\n- **Vanguard Logistics** : ${formatCurrency(43000)}, 31–90 jours (ÉLEVÉ)\n- **Kronos Chemicals** : ${formatCurrency(14000)}, 31–90 jours (ÉLEVÉ)\n\nLe total des créances en retard dépasse le seuil de 60 jours : **${formatCurrency(199000)}**. Le DSO est actuellement de 67 jours, au-dessus du seuil d'alerte orange de 60 jours.`;
    }
    if (hasKeyword(fxKeywords)) {
      return `L'impact FX en octobre était de **${formatCurrency(-38400)}**, entraîné par la dépréciation de l'EUR/INR (85,2 contre 88,2 il y a un an). L'impact FX cumulé pour 2025 est de **${formatCurrency(-7500)}**, un net retournement par rapport au gain de ${formatCurrency(293000)} enregistré fin 2024. Les revenus en INR représentent environ 18% du chiffre d'affaires total — envisagez des instruments de couverture FX pour réduire cette exposition.`;
    }
    return `Je peux voir vos données financières pour Arcturus Manufacturing GmbH. Vos indicateurs clés : autonomie de trésorerie **${runway} mois**, marge brute **${margin}%**, DSO **67 jours**. Posez-moi des questions sur les flux de trésorerie, les marges, les factures, l'exposition FX ou la capacité d'embauche.`;
  } else {
    if (hasKeyword(runwayKeywords)) {
      return `Based on current data, your cash runway is **${runway} months** at the current burn rate of ${formatCurrency(326000)}/month. With the running balance at ${formatCurrency(1240000)}, you should prioritize AR collection from overdue clients — particularly Meridian Tech GmbH (${formatCurrency(142000)}, 97 days overdue). Recovering those funds alone would extend runway by approximately 0.4 months.`;
    }
    if (hasKeyword(marginKeywords)) {
      return `Gross margin is currently **${margin}%**, which is within your historical range of 36–39%. The 3-month rolling average is 37.2%. Note that COGS spiked 8.2% MoM in October — this is flagged as an anomaly and warrants a review of your raw material supplier contracts before year-end.`;
    }
    if (hasKeyword(hireKeywords)) {
      return `With a current runway of **${runway} months** and a burn rate of ${formatCurrency(326000)}/month, each additional hire adds ~${formatCurrency(35000)}/year (${formatCurrency(2917)}/month) to fixed costs. Hiring 2 people would reduce your runway by approximately **0.2 months**. Given the current trajectory, this is feasible but tight — I'd recommend securing the Meridian Tech AR first to create a buffer.`;
    }
    if (hasKeyword(overdueKeywords)) {
      return `You have **3 clients** with overdue invoices:\n- **Meridian Tech GmbH**: ${formatCurrency(142000)}, 90+ days (CRITICAL)\n- **Vanguard Logistics**: ${formatCurrency(43000)}, 31–90 days (HIGH)\n- **Kronos Chemicals**: ${formatCurrency(14000)}, 31–90 days (HIGH)\n\nTotal overdue AR exceeds the 60-day threshold: **${formatCurrency(199000)}**. DSO is currently 67 days, above the 60-day amber threshold.`;
    }
    if (hasKeyword(fxKeywords)) {
      return `FX impact in October was **${formatCurrency(-38400)}**, driven by EUR/INR depreciation (85.2 vs 88.2 a year ago). Cumulative FX impact for 2025 is **${formatCurrency(-7500)}**, a sharp reversal from the ${formatCurrency(293000)} gain recorded through end-2024. INR revenues represent ~18% of total revenue — consider FX hedging instruments to reduce this exposure.`;
    }
    return `I can see your financial data for Arcturus Manufacturing GmbH. Your key metrics: cash runway **${runway}mo**, gross margin **${margin}%**, DSO **67 days**. Ask me about cash flow, margins, invoices, FX exposure, or hiring capacity.`;
  }
}
