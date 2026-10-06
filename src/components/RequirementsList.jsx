import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTender } from '../context/TenderContext';
import { ListOrdered, Wand2, FileSpreadsheet } from 'lucide-react';
import DocumentCard from './DocumentCard';

export default function RequirementsList() {
  const { t } = useLanguage();
  const { requirements, triggerAutoMatch, uploadedFiles } = useTender();

  const sortedRequirements = [...requirements].sort((a, b) => a.order - b.order);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-blue-600" />
            {t('reqListTitle')} ({requirements.length})
          </h2>
          <p className="text-xs text-slate-500">
            {t('reqListSubtitle')}
          </p>
        </div>

        {/* Auto-Match Button (Bonus) */}
        <button
          onClick={triggerAutoMatch}
          disabled={uploadedFiles.length === 0}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 disabled:opacity-40 disabled:hover:bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 transition-colors shadow-xs"
          title="Automatically suggest matches between files and requirements"
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>{t('autoMatchBtn')}</span>
        </button>
      </div>

      {/* List of Document Cards */}
      <div className="space-y-3">
        {sortedRequirements.map(req => (
          <DocumentCard key={req.id} req={req} />
        ))}
      </div>
    </div>
  );
}
