import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTender } from '../context/TenderContext';
import { 
  FileText, 
  Globe, 
  Save, 
  FolderOpen, 
  Download, 
  Upload, 
  Stamp, 
  Bot, 
  HelpCircle,
  FileCheck2,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import StampModal from './StampModal';
import AiHelperModal from './AiHelperModal';

export default function Navbar() {
  const { lang, toggleLanguage, t } = useLanguage();
  const { 
    saveToStorage, 
    loadFromStorage, 
    exportProjectFile, 
    loadRequirementsJson,
    loadSamplePack,
    tender 
  } = useTender();
  
  const location = useLocation();
  const [isStampOpen, setIsStampOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2">
            
            {/* Left: Brand Logo & Title */}
            <div className="flex items-center gap-2.5 min-w-0">
              <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                  <FileCheck2 className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="font-bold text-slate-900 text-sm sm:text-base lg:text-lg tracking-tight group-hover:text-blue-600 transition-colors truncate">
                      {t('appName')}
                    </span>
                    <span className="hidden sm:inline-block text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 shrink-0">
                      '26
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium hidden md:block truncate max-w-xs lg:max-w-md">
                    {tender.tender_id ? `${tender.tender_id} • ${tender.title}` : t('appTagline')}
                  </p>
                </div>
              </Link>
            </div>

            {/* Middle: Navigation Links (Desktop) */}
            <nav className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 shrink-0">
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  location.pathname === '/' 
                    ? 'bg-white text-blue-700 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('navBuilder')}
              </Link>
              <Link
                to="/preview"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  location.pathname === '/preview' 
                    ? 'bg-white text-blue-700 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('navPreview')}
              </Link>
              <Link
                to="/guidelines"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  location.pathname === '/guidelines' 
                    ? 'bg-white text-blue-700 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('navGuide')}
              </Link>
            </nav>

            {/* Right: Actions & Language Switcher */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              
              {/* Load Sample Pack (Desktop) */}
              <button
                onClick={loadSamplePack}
                title="Load the official sample pack files"
                className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('loadSampleData')}</span>
              </button>

              {/* Stamp & Seal Tool */}
              <button
                onClick={() => setIsStampOpen(true)}
                title={t('stampSealBtn')}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              >
                <Stamp className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden md:inline">{t('stampSealBtn')}</span>
              </button>

              {/* AI Helper Tool */}
              <button
                onClick={() => setIsAiOpen(true)}
                title={t('aiAssistantBtn')}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
              >
                <Bot className="w-3.5 h-3.5" />
                <span className="hidden md:inline">AI Helper</span>
              </button>

              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg border border-blue-300 bg-blue-50/70 hover:bg-blue-100 text-blue-800 text-xs font-bold transition-all shadow-xs"
                title={lang === 'en' ? 'Switch to বাংলা' : 'Switch to English'}
              >
                <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{lang === 'en' ? 'বাং' : 'EN'}</span>
              </button>

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(prev => !prev)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150 shadow-lg">
            <div className="grid grid-cols-3 gap-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-center py-2 px-3 rounded-lg text-xs font-bold transition-colors ${
                  location.pathname === '/' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {t('navBuilder')}
              </Link>
              <Link
                to="/preview"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-center py-2 px-3 rounded-lg text-xs font-bold transition-colors ${
                  location.pathname === '/preview' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {t('navPreview')}
              </Link>
              <Link
                to="/guidelines"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-center py-2 px-3 rounded-lg text-xs font-bold transition-colors ${
                  location.pathname === '/guidelines' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {t('navGuide')}
              </Link>
            </div>

            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                onClick={() => { loadSamplePack(); setMobileMenuOpen(false); }}
                className="p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('loadSampleData')}</span>
              </button>

              <button
                onClick={() => { setIsStampOpen(true); setMobileMenuOpen(false); }}
                className="p-2 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 font-semibold flex items-center justify-center gap-1.5"
              >
                <Stamp className="w-3.5 h-3.5" />
                <span>{t('stampSealBtn')}</span>
              </button>

              <button
                onClick={() => { setIsAiOpen(true); setMobileMenuOpen(false); }}
                className="p-2 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 font-semibold flex items-center justify-center gap-1.5"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>AI Helper</span>
              </button>

              <button
                onClick={() => { saveToStorage(); setMobileMenuOpen(false); }}
                className="p-2 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 font-semibold flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{t('saveWork')}</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
              <button
                onClick={() => { loadFromStorage(); setMobileMenuOpen(false); }}
                className="flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>{t('loadWork')}</span>
              </button>

              <button
                onClick={() => { exportProjectFile(); setMobileMenuOpen(false); }}
                className="flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t('exportProject')}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Modals */}
      <StampModal isOpen={isStampOpen} onClose={() => setIsStampOpen(false)} />
      <AiHelperModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </>
  );
}
