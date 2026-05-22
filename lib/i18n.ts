'use client';

export type Locale = 'en' | 'fr';

export const translations = {
  en: {
    // Navigation
    nav: {
      dashboard: 'Dashboard',
      cashflow: 'Cash Flow',
      pl: 'P&L',
      invoices: 'Invoices',
      fx: 'FX Intelligence',
      scenarios: 'Scenario Sim',
      reports: 'Reports',
      input: 'Data Input',
    },
    // TopBar
    topbar: {
      entity: 'Entity',
      subtitle: 'Jan 2023 — Dec 2025',
    },
    // Dashboard
    dashboard: {
      title: 'Dashboard',
      revenueVsBudget: 'Revenue vs Budget',
      cashFlowTimeline: 'Cash Flow Timeline',
      grossMarginTrend: 'Gross Margin Trend',
      arAgingDistribution: 'AR Aging Distribution',
      clientArConcentration: 'Client AR Concentration',
      byRiskRating: 'By risk rating',
      timelineSub: 'Jan 2023 — Oct 2025',
      ytd2025: '2025 YTD',
      months36: '36 months',
      actual: 'Actual',
      budget: 'Budget',
      anomaly: 'Anomaly',
      avg3m: '3M Avg',
    },
    // KPI labels
    kpi: {
      currentBalance: 'Current Balance',
      cashRunway: 'Cash Runway',
      monthlyBurn: 'Monthly Burn',
      dso: 'DSO',
      hhiScore: 'HHI Score',
      anomalies: 'Anomalies',
      atCurrentBurn: 'at current burn',
      avg3m: 'avg 3M',
      concentration: 'concentration',
      thisPeriod: 'this period',
      highRisk: 'HIGH RISK',
      lowRisk: 'LOW RISK',
      critical: 'CRITICAL',
      low: 'LOW',
      high: 'HIGH',
      medium: 'MEDIUM',
      flagged: 'FLAGGED',
    },
    // Cash Flow page
    cashflow: {
      title: 'Cash Flow Analysis',
      subtitle: '34-month historical view — Jan 2023 to Oct 2025',
      totalInflow: 'Total Inflow (All Time)',
      totalOutflow: 'Total Outflow (All Time)',
      netPosition: 'Net Position',
      avgBurn: 'Avg Monthly Burn (6M)',
      chartTitle: 'Inflow vs Outflow vs Net (Full Period)',
      tableTitle: 'Monthly Cash Flow Statement',
      month: 'Month',
      inflow: 'Inflow',
      outflow: 'Outflow',
      net: 'Net',
      balance: 'Balance',
      momPct: 'MoM %',
    },
    // P&L page
    pl: {
      title: 'Profit & Loss',
      subtitle: '36-month view with margin analysis',
      chartTitle: 'P&L Waterfall + Margin Overlay',
      tableTitle: 'Monthly P&L Detail',
      month: 'Month',
      revenue: 'Revenue',
      grossProfit: 'Gross Profit',
      gmPct: 'GM %',
      ebit: 'EBIT',
      ebitPct: 'EBIT %',
      netProfit: 'Net Profit',
      netPct: 'Net %',
    },
    // Invoices page
    invoices: {
      title: 'Invoices & AR Risk',
      subtitle: 'Aging analysis, client risk profiles, and anomaly log',
      tabAging: 'AR Aging',
      tabRisk: 'Client Risk',
      tabAnomalies: 'Anomalies',
      tableTitle: 'Accounts Receivable Aging',
      client: 'Client',
      paid: 'Paid',
      totalAR: 'Total AR',
      risk: 'Risk',
      concentration: 'Concentration',
      maxOverdue: 'Max Overdue',
      payHistory: 'Pay History',
      anomalyCount: 'anomalies flagged',
      hciWarning: 'HHI Concentration Warning',
      hciDetail: 'Client AR concentration is dangerously high. Meridian Tech GmbH represents 20.9% of total AR with CRITICAL risk status.',
      bucket1_30: '1–30d',
      bucket31_60: '31–60d',
      bucket61_90: '61–90d',
      bucket90_plus: '90+ d',
      date: 'Date',
      txnId: 'TXN ID',
      description: 'Description',
      amount: 'Amount',
      category: 'Category',
      flag: 'Flag',
      anomalyLogTitle: 'Anomaly & Review Log',
    },
    // FX page
    fx: {
      title: 'FX Intelligence',
      subtitle: 'Currency exposure, rate trends, and FX impact analysis',
      cumulativeFx: 'Cumulative FX Impact',
      mostVolatile: 'Most Volatile Month',
      eurInr: 'Current EUR/INR',
      eurAed: 'Current EUR/AED',
      revByCurrency: 'Revenue by Currency',
      latestMonth: 'Latest month',
      rateChart: 'EUR/INR & EUR/AED Rate',
      trend36: '36-month trend',
      monthlyImpact: 'Monthly FX Impact',
      positiveNote: 'Positive = FX gain, Negative = FX loss',
      gain: 'GAIN',
      loss: 'LOSS',
    },
    // Scenarios page
    scenarios: {
      title: 'Scenario Simulator',
      subtitle: 'Adjust parameters to model financial outcomes in real time',
      parameters: 'Parameters',
      outcomes: 'Projected Outcomes',
      revenueChange: 'Revenue Change',
      cogsChange: 'COGS Change',
      opexChange: 'Opex Change',
      fxImpact: 'FX Impact (EUR/INR)',
      newHeadcount: 'New Headcount',
      projRevenue: 'Projected Revenue',
      projGrossMargin: 'Projected Gross Margin',
      projEbit: 'Projected EBIT',
      projNetProfit: 'Projected Net Profit (25% tax)',
      cashRunway: 'Cash Runway',
      baseCase: 'Base Case',
      bearCase: 'Bear Case',
      bullCase: 'Bull Case',
      recession: 'Recession',
      reset: 'Reset',
      canHire: 'You can hire',
      cashRisk: 'Cash runway risk',
      additionalCost: 'Additional cost',
      vsBase: 'vs base',
      vsCurrent: 'vs current',
      month: 'month',
      months: 'months',
      people: 'ppl',
      margin: 'margin',
    },
    // Reports page
    reports: {
      title: 'Reports',
      subtitle: 'Generate and download financial reports',
      generate: 'Generate',
      download: 'Download',
      generating: 'Generating...',
      generatedNow: 'Generated just now',
      note: 'Note',
      noteText: 'Reports are currently generated as JSON files from the demo data. In production, these will produce formatted PDFs via a backend report engine. Click Generate on any report card above to download the data package.',
      healthTitle: 'Financial Health Summary',
      healthDesc: 'KPI snapshot, active alerts, margin overview, and liquidity metrics in a single digest.',
      agingTitle: 'Invoice Aging Report',
      agingDesc: 'Full AR aging breakdown by client, risk scores, overdue analysis, and concentration warnings.',
      cashflowTitle: 'Cash Flow Statement',
      cashflowDesc: '12-month rolling cash flow with inflows, outflows, net position, and running balance.',
      lastGenerated: 'Last generated: Never',
    },
    // Data Input
    input: {
      title: 'Data Ingestion Portal',
      subtitle: 'Upload and process raw financial datasets and statements',
      balanceSheet: 'Balance Sheet',
      cashFlow: 'Cash Flow Statement',
      incomeStatement: 'Income Statement',
      bankStatements: 'Bank Statements',
      apArMaster: 'AP/AR Master Data',
      dragDrop: 'Drag & drop file or click to browse',
      supportedFormats: 'Supports CSV, XLSX or PDF up to 10MB',
      uploading: 'Uploading & Processing...',
      success: 'File successfully processed',
      activeSource: 'Active Data Source',
      parsing: 'Parsing document structure...',
      validating: 'Running validation checks...',
      ingesting: 'Ingesting data into dashboard...',
      rowsParsed: 'rows parsed successfully',
    },
    // Chat
    chat: {
      title: 'Ask Pulse OS',
      subtitle: 'AI financial assistant',
      placeholder: 'Ask about your finances...',
      emptyTitle: 'Pulse OS AI',
      emptySubtitle: 'Ask me anything about your financial data.',
      prompts: [
        "What's my cash runway?",
        "Why did margin drop?",
        "Can I hire 2 people?",
        "Show overdue invoices",
        "Explain the FX impact",
      ],
    },
    // Common
    common: {
      concentration: 'concentration',
      month: 'Month',
      year: 'Year',
      total: 'Total',
      status: 'Status',
    },
  },

  fr: {
    // Navigation
    nav: {
      dashboard: 'Tableau de bord',
      cashflow: 'Flux de trésorerie',
      pl: 'Compte de résultat',
      invoices: 'Factures',
      fx: 'Devises',
      scenarios: 'Simulateur',
      reports: 'Rapports',
      input: 'Saisie de données',
    },
    // TopBar
    topbar: {
      entity: 'Entité',
      subtitle: 'Janv. 2023 — Déc. 2025',
    },
    // Dashboard
    dashboard: {
      title: 'Tableau de bord',
      revenueVsBudget: 'Chiffre d\'affaires vs Budget',
      cashFlowTimeline: 'Flux de trésorerie',
      grossMarginTrend: 'Tendance de la marge brute',
      arAgingDistribution: 'Distribution de l\'antériorité AR',
      clientArConcentration: 'Concentration des créances clients',
      byRiskRating: 'Par évaluation de risque',
      timelineSub: 'Janv. 2023 — Oct. 2025',
      ytd2025: 'Cumul annuel 2025',
      months36: '36 mois',
      actual: 'Réel',
      budget: 'Budget',
      anomaly: 'Anomalie',
      avg3m: 'Moy. 3M',
    },
    // KPI labels
    kpi: {
      currentBalance: 'Solde actuel',
      cashRunway: 'Autonomie de trésorerie',
      monthlyBurn: 'Dépenses mensuelles',
      dso: 'DSO',
      hhiScore: 'Score HHI',
      anomalies: 'Anomalies',
      atCurrentBurn: 'au rythme actuel',
      avg3m: 'moy. 3M',
      concentration: 'concentration',
      thisPeriod: 'cette période',
      highRisk: 'RISQUE ÉLEVÉ',
      lowRisk: 'RISQUE FAIBLE',
      critical: 'CRITIQUE',
      low: 'FAIBLE',
      high: 'ÉLEVÉ',
      medium: 'MOYEN',
      flagged: 'SIGNALÉ',
    },
    // Cash Flow page
    cashflow: {
      title: 'Analyse des flux de trésorerie',
      subtitle: 'Historique 34 mois — Janv. 2023 à Oct. 2025',
      totalInflow: 'Entrées totales (tout temps)',
      totalOutflow: 'Sorties totales (tout temps)',
      netPosition: 'Position nette',
      avgBurn: 'Dépenses mensuelles moy. (6M)',
      chartTitle: 'Entrées vs Sorties vs Net (période complète)',
      tableTitle: 'Relevé mensuel des flux de trésorerie',
      month: 'Mois',
      inflow: 'Entrées',
      outflow: 'Sorties',
      net: 'Net',
      balance: 'Solde',
      momPct: 'Var. M/M %',
    },
    // P&L page
    pl: {
      title: 'Compte de résultat',
      subtitle: 'Vue 36 mois avec analyse des marges',
      chartTitle: 'Cascade C/R + Courbe de marge',
      tableTitle: 'Détail mensuel du C/R',
      month: 'Mois',
      revenue: 'Chiffre d\'affaires',
      grossProfit: 'Marge brute',
      gmPct: 'Marge brute %',
      ebit: 'EBIT',
      ebitPct: 'EBIT %',
      netProfit: 'Résultat net',
      netPct: 'Net %',
    },
    // Invoices page
    invoices: {
      title: 'Factures & Risque clients',
      subtitle: 'Analyse des échéances, profils de risque et journal des anomalies',
      tabAging: 'Antériorité AR',
      tabRisk: 'Risque client',
      tabAnomalies: 'Anomalies',
      tableTitle: 'Antériorité des créances clients',
      client: 'Client',
      paid: 'Payé',
      totalAR: 'Créances totales',
      risk: 'Risque',
      concentration: 'Concentration',
      maxOverdue: 'Retard max.',
      payHistory: 'Historique paiements',
      anomalyCount: 'anomalies signalées',
      hciWarning: 'Alerte de concentration HHI',
      hciDetail: 'La concentration des créances clients est dangereusement élevée. Meridian Tech GmbH représente 20,9 % du total AR avec un risque CRITIQUE.',
      bucket1_30: '1–30 j',
      bucket31_60: '31–60 j',
      bucket61_90: '61–90 j',
      bucket90_plus: '90 j+',
      date: 'Date',
      txnId: 'ID TXN',
      description: 'Description',
      amount: 'Montant',
      category: 'Catégorie',
      flag: 'Signalement',
      anomalyLogTitle: 'Registre des anomalies',
    },
    // FX page
    fx: {
      title: 'Intelligence des devises',
      subtitle: 'Exposition aux devises, tendances des taux et analyse de l\'impact FX',
      cumulativeFx: 'Impact FX cumulé',
      mostVolatile: 'Mois le plus volatile',
      eurInr: 'EUR/INR actuel',
      eurAed: 'EUR/AED actuel',
      revByCurrency: 'Revenus par devise',
      latestMonth: 'Dernier mois',
      rateChart: 'Taux EUR/INR & EUR/AED',
      trend36: 'Tendance 36 mois',
      monthlyImpact: 'Impact FX mensuel',
      positiveNote: 'Positif = gain FX, Négatif = perte FX',
      gain: 'GAIN',
      loss: 'PERTE',
    },
    // Scenarios page
    scenarios: {
      title: 'Simulateur de scénarios',
      subtitle: 'Ajustez les paramètres pour modéliser les résultats financiers en temps réel',
      parameters: 'Paramètres',
      outcomes: 'Résultats projetés',
      revenueChange: 'Variation du CA',
      cogsChange: 'Variation du COGS',
      opexChange: 'Variation des charges d\'exploitation',
      fxImpact: 'Impact FX (EUR/INR)',
      newHeadcount: 'Nouveaux effectifs',
      projRevenue: 'CA projeté',
      projGrossMargin: 'Marge brute projetée',
      projEbit: 'EBIT projeté',
      projNetProfit: 'Résultat net projeté (taxe 25 %)',
      cashRunway: 'Autonomie de trésorerie',
      baseCase: 'Scénario de base',
      bearCase: 'Scénario baissier',
      bullCase: 'Scénario haussier',
      recession: 'Récession',
      reset: 'Réinitialiser',
      canHire: 'Vous pouvez embaucher',
      cashRisk: 'Risque de trésorerie',
      additionalCost: 'Coût additionnel',
      vsBase: 'vs base',
      vsCurrent: 'vs actuel',
      month: 'mois',
      months: 'mois',
      people: 'pers.',
      margin: 'marge',
    },
    // Reports page
    reports: {
      title: 'Rapports',
      subtitle: 'Générer et télécharger des rapports financiers',
      generate: 'Générer',
      download: 'Télécharger',
      generating: 'Génération...',
      generatedNow: 'Généré à l\'instant',
      note: 'Remarque',
      noteText: 'Les rapports sont générés sous forme de fichiers JSON à partir des données de démonstration. En production, ils produiront des PDF formatés via un moteur de rapport. Cliquez sur Générer sur une carte ci-dessus pour télécharger le fichier.',
      healthTitle: 'Résumé de santé financière',
      healthDesc: 'Instantané des KPI, alertes actives, aperçu des marges et indicateurs de liquidité.',
      agingTitle: 'Rapport d\'antériorité des factures',
      agingDesc: 'Analyse complète de l\'antériorité AR par client, scores de risque, analyse des retards et avertissements de concentration.',
      cashflowTitle: 'État des flux de trésorerie',
      cashflowDesc: 'Flux de trésorerie glissants 12 mois avec entrées, sorties, position nette et solde courant.',
      lastGenerated: 'Dernière génération : Jamais',
    },
    // Data Input
    input: {
      title: 'Portail d\'importation des données',
      subtitle: 'Téléchargez et traitez les ensembles de données financières brutes',
      balanceSheet: 'Bilan',
      cashFlow: 'État des flux de trésorerie',
      incomeStatement: 'Compte de résultat',
      bankStatements: 'Relevés bancaires',
      apArMaster: 'Fichier maître AP/AR',
      dragDrop: 'Glissez-déposez des fichiers ici, ou cliquez pour parcourir',
      supportedFormats: 'Prend en charge CSV, XLSX ou PDF jusqu\'à 10 Mo',
      uploading: 'Téléchargement et traitement...',
      success: 'Fichier traité avec succès',
      activeSource: 'Source de données active',
      parsing: 'Analyse de la structure du document...',
      validating: 'Exécution des contrôles de validation...',
      ingesting: 'Intégration des données dans le tableau de bord...',
      rowsParsed: 'lignes analysées avec succès',
    },
    // Chat
    chat: {
      title: 'Demandez à Pulse OS',
      subtitle: 'Assistant financier IA',
      placeholder: 'Posez une question sur vos finances...',
      emptyTitle: 'Pulse OS IA',
      emptySubtitle: 'Posez-moi n\'importe quelle question sur vos données financières.',
      prompts: [
        'Quelle est mon autonomie de trésorerie ?',
        'Pourquoi la marge a-t-elle chuté ?',
        'Puis-je embaucher 2 personnes ?',
        'Montrer les factures en retard',
        'Expliquer l\'impact FX',
      ],
    },
    // Common
    common: {
      concentration: 'concentration',
      month: 'Mois',
      year: 'Année',
      total: 'Total',
      status: 'Statut',
    },
  },
} as const;

