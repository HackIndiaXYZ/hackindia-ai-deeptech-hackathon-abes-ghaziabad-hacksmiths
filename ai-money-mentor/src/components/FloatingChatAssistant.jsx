import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { MessageSquare, IndianRupee, X, Send, Bot, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { askGemini } from '../services/geminiService';

export default function FloatingChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDot, setShowDot] = useState(false);
  const [iconToggle, setIconToggle] = useState(true); // true = chat, false = rupee
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Namaste! I'm AFTERMATH, your personal money mentor. How can I help you optimize your wealth today?", typed: false }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { state } = useApp();
  const location = useLocation();
  const messagesEndRef = useRef(null);
  
  // Icon toggle every 3s
  useEffect(() => {
    const i = setInterval(() => setIconToggle(v => !v), 3000);
    return () => clearInterval(i);
  }, []);

  // Unread dot after 30s
  useEffect(() => {
    const t = setTimeout(() => setShowDot(true), 30000);
    return () => clearTimeout(t);
  }, []);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend = input) => {
    if (!textToSend.trim()) return;
    const userMsg = { role: 'user', text: textToSend, typed: true };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const systemPrompt = `You are an expert Indian financial AI advisor. Keep responses short, empathetic, and actionable. Max 3-4 sentences. The user's profile: ${JSON.stringify(state.userData)} ${state.healthScore ? 'Their score: '+state.healthScore.score : ''}`;
      // Compile history
      const historyCtx = messages.slice(-4).map(m => `${m.role === 'ai'?'Advisor':'User'}: ${m.text}`).join('\n');
      const prompt = `Conversation history:\n${historyCtx}\n\nUser: ${textToSend}\nAdvisor:`;
      
      const response = await askGemini(prompt, systemPrompt);
      setMessages(prev => [...prev, { role: 'ai', text: response, typed: false }]);
    } catch(err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I'm having trouble connecting to my financial database right now.", typed: false }]);
    } finally {
      setIsTyping(false);
    }
  };

  const isHealthPage = location.pathname.includes('/results/health');
  const suggestions = isHealthPage ? [
    "How can I improve my score?",
    "What should I invest in first?",
    "How much emergency fund do I need?"
  ] : [
    "How do I save more tax?",
    "Am I on track for FIRE?",
    "What is the 50/30/20 rule?"
  ];

  const showSuggestions = messages.length <= 3 && !isTyping;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 50, x: 50, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50, x: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
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
                  <h3 className="font-bold text-white text-sm">AFTERMATH</h3>
                  <div className="text-xs text-green-400">Online</div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-red-500/20 hover:text-red-400">
                <X size={18} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-navy/50 relative">
              {messages.map((msg, i) => (
                <ChatMessage key={i} msg={msg} />
              ))}
              
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
                  <button 
                    key={i} onClick={() => handleSend(s)}
                    className="whitespace-nowrap bg-card border border-gold/20 hover:border-gold hover:bg-gold/10 text-gold text-xs px-3 py-1.5 rounded-full transition-colors flex-shrink-0"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input Form */}
            <div className="p-4 bg-navy border-t border-white/10 z-10">
              <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="relative flex items-center">
                <input 
                  type="text" 
                  value={input} onChange={e => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="w-full bg-card border border-white/10 rounded-full pl-4 pr-12 py-3 text-sm text-white outline-none focus:border-gold/50 transition-colors"
                />
                <button 
                  type="submit" disabled={!input.trim() || isTyping}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-gold rounded-full flex items-center justify-center text-navy disabled:opacity-50 disabled:bg-gray-600 disabled:text-gray-400 transition-all hover:scale-110"
                >
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
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.1, animation: 'none' }}
        onClick={() => { setIsOpen(!isOpen); setShowDot(false); }}
        className="w-16 h-16 bg-gradient-to-br from-gold to-yellow-600 rounded-full flex items-center justify-center text-navy shadow-[0_0_30px_rgba(245,166,35,0.4)] hover:shadow-[0_0_40px_rgba(245,166,35,0.6)] cursor-pointer relative z-50 border-4 border-navy"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={iconToggle ? 'chat' : 'rupee'}
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: 0.3 }}
          >
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

  // Typing effect for AI messages only if they are newly added
  useEffect(() => {
    if (isAi && !msg.typed) {
      let i = 0;
      const interval = setInterval(() => {
        if (i <= msg.text.length) {
          setDisplayText(msg.text.slice(0, i));
          i++;
        } else {
          clearInterval(interval);
          msg.typed = true;
        }
      }, 20); // roughly 30 chars per second
      return () => clearInterval(interval);
    } else {
      setDisplayText(msg.text); // User msgs or already typed
    }
  }, [msg, isAi]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }} 
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex items-start w-[85%] ${isAi ? 'mr-auto space-x-2' : 'ml-auto space-x-2 flex-row-reverse'}`}
    >
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
