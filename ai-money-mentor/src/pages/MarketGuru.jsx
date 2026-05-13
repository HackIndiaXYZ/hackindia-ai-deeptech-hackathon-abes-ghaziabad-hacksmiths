import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Crown, Shield, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GURUS = [
  { id: 'rj', name: 'Rakesh Jhunjhunwala', emoji: '🐂', color: '#ef4444', icon: Crown, style: 'Bold & Concentrated', bg: 'from-red-500/10 to-navy',
    desc: 'High conviction, concentrated bets. Go big or go home.',
    answers: {
      default: "Beta, investing me conviction chahiye. Ek company me full research karo, then usko itna samjho ki tumhe stock price dekhne ki zarurat na pade. Market crash? More shares at discount! India ka growth story abhi shuru hua hai.",
      'should i invest': "Haan bhai, invest karo! But no mutual funds — pick 3-4 companies you deeply understand. Banking, infrastructure, consumer — jo India ka backbone hai. Put 70% in your top pick. Half knowledge is dangerous, full knowledge is wealth.",
      'market crash': "Market crash? This is when fortunes are made! In 2008 maine Titan shares double kiye. Jab sab log darr ke bhaag rahe hote hain, tab asli investor kharidta hai. Crash is a sale, not a funeral.",
      'sip': "SIP is fine for beginners. But real wealth? That comes from conviction investing. ₹10,000 SIP will give you comfortable retirement. ₹10 lakh in one great stock can give you generational wealth.",
    }
  },
  { id: 'wb', name: 'Warren Buffett (India)', emoji: '🦉', color: '#3b82f6', icon: Shield, style: 'Patient & Value-Focused', bg: 'from-blue-500/10 to-navy',
    desc: 'Buy wonderful businesses at fair prices. Then do nothing.',
    answers: {
      default: "The stock market is a device for transferring money from the impatient to the patient. In India, find companies with strong moats — brand power like Asian Paints, network effects like HDFC Bank. Buy them. Hold them for 20 years. Ignore the noise.",
      'should i invest': "Invest in what you understand. If you use Pidilite products daily, if you bank with HDFC, if you know why Bajaj Finance is different — those are your circle of competence. Start there. Never invest in something you can't explain to a 10-year-old.",
      'market crash': "Be fearful when others are greedy, and greedy when others are fearful. A market crash is simply wonderful businesses going on sale. Would you panic if your favorite store had a 30% discount? No. Same with stocks.",
      'sip': "SIP in a good index fund is the best advice for 90% of people. Nifty 50 has returned 12% CAGR over 20 years. Just automate it and forget about it. The best investors check their portfolio once a year.",
    }
  },
  { id: 'idx', name: 'Index Investor', emoji: '📊', color: '#22c55e', icon: BarChart3, style: 'Boring But Works', bg: 'from-green-500/10 to-navy',
    desc: 'Low cost, diversified, evidence-based. Beat 85% of fund managers by doing less.',
    answers: {
      default: "Data shows 85% of actively managed mutual funds in India underperform the Nifty 50 index over 10 years. So why are you paying higher fees for worse performance? Nifty 50 index fund + Nifty Next 50 + one international fund. Done. Total expense ratio under 0.2%. That's it.",
      'should i invest': "Three funds. That's all you need. 60% Nifty 50 index fund, 25% Nifty Next 50, 15% Nasdaq 100 for international exposure. Total expense ratio: 0.15%. Rebalance once a year. You'll beat 85% of professional fund managers.",
      'market crash': "During a crash, do absolutely nothing. Historically, staying invested through every crash has been more profitable than trying to time exits and entries. Missing just the 10 best market days over 20 years reduces returns by 50%.",
      'sip': "SIP is the greatest wealth-building tool ever invented. ₹10,000/month in Nifty 50 index at 12% CAGR = ₹1 crore in 20 years. No stock picking. No fund manager fees. No stress. Just boring, beautiful compounding.",
    }
  },
];

export default function MarketGuru() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [asked, setAsked] = useState(false);
  const [userQ, setUserQ] = useState('');

  const getAnswer = (guru, q) => {
    const lower = q.toLowerCase();
    if (lower.includes('invest')) return guru.answers['should i invest'];
    if (lower.includes('crash') || lower.includes('fall') || lower.includes('bear')) return guru.answers['market crash'];
    if (lower.includes('sip') || lower.includes('mutual')) return guru.answers['sip'];
    return guru.answers.default;
  };

  const ask = () => {
    if (!question.trim()) return;
    setUserQ(question);
    setAsked(true);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-navy text-white pt-24 pb-32 px-4">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">🧘 Indian Market Guru</h1>
          <p className="text-gray-400">Ask one question. Get three dramatically different answers.</p>
        </div>

        {/* Question input */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex gap-2">
            <input value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && ask()}
              placeholder="Ask any Indian market question... (e.g. Should I invest in stocks?)" className="flex-1 bg-card border border-white/10 rounded-xl px-5 py-4 text-white outline-none focus:border-gold" />
            <button onClick={ask} className="bg-gold text-navy font-bold px-6 rounded-xl hover:bg-yellow-400 transition-colors">
              <Send size={18} />
            </button>
          </div>
          {!asked && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {['Should I invest in stocks?', 'What about the market crash?', 'Is SIP worth it?'].map(s => (
                <button key={s} onClick={() => { setQuestion(s); setUserQ(s); setAsked(true); }}
                  className="text-xs bg-card border border-white/10 px-3 py-1.5 rounded-full text-gray-400 hover:text-white hover:border-white/20 transition-all">
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Guru responses */}
        {asked && (
          <div className="space-y-6">
            <div className="text-center text-sm text-gray-500 mb-6">Your question: <span className="text-white italic">"{userQ}"</span></div>
            <div className="grid lg:grid-cols-3 gap-6">
              {GURUS.map((g, i) => (
                <motion.div key={g.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.3 }}
                  className={`bg-gradient-to-br ${g.bg} p-6 rounded-3xl border`} style={{ borderColor: g.color + '30' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-4xl">{g.emoji}</div>
                    <div>
                      <div className="text-sm font-bold text-white">{g.name}</div>
                      <div className="text-xs font-medium" style={{ color: g.color }}>{g.style}</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed mb-4">{getAnswer(g, userQ)}</p>
                  <div className="text-[10px] text-gray-600 italic">{g.desc}</div>
                </motion.div>
              ))}
            </div>
            <button onClick={() => { setAsked(false); setQuestion(''); }}
              className="block mx-auto bg-card border border-white/10 text-gray-400 px-6 py-3 rounded-xl hover:text-white transition-colors mt-6">Ask Another Question</button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
