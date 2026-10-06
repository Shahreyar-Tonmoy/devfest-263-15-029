import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTender } from '../context/TenderContext';
import { 
  FileCheck2, 
  Download, 
  ArrowLeft, 
  Eye, 
  AlertCircle, 
  FileText,
  Calendar,
  Building,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export default function PreviewPage() {
  const { lang, t } = useLanguage();
  const { 
    generatedPdf, 
    downloadGeneratedPackage, 
    tender, 
    requirements, 
    matches, 
    uploadedFiles 
  } = useTender();

  const sortedReqs = [...requirements].sort((a, b) => a.order - b.order);
  const includedDocs = sortedReqs
    .filter(req => matches[req.id])
    .map(req => {
      const f = uploadedFiles.find(item => item.id === matches[req.id]);
      return { req, file: f };
    });

  if (!generatedPdf) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 text-center space-y-4 max-w-xl mx-auto my-8 sm:my-12 shadow-sm">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
          <FileText className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-bold text-slate-800">No Package Generated Yet</h2>
          <p className="text-xs text-slate-500">
            Please return to the Package Builder, match all required documents, and click "Generate Combined PDF Package".
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('backToBuilder')}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('navBuilder')}</span>
            </Link>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs font-mono text-slate-500">{tender.tender_id}</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
            {generatedPdf.filename}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Total Pages: <strong className="text-slate-800">{generatedPdf.totalPages}</strong> (Cover + Index + {includedDocs.length} Documents)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Open full tab on mobile */}
          <a
            href={generatedPdf.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span>Open in Tab</span>
          </a>

          <button
            onClick={downloadGeneratedPackage}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{t('downloadPackageBtn')}</span>
          </button>
        </div>
      </div>

      {/* Main Content: Document Breakdown on Left, Embedded PDF Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Document Breakdown List (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>Package Contents</span>
            <span className="text-blue-600 font-mono">{includedDocs.length} Files</span>
          </h3>

          <div className="space-y-2 text-xs max-h-64 sm:max-h-80 lg:max-h-none overflow-y-auto pr-1">
            <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 text-blue-900 font-medium">
              📄 Page 1: Official English Cover Page
            </div>
            <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100 text-indigo-900 font-medium">
              📑 Page 2: Table of Contents & Index
            </div>

            {includedDocs.map(({ req, file }) => (
              <div key={req.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 truncate">
                    #{req.order} {lang === 'bn' ? req.title_bn : req.title_en}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate max-w-[200px]" title={file?.name}>
                    {file?.name}
                  </p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700 shrink-0">
                  {file?.pageCount} pgs
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <p className="font-bold text-slate-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Standardized Package Footers:
            </p>
            <p className="font-mono text-slate-700 break-all">
              {tender.tender_id} | Page X of {generatedPdf.totalPages}
            </p>
          </div>
        </div>

        {/* Embedded PDF Viewer (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-2 shadow-sm h-[520px] sm:h-[650px] lg:h-[820px] flex flex-col">
          <iframe
            src={generatedPdf.url}
            title="Generated PDF Preview"
            className="w-full h-full rounded-xl border border-slate-100"
          />
        </div>

      </div>
    </div>
  );
}
