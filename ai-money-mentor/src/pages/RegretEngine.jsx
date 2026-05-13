import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, TrendingDown, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const SCENARIOS = [
  {
    id: 'no_sip',
    title: "I'll start SIP next year",
    emoji: '⏳',
    cost: (income) => {
      const monthly = Math.round(income * 0.15);
      const r = 0.12 / 12;
      const lost = Math.round(monthly * ((Math.pow(1 + r, 12) - 1) / r) * Math.pow(1 + r, 228));
      return { monthly, lost, desc: `Every year you wait costs you exponentially. That "next year" attitude on a ₹${monthly.toLocaleString('en-IN')}/mo SIP just cost you`, extra: 'Because of compounding, the first year of investment is the most powerful year you will ever have.' };
    },
  },
  {
    id: 'no_insurance',
    title: "I don't need term insurance yet",
    emoji: '🛡️',
    cost: (income) => {
      const premiumNow = Math.round(income * 0.005 * 12);
      const premiumLater = Math.round(premiumNow * 1.4);
      const lifetimeCost = (premiumLater - premiumNow) * 30;
      return { monthly: premiumNow, lost: lifetimeCost, desc: `Waiting 5 years means 40% higher premiums. You'll pay ₹${lifetimeCost.toLocaleString('en-IN')} more over your lifetime for the exact same coverage.`, extra: 'Plus, any health issue in those 5 years could make you uninsurable.' };
    },
  },
  {
    id: 'lifestyle_inflation',
    title: "I got a raise! Time to upgrade my lifestyle",
    emoji: '🎉',
    cost: (income) => {
      const raiseAmt = Math.round(income * 0.2);
      const r = 0.12 / 12;
      const invested = Math.round(raiseAmt * ((Math.pow(1 + r, 240) - 1) / r));
      return { monthly: raiseAmt, lost: invested, desc: `If you invested your ₹${raiseAmt.toLocaleString('en-IN')} raise instead of spending it, in 20 years you'd have`, extra: 'The 50-30-20 rule says: invest at least 50% of every raise. Your future self will be a millionaire.' };
    },
  },
  {
    id: 'credit_card',
    title: "I'll pay the minimum balance on my credit card",
    emoji: '💳',
    cost: (income) => {
      const debt = Math.round(income * 0.8);
      const interestPaid = Math.round(debt * 2.4);
      return { monthly: Math.round(debt * 0.03), lost: interestPaid, desc: `That ₹${debt.toLocaleString('en-IN')} credit card balance at 36% APR means you'll pay`, extra: 'You are literally paying 3x the original price. Credit card debt is the most expensive debt in India.' };
    },
  },
  {
    id: 'no_80c',
    title: "I don't bother with tax saving investments",
    emoji: '🧾',
    cost: (income) => {
      const taxLost = 46800;
      const tenYearLoss = Math.round(taxLost * 10 * 1.5);
      return { monthly: Math.round(taxLost / 12), lost: tenYearLoss, desc: `You lose ₹46,800 every single year in taxes you could have saved. Over 10 years with compounding, that's`, extra: 'ELSS funds give you tax savings AND market returns. It\'s literally free money you\'re leaving on the table.' };
    },
  },
  {
    id: 'fd_only',
    title: "I keep all my money in Fixed Deposits",
    emoji: '🏦',
    cost: (income) => {
      const savings = Math.round(income * 12 * 3);
      const fdReturn = Math.round(savings * Math.pow(1.065, 20));
      const equityReturn = Math.round(savings * Math.pow(1.12, 20));
      const gap = equityReturn - fdReturn;
      return { monthly: 0, lost: gap, desc: `Your ₹${(savings/100000).toFixed(1)}L in FDs at 6.5% vs equity at 12% — after 20 years, you lose`, extra: 'FDs don\'t even beat inflation. Your money is actually losing value every year.' };
    },
  },
];

