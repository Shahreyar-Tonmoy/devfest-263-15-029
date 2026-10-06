import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTender } from '../context/TenderContext';
import { CheckCircle2, AlertOctagon, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function ValidationSummary() {
  const { t } = useLanguage();
  const { getBlockingIssues, uploadedFiles, matches } = useTender();

  const blockers = getBlockingIssues();
  const isReady = blockers.length === 0 && Object.keys(matches).length > 0;

  if (isReady) {
    return (
      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 shadow-sm flex items-start gap-3">
        <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
            {t('packageReady')}
          </h4>
          <p className="text-xs text-emerald-700 mt-0.5">
            Zero blocking errors found. Cover page, document ordering, and pagination footers are prepared.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-300 shadow-sm space-y-2.5">
      <div className="flex items-center gap-2 text-amber-900">
        <AlertOctagon className="w-4 h-4 text-amber-600 shrink-0" />
        <h4 className="text-xs font-bold uppercase tracking-wider">
          {t('packageBlocked')} ({blockers.length} {t('blockingIssuesCount')})
        </h4>
      </div>

      <ul className="space-y-1.5 pl-5 list-disc text-xs text-amber-950">
        {blockers.map((b, idx) => (
          <li key={idx} className="leading-snug">
            <strong className="text-amber-900">{b.title} ({b.reqId}):</strong> {b.reason}
          </li>
        ))}
      </ul>
    </div>
  );
}
