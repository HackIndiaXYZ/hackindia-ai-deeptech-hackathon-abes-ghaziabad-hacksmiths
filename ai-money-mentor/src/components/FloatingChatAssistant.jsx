import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { MessageSquare, IndianRupee, X, Send, Bot, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { askGemini } from '../services/geminiService';

// ─── Smart local fallback: answers based on user's actual data ────────────────
function getLocalAnswer(question, userData, healthScore) {
  const q = question.toLowerCase();
  const income     = Number(userData?.monthlyIncome   || 0);
  const expenses   = Number(userData?.monthlyExpenses || 0);
  const savings    = Number(userData?.savings         || 0);
  const invest     = Number(userData?.investments     || 0);
  const debt       = Number(userData?.debtAmount      || 0);
  const age        = Number(userData?.age             || 30);
  const surplus    = income - expenses;
  const score      = healthScore?.score || 0;
  const fmt        = (n) => '₹' + Number(n).toLocaleString('en-IN');

  // Emergency fund
  if (q.includes('emergency') || q.includes('fund')) {
    const target  = expenses * 6;
    const gap     = Math.max(0, target - savings);
    const months  = expenses > 0 ? (savings / expenses).toFixed(1) : 0;
    return gap > 0
      ? `Your emergency fund covers ${months} months. You need ${fmt(gap)} more to reach the recommended 6-month target of ${fmt(target)}. Keep it in a sweep-in FD or liquid mutual fund for instant access.`
      : `Great news — your savings of ${fmt(savings)} covers ${months} months of expenses, which is above the 6-month target. Well done!`;
  }

  // Score improvement
  if (q.includes('score') || q.includes('improve') || q.includes('increase')) {
    const tips = [];
    if (savings < expenses * 3) tips.push(`build your emergency fund to ${fmt(expenses * 6)}`);
    if (debt > income * 6)      tips.push(`aggressively pay down your debt of ${fmt(debt)}`);
    if (invest < income * 3)    tips.push(`start a SIP of at least ${fmt(Math.round(surplus * 0.3))}/mo`);
    tips.push('max out your Section 80C limit of ₹1,50,000/year');
    return `Your score is ${score}/100. To improve it: ${tips.slice(0,3).map((t,i)=>`${i+1}) ${t}`).join(', ')}. Each of these alone can add 5-15 points.`;
  }

  // Investment / SIP
  if (q.includes('invest') || q.includes('sip') || q.includes('mutual fund')) {
    const sipAmt = Math.max(2000, Math.round(surplus * 0.35));
    return income > 0
      ? `Based on your ${fmt(surplus)} monthly surplus, you can invest around ${fmt(sipAmt)}/mo in a diversified equity SIP. At 12% annual returns over 10 years, that grows to ${fmt(Math.round(sipAmt * 12 * 10 * 1.8))}. Start with a Flexi Cap fund like Parag Parikh or Mirae Asset.`
      : `A good rule of thumb: invest at least 20-30% of your income. Start with a simple index fund SIP — even ₹500/mo builds the habit.`;
  }

  // Tax savings
  if (q.includes('tax') || q.includes('80c') || q.includes('save tax')) {
    return income > 0
      ? `At your income of ${fmt(income)}/mo, you can save up to ₹46,800/year by maxing out Section 80C (₹1.5L via ELSS/PPF) and an extra ₹15,600 via NPS under 80CCD(1B). That's ₹62,400 total tax savings annually.`
      : `Max out Section 80C (₹1.5L/yr) using ELSS mutual funds, PPF, or EPF. Additionally, invest in NPS for an extra ₹50,000 deduction under 80CCD(1B). Total annual tax saving can be up to ₹62,400.`;
  }

  // Debt
  if (q.includes('debt') || q.includes('loan') || q.includes('emi')) {
    return debt > 0
      ? `You have ${fmt(debt)} in debt. With a surplus of ${fmt(surplus)}/mo, allocating ${fmt(Math.round(surplus * 0.3))}/mo extra towards prepayment can reduce your tenure significantly and save lakhs in interest. Prioritize high-interest loans first.`
      : `You have no debt — that's excellent! This gives you maximum flexibility to invest. Put your surplus of ${fmt(surplus)}/mo to work in equity SIPs.`;
  }

  // FIRE / retirement
  if (q.includes('fire') || q.includes('retire') || q.includes('freedom')) {
    const annualExp   = expenses * 12;
    const fireCorpus  = annualExp * 25;
    const currentCorpus = savings + invest;
    return `For FIRE at your current expenses of ${fmt(expenses)}/mo, you need a corpus of ${fmt(fireCorpus)} (25x annual expenses). You currently have ${fmt(currentCorpus)}. Investing ${fmt(Math.round(surplus * 0.5))}/mo at 12% return can bridge this gap significantly.`;
  }

  // Insurance
  if (q.includes('insurance') || q.includes('term')) {
    return age < 40
      ? `At age ${age}, a ₹1 Crore term life insurance plan costs just ~₹700-900/month. This is the most critical financial safety net — get it before any investment. Also ensure you have health insurance of at least ₹10 Lakh.`
      : `A ₹1 Crore term plan at your age is still worthwhile. Prioritize a comprehensive health cover of ₹15-20 Lakh as medical costs rise with age. Check if your employer cover is sufficient.`;
  }

  // Savings rate
  if (q.includes('save') || q.includes('saving') || q.includes('50/30/20')) {
    const rate = income > 0 ? Math.round((surplus / income) * 100) : 0;
    return income > 0
      ? `Your current savings rate is ${rate}% (${fmt(surplus)}/mo). The 50/30/20 rule suggests: 50% needs (${fmt(income*0.5)}), 30% wants (${fmt(income*0.3)}), 20% savings (${fmt(income*0.2)}). ${rate >= 20 ? "You're doing well!" : `Try to get your savings rate to at least 20% — cut discretionary spend by ${fmt(income*0.2 - surplus)}/mo.`}`
      : `The 50/30/20 rule: spend 50% on needs, 30% on wants, and save/invest 20% of your income. For most Indians, even 10% saved consistently beats 30% saved occasionally.`;
  }

  // Greeting
  if (q.includes('hi') || q.includes('hello') || q.includes('namaste') || q.length < 10) {
    return score > 0
      ? `Namaste! Your current money health score is ${score}/100. I can help you improve it! Ask me about investments, tax savings, emergency funds, debt management, or FIRE planning.`
      : `Namaste! I'm your AI financial advisor. Ask me about savings, investments, tax planning, debt management, insurance, or how to reach financial freedom!`;
  }

  // Generic fallback
  return `Based on your profile — ${fmt(income)}/mo income, ${fmt(surplus)} monthly surplus, ${fmt(invest)} invested — my top advice: ${surplus > 10000 ? `start a ${fmt(Math.round(surplus * 0.3))}/mo SIP` : 'reduce expenses to create a surplus'}, max your 80C to save ₹46,800 in tax, and ensure you have a 6-month emergency fund of ${fmt(expenses * 6)}. Which of these would you like to explore?`;
}