export type Translations = {
  nav: { dashboard: string; cashflow: string; pl: string; invoices: string; fx: string; scenarios: string; reports: string; input: string };
  topbar: { entity: string; subtitle: string };
  dashboard: {
    title: string;
    revenueVsBudget: string;
    cashFlowTimeline: string;
    grossMarginTrend: string;
    arAgingDistribution: string;
    clientArConcentration: string;
    byRiskRating: string;
    timelineSub: string;
    ytd2025: string;
    months36: string;
    actual: string;
    budget: string;
    anomaly: string;
    avg3m: string;
  };
  kpi: { currentBalance: string; cashRunway: string; monthlyBurn: string; dso: string; hhiScore: string; anomalies: string; atCurrentBurn: string; avg3m: string; concentration: string; thisPeriod: string; highRisk: string; lowRisk: string; critical: string; low: string; high: string; medium: string; flagged: string };
  cashflow: { title: string; subtitle: string; totalInflow: string; totalOutflow: string; netPosition: string; avgBurn: string; chartTitle: string; tableTitle: string; month: string; inflow: string; outflow: string; net: string; balance: string; momPct: string };
  pl: { title: string; subtitle: string; chartTitle: string; tableTitle: string; month: string; revenue: string; grossProfit: string; gmPct: string; ebit: string; ebitPct: string; netProfit: string; netPct: string };
  invoices: { title: string; subtitle: string; tabAging: string; tabRisk: string; tabAnomalies: string; tableTitle: string; client: string; paid: string; totalAR: string; risk: string; concentration: string; maxOverdue: string; payHistory: string; anomalyCount: string; hciWarning: string; hciDetail: string; bucket1_30: string; bucket31_60: string; bucket61_90: string; bucket90_plus: string; date: string; txnId: string; description: string; amount: string; category: string; flag: string; anomalyLogTitle: string };
  fx: { title: string; subtitle: string; cumulativeFx: string; mostVolatile: string; eurInr: string; eurAed: string; revByCurrency: string; latestMonth: string; rateChart: string; trend36: string; monthlyImpact: string; positiveNote: string; gain: string; loss: string };
  scenarios: { title: string; subtitle: string; parameters: string; outcomes: string; revenueChange: string; cogsChange: string; opexChange: string; fxImpact: string; newHeadcount: string; projRevenue: string; projGrossMargin: string; projEbit: string; projNetProfit: string; cashRunway: string; baseCase: string; bearCase: string; bullCase: string; recession: string; reset: string; canHire: string; cashRisk: string; additionalCost: string; vsBase: string; vsCurrent: string; month: string; months: string; people: string; margin: string };
  reports: { title: string; subtitle: string; generate: string; download: string; generating: string; generatedNow: string; note: string; noteText: string; healthTitle: string; healthDesc: string; agingTitle: string; agingDesc: string; cashflowTitle: string; cashflowDesc: string; lastGenerated: string };
  input: {
    title: string;
    subtitle: string;
    balanceSheet: string;
    cashFlow: string;
    incomeStatement: string;
    bankStatements: string;
    apArMaster: string;
    dragDrop: string;
    supportedFormats: string;
    uploading: string;
    success: string;
    activeSource: string;
    parsing: string;
    validating: string;
    ingesting: string;
    rowsParsed: string;
  };
  chat: { title: string; subtitle: string; placeholder: string; emptyTitle: string; emptySubtitle: string; prompts: readonly string[] };
  common: { concentration: string; month: string; year: string; total: string; status: string };
};

export const typedTranslations: Record<Locale, Translations> = translations as Record<Locale, Translations>;
