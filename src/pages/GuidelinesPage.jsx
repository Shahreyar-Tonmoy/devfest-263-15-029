import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  BookOpen, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  HelpCircle,
  FileText,
  ShieldCheck,
  FileCheck2
} from 'lucide-react';

export default function GuidelinesPage() {
  const { lang, t } = useLanguage();

  const rulesData = [
    {
      status: 'Missing',
      statusBn: 'অনুপস্থিত (Missing)',
      trigger: 'Document is mandatory (mandatory: true), but no file is matched.',
      triggerBn: 'বাধ্যতামূলক নথি কিন্তু কোনো পিডিএফ ফাইল সংযুক্ত করা হয়নি।',
      blocks: 'YES (Blocked)',
      blocksBn: 'হ্যাঁ (প্যাকেজ তৈরি বন্ধ থাকবে)',
      fix: 'Upload and match the corresponding PDF file.',
      fixBn: 'প্রয়োজনীয় পিডিএফ ফাইল আপলোড করে সংযুক্ত করুন।',
      icon: <XCircle className="w-4 h-4 text-red-600" />,
      colorClass: 'bg-red-50/70 border-red-200 text-red-900',
      badgeClass: 'bg-red-100 text-red-800'
    },
    {
      status: 'Expiry date needed',
      statusBn: 'মেয়াদ উত্তীর্ণের তারিখ প্রয়োজন',
      trigger: 'Document requires expiry verification (has_expiry: true) and a file is matched, but no date is entered.',
      triggerBn: 'নথির মেয়াদ থাকা আবশ্যক এবং ফাইল সংযুক্ত হয়েছে, কিন্তু মেয়াদ উত্তীর্ণের তারিখ লেখা হয়নি।',
      blocks: 'YES (Blocked)',
      blocksBn: 'হ্যাঁ (প্যাকেজ তৈরি বন্ধ থাকবে)',
      fix: 'Enter the certificate\'s validity/expiry date in the date picker.',
      fixBn: 'সনদে উল্লেখিত মেয়াদ উত্তীর্ণের তারিখটি ক্যালেন্ডার থেকে নির্বাচন করুন।',
      icon: <Clock className="w-4 h-4 text-amber-600" />,
      colorClass: 'bg-amber-50/70 border-amber-200 text-amber-900',
      badgeClass: 'bg-amber-100 text-amber-800'
    },
    {
      status: 'Expired',
      statusBn: 'মেয়াদোত্তীর্ণ (Expired)',
      trigger: 'The entered expiry date is strictly before the tender submission deadline.',
      triggerBn: 'প্রদত্ত মেয়াদ উত্তীর্ণের তারিখ টেন্ডার জমার শেষ সময়সীমার পূর্বেই অতিক্রান্ত হয়েছে।',
      blocks: 'YES (Blocked)',
      blocksBn: 'হ্যাঁ (প্যাকেজ তৈরি বন্ধ থাকবে)',
      fix: 'Replace with a renewed certificate valid on or after the deadline.',
      fixBn: 'বর্তমান ডেডলাইনের সমপরিমাণ বা পরবর্তী মেয়াদের নবায়নকৃত সনদ দিয়ে প্রতিস্থাপন করুন।',
      icon: <AlertTriangle className="w-4 h-4 text-rose-600" />,
      colorClass: 'bg-rose-50/70 border-rose-200 text-rose-900',
      badgeClass: 'bg-rose-100 text-rose-800'
    },
    {
      status: 'Not provided',
      statusBn: 'প্রদান করা হয়নি (Not provided)',
      trigger: 'Document is optional (mandatory: false) and no file is matched.',
      triggerBn: 'নথিটি ঐচ্ছিক এবং কোনো ফাইল সংযুক্ত করা হয়নি।',
      blocks: 'NO (Allowed)',
      blocksBn: 'না (অনুমোদিত)',
      fix: 'No action required. Will be cleanly omitted from final package.',
      fixBn: 'কোনো করণীয় নেই। চূড়ান্ত প্যাকেজ থেকে এটি বাদ দেওয়া হবে।',
      icon: <HelpCircle className="w-4 h-4 text-slate-500" />,
      colorClass: 'bg-slate-50/80 border-slate-200 text-slate-800',
      badgeClass: 'bg-slate-200 text-slate-700'
    },
    {
      status: 'OK',
      statusBn: 'ঠিক আছে (OK)',
      trigger: 'File is matched, and if expiry is required, the date is on or after the submission deadline.',
      triggerBn: 'ফাইল সংযুক্ত হয়েছে এবং প্রযোজ্য ক্ষেত্রে মেয়াদ জমার ডেডলাইন বা তার পরবর্তী তারিখ পর্যন্ত বৈধ।',
      blocks: 'NO (Compliant)',
      blocksBn: 'না (সম্পূর্ণ গ্রহণযোগ্য)',
      fix: 'Fully compliant and ready.',
      fixBn: 'নথি সম্পূর্ণ সঠিক ও বৈধ।',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      colorClass: 'bg-emerald-50/70 border-emerald-200 text-emerald-900',
      badgeClass: 'bg-emerald-100 text-emerald-800'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-bold font-mono">
              AI DevFest 2026
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Contest Reference</span>
          </div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900">
            {t('rulesTitle')}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t('rulesIntro')}
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all shrink-0 self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('backToBuilder')}</span>
        </Link>
      </div>

      {/* Section 5: Document Status Evaluation Rules */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
          <span>{t('ruleSection5Title')}</span>
        </h2>

        <p className="text-xs text-slate-600 leading-relaxed">
          {lang === 'bn' 
            ? 'প্রতিটি প্রয়োজনীয় নথিপত্র স্বয়ংক্রিয়ভাবে মূল্যায়িত হয় এবং নিচের পাঁচটি সরকারি স্ট্যাটাসের যেকোনো একটি প্রদর্শন করে:'
            : 'Each required document is evaluated dynamically and displays exactly one of the five official statuses below:'}
        </p>

        {/* Mobile View: Cards */}
        <div className="grid grid-cols-1 gap-3 sm:hidden">
          {rulesData.map((rule, idx) => (
            <div key={idx} className={`p-4 rounded-xl border ${rule.colorClass} space-y-2`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs flex items-center gap-1.5">
                  {rule.icon}
                  {lang === 'bn' ? rule.statusBn : rule.status}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${rule.badgeClass}`}>
                  {lang === 'bn' ? rule.blocksBn : rule.blocks}
                </span>
              </div>
              <p className="text-xs opacity-90">
                <strong>{lang === 'bn' ? 'শর্ত:' : 'When:'}</strong> {lang === 'bn' ? rule.triggerBn : rule.trigger}
              </p>
              <p className="text-xs opacity-80 pt-1 border-t border-slate-200/50">
                <strong>{lang === 'bn' ? 'সমাধান:' : 'Fix:'}</strong> {lang === 'bn' ? rule.fixBn : rule.fix}
              </p>
            </div>
          ))}
        </div>

        {/* Desktop & Tablet View: Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3 border-b border-slate-200">Status</th>
                <th className="p-3 border-b border-slate-200">Condition / Trigger</th>
                <th className="p-3 border-b border-slate-200 text-center">Blocks Package?</th>
                <th className="p-3 border-b border-slate-200">How to Fix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {rulesData.map((rule, idx) => (
                <tr key={idx} className={rule.colorClass}>
                  <td className="p-3 font-bold flex items-center gap-1.5">
                    {rule.icon}
                    {lang === 'bn' ? rule.statusBn : rule.status}
                  </td>
                  <td className="p-3">
                    {lang === 'bn' ? rule.triggerBn : rule.trigger}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${rule.badgeClass}`}>
                      {lang === 'bn' ? rule.blocksBn : rule.blocks}
                    </span>
                  </td>
                  <td className="p-3 text-[11px]">
                    {lang === 'bn' ? rule.fixBn : rule.fix}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 leading-relaxed">
          <strong>Important Rule Note:</strong> If a document expires on the <em>exact same day</em> as the submission deadline, it is considered <strong>OK</strong>. Duplicate files with identical binary content are flagged in the uploaded list and cannot be matched to multiple distinct documents.
        </div>
      </div>

      {/* Section 6: Package Layout & Footer Specifications */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <FileCheck2 className="w-5 h-5 text-indigo-600 shrink-0" />
          <span>{t('ruleSection6Title')}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <h4 className="font-bold text-slate-900 text-xs">6.1 Page 1: Official English Cover Page</h4>
            <p className="text-slate-600 leading-relaxed">
              The first page of every package is an English cover page displaying:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-700">
              <li>Tender ID (e.g. T-2026-0417)</li>
              <li>Tender Title</li>
              <li>Procuring Entity name</li>
              <li>Bidder name</li>
              <li>Submission Deadline date</li>
              <li>Date the package was generated</li>
              <li>Sorted list of included documents in order</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <h4 className="font-bold text-slate-900 text-xs">6.2 Document Sequence & Preservation</h4>
            <p className="text-slate-600 leading-relaxed">
              Documents are merged strictly after the cover page, sorted in ascending sequence of their requirement <code>order</code>.
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-700">
              <li>All pages of each file are included in their original sequence.</li>
              <li>Optional documents without attached files are cleanly skipped.</li>
              <li>Index page shows the exact starting page number of each attachment.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 md:col-span-2">
            <h4 className="font-bold text-slate-900 text-xs">6.3 & 6.4 Package Footers and Pagination</h4>
            <p className="text-slate-600 leading-relaxed">
              Every page in the package (including the cover page and index page) contains a standardized footer:
            </p>
            <div className="p-3 bg-white border border-slate-300 rounded-lg text-center font-mono font-bold text-slate-800 text-xs sm:text-sm">
              &lt;tender_id&gt; | Page X of Y
            </div>
            <p className="text-slate-500 text-[11px]">
              Y is the total number of pages across the entire package. The footer is styled with a protective background bar and separation line to ensure it is crystal clear and never overlaps document text.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
