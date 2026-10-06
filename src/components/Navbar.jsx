import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTender } from '../context/TenderContext';
import { 
  FileCheck2, 
  Layers, 
  Eye, 
  BookOpen, 
  Sparkles, 
  Stamp, 
  Bot, 
  Save, 
  FolderOpen, 
  Download, 
  FileSpreadsheet, 
  MoreHorizontal, 
  Globe, 
  X,
  Menu,
  ChevronDown
} from 'lucide-react';
import StampModal from './StampModal';
import AiAgentChat from './AiAgentChat';

export default function Navbar() {
  const { lang, setLang, t } = useLanguage();
  const { 
    tender, 
    loadSamplePack, 
    saveToStorage, 
    loadFromStorage, 
    exportProjectFile,
    exportChecklistCSV
  } = useTender();

  const location = useLocation();
  const [isStampOpen, setIsStampOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toolsRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (toolsRef.current && !toolsRef.current.contains(event.target)) {
        setToolsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Top Accent Gradient Line */}
      <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-400 sticky top-0 z-50" />

      {/* Main Header Bar */}
      <header className="sticky top-1 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            
            {/* 1. Left: Clean Brand Logo & Active Tender */}
            <div className="flex items-center gap-2.5 shrink-0 min-w-0">
              <Link to="/" className="flex items-center gap-2.5 group shrink-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-all shrink-0">
                  <div className="w-full h-full bg-slate-950/20 rounded-[10px] flex items-center justify-center text-white">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight group-hover:text-blue-600 transition-colors">
                      {lang === 'bn' ? 'টেন্ডার বিল্ডার' : 'TenderBuilder'}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                      '26
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                    <span className="truncate max-w-[120px] sm:max-w-[180px] font-medium text-slate-600">
                      {tender.tender_id || 'T-2026-0417'}
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* 2. Center: Segmented Navigation Pill (Visible on lg+ screens, zero overlap) */}
            <nav className="hidden lg:flex items-center bg-slate-100/90 p-1 rounded-full border border-slate-200/70 shadow-inner shrink-0">
              <Link
                to="/"
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  location.pathname === '/'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{t('navBuilder')}</span>
              </Link>

              <Link
                to="/preview"
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  location.pathname === '/preview'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{t('navPreview')}</span>
              </Link>

              <Link
                to="/guidelines"
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  location.pathname === '/guidelines'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{t('navGuide')}</span>
              </Link>
            </nav>

            {/* 3. Right: Action Buttons & Controls */}
            <div className="flex items-center gap-2 shrink-0">
              
              {/* Load Sample Button */}
              <button
                onClick={loadSamplePack}
                title="Load sample tender files"
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg sm:rounded-full transition-colors shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">{t('loadSampleData')}</span>
                <span className="sm:hidden">Sample</span>
              </button>

              {/* Stamp & Seal Tool */}
              <button
                onClick={() => setIsStampOpen(true)}
                title={t('stampSealBtn')}
                className="hidden sm:inline-flex items-center gap-1 p-2 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg sm:rounded-full border border-slate-200 transition-colors"
              >
                <Stamp className="w-4 h-4 text-indigo-600" />
              </button>

              {/* AI Helper Tool */}
              <button
                onClick={() => setIsAiOpen(true)}
                title={t('aiAssistantBtn')}
                className="hidden sm:inline-flex items-center gap-1 p-2 text-slate-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg sm:rounded-full border border-slate-200 transition-colors"
              >
                <Bot className="w-4 h-4 text-purple-600" />
              </button>

              {/* Tools & Export Dropdown */}
              <div className="relative" ref={toolsRef}>
                <button
                  onClick={() => setToolsDropdownOpen(prev => !prev)}
                  className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg sm:rounded-full transition-colors"
                  title="Storage and Export Actions"
                >
                  <MoreHorizontal className="w-4 h-4 text-slate-600" />
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {toolsDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Project Storage
                    </div>

                    <button
                      onClick={() => { saveToStorage(); setToolsDropdownOpen(false); }}
                      className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                    >
                      <Save className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t('saveWork')} (Browser)</span>
                    </button>

                    <button
                      onClick={() => { loadFromStorage(); setToolsDropdownOpen(false); }}
                      className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t('loadWork')}</span>
                    </button>

                    <div className="my-1 border-t border-slate-100" />
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Export Options
                    </div>

                    <button
                      onClick={() => { exportProjectFile(); setToolsDropdownOpen(false); }}
                      className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-600" />
                      <span>{t('exportProject')}</span>
                    </button>

                    <button
                      onClick={() => { exportChecklistCSV(); setToolsDropdownOpen(false); }}
                      className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t('exportChecklistBtn')}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Language Switcher Pill (EN | বাংলা) */}
              <div className="flex items-center p-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold shadow-inner">
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-2 py-0.5 rounded-full transition-all text-[11px] ${
                    lang === 'en'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Switch to English"
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLang('bn')}
                  className={`px-2 py-0.5 rounded-full transition-all text-[11px] ${
                    lang === 'bn'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="বাংলায় পরিবর্তন করুন"
                >
                  বাং
                </button>
              </div>

              {/* Mobile Drawer Button (Visible on screens < lg) */}
              <button
                onClick={() => setMobileMenuOpen(prev => !prev)}
                className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown for tablets and phones */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-3 animate-in slide-in-from-top-1 duration-150 shadow-lg">
            {/* Nav Links */}
            <div className="grid grid-cols-3 gap-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-center py-2 px-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                  location.pathname === '/' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{t('navBuilder')}</span>
              </Link>
              <Link
                to="/preview"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-center py-2 px-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                  location.pathname === '/preview' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{t('navPreview')}</span>
              </Link>
              <Link
                to="/guidelines"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-center py-2 px-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                  location.pathname === '/guidelines' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{t('navGuide')}</span>
              </Link>
            </div>

            {/* Quick Tools */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
              <button
                onClick={() => { setIsStampOpen(true); setMobileMenuOpen(false); }}
                className="p-2 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200 font-semibold flex items-center justify-center gap-1.5"
              >
                <Stamp className="w-3.5 h-3.5 text-indigo-600" />
                <span>{t('stampSealBtn')}</span>
              </button>

              <button
                onClick={() => { setIsAiOpen(true); setMobileMenuOpen(false); }}
                className="p-2 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 font-semibold flex items-center justify-center gap-1.5"
              >
                <Bot className="w-3.5 h-3.5 text-purple-600" />
                <span>AI Inspector</span>
              </button>

              <button
                onClick={() => { saveToStorage(); setMobileMenuOpen(false); }}
                className="p-2 rounded-xl bg-slate-100 text-slate-800 font-semibold flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5 text-slate-600" />
                <span>{t('saveWork')}</span>
              </button>

              <button
                onClick={() => { exportChecklistCSV(); setMobileMenuOpen(false); }}
                className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold flex items-center justify-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Checklist CSV</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Floating AI Agent Chat Bubble (Accessible everywhere) */}
      <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40">
        <button
          onClick={() => setIsAiOpen(prev => !prev)}
          className="group relative flex items-center gap-2 p-3 sm:px-4 sm:py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white rounded-full shadow-xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all"
          title="Open TenderBot AI Agent Chat"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-indigo-700 animate-pulse"></span>
          </div>
          <span className="hidden sm:inline-block font-extrabold text-xs tracking-wide">
            TenderBot AI
          </span>
          <span className="sm:hidden absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white"></span>
        </button>
      </div>

      {/* Modals & AI Agent Drawer */}
      <StampModal isOpen={isStampOpen} onClose={() => setIsStampOpen(false)} />
      <AiAgentChat isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </>
  );
}
