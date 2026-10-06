import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTender } from '../context/TenderContext';
import { 
  Building2, 
  Calendar, 
  FileText, 
  Briefcase, 
  Upload, 
  Sparkles, 
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  HelpCircle
} from 'lucide-react';

export default function TenderHeader() {
  const { lang, t } = useLanguage();
  const { 
    tender, 
    requirements, 
    getDocumentStatus, 
    loadRequirementsJson, 
    loadSamplePack,
    exportChecklistCSV 
  } = useTender();

  const handleJsonUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        loadRequirementsJson(json);
      } catch (err) {
        alert('Invalid JSON file format: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Calculate stats
  const stats = {
    ok: 0,
    missing: 0,
    expiryNeeded: 0,
    expired: 0,
    notProvided: 0
  };

  requirements.forEach(req => {
    const s = getDocumentStatus(req);
    if (s.code === 'OK') stats.ok++;
    else if (s.code === 'Missing') stats.missing++;
    else if (s.code === 'Expiry date needed') stats.expiryNeeded++;
    else if (s.code === 'Expired') stats.expired++;
    else if (s.code === 'Not provided') stats.notProvided++;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-5">
      
      {/* Top Row: Title & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 font-mono text-xs font-bold">
              {tender.tender_id || 'T-2026-0417'}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">
              {t('tenderDetails')}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {tender.title || 'Supply of IT Equipment'}
          </h1>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Upload JSON Button */}
          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-sm">
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Load requirements.json</span>
            <input type="file" accept=".json" onChange={handleJsonUpload} className="hidden" />
          </label>

          {/* Load Sample Data */}
          <button
            onClick={loadSamplePack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('loadSampleData')}</span>
          </button>

          {/* Export Checklist CSV (Bonus) */}
          <button
            onClick={exportChecklistCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-sm"
            title="Download Excel / CSV checklist"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('exportChecklistBtn')}</span>
          </button>
        </div>
      </div>

      {/* Tender Metadata Details Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        
        {/* Procuring Entity */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
          <div className="p-2 rounded-lg bg-blue-100 text-blue-700 mt-0.5">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {t('procuringEntity')}
            </p>
            <p className="text-xs sm:text-sm font-bold text-slate-800">
              {tender.procuring_entity || 'N/A'}
            </p>
          </div>
        </div>

        {/* Bidder */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
          <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 mt-0.5">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {t('bidder')}
            </p>
            <p className="text-xs sm:text-sm font-bold text-slate-800">
              {tender.bidder || 'N/A'}
            </p>
          </div>
        </div>

        {/* Submission Deadline */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/60 border border-amber-200/70">
          <div className="p-2 rounded-lg bg-amber-100 text-amber-800 mt-0.5">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
              {t('submissionDeadline')}
            </p>
            <p className="text-xs sm:text-sm font-bold text-amber-950 font-mono">
              {tender.submission_deadline || '2026-10-20'}
            </p>
            <p className="text-[10px] text-amber-700 mt-0.5">
              {t('deadlineNotice')} <strong className="font-mono">{tender.submission_deadline}</strong>
            </p>
          </div>
        </div>

      </div>

      {/* Live Status Indicators Bar */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-bold text-slate-700">
          {t('packageSummary')}:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t('statusOK')}: {stats.ok}
          </span>

          {stats.missing > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-semibold border border-red-300 animate-pulse">
              <XCircle className="w-3.5 h-3.5" />
              {t('statusMissing')}: {stats.missing}
            </span>
          )}

          {stats.expiryNeeded > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold border border-amber-300">
              <Clock className="w-3.5 h-3.5" />
              {t('statusExpiryNeeded')}: {stats.expiryNeeded}
            </span>
          )}

          {stats.expired > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-semibold border border-rose-300">
              <AlertTriangle className="w-3.5 h-3.5" />
              {t('statusExpired')}: {stats.expired}
            </span>
          )}

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 font-medium">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            {t('statusNotProvided')}: {stats.notProvided}
          </span>

        </div>
      </div>

    </div>
  );
}
