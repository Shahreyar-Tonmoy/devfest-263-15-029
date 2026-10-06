import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTender } from '../context/TenderContext';
import { 
  FileText, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  HardDrive
} from 'lucide-react';

export default function UploadedFilesList() {
  const { lang, t } = useLanguage();
  const { uploadedFiles, removeFile, matches, requirements } = useTender();

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Find requirement matched to this file
  const getMatchedReq = (fileId) => {
    for (const [rId, fId] of Object.entries(matches)) {
      if (fId === fileId) {
        const req = requirements.find(r => r.id === rId);
        return req ? { id: req.id, order: req.order, title: lang === 'bn' ? req.title_bn : req.title_en } : null;
      }
    }
    return null;
  };

  if (uploadedFiles.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm text-center py-8">
        <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-slate-700">{t('uploadedFilesCount')} (0)</h3>
        <p className="text-xs text-slate-400 mt-1">{t('noFilesUploaded')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            {t('uploadedFilesCount')} ({uploadedFiles.length})
          </h2>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Total: {uploadedFiles.reduce((acc, f) => acc + (f.pageCount || 0), 0)} {t('pages')}
        </span>
      </div>

      <div className="space-y-2.5 max-h-64 sm:max-h-80 lg:max-h-[420px] overflow-y-auto pr-1">
        {uploadedFiles.map(file => {
          const matched = getMatchedReq(file.id);

          return (
            <div
              key={file.id}
              className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                file.isDuplicate
                  ? 'border-amber-300 bg-amber-50/40'
                  : matched
                  ? 'border-blue-200 bg-blue-50/30'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              {/* File Info */}
              <div className="flex items-start gap-3 min-w-0">
                <div className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                  file.isDuplicate ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 truncate max-w-xs" title={file.name}>
                      {file.name}
                    </span>

                    {/* Duplicate Badge (Section 4.6) */}
                    {file.isDuplicate && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300" title={t('duplicateWarning')}>
                        <Copy className="w-3 h-3" />
                        {t('statusDuplicate')}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">
                      {file.pageCount} {file.pageCount === 1 ? t('page') : t('pages')}
                    </span>
                    <span>•</span>
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span className="font-mono text-[10px] text-slate-400" title={file.hash}>
                      hash: {file.hash?.substring(0, 8)}...
                    </span>
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                {matched ? (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-100/80 text-blue-800 border border-blue-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>#{matched.order} {matched.title}</span>
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 italic px-2 py-0.5">
                    {t('notMatched')}
                  </span>
                )}

                <button
                  onClick={() => removeFile(file.id)}
                  title={t('removeFile')}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
