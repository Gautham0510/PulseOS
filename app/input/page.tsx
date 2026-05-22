'use client';

import { useState, useRef } from 'react';
import {
  FileSpreadsheet, Coins, BarChart3, CreditCard, Users,
  UploadCloud, X, CheckCircle2, FileText, AlertCircle, Loader2, ArrowRight
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';

type DocCategory = 'balanceSheet' | 'cashFlow' | 'incomeStatement' | 'bankStatements' | 'apArMaster';

type UploadState = {
  status: 'idle' | 'uploading' | 'success';
  fileName: string;
  fileSize: string;
  progress: number;
  currentStep: number;
  log: string[];
};

const INITIAL_STATE: UploadState = {
  status: 'idle',
  fileName: '',
  fileSize: '',
  progress: 0,
  currentStep: 0,
  log: [],
};

export default function DataInputPage() {
  const { t, locale } = useAppStore();

  const categories = [
    { key: 'balanceSheet' as DocCategory, label: t.input.balanceSheet, icon: FileSpreadsheet, color: 'from-blue-500/20 to-indigo-500/20', iconColor: 'text-blue-400' },
    { key: 'cashFlow' as DocCategory, label: t.input.cashFlow, icon: Coins, color: 'from-emerald-500/20 to-teal-500/20', iconColor: 'text-emerald-400' },
    { key: 'incomeStatement' as DocCategory, label: t.input.incomeStatement, icon: BarChart3, color: 'from-sky-500/20 to-cyan-500/20', iconColor: 'text-sky-400' },
    { key: 'bankStatements' as DocCategory, label: t.input.bankStatements, icon: CreditCard, color: 'from-purple-500/20 to-fuchsia-500/20', iconColor: 'text-purple-400' },
    { key: 'apArMaster' as DocCategory, label: t.input.apArMaster, icon: Users, color: 'from-amber-500/20 to-orange-500/20', iconColor: 'text-amber-400' },
  ];

  const [states, setStates] = useState<Record<DocCategory, UploadState>>({
    balanceSheet: { ...INITIAL_STATE },
    cashFlow: { ...INITIAL_STATE },
    incomeStatement: { ...INITIAL_STATE },
    bankStatements: { ...INITIAL_STATE },
    apArMaster: { ...INITIAL_STATE },
  });

  const fileInputRefs = {
    balanceSheet: useRef<HTMLInputElement>(null),
    cashFlow: useRef<HTMLInputElement>(null),
    incomeStatement: useRef<HTMLInputElement>(null),
    bankStatements: useRef<HTMLInputElement>(null),
    apArMaster: useRef<HTMLInputElement>(null),
  };

  const [dragActive, setDragActive] = useState<Record<DocCategory, boolean>>({
    balanceSheet: false,
    cashFlow: false,
    incomeStatement: false,
    bankStatements: false,
    apArMaster: false,
  });

  // Active sources table details
  const [sources, setSources] = useState([
    { name: 'balance_sheet_ytd_2025.xlsx', type: 'balanceSheet', size: '1.2 MB', status: 'Active', ageEn: 'Loaded 2 hours ago by admin', ageFr: 'Chargé il y a 2 heures par admin' },
    { name: 'monthly_cashflow.csv', type: 'cashFlow', size: '245 KB', status: 'Active', ageEn: 'System loaded (demo data)', ageFr: 'Chargé par le système (données démo)' },
    { name: 'pl_with_metrics.csv', type: 'incomeStatement', size: '180 KB', status: 'Active', ageEn: 'System loaded (demo data)', ageFr: 'Chargé par le système (données démo)' },
    { name: 'bank_statement_q1.pdf', type: 'bankStatements', size: '2.4 MB', status: 'Active', ageEn: 'Loaded 1 day ago by analyst', ageFr: 'Chargé hier par l\'analyste' },
    { name: 'client_risk_scores.csv', type: 'apArMaster', size: '98 KB', status: 'Active', ageEn: 'System loaded (demo data)', ageFr: 'Chargé par le système (données démo)' },
  ]);

  function triggerUpload(key: DocCategory, file: File) {
    if (!file) return;

    setStates(prev => ({
      ...prev,
      [key]: {
        status: 'uploading',
        fileName: file.name,
        fileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        progress: 0,
        currentStep: 0,
        log: [t.input.parsing],
      }
    }));

    // Simulating sequential processing steps
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progress === 30) {
        setStates(prev => ({
          ...prev,
          [key]: {
            ...prev[key],
            progress,
            currentStep: 1,
            log: [...prev[key].log, '✔ ' + t.input.parsing, t.input.validating]
          }
        }));
      } else if (progress === 65) {
        setStates(prev => ({
          ...prev,
          [key]: {
            ...prev[key],
            progress,
            currentStep: 2,
            log: [...prev[key].log, '✔ ' + t.input.validating, t.input.ingesting]
          }
        }));
      } else if (progress >= 100) {
        clearInterval(interval);
        setStates(prev => ({
          ...prev,
          [key]: {
            ...prev[key],
            status: 'success',
            progress: 100,
            log: [...prev[key].log, '✔ ' + t.input.ingesting]
          }
        }));
        // Add new file to active sources
        setSources(prev => [
          {
            name: file.name,
            type: key,
            size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
            status: 'Active',
            ageEn: 'Just loaded now',
            ageFr: 'Chargé à l\'instant'
          },
          ...prev
        ]);
      } else {
        setStates(prev => ({
          ...prev,
          [key]: {
            ...prev[key],
            progress
          }
        }));
      }
    }, 100);
  }

  function handleFileChange(key: DocCategory) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) triggerUpload(key, file);
    };
  }

  function handleDrag(key: DocCategory) {
    return (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(prev => ({ ...prev, [key]: true }));
      } else if (e.type === "dragleave") {
        setDragActive(prev => ({ ...prev, [key]: false }));
      }
    };
  }

  function handleDrop(key: DocCategory) {
    return (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(prev => ({ ...prev, [key]: false }));
      const file = e.dataTransfer.files?.[0];
      if (file) triggerUpload(key, file);
    };
  }

  function resetState(key: DocCategory) {
    setStates(prev => ({
      ...prev,
      [key]: { ...INITIAL_STATE }
    }));
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-[#e8eaf0]">{t.input.title}</h2>
        <p className="text-sm text-[#5a6280]">{t.input.subtitle}</p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {categories.map(({ key, label, icon: Icon, color, iconColor }) => {
          const state = states[key];
          const isDragging = dragActive[key];

          return (
            <div
              key={key}
              className="bg-[#1e2130] border border-[#2a2f45] rounded-xl p-5 hover:border-[#3a4060] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br", color)}>
                    <Icon className={cn("w-5 h-5", iconColor)} />
                  </div>
                  <h3 className="text-sm font-semibold text-[#e8eaf0]">{label}</h3>
                </div>

                {state.status === 'idle' && (
                  <div
                    onDragEnter={handleDrag(key)}
                    onDragOver={handleDrag(key)}
                    onDragLeave={handleDrag(key)}
                    onDrop={handleDrop(key)}
                    onClick={() => fileInputRefs[key].current?.click()}
                    className={cn(
                      "border border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[160px] text-center",
                      isDragging
                        ? "border-blue-500 bg-blue-500/5 text-blue-400"
                        : "border-[#3a4060]/50 hover:bg-[#252839]/30 text-[#8891aa]"
                    )}
                  >
                    <input
                      type="file"
                      ref={fileInputRefs[key]}
                      className="hidden"
                      onChange={handleFileChange(key)}
                      accept=".csv,.xlsx,.xls,.pdf"
                    />
                    <UploadCloud className={cn("w-8 h-8 mb-2 opacity-65", isDragging ? "text-blue-400" : "text-[#5a6280]")} />
                    <p className="text-xs font-medium mb-1">{t.input.dragDrop}</p>
                    <p className="text-[10px] text-[#5a6280]">{t.input.supportedFormats}</p>
                  </div>
                )}

                {state.status === 'uploading' && (
                  <div className="bg-[#13161f] border border-[#2a2f45] rounded-lg p-4 min-h-[160px] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <span className="text-xs text-[#e8eaf0] truncate font-medium">{state.fileName}</span>
                        </div>
                        <span className="text-[10px] text-[#5a6280] flex-shrink-0">{state.fileSize}</span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-[#2a2f45] h-1 rounded-full overflow-hidden mb-3">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-100 ease-out"
                          style={{ width: `${state.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Step Logs */}
                    <div className="space-y-1 mt-1 text-[10px] font-mono text-[#8891aa]">
                      {state.log.map((line, index) => {
                        const isDone = line.startsWith('✔');
                        return (
                          <div key={index} className="flex items-center gap-1.5">
                            {isDone ? (
                              <span className="text-emerald-400 font-semibold">{line}</span>
                            ) : (
                              <>
                                <Loader2 className="w-3 h-3 text-blue-400 animate-spin flex-shrink-0" />
                                <span className="text-[#e8eaf0]">{line}</span>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {state.status === 'success' && (
                  <div className="bg-[#13161f]/50 border border-emerald-500/20 rounded-lg p-4 min-h-[160px] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">{t.input.success}</span>
                      </div>
                      <p className="text-xs text-[#e8eaf0] truncate mb-0.5 font-medium">{state.fileName}</p>
                      <p className="text-[10px] text-[#5a6280]">{state.fileSize} • 142 {t.input.rowsParsed}</p>
                    </div>

                    <button
                      onClick={() => resetState(key)}
                      className="mt-3 w-full flex items-center justify-center gap-1 py-1 px-3 text-xs bg-[#1e2130] hover:bg-[#2a2f45] border border-[#2a2f45] text-[#8891aa] hover:text-[#e8eaf0] rounded-md transition-colors"
                    >
                      <span>{locale === 'fr' ? 'Importer un autre fichier' : 'Upload another file'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Data Sources Log */}
      <div className="bg-[#1e2130] border border-[#2a2f45] rounded-lg overflow-hidden mt-6">
        <div className="px-4 py-3 border-b border-[#2a2f45]">
          <h3 className="text-sm font-semibold text-[#e8eaf0]">{t.input.activeSource}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#2a2f45] bg-[#171a25]/50 text-[#5a6280] font-semibold uppercase tracking-wider">
                <th className="px-4 py-3">{locale === 'fr' ? 'Nom du fichier' : 'File Name'}</th>
                <th className="px-4 py-3">{locale === 'fr' ? 'Catégorie de document' : 'Document Category'}</th>
                <th className="px-4 py-3">{locale === 'fr' ? 'Taille' : 'Size'}</th>
                <th className="px-4 py-3">{locale === 'fr' ? 'Statut' : 'Status'}</th>
                <th className="px-4 py-3">{locale === 'fr' ? 'Âge' : 'Age'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1e2d]">
              {sources.map((src, i) => {
                const matchedCategory = categories.find(c => c.key === src.type);
                return (
                  <tr key={i} className="hover:bg-[#252a3d]/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-[#e8eaf0]">{src.name}</td>
                    <td className="px-4 py-3 text-[#8891aa]">{matchedCategory?.label || src.type}</td>
                    <td className="px-4 py-3 text-[#8891aa] font-mono">{src.size}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                        {src.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#5a6280]">{locale === 'fr' ? src.ageFr : src.ageEn}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
