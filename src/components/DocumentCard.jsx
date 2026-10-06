import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTender } from '../context/TenderContext';
import { 
  FileCheck, 
  FileX, 
  AlertCircle, 
  Calendar, 
  Clock, 
  X, 
  Check, 
  HelpCircle,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';

export default function DocumentCard({ req }) {
  const { lang, t } = useLanguage();
  const { 
    tender, 
    uploadedFiles, 
    matches, 
    matchFile, 
    unmatch, 
    expiryDates, 
    setExpiryDate, 
    getDocumentStatus 
  } = useTender();

  const currentFileId = matches[req.id];
  const matchedFile = uploadedFiles.find(f => f.id === currentFileId);
  const status = getDocumentStatus(req);
  const currentExpiry = expiryDates[req.id] || '';

  // Get list of available files that are either this file or not yet matched
  const availableFiles = uploadedFiles.filter(f => {
    if (f.id === currentFileId) return true;
    // Don't show files already matched elsewhere
    const isMatchedElsewhere = Object.entries(matches).some(([rId, fId]) => rId !== req.id && fId === f.id);
    return !isMatchedElsewhere;
  });

  const title = lang === 'bn' ? (req.title_bn || req.title_en) : (req.title_en || req.title_bn);

  const getStatusIcon = () => {
    switch (status.code) {
      case 'OK':
        return <Check className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Missing':
        return <FileX className="w-3.5 h-3.5 text-red-600" />;
      case 'Expiry date needed':
        return <Clock className="w-3.5 h-3.5 text-amber-600" />;
      case 'Expired':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />;
      case 'Not provided':
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getStatusLabel = () => {
    switch (status.code) {
      case 'OK': return t('statusOK');
      case 'Missing': return t('statusMissing');
      case 'Expiry date needed': return t('statusExpiryNeeded');
      case 'Expired': return t('statusExpired');
      case 'Not provided': return t('statusNotProvided');
      default: return status.code;
    }
  };

  const getStatusDescription = () => {
    switch (status.code) {
      case 'OK': return t('statusDescOK');
      case 'Missing': return t('statusDescMissing');
      case 'Expiry date needed': return t('statusDescExpiryNeeded');
      case 'Expired': return t('statusDescExpired');
      case 'Not provided': return t('statusDescNotProvided');
      default: return '';
    }
  };

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      status.code === 'OK'
        ? 'border-emerald-200 bg-emerald-50/20'
        : status.code === 'Expired' || status.code === 'Missing'
        ? 'border-red-200 bg-red-50/20'
        : status.code === 'Expiry date needed'
        ? 'border-amber-200 bg-amber-50/20'
        : 'border-slate-200 bg-white'
    }`}>
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 text-slate-700 font-mono text-xs font-bold flex items-center justify-center shrink-0">
            {req.order}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                {title}
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                ({req.id})
              </span>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          {req.mandatory ? (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
              {t('mandatoryBadge')}
            </span>
          ) : (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              {t('optionalBadge')}
            </span>
          )}

          {req.has_expiry && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {t('hasExpiryBadge')}
            </span>
          )}

          {/* Status Badge */}
          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border shadow-xs ${status.badgeColor}`}>
            {getStatusIcon()}
            <span>{getStatusLabel()}</span>
          </span>
        </div>
      </div>

      {/* Matching & Expiry Controls */}
      <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
        
        {/* PDF Match Selection */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            {t('matchedTo')}:
          </label>
          <div className="flex items-center gap-1.5">
            <select
              value={currentFileId || ''}
              onChange={(e) => matchFile(req.id, e.target.value || null)}
              className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="">{t('selectFilePrompt')}</option>
              {availableFiles.map(file => (
                <option key={file.id} value={file.id}>
                  {file.name} ({file.pageCount} {file.pageCount === 1 ? t('page') : t('pages')})
                  {file.isDuplicate ? ` [${t('statusDuplicate')}]` : ''}
                </option>
              ))}
            </select>

            {currentFileId && (
              <button
                onClick={() => unmatch(req.id)}
                title={t('unmatch')}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Expiry Date Input (Task 4.4) */}
        {req.has_expiry && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center justify-between">
              <span>{t('expiryDateLabel')}</span>
              {tender.submission_deadline && (
                <span className="text-[10px] text-slate-400 font-normal">
                  Deadline: {tender.submission_deadline}
                </span>
              )}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                disabled={!matchedFile}
                value={currentExpiry}
                onChange={(e) => setExpiryDate(req.id, e.target.value)}
                className={`w-full text-xs py-1.5 px-2.5 rounded-lg border font-mono transition-colors ${
                  !matchedFile
                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                    : currentExpiry && currentExpiry < tender.submission_deadline
                    ? 'border-red-400 bg-red-50/50 text-red-900 font-bold focus:ring-red-500'
                    : currentExpiry && currentExpiry >= tender.submission_deadline
                    ? 'border-emerald-400 bg-emerald-50/50 text-emerald-900 font-bold focus:ring-emerald-500'
                    : 'border-slate-300 bg-white text-slate-800 focus:ring-blue-500'
                }`}
              />
            </div>
          </div>
        )}

      </div>

      {/* Status description explanation text */}
      <div className="mt-2 text-[11px] flex items-center justify-between text-slate-500">
        <span>{getStatusDescription()}</span>
        {matchedFile && (
          <span className="font-semibold text-slate-700">
            {matchedFile.pageCount} {matchedFile.pageCount === 1 ? t('page') : t('pages')}
          </span>
        )}
      </div>

    </div>
  );
}
