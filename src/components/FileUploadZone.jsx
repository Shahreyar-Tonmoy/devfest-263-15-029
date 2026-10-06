import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTender } from '../context/TenderContext';
import { UploadCloud, FileCheck, AlertCircle, FilePlus, Sparkles } from 'lucide-react';

export default function FileUploadZone() {
  const { t } = useLanguage();
  const { addFiles, loadSamplePack } = useTender();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await addFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      await addFiles(e.target.files);
    }
    e.target.value = '';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <FilePlus className="w-4 h-4 text-blue-600" />
            {t('uploadTitle')}
          </h2>
          <p className="text-xs text-slate-500">
            {t('uploadHint')}
          </p>
        </div>
        <button
          onClick={loadSamplePack}
          className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {t('loadSampleData')}
        </button>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50/60 scale-[0.99]'
            : 'border-slate-300 hover:border-blue-400 bg-slate-50/50'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
            <UploadCloud className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-800">
              {t('uploadSubtitle')}
            </p>
            <p className="text-xs text-slate-500">
              Drag all candidate PDFs here, or click to choose from your computer
            </p>
          </div>

          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all">
            <FilePlus className="w-4 h-4" />
            <span>Select PDF Files</span>
            <input
              type="file"
              multiple
              accept=".pdf,application/pdf"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
