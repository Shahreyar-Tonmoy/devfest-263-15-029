import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTender } from '../context/TenderContext';
import { X, Upload, Stamp, Check, Trash2, Image } from 'lucide-react';

export default function StampModal({ isOpen, onClose }) {
  const { t } = useLanguage();
  const { stampConfig, setStampConfig, showToast } = useTender();

  const [pageOption, setPageOption] = useState(stampConfig?.pageOption || 'all');
  const [position, setPosition] = useState(stampConfig?.position || 'bottom-right');
  const [previewUrl, setPreviewUrl] = useState(stampConfig?.dataUrl || null);
  const [imageBytes, setImageBytes] = useState(stampConfig?.imageBytes || null);

  if (!isOpen) return null;

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('png') && !file.name.toLowerCase().endsWith('.png')) {
      showToast('Please upload a PNG format image (.png) with transparency', 'warning');
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const url = URL.createObjectURL(file);
      setImageBytes(bytes);
      setPreviewUrl(url);
    } catch (err) {
      showToast('Failed to load image file', 'error');
    }
  };

  const handleApply = () => {
    if (!imageBytes) {
      showToast('Please upload a PNG stamp or logo first', 'warning');
      return;
    }

    setStampConfig({
      imageBytes,
      dataUrl: previewUrl,
      pageOption,
      position
    });
    showToast('Stamp & Seal configuration applied!', 'success');
    onClose();
  };

  const handleRemove = () => {
    setStampConfig(null);
    setImageBytes(null);
    setPreviewUrl(null);
    showToast('Stamp removed from package', 'info');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Stamp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{t('sealModalTitle')}</h3>
              <p className="text-xs text-slate-500">{t('sealModalSubtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Upload Box */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              {t('uploadPngPrompt')}
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-indigo-500 bg-slate-50 transition-colors">
              {previewUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-24 h-24 p-2 bg-white rounded-lg border border-slate-200 shadow-inner flex items-center justify-center">
                    <img src={previewUrl} alt="Seal Preview" className="max-h-full max-w-full object-contain" />
                  </div>
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Seal Image Loaded
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                    <Image className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    Upload official company seal, watermark, or signature PNG
                  </p>
                  <label className="inline-block cursor-pointer px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors">
                    Browse PNG File
                    <input type="file" accept="image/png" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Page Placement Options */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              {t('sealPageOption')}
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPageOption('all')}
                className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                  pageOption === 'all'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {t('sealAllPages')}
              </button>
              <button
                type="button"
                onClick={() => setPageOption('cover')}
                className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                  pageOption === 'cover'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {t('sealCoverOnly')}
              </button>
            </div>
          </div>

          {/* Position Options */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              {t('sealPosition')}
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { id: 'bottom-right', label: t('bottomRight') },
                { id: 'bottom-left', label: t('bottomLeft') },
                { id: 'top-right', label: t('topRight') }
              ].map(pos => (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => setPosition(pos.id)}
                  className={`p-2 rounded-lg border text-center font-medium transition-all ${
                    position === pos.id
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
          {stampConfig ? (
            <button
              onClick={handleRemove}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {t('removeSeal')}
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!imageBytes}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm"
            >
              {t('applySeal')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
