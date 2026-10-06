import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTender } from '../context/TenderContext';
import { 
  Bot, 
  Sparkles, 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Wand2, 
  Download, 
  RotateCcw,
  ShieldCheck,
  Calendar,
  MessageSquare,
  FileCheck
} from 'lucide-react';

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
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'agent',
      time: 'Just now',
      text: lang === 'bn' 
        ? `স্বাগতম! আমি আপনার টেন্ডার প্রকিউরমেন্ট এআই এজেন্ট। আমি টেন্ডারের সকল নথি যাচাই, মেয়াদ উত্তীর্ণের তারিখ পরীক্ষণ, ডুপ্লিকেট শনাক্তকরণ এবং চূড়ান্ত প্যাকেজ নিয়মমাফিক তৈরিতে সাহায্য করি। আমি আপনাকে কীভাবে সহায়তা করতে পারি?`
        : `Hello! I am your Tender Procurement AI Agent. I monitor your tender requirements, verify certificate expiry dates, detect duplicates, and ensure strict compliance with tender rules. How can I assist you today?`,
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

  const executeQuickAction = (actionType) => {
    if (actionType === 'auto_match') {
      triggerAutoMatch();
      addAgentMessage(lang === 'bn' ? '✅ ফাইলের নামের ভিত্তিতে সফলভাবে নথি সংযুক্ত করা হয়েছে।' : '✅ Auto-matched available candidate files to requirements!');
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

    // Prepare current tender context state for the Agent
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

    // Check if user has provided their own Gemini API Key (Rulebook 5.5)
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

Answer directly, accurately, and politely with actionable advice. If the user asks why the package is blocked, list the exact issues and how to fix them.`
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

    // Intelligent built-in Agent Brain (Works offline / zero keys)
    setTimeout(() => {
      setIsTyping(false);
      const lower = text.toLowerCase();

      if (lower.includes('audit') || lower.includes('compliance') || lower.includes('অডিট')) {
        let reply = lang === 'bn'
          ? `📋 **টেন্ডার কমপ্লায়েন্স অডিট রিপোর্ট**\n• **টেন্ডার আইডি:** ${tender.tender_id}\n• **জমার শেষ তারিখ:** ${tender.submission_deadline}\n• **মোট আবশ্যক নথি:** ${requirements.length} টি\n\n`
          : `📋 **Tender Compliance Audit Report**\n• **Tender ID:** ${tender.tender_id}\n• **Submission Deadline:** ${tender.submission_deadline}\n• **Total Requirements:** ${requirements.length}\n\n`;

        if (blockers.length === 0 && Object.keys(matches).length > 0) {
          reply += lang === 'bn'
            ? `🎉 **সব শর্ত পূরণ হয়েছে!** কোনো ব্লকিং সমস্যা নেই। আপনি প্যাকেজ তৈরি করতে পারেন।`
            : `🎉 **100% Compliant!** Zero blocking errors found. All mandatory certificates are present and valid on deadline. You can generate the final PDF package now!`;
        } else {
          reply += lang === 'bn'
            ? `⚠️ **বর্তমান সমস্যাসমূহ (${blockers.length} টি):**\n`
            : `⚠️ **Current Blocking Issues (${blockers.length}):**\n`;
          blockers.forEach((b, i) => {
            reply += `${i + 1}. **${b.title} (${b.reqId})**: ${b.reason}\n`;
          });
        }
        addAgentMessage(reply);
      } else if (lower.includes('blocked') || lower.includes('why') || lower.includes('ব্লক')) {
        if (blockers.length === 0) {
          addAgentMessage(lang === 'bn'
            ? 'প্যাকেজ তৈরির বাটন ব্লকড নয়! আপনি এখন একীভূত প্যাকেজ তৈরি করতে পারেন।'
            : 'The Generate Package button is NOT blocked! All mandatory rules are satisfied. Click "Generate Combined PDF Package".');
        } else {
          let reply = lang === 'bn'
            ? `প্যাকেজ তৈরির বাটনটি ব্লক হওয়ার কারণ (${blockers.length} টি সমস্যা):\n\n`
            : `The Generate button is blocked due to the following ${blockers.length} issue(s):\n\n`;
          blockers.forEach((b, i) => {
            reply += `• **${b.title}**: ${b.reason}\n`;
          });
          reply += lang === 'bn'
            ? `\n💡 সমাধান: ফাইল সংযুক্ত করুন এবং রুলবুক ৫ অনুযায়ী মেয়াদ উত্তীর্ণের সঠিক তারিখ নির্বাচন করুন।`
            : `\n💡 Solution: Attach the required PDF files and set valid expiry dates on or after ${tender.submission_deadline}.`;
          addAgentMessage(reply);
        }
      } else if (lower.includes('expiry') || lower.includes('date') || lower.includes('মেয়াদ')) {
        const expiryDocs = requirements.filter(r => r.has_expiry);
        let reply = lang === 'bn'
          ? `📅 **মেয়াদ সংক্রান্ত নথির তথ্য (ডেডলাইন: ${tender.submission_deadline}):**\n\n`
          : `📅 **Expiry Requirements (Deadline: ${tender.submission_deadline}):**\n\n`;
        expiryDocs.forEach(ed => {
          const s = getDocumentStatus(ed);
          const enteredDate = expiryDates[ed.id] || 'Not entered';
          reply += `• **${ed.title_en} (${ed.id})**: Date = ${enteredDate} | Status: **${s.code}**\n`;
        });
        reply += lang === 'bn'
          ? `\nমনে রাখবেন: ডেডলাইনের দিনে মেয়াদ শেষ হলেও নথিটি গ্রহণযোগ্য থাকবে।`
          : `\nNote: If a document expires on the exact submission deadline date, it is still valid and OK.`;
        addAgentMessage(reply);
      } else if (lower.includes('match') || lower.includes('suggest') || lower.includes('মিল')) {
        addAgentMessage(
          lang === 'bn'
            ? 'আমি স্বয়ংক্রিয়ভাবে আপলোডকৃত ফাইলগুলোর নাম বিশ্লেষণ করে সঠিক নথির সাথে মিল করতে পারি। আপনি কি স্বয়ংক্রিয় মিলকরণ চালাতে চান?'
            : 'I can analyze candidate file names (like trade license, tin, vat, solvency, proposals) and automatically match them to requirements.',
          [
            { label: '⚡ Run Auto-Match Now', action: 'auto_match' }
          ]
        );
      } else {
        addAgentMessage(
          lang === 'bn'
            ? `আমি আপনার প্রশ্নটি বিশ্লেষণ করেছি। আপনার বর্তমান টেন্ডার প্যাকেজে ${blockers.length === 0 ? 'সব শর্ত পূরণ হয়েছে' : `${blockers.length}টি সমস্যা রয়েছে`}। আপনি কি একটি সম্পূর্ণ অডিট রিপোর্ট দেখতে চান?`
            : `I analyzed your request for Tender **${tender.tender_id}**. Currently you have **${blockers.length} blocking issue(s)**. Let me know if you would like me to perform an automated compliance audit or suggest matching files.`,
          [
            { label: '🔍 Run Audit', query: 'Run a complete compliance audit.' },
            { label: '⚡ Auto-Match', action: 'auto_match' }
          ]
        );
      }
    }, 650);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-50 max-w-[420px] w-[calc(100%-1.5rem)] sm:w-full bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 h-[560px] max-h-[85vh]">
      
      {/* 1. Header */}
      <div className="p-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
              <Bot className="w-6 h-6 text-sky-200" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-indigo-700"></span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-sm tracking-tight text-white">TenderBot AI</h3>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-mono text-sky-200">
                Agent v2
              </span>
            </div>
            <p className="text-[11px] text-blue-100 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-300" />
              <span>Procurement & Rules Inspector</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-white/80">
          <button
            onClick={() => setShowKeyInput(prev => !prev)}
            title="Configure Gemini API Key (Rulebook 5.5)"
            className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${showKeyInput ? 'bg-white/20 text-white' : ''}`}
          >
            <Key className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
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
              <Key className="w-3.5 h-3.5 text-purple-600" /> Gemini API Key (Optional)
            </span>
            <span className="text-[10px] text-purple-600 font-medium">Rulebook 5.5 Compliant</span>
          </div>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => handleSaveKey(e.target.value)}
            placeholder="AIzaSy... (leave empty for built-in local engine)"
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
          />
          <p className="text-[10px] text-purple-700">
            Keys remain strictly in your browser and are never saved on servers.
          </p>
        </div>
      )}

      {/* 3. Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-slate-50/60">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1 mb-1 text-[10px] text-slate-400 font-mono">
              <span>{msg.sender === 'user' ? 'You' : 'TenderBot'}</span>
              <span>•</span>
              <span>{msg.time}</span>
            </div>

            <div
              className={`p-3.5 rounded-2xl max-w-[88%] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-xs shadow-md'
                  : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs shadow-xs'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Action Buttons inside agent message */}
              {msg.actions && msg.actions.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                  {msg.actions.map((act, i) => (
                    <button
                      key={i}
                      onClick={() => act.action ? executeQuickAction(act.action) : handleSendMessage(act.query)}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold text-[11px] border border-blue-200 transition-colors shadow-xs"
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Suggestion Chips */}
              {msg.actionSuggestions && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Suggested Queries:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.actionSuggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(sug.query)}
                        className="text-left px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
                      >
                        {sug.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs italic p-2">
            <Bot className="w-4 h-4 animate-bounce text-purple-600" />
            <span>TenderBot is analyzing requirements...</span>
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
            placeholder={lang === 'bn' ? 'এআই এজেন্টকে যেকোনো প্রশ্ন করুন...' : 'Ask TenderBot any compliance question...'}
            className="flex-1 text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl shadow-md shadow-blue-500/20 transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>AI Vibe-Coding Solo Assistant</span>
          <span>Rulebook 5.5 Ready</span>
        </div>
      </div>

    </div>
  );
}
