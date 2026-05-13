import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain, Shield, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const QUESTIONS = [
  'Do you check your bank account balance daily?',
  'Does stock market crash news give you anxiety?',
  'Have you ever lost sleep worrying about money?',
  'Do you avoid opening investment apps when markets are down?',
  'Do you keep too much cash "just in case"?',
  'Do you feel guilty after spending on yourself?',
  'Have you postponed financial decisions out of fear?',
  'Do you feel overwhelmed by too many investment options?',
];

const PROFILES = [
  { min: 0, max: 12, name: 'Frozen Deer', emoji: '🦌', color: '#3b82f6', desc: 'Paralyzed by financial anxiety. You have the money, but fear stops you from acting.', costText: 'Your fear costs you ₹3-5 lakhs per year in lost investment returns because your money sits idle.', gradient: 'from-blue-500/10 to-navy' },
  { min: 13, max: 20, name: 'Cautious Turtle', emoji: '🐢', color: '#22c55e', desc: 'You play it too safe. FDs and savings accounts feel comfortable, but they barely beat inflation.', costText: 'Over-caution costs you ~₹15 lakhs over 10 years by choosing 6% FDs over 12% equity.', gradient: 'from-green-500/10 to-navy' },
  { min: 21, max: 28, name: 'Confident Architect', emoji: '🏗️', color: '#F5A623', desc: 'The sweet spot. You understand risk, plan carefully, and execute with confidence.', costText: 'You\'re on the right track. Keep refining your strategy and stay disciplined.', gradient: 'from-yellow-500/10 to-navy' },
  { min: 29, max: 40, name: 'Reckless Gambler', emoji: '🎰', color: '#ef4444', desc: 'Too much risk tolerance. You chase tips, time markets, and make emotional trades.', costText: 'Reckless decisions cost active traders 4-7% annually vs a simple index fund strategy.', gradient: 'from-red-500/10 to-navy' },
];

const FEAR_PLAN = [
  { step: 'Start with ₹500', desc: 'Open a liquid fund and invest just ₹500. The goal is action, not amount.' },
  { step: 'Automate one SIP', desc: 'Set up ₹2,000 auto-debit SIP. Remove yourself from the decision loop.' },
  { step: 'Check portfolio weekly only', desc: 'Delete price alert notifications. Check once a week, Sunday evening.' },
  { step: 'Learn one concept/week', desc: 'Read about one financial concept each week. Knowledge reduces fear.' },
  { step: 'Have a crash plan', desc: 'Write down: "If market drops 20%, I will ___." Having a plan prevents panic.' },
];

export default function FearIndex() {
  const navigate = useNavigate();
  const { state } = useApp();
  const demoF = state.demoData?.fear;
  const initAnswers = (() => {
    if (!demoF) return {};
    const a = {};
    demoF.answers.forEach((val, i) => { a[i] = val; });
    return a;
  })();
  const [answers, setAnswers] = useState(initAnswers);
  const [done, setDone] = useState(!!demoF);
  const currentQ = Object.keys(answers).length;

  useEffect(() => {
    if (state.demoData?.fear) {
      const demoAnswers = {};
      state.demoData.fear.answers.forEach((val, i) => { demoAnswers[i] = val; });
      setAnswers(demoAnswers);
      setDone(true);
    }
  }, [state.demoData]);

  const answer = (qi, val) => {
    const newAns = { ...answers, [qi]: val };
    setAnswers(newAns);
    if (Object.keys(newAns).length === QUESTIONS.length) {
      setTimeout(() => setDone(true), 500);
    }
  };

  const score = Object.values(answers).reduce((a, b) => a + b, 0);
  const profile = PROFILES.find(p => score >= p.min && score <= p.max) || PROFILES[0];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-navy text-white pt-24 pb-32 px-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            <Brain className="inline w-10 h-10 text-purple-400 mr-2 -mt-1" /> The Fear Index
          </h1>
          <p className="text-gray-400">How is your relationship with money really?</p>
        </div>

        {!done ? (
          <div className="space-y-4">
            {QUESTIONS.map((q, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: i <= currentQ ? 1 : 0.3, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card p-5 rounded-2xl border border-white/5"
              >
                <div className="text-sm text-gray-300 mb-3">{i + 1}. {q}</div>
                <div className="flex gap-2">
                  {[
                    { label: 'Never', value: 0 },
                    { label: 'Sometimes', value: 2 },
                    { label: 'Often', value: 3 },
                    { label: 'Always', value: 5 },
                  ].map(opt => (
                    <button key={opt.label} onClick={() => answer(i, opt.value)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                        answers[i] === opt.value ? 'bg-purple-600 text-white' : 'bg-navy border border-white/10 text-gray-500 hover:text-white hover:border-white/20'
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {/* Profile reveal */}
            <div className={`bg-gradient-to-br ${profile.gradient} p-10 rounded-3xl border text-center`} style={{ borderColor: profile.color + '30' }}>
              <div className="text-6xl mb-4">{profile.emoji}</div>
              <div className="text-xs uppercase tracking-widest mb-2" style={{ color: profile.color }}>Your Money Fear Profile</div>
              <h2 className="text-3xl font-black text-white mb-3">{profile.name}</h2>
              <div className="text-sm text-gray-400 mb-4 max-w-md mx-auto">{profile.desc}</div>

              {/* Score bar */}
              <div className="max-w-sm mx-auto mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>🦌 Frozen</span><span>🏗️ Balanced</span><span>🎰 Reckless</span>
                </div>
                <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden relative">
                  <motion.div className="absolute top-0 left-0 h-full rounded-full" style={{ background: profile.color, width: `${(score / 40) * 100}%` }}
                    initial={{ width: 0 }} animate={{ width: `${(score / 40) * 100}%` }} transition={{ duration: 1 }} />
                </div>
                <div className="text-center text-lg font-black mt-2" style={{ color: profile.color }}>Score: {score}/40</div>
              </div>

              <div className="bg-black/30 p-4 rounded-xl text-sm text-gray-300">{profile.costText}</div>
            </div>

            {/* Fear reduction plan */}
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Shield size={20} className="text-green-400" /> 5-Step Fear Reduction Plan</h3>
              <div className="space-y-3">
                {FEAR_PLAN.map((p, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
                    className="bg-card p-5 rounded-2xl border border-white/5 flex items-start gap-4">
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 font-bold text-sm shrink-0">{i+1}</div>
                    <div>
                      <div className="text-sm font-bold text-white">{p.step}</div>
                      <div className="text-xs text-gray-400 mt-1">{p.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <button onClick={() => { setDone(false); setAnswers({}); }} className="w-full bg-card border border-white/10 text-gray-400 py-3 rounded-xl hover:text-white transition-colors">← Retake Quiz</button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