export default function FloatingChatAssistant() {
  const [isOpen, setIsOpen]         = useState(false);
  const [showDot, setShowDot]       = useState(false);
  const [iconToggle, setIconToggle] = useState(true);
  const [messages, setMessages]     = useState([
    { role: 'ai', text: "Namaste! I'm AFTERMATH, your personal money mentor. How can I help you optimize your wealth today?", typed: false }
  ]);
  const [input, setInput]       = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { state }               = useApp();
  const location                = useLocation();
  const messagesEndRef          = useRef(null);

  useEffect(() => {
    const i = setInterval(() => setIconToggle(v => !v), 3000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowDot(true), 30000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend = input) => {
    if (!textToSend.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: textToSend, typed: true }]);
    setInput('');
    setIsTyping(true);

    try {
      // Try Gemini API first
      const systemPrompt = `You are an expert Indian financial AI advisor called AFTERMATH. Keep responses short (2-3 sentences max), empathetic, and actionable. The user's profile: Income ${state.userData?.monthlyIncome}, Expenses ${state.userData?.monthlyExpenses}, Savings ${state.userData?.savings}, Investments ${state.userData?.investments}, Debt ${state.userData?.debtAmount}, Age ${state.userData?.age}. Health score: ${state.healthScore?.score || 'not yet calculated'}.`;
      const historyCtx = messages.slice(-4).map(m => `${m.role === 'ai' ? 'Advisor' : 'User'}: ${m.text}`).join('\n');
      const prompt = `${historyCtx}\nUser: ${textToSend}\nAdvisor:`;
      const response = await askGemini(prompt, systemPrompt);
      setMessages(prev => [...prev, { role: 'ai', text: response, typed: false }]);
    } catch {
      // Smart local fallback — never shows generic error message
      const localAnswer = getLocalAnswer(textToSend, state.userData, state.healthScore);
      setMessages(prev => [...prev, { role: 'ai', text: localAnswer, typed: false }]);
    } finally {
      setIsTyping(false);
    }
  };

  const isHealthPage   = location.pathname.includes('/results/health');
  const suggestions    = isHealthPage
    ? ['How can I improve my score?', 'What should I invest in first?', 'How much emergency fund do I need?']
    : ['How do I save more tax?', 'Am I on track for FIRE?', 'What is the 50/30/20 rule?'];
  const showSuggestions = messages.length <= 3 && !isTyping;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50, x: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50, x: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-card w-[380px] h-[520px] rounded-3xl border border-gold/30 shadow-2xl overflow-hidden flex flex-col mb-4 relative"
          >
            {/* Header */}
            <div className="bg-navy border-b border-white/10 p-4 flex items-center justify-between z-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gold to-yellow-600 rounded-full flex items-center justify-center p-1 relative">
                  <div className="bg-navy w-full h-full rounded-full flex items-center justify-center">
                    <Bot className="text-gold w-5 h-5" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-navy animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">AFTERMATH AI</h3>
                  <div className="text-xs text-green-400">Online • Always here</div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-red-500/20 hover:text-red-400">
                <X size={18} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-navy/50 relative">
              {messages.map((msg, i) => <ChatMessage key={i} msg={msg} />)}
              {isTyping && (
                <div className="flex items-start w-3/4 mr-auto space-x-2">
                  <div className="w-8 h-8 rounded-full bg-navy border border-white/10 flex items-center justify-center shrink-0 mt-1">
                    <Bot size={14} className="text-gold" />
                  </div>
                  <div className="bg-navy border border-white/5 p-3 rounded-2xl rounded-tl-sm flex space-x-1.5 h-10 items-center">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {showSuggestions && (
              <div className="px-4 pb-2 pt-2 bg-navy/50 z-10 flex flex-nowrap overflow-x-auto gap-2 no-scrollbar">
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => handleSend(s)}
                    className="whitespace-nowrap bg-card border border-gold/20 hover:border-gold hover:bg-gold/10 text-gold text-xs px-3 py-1.5 rounded-full transition-colors flex-shrink-0">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-4 bg-navy border-t border-white/10 z-10">
              <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="relative flex items-center">
                <input
                  type="text" value={input} onChange={e => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="w-full bg-card border border-white/10 rounded-full pl-4 pr-12 py-3 text-sm text-white outline-none focus:border-gold/50 transition-colors"
                />
                <button type="submit" disabled={!input.trim() || isTyping}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-gold rounded-full flex items-center justify-center text-navy disabled:opacity-50 disabled:bg-gray-600 transition-all hover:scale-110">
                  <Send size={14} className="translate-x-[1px] translate-y-[1px]" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bubble Button */}
      <motion.button
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={{ scale: 1.1 }}
        onClick={() => { setIsOpen(!isOpen); setShowDot(false); }}
        className="w-16 h-16 bg-gradient-to-br from-gold to-yellow-600 rounded-full flex items-center justify-center text-navy shadow-[0_0_30px_rgba(245,166,35,0.4)] hover:shadow-[0_0_40px_rgba(245,166,35,0.6)] cursor-pointer relative z-50 border-4 border-navy"
      >
        <AnimatePresence mode="wait">
          <motion.div key={iconToggle ? 'chat' : 'rupee'}
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: 0.3 }}>
            {iconToggle ? <MessageSquare fill="currentColor" size={24} /> : <IndianRupee strokeWidth={3} size={24} />}
          </motion.div>
        </AnimatePresence>
        {showDot && !isOpen && (
          <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-navy">
            <div className="w-full h-full bg-red-400 rounded-full animate-ping opacity-75" />
          </div>
        )}
      </motion.button>
    </div>
  );
}

