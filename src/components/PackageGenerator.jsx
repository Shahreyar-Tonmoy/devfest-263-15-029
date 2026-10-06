import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTender } from '../context/TenderContext';
import { 
  FileCheck2, 
  Download, 
  Eye, 
  Loader2, 
  Sparkles, 
  BookOpen, 
  Layers,
  CheckCircle2,
  Lock
} from 'lucide-react';
import ValidationSummary from './ValidationSummary';

export default function PackageGenerator() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { 
    tender, 
    requirements, 
    matches, 
    uploadedFiles, 
    getBlockingIssues, 
    isGenerating, 
    generationProgress, 
    generatedPdf, 
    handleGeneratePackage, 
    downloadGeneratedPackage 
  } = useTender();

  const [includeIndex, setIncludeIndex] = useState(true);

  const blockers = getBlockingIssues();
  const hasMatches = Object.keys(matches).length > 0;
  const isBlocked = blockers.length > 0 || !hasMatches;

  // Calculate pages
  let totalDocPages = 0;
  Object.values(matches).forEach(fId => {
    const f = uploadedFiles.find(item => item.id === fId);
    if (f) totalDocPages += (f.pageCount || 1);
  });
  const estimatedTotalPages = totalDocPages + 1 + (includeIndex ? 1 : 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <FileCheck2 className="w-5 h-5 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            {t('packageSummary')}
          </h2>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          {t('estimatedPackagePages')}: <strong className="text-slate-800">{estimatedTotalPages}</strong>
        </div>
      </div>

      {/* Validation Checklist / Live Blockers Display */}
      <ValidationSummary />

      {/* Bonus Options */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
          <input
            type="checkbox"
            checked={includeIndex}
            onChange={(e) => setIncludeIndex(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
          />
          <span>Include Index / Table of Contents Page (Page 2 - Bonus)</span>
        </label>
        <span className="text-[11px] text-slate-500">
          Page 1 Cover + {includeIndex ? 'Page 2 Index + ' : ''}{totalDocPages} Document Pages
        </span>
      </div>

      {/* Progress Bar (while generating) */}
      {isGenerating && (
        <div className="space-y-2 p-4 bg-blue-50/60 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              {generationProgress.message || t('generatingText')}
            </span>
            <span>{generationProgress.progress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${generationProgress.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        {/* Main Generate Button (Task 4.7: Disabled while blocked) */}
        <button
          onClick={() => handleGeneratePackage(includeIndex)}
          disabled={isBlocked || isGenerating}
          className={`w-full sm:flex-1 py-3 px-5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
            isBlocked
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none border border-slate-300'
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-blue-500/25 hover:shadow-lg active:scale-[0.99]'
          }`}
          title={isBlocked ? 'Resolve all blocking issues above to enable package generation' : 'Generate final compliant tender package'}
        >
          {isBlocked ? (
            <>
              <Lock className="w-4 h-4" />
              <span>{t('generatePackageBtn')} (Blocked)</span>
            </>
          ) : isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating Package...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{t('generatePackageBtn')}</span>
            </>
          )}
        </button>

        {/* Download & Preview Buttons (Shown when generated) */}
        {generatedPdf && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={downloadGeneratedPackage}
              className="flex-1 sm:flex-initial py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{t('downloadPackageBtn')}</span>
            </button>

            <button
              onClick={() => navigate('/preview')}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">{t('viewPreviewBtn')}</span>
            </button>
          </div>
        )}
      </div>

      {generatedPdf && (
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
          <span className="flex items-center gap-1.5 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Ready: {generatedPdf.filename} ({generatedPdf.totalPages} pages)
          </span>
          <span className="text-[11px] text-emerald-700 font-mono">
            Cover + Index + Footers applied
          </span>
        </div>
      )}

    </div>
  );
}