export default function RegretEngine() {
  const navigate = useNavigate();
  const { state } = useApp();
  const demo = state.demoData?.regret;
  const [income, setIncome] = useState(demo ? String(demo.income) : '');
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (state.demoData?.regret) {
      setIncome(String(state.demoData.regret.income));
    }
  }, [state.demoData]);

  const incomeNum = parseInt(income) || 60000;

  const selectScenario = (s) => {
    setSelected(s);
    setShowResult(true);
  };

  const result = selected ? selected.cost(incomeNum) : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-navy text-white pt-24 pb-32 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            <TrendingDown className="inline w-10 h-10 text-red-500 mr-2 -mt-1" /> The Regret Engine
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto">Choose a financial decision you've been making. See what it's really costing you.</p>
        </div>

        {/* Income input */}
        <div className="bg-card p-6 rounded-2xl border border-white/5 mb-8 max-w-md mx-auto">
          <label className="text-xs text-gray-400 uppercase tracking-widest mb-2 block">Your Monthly Income</label>
          <input
            type="number"
            placeholder="₹ 60,000"
            value={income}
            onChange={e => setIncome(e.target.value)}
            className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold text-lg"
          />
        </div>

        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div key="scenarios" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h3 className="text-lg font-bold text-center mb-6 text-gray-400">Which excuse have you been using?</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {SCENARIOS.map((s, i) => (
                  <motion.button
                    key={s.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => selectScenario(s)}
                    className="bg-card border border-white/5 rounded-2xl p-5 text-left hover:border-red-500/30 hover:-translate-y-1 transition-all group"
                  >
                    <div className="text-2xl mb-2 group-hover:scale-110 transition-transform inline-block">{s.emoji}</div>
                    <div className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">{s.title}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : result && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              {/* Result card */}
              <div className="bg-gradient-to-b from-red-900/20 to-card p-10 md:p-14 rounded-3xl border border-red-500/20 text-center mb-8 relative overflow-hidden">
                <div className="text-5xl mb-4">{selected.emoji}</div>
                <h3 className="text-xl font-bold text-gray-300 mb-2 italic">"{selected.title}"</h3>
                <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">{result.desc}</p>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  className="text-5xl md:text-7xl font-black text-red-400 mb-2"
                >
                  ₹{(result.lost / 100000).toFixed(1)}L
                </motion.div>
                <div className="text-xs text-gray-500 mb-6">lost to this one decision</div>

                {/* Burning animation */}
                <div className="flex justify-center gap-1 mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [-5, 5, -5], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                    >
                      <Flame size={24} className="text-orange-500" />
                    </motion.div>
                  ))}
                </div>

                <div className="bg-black/30 p-4 rounded-xl max-w-md mx-auto">
                  <p className="text-sm text-gray-300 italic">{result.extra}</p>
                </div>
              </div>

              {/* What you could have bought instead */}
              <div className="bg-card p-6 rounded-2xl border border-white/5 mb-8">
                <h4 className="text-sm font-bold text-gray-400 mb-4 text-center">What ₹{(result.lost / 100000).toFixed(1)}L could buy you instead:</h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { emoji: '🚗', label: `${Math.floor(result.lost / 800000)} cars` },
                    { emoji: '✈️', label: `${Math.floor(result.lost / 50000)} international trips` },
                    { emoji: '📱', label: `${Math.floor(result.lost / 80000)} iPhones` },
                  ].map(item => (
                    <div key={item.label} className="bg-navy p-3 rounded-xl">
                      <div className="text-2xl mb-1">{item.emoji}</div>
                      <div className="text-xs text-gray-400">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fix it */}
              <div className="bg-green-900/10 border border-green-500/20 p-6 rounded-2xl text-center mb-8">
                <div className="text-xs text-green-400 uppercase tracking-widest mb-2">The Good News</div>
                <p className="text-sm text-gray-300">You can't undo the past, but you can start today. Every day you act is a day you stop the bleeding.</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => { setShowResult(false); setSelected(null); }}
                  className="flex-1 bg-card border border-white/10 text-gray-400 py-3 rounded-xl hover:text-white transition-colors">← Try Another Scenario</button>
                <button onClick={() => navigate('/dashboard')}
                  className="flex-1 bg-gold text-navy font-bold py-3 rounded-xl hover:bg-yellow-400 transition-colors">Start Fixing →</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
