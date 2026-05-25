import { parseCsv, formatCurrency } from './formatters';
import { useAppStore } from './store';

const BASE = '/data';

const activeRequests = new Map<string, Promise<any>>();

async function fetchJson(path: string): Promise<any> {
  if (activeRequests.has(path)) {
    return activeRequests.get(path);
  }
  const promise = (async () => {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to fetch ${path}`);
    return res.json();
  })();
  activeRequests.set(path, promise);
  try {
    return await promise;
  } finally {
    activeRequests.delete(path);
  }
}

async function fetchCsv(path: string): Promise<Record<string, string>[]> {
  if (activeRequests.has(path)) {
    return activeRequests.get(path);
  }
  const promise = (async () => {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to fetch ${path}`);
    const text = await res.text();
    return parseCsv(text);
  })();
  activeRequests.set(path, promise);
  try {
    return await promise;
  } finally {
    activeRequests.delete(path);
  }
}

// Convert all values in an object or array to strings to match CSV parser output
function stringifyFields(data: any): any {
  if (Array.isArray(data)) {
    return data.map(stringifyFields);
  }
  if (data !== null && typeof data === 'object') {
    return Object.fromEntries(
      Object.entries(data).map(([k, v]) => [
        k,
        v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v)
      ])
    );
  }
  return String(data);
}

// Pivot the raw aging report data by client
function pivotAgingData(rows: any[]): any[] {
  const clientsMap: Record<string, any> = {};

  for (const row of rows) {
    const client = row.client_supplier || row.client_name || '';
    if (!client) continue;

    if (!clientsMap[client]) {
      clientsMap[client] = {
        client_name: client,
        paid: 0,
        bucket_1_30: 0,
        bucket_31_60: 0,
        bucket_61_90: 0,
        bucket_90_plus: 0,
        total_ar: 0,
        overdue_invoices: 0,
        risk_rating: 'LOW'
      };
    }

    const bucket = row.aging_bucket || '';
    const count = parseInt(row.invoice_count || '0') || 0;
    const amount = parseFloat(row.total_amount || '0') || 0;

    if (bucket === 'Paid') {
      clientsMap[client].paid = amount;
    } else {
      clientsMap[client].overdue_invoices += count;

      if (bucket === '1-30 days') {
        clientsMap[client].bucket_1_30 = amount;
      } else if (bucket === '31-60 days') {
        clientsMap[client].bucket_31_60 = amount;
      } else if (bucket === '61-90 days') {
        clientsMap[client].bucket_61_90 = amount;
      } else if (bucket === '90+ days') {
        clientsMap[client].bucket_90_plus = amount;
      }
    }
  }

  // Calculate total_ar for each client
  for (const client of Object.values(clientsMap)) {
    client.total_ar = client.paid + client.bucket_1_30 + client.bucket_31_60 + client.bucket_61_90 + client.bucket_90_plus;
  }

  return Object.values(clientsMap);
}

export async function getMetricsSummary(): Promise<any> {
  return fetchJson(`${BASE}/metrics_summary.json`);
}

export async function getMonthlyCashflow(): Promise<Record<string, string>[]> {
  return fetchCsv(`${BASE}/monthly_cashflow.csv`);
}

export async function getInvoiceAging(): Promise<Record<string, string>[]> {
  const agingRows = await fetchCsv(`${BASE}/invoice_aging_report.csv`);
  const pivoted = pivotAgingData(agingRows);

  let riskRows: any[] = [];
  try {
    riskRows = await fetchCsv(`${BASE}/client_risk_scores.csv`);
  } catch (e) {
    console.error('Failed to load risk ratings for aging report join', e);
  }

  const riskMap = Object.fromEntries(
    riskRows.map(r => [r.client_supplier || r.client_name || '', (r.risk_rating || 'LOW').toUpperCase()])
  );

  return pivoted.map(item => ({
    client_name: item.client_name,
    paid: String(item.paid),
    bucket_1_30: String(item.bucket_1_30),
    bucket_31_60: String(item.bucket_31_60),
    bucket_61_90: String(item.bucket_61_90),
    bucket_90_plus: String(item.bucket_90_plus),
    total_ar: String(item.total_ar),
    risk_rating: riskMap[item.client_name] || 'LOW',
    overdue_invoices: String(item.overdue_invoices)
  })) as Record<string, string>[];
}

export async function getClientRiskScores(): Promise<Record<string, string>[]> {
  const riskRows = await fetchCsv(`${BASE}/client_risk_scores.csv`);
  const agingRows = await fetchCsv(`${BASE}/invoice_aging_report.csv`);

  const pivotedAging = pivotAgingData(agingRows);
  const agingMap = Object.fromEntries(pivotedAging.map(a => [a.client_name, a]));

  return riskRows.map(row => {
    const name = row.client_supplier || row.client_name || '';
    const total_ar = parseFloat(row.total_ar || '0') || 0;
    const total_risk_score = parseFloat(row.total_risk_score || '0') || 0;
    const risk_pct = parseFloat(row.risk_pct || '0') || 0;
    const risk_rating = (row.risk_rating || 'LOW').toUpperCase();

    const pivoted = agingMap[name] || { paid: 0, bucket_1_30: 0, bucket_31_60: 0, bucket_61_90: 0, bucket_90_plus: 0 };
    
    const payment_history_score = total_ar > 0 
      ? Math.min(100, Math.round((pivoted.paid / total_ar) * 100)) 
      : 100;

    let overdue_days_max = 0;
    if (pivoted.bucket_90_plus > 0) overdue_days_max = 97;
    else if (pivoted.bucket_61_90 > 0) overdue_days_max = 75;
    else if (pivoted.bucket_31_60 > 0) overdue_days_max = 45;
    else if (pivoted.bucket_1_30 > 0) overdue_days_max = 15;

    return {
      client_name: name,
      total_ar: String(total_ar),
      risk_rating,
      risk_score: String(total_risk_score),
      overdue_days_max: String(overdue_days_max),
      payment_history_score: String(payment_history_score),
      concentration_pct: String(risk_pct),
    };
  }) as Record<string, string>[];
}

export async function getFxAnalysis(): Promise<Record<string, string>[]> {
  const rows = await fetchCsv(`${BASE}/fx_analysis.csv`);

  let runningSum = 0;
  return rows.map(r => {
    const impact = parseFloat(r.fx_impact_eur || '0') || 0;
    runningSum += impact;

    return {
      year_month: r.year_month || '',
      eur_inr_rate: String(r.eur_inr_rate || '0'),
      eur_aed_rate: String(r.eur_aed_rate || '0'),
      eur_revenue_pct: String(r.eur_share_pct || r.eur_revenue_pct || '0'),
      inr_revenue_pct: String(r.inr_share_pct || r.inr_revenue_pct || '0'),
      aed_revenue_pct: String(r.aed_share_pct || r.aed_revenue_pct || '0'),
      fx_impact_eur: String(impact),
      cumulative_fx_impact: String(runningSum),
      fx_flag: String(r.fx_flag ?? 'false'),
    };
  }) as Record<string, string>[];
}

export async function getBudgetVsActual(): Promise<Record<string, string>[]> {
  return fetchCsv(`${BASE}/budget_vs_actual.csv`);
}

export async function getPlWithMetrics(): Promise<Record<string, string>[]> {
  return fetchCsv(`${BASE}/pl_with_metrics.csv`);
}

export async function getAnomalyLog(): Promise<Record<string, string>[]> {
  return fetchCsv(`${BASE}/anomaly_log.csv`);
}

export async function getMockAiResponse(message: string, metrics?: Record<string, unknown>): Promise<string> {
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
