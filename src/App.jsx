import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { TenderProvider, useTender } from './context/TenderContext';
import Navbar from './components/Navbar';
import BuilderPage from './pages/BuilderPage';
import PreviewPage from './pages/PreviewPage';
import GuidelinesPage from './pages/GuidelinesPage';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

function ToastContainer() {
  const { toastMessage } = useTender();
  if (!toastMessage) return null;

  const getIcon = () => {
    switch (toastMessage.type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-600 shrink-0" />;
    }
  };

  const getBg = () => {
    switch (toastMessage.type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-300 text-emerald-900';
      case 'error':
        return 'bg-rose-50 border-rose-300 text-rose-900';
      case 'warning':
        return 'bg-amber-50 border-amber-300 text-amber-900';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-300 text-blue-900';
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className={`p-3.5 rounded-xl border shadow-lg flex items-center gap-2.5 text-xs font-semibold ${getBg()}`}>
        {getIcon()}
        <span className="flex-1">{toastMessage.message}</span>
      </div>
    </div>
  );
}

function MainLayout() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-200 selection:text-blue-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Routes>
          <Route path="/" element={<BuilderPage />} />
          <Route path="/preview" element={<PreviewPage />} />
          <Route path="/guidelines" element={<GuidelinesPage />} />
        </Routes>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            AI DevFest 2026 • AI Vibe-Coding Contest • Registration: <strong className="font-mono text-slate-700">263-15-029</strong>
          </p>
          <p className="text-slate-400">
            Frontend-only • React • Tailwind CSS • React Router • pdf-lib
          </p>
        </div>
      </footer>

      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <TenderProvider>
        <Router>
          <MainLayout />
        </Router>
      </TenderProvider>
    </LanguageProvider>
  );
}
