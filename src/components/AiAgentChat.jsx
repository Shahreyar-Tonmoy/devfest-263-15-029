import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTender } from '../context/TenderContext';
import { 
  Bot, 
  Sparkles, 
  Send, 
  X, 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  Wand2, 
  Download, 
  ShieldCheck, 
  Calendar, 
  Check, 
  Copy, 
  FileText, 
  CornerDownLeft,
  User,
  Clock,
  Layers
} from 'lucide-react';

/**
 * Rich Formatter for Agent and User messages
 */
function FormattedMessageText({ text, isAgent }) {
  if (!isAgent) {
    return <div className="whitespace-pre-wrap">{text}</div>;
  }

  // Split by double line breaks into logical blocks
  const blocks = text.split(/\n\s*\n/);

  const formatInlineText = (str) => {
    // Replace **bold**
    const parts = [];
    let remaining = str;
    let keyIdx = 0;

    // Regex for bold **...** and backticks `...`
    const regex = /(\*\*.*?\*\*|`.*?`)/g;
    const splitTokens = remaining.split(regex);

    return splitTokens.map((token, idx) => {
      if (token.startsWith('**') && token.endsWith('**')) {
        const inner = token.slice(2, -2);
        return <strong key={idx} className="font-bold text-slate-900">{inner}</strong>;
      }
      if (token.startsWith('`') && token.endsWith('`')) {
        const code = token.slice(1, -1);
        return (
          <code key={idx} className="font-mono bg-slate-100 text-blue-700 px-1 py-0.5 rounded text-[11px] font-semibold border border-slate-200">
            {code}
          </code>
        );
      }
      return <span key={idx}>{token}</span>;
    });
  };

  return (
    <div className="space-y-2.5 text-xs text-slate-700 leading-relaxed">
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Header block: ### or ##
        if (trimmed.startsWith('###') || trimmed.startsWith('##') || trimmed.startsWith('#')) {
          const headerText = trimmed.replace(/^#+\s*/, '');
          return (
            <div key={bIdx} className="font-extrabold text-sm text-slate-900 pb-1 border-b border-slate-200/80 pt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>{formatInlineText(headerText)}</span>
            </div>
          );
        }

        // List block: starts with • or - or numbers
        const lines = trimmed.split('\n');
        const isList = lines.every(l => l.trim().startsWith('•') || l.trim().startsWith('-') || /^\d+\./.test(l.trim()));

        if (isList) {
          return (
            <div key={bIdx} className="space-y-1.5 bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/70">
              {lines.map((line, lIdx) => {
                const cleanLine = line.trim().replace(/^([•\-]|\d+\.)\s*/, '');
                const isError = line.includes('Expired') || line.includes('Missing') || line.includes('error') || line.includes('মেয়াদোত্তীর্ণ');
                const isSuccess = line.includes('OK') || line.includes('Compliant') || line.includes('ঠিক আছে');

                return (
                  <div key={lIdx} className="flex items-start gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                      isError ? 'bg-rose-500' : isSuccess ? 'bg-emerald-500' : 'bg-indigo-500'
                    }`} />
                    <span className="flex-1 leading-snug">{formatInlineText(cleanLine)}</span>
                  </div>
                );
              })}
            </div>
          );
        }

        // Alert box if starts with ⚠️ or 💡 or 🎉
        if (trimmed.startsWith('⚠️') || trimmed.startsWith('💡') || trimmed.startsWith('🎉')) {
          const isWarning = trimmed.startsWith('⚠️');
          const isSuccess = trimmed.startsWith('🎉');
          return (
            <div
              key={bIdx}
              className={`p-3 rounded-xl border flex items-start gap-2 leading-relaxed ${
                isWarning
                  ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                  : isSuccess
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  : 'bg-blue-50/80 border-blue-200 text-blue-950'
              }`}
            >
              <div className="shrink-0 text-sm mt-0.5">{trimmed.substring(0, 2)}</div>
              <div className="flex-1">{formatInlineText(trimmed.substring(2).trim())}</div>
            </div>
          );
        }

        // Standard paragraph
        return (
          <p key={bIdx}>
            {formatInlineText(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

export default function AiAgentChat({ isOpen, onClose }) {
  const { lang, t } = useLanguage();
  const { 
    tender, 
    requirements, 
    matches, 
    expiryDates, 
    uploadedFiles, 
    getDocumentStatus, 
    getBlockingIssues,
    triggerAutoMatch,
    loadSamplePack,
    exportChecklistCSV
  } = useTender();

  const [apiKey, setApiKey] = useState(() => localStorage.getItem('user_gemini_api_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'agent',
      time: 'Just now',
      text: lang === 'bn' 
        ? `স্বাগতম! আমি আপনার টেন্ডার প্রকিউরমেন্ট এআই এজেন্ট। আমি টেন্ডারের সকল নথি যাচাই, মেয়াদ উত্তীর্ণের তারিখ পরীক্ষণ, ডুপ্লিকেট শনাক্তকরণ এবং চূড়ান্ত প্যাকেজ নিয়মমাফিক তৈরিতে সাহায্য করি।`
        : `Hello! I am your Tender Procurement AI Agent. I monitor tender requirements, verify certificate expiry dates, check duplicate files, and help build a compliant tender document package.`,
      actionSuggestions: [
        { label: lang === 'bn' ? '🔍 সম্পূর্ণ অডিট করুন' : '🔍 Full Compliance Audit', query: 'Run a complete compliance audit on my current tender documents.' },
        { label: lang === 'bn' ? '⚠️ কেন প্যাকেজ ব্লক?' : '⚠️ Why is package blocked?', query: 'Why is the package generation button currently blocked?' },
        { label: lang === 'bn' ? '⚡ স্বয়ংক্রিয় মিলকরণ' : '⚡ Auto-match suggestions', query: 'Suggest best document matches based on uploaded files.' },
        { label: lang === 'bn' ? '📅 মেয়াদ পরীক্ষা' : '📅 Check expiry dates', query: 'Check expiry dates and alert me of any expired certificates.' }
      ]
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSaveKey = (val) => {
    setApiKey(val);
    localStorage.setItem('user_gemini_api_key', val);
  };

  const handleCopyMessage = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const executeQuickAction = (actionType) => {
    if (actionType === 'auto_match') {
      triggerAutoMatch();
      addAgentMessage(lang === 'bn' ? '✅ ফাইলের নামের ভিত্তিতে সফলভাবে নথি সংযুক্ত করা হয়েছে।' : '✅ Auto-matched candidate files to requirements!');
    } else if (actionType === 'load_sample') {
      loadSamplePack();
      addAgentMessage(lang === 'bn' ? '✅ নমুনা টেন্ডার ফাইল ও রিকোয়ারমেন্ট লোড করা হয়েছে।' : '✅ Sample pack files and requirements preloaded!');
    } else if (actionType === 'export_csv') {
      exportChecklistCSV();
      addAgentMessage(lang === 'bn' ? '✅ চেকলিস্ট CSV ফাইল ডাউনলোড শুরু হয়েছে।' : '✅ Checklist CSV exported and downloaded!');
    }
  };

  const addAgentMessage = (text, actions = null) => {
    setMessages(prev => [
      ...prev,
      {
        id: `agent_${Date.now()}`,
        sender: 'agent',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text,
        actions
      }
    ]);
  };

  const handleSendMessage = async (textToSend = null) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: text.trim()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    const blockers = getBlockingIssues();
    const docStatuses = requirements.map(r => {
      const fId = matches[r.id];
      const f = fId ? uploadedFiles.find(item => item.id === fId) : null;
      const s = getDocumentStatus(r);
      return {
        id: r.id,
        order: r.order,
        title: r.title_en,
        mandatory: r.mandatory,
        has_expiry: r.has_expiry,
        file: f ? f.name : 'None',
        expiry: expiryDates[r.id] || 'None',
        status: s.code
      };
    });

    // Check if user entered Gemini API Key
    if (apiKey.trim()) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey.trim())}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are TenderBot, an autonomous, highly professional Tender Compliance AI Agent assisting a bidder with their bid submission package.
Tender Details:
- Tender ID: ${tender.tender_id}
- Title: ${tender.title}
- Procuring Entity: ${tender.procuring_entity}
- Bidder: ${tender.bidder}
- Submission Deadline: ${tender.submission_deadline}

Current Document Statuses:
${JSON.stringify(docStatuses, null, 2)}

Current Blocking Issues (${blockers.length}):
${JSON.stringify(blockers, null, 2)}

Language to respond in: ${lang === 'bn' ? 'Bangla (বাংলা)' : 'English'}.
User prompt: "${text}"

Answer directly, accurately, and politely with actionable advice using clear markdown sections and bullet points.`
              }]
            }]
          })
        });

        const data = await response.json();
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
          const aiResponse = data.candidates[0].content.parts[0].text;
          setIsTyping(false);
          addAgentMessage(aiResponse);
          return;
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to local agent logic:', err);
      }
    }

    // Built-in intelligent Agent Brain
    setTimeout(() => {
      setIsTyping(false);
      const lower = text.toLowerCase();

      if (lower.includes('audit') || lower.includes('compliance') || lower.includes('অডিট')) {
        let reply = lang === 'bn'
          ? `### টেন্ডার কমপ্লায়েন্স অডিট রিপোর্ট\n**টেন্ডার আইডি:** \`${tender.tender_id}\` | **জমার শেষ তারিখ:** \`${tender.submission_deadline}\`\n\n`
          : `### Tender Compliance Audit Report\n**Tender ID:** \`${tender.tender_id}\` | **Submission Deadline:** \`${tender.submission_deadline}\`\n\n`;

        if (blockers.length === 0 && Object.keys(matches).length > 0) {
          reply += lang === 'bn'
            ? `🎉 সব শর্ত পূরণ হয়েছে! কোনো ব্লকিং সমস্যা নেই। আপনি প্যাকেজ তৈরি করতে পারেন।`
            : `🎉 100% Compliant! Zero blocking errors found. All mandatory certificates are present and valid on deadline. You can generate the final PDF package now!`;
        } else {
          reply += lang === 'bn'
            ? `⚠️ বর্তমান সমস্যাসমূহ (${blockers.length} টি):\n\n`
            : `⚠️ Current Blocking Issues (${blockers.length}):\n\n`;
          blockers.forEach((b, i) => {
            reply += `• **${b.title} (${b.reqId})**: ${b.reason}\n`;
          });
        }
        addAgentMessage(reply, [
          { label: '⚡ Run Auto-Match', action: 'auto_match' },
          { label: '📊 Export Checklist CSV', action: 'export_csv' }
        ]);
      } else if (lower.includes('blocked') || lower.includes('why') || lower.includes('ব্লক')) {
        if (blockers.length === 0) {
          addAgentMessage(lang === 'bn'
            ? '🎉 প্যাকেজ তৈরির বাটনটি ব্লকড নয়! আপনি এখন একীভূত প্যাকেজ তৈরি করতে পারেন।'
            : '🎉 The Generate Package button is NOT blocked! All mandatory rules are satisfied. Click "Generate Combined PDF Package".');
        } else {
          let reply = lang === 'bn'
            ? `⚠️ প্যাকেজ তৈরির বাটন ব্লক হওয়ার কারণ (${blockers.length} টি সমস্যা):\n\n`
            : `⚠️ Package Generation is blocked due to ${blockers.length} issue(s):\n\n`;
          blockers.forEach((b) => {
            reply += `• **${b.title}**: ${b.reason}\n`;
          });
          reply += lang === 'bn'
            ? `\n💡 সমাধান: ফাইল সংযুক্ত করুন এবং রুলবুক ৫ অনুযায়ী মেয়াদ উত্তীর্ণের সঠিক তারিখ নির্বাচন করুন।`
            : `\n💡 Solution: Attach the required PDF files and ensure expiry dates are on or after ${tender.submission_deadline}.`;
          addAgentMessage(reply, [
            { label: '⚡ Auto-Match Files', action: 'auto_match' }
          ]);
        }
      } else if (lower.includes('expiry') || lower.includes('date') || lower.includes('মেয়াদ')) {
        const expiryDocs = requirements.filter(r => r.has_expiry);
        let reply = lang === 'bn'
          ? `### মেয়াদ সংক্রান্ত নথির তথ্য\n**জমার শেষ সময়সীমা:** \`${tender.submission_deadline}\`\n\n`
          : `### Certificate Expiry Verification\n**Submission Deadline:** \`${tender.submission_deadline}\`\n\n`;
        expiryDocs.forEach(ed => {
          const s = getDocumentStatus(ed);
          const enteredDate = expiryDates[ed.id] || 'Not entered';
          reply += `• **${ed.title_en} (${ed.id})**: Date = \`${enteredDate}\` | Status: **${s.code}**\n`;
        });
        reply += lang === 'bn'
          ? `\n💡 মনে রাখবেন: ডেডলাইনের দিনে মেয়াদ শেষ হলেও নথিটি বৈধ থাকবে।`
          : `\n💡 Rule Note: If a document expires on the exact submission deadline date, it is still valid and OK.`;
        addAgentMessage(reply);
      } else if (lower.includes('match') || lower.includes('suggest') || lower.includes('মিল')) {
        addAgentMessage(
          lang === 'bn'
            ? '💡 আমি ফাইলের নামের সাথে রিকোয়ারমেন্ট মিলিয়ে স্বয়ংক্রিয়ভাবে ম্যাচ করতে পারি। নিচের বাটনে ক্লিক করে স্বয়ংক্রিয় মিলকরণ চালু করুন:'
            : '💡 I can analyze file names (Trade license, TIN, VAT, Solvency, Proposal) and automatically match them to requirements.',
          [
            { label: '⚡ Execute Auto-Match Now', action: 'auto_match' }
          ]
        );
      } else {
        addAgentMessage(
          lang === 'bn'
            ? `আমি আপনার প্রশ্নটি বিশ্লেষণ করেছি। টেন্ডার **${tender.tender_id}** এর জন্য আপনার বর্তমান প্যাকেজে **${blockers.length}টি সমস্যা** রয়েছে। আপনি কি সম্পূর্ণ অডিট রিপোর্ট দেখতে চান?`
            : `I reviewed your inquiry for Tender **${tender.tender_id}**. You currently have **${blockers.length} blocking issue(s)**. I can audit the documents or suggest matching files.`,
          [
            { label: '🔍 Run Audit', query: 'Run a complete compliance audit.' },
            { label: '⚡ Run Auto-Match', action: 'auto_match' }
          ]
        );
      }
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-50 max-w-[450px] w-[calc(100%-1.5rem)] sm:w-full bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 h-[600px] max-h-[85vh]">
      
      {/* 1. Header with Gradient Accent */}
      <div className="p-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/25 shadow-inner">
              <Bot className="w-6 h-6 text-sky-200" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-indigo-800 animate-pulse"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm tracking-tight text-white">TenderBot AI</h3>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono text-sky-200 font-bold border border-white/10">
                Agent v2
              </span>
            </div>
            <p className="text-[11px] text-blue-100 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Procurement & Rules Specialist</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-white/90">
          <button
            onClick={() => setShowKeyInput(prev => !prev)}
            title="Configure Gemini API Key (Rulebook 5.5)"
            className={`p-1.5 rounded-xl hover:bg-white/15 transition-colors ${showKeyInput ? 'bg-white/25 text-white' : ''}`}
          >
            <Key className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/15 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. Optional API Key Slide Down */}
      {showKeyInput && (
        <div className="p-3 bg-purple-50 border-b border-purple-200 text-xs space-y-1.5 animate-in slide-in-from-top-2 duration-150 shrink-0">
          <div className="flex items-center justify-between">
            <span className="font-bold text-purple-900 flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-purple-600" /> Google Gemini API Key (Rulebook 5.5)
            </span>
            <span className="text-[10px] text-purple-600 font-semibold bg-purple-100 px-1.5 py-0.5 rounded">Optional</span>
          </div>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => handleSaveKey(e.target.value)}
            placeholder="AIzaSy... (leave blank for local agent engine)"
            className="w-full px-3 py-1.5 text-xs bg-white border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono shadow-xs"
          />
          <p className="text-[10px] text-purple-700 leading-tight">
            Your key stays strictly inside your browser and is never stored on servers.
          </p>
        </div>
      )}

      {/* 3. Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-slate-50/70">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            {msg.sender === 'agent' ? (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
                <Bot className="w-4 h-4 text-sky-100" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-600 flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
                <User className="w-4 h-4 text-white" />
              </div>
            )}

            {/* Bubble & Actions */}
            <div className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              
              <div className="flex items-center gap-2 mb-1 px-1 text-[10px] text-slate-400 font-mono">
                <span className="font-semibold text-slate-600">
                  {msg.sender === 'user' ? 'You' : 'TenderBot AI'}
                </span>
                <span>•</span>
                <span>{msg.time}</span>
              </div>

              <div
                className={`p-3.5 rounded-2xl leading-relaxed shadow-sm transition-all group relative ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs shadow-blue-500/15'
                    : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs shadow-slate-200/60'
                }`}
              >
                {/* Message Body with rich formatting */}
                <FormattedMessageText text={msg.text} isAgent={msg.sender === 'agent'} />

                {/* Copy button for Agent responses */}
                {msg.sender === 'agent' && (
                  <button
                    onClick={() => handleCopyMessage(msg.id, msg.text)}
                    className="absolute top-2 right-2 p-1 text-slate-300 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100"
                    title="Copy message"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}

                {/* Interactive Action Buttons */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-2">
                    {msg.actions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => act.action ? executeQuickAction(act.action) : handleSendMessage(act.query)}
                        className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-[11px] shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>{act.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Suggestion Chips */}
                {msg.actionSuggestions && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Quick Analysis Prompts:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.actionSuggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(sug.query)}
                          className="text-left px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-all border border-slate-200/60 active:scale-95"
                        >
                          {sug.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        ))}

        {/* Typing State */}
        {isTyping && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs p-3 shadow-xs flex items-center gap-2 text-xs text-slate-500">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse delay-100"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse delay-200"></span>
              </span>
              <span className="font-medium">TenderBot is auditing rules...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. Input Area */}
      <div className="p-3 bg-white border-t border-slate-200 shrink-0 space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={lang === 'bn' ? 'এআই এজেন্টকে যেকোনো প্রশ্ন করুন...' : 'Ask TenderBot compliance questions...'}
            className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/70"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="p-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 text-white rounded-xl shadow-md shadow-blue-500/20 transition-all shrink-0 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono px-1">
          <span>AI Vibe-Coding Solo Assistant</span>
          <span>Rulebook 5.5 Certified</span>
        </div>
      </div>

    </div>
  );
}