function ChatMessage({ msg }) {
  const isAi = msg.role === 'ai';
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    if (isAi && !msg.typed) {
      let i = 0;
      const interval = setInterval(() => {
        if (i <= msg.text.length) { setDisplayText(msg.text.slice(0, i)); i++; }
        else { clearInterval(interval); msg.typed = true; }
      }, 18);
      return () => clearInterval(interval);
    } else {
      setDisplayText(msg.text);
    }
  }, [msg, isAi]);

  return (
    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex items-start w-[85%] ${isAi ? 'mr-auto space-x-2' : 'ml-auto space-x-2 flex-row-reverse'}`}>
      <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 mt-1 ${isAi ? 'bg-navy border-white/10' : 'bg-gold border-gold ml-2'}`}>
        {isAi ? <Bot size={14} className="text-gold" /> : <User size={14} className="text-navy" />}
      </div>
      <div className={`p-3 text-sm leading-relaxed shadow-md ${isAi ? 'bg-navy border border-white/5 rounded-2xl rounded-tl-sm text-gray-200' : 'bg-gradient-to-br from-gold to-yellow-600 rounded-2xl rounded-tr-sm text-navy font-medium'}`}>
        {displayText}
        {isAi && !msg.typed && <span className="inline-block w-1.5 h-3 ml-1 bg-gold animate-pulse align-middle" />}
      </div>
    </motion.div>
  );
}
