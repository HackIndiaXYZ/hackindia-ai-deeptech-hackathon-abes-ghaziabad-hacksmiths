import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, DollarSign, TrendingUp, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function PassiveIncomeDashboard() {
  const navigate = useNavigate();
  const { state } = useApp();
  const demoP = state.demoData?.passive;
  const [years, setYears] = useState(10);
  const [monthlyExpense, setMonthlyExpense] = useState(demoP?.monthlyExpenses || 55000);
  const [invested, setInvested] = useState(demoP?.sipCorpus || 200000);
  const [monthlySIP, setMonthlySIP] = useState(demoP ? 25000 : 15000);

  useEffect(() => {
    if (state.demoData?.passive) {
      setMonthlyExpense(state.demoData.passive.monthlyExpenses);
      setInvested(state.demoData.passive.sipCorpus);
      setMonthlySIP(25000);
    }
  }, [state.demoData]);

  const rate = 0.12;
  const totalMonths = years * 12;
  const r = rate / 12;
  const futureValue = invested * Math.pow(1 + r, totalMonths) + monthlySIP * ((Math.pow(1 + r, totalMonths) - 1) / r);

  // Split into sources
  const equityDiv = futureValue * 0.4 * 0.015 / 12;
  const reitYield = futureValue * 0.15 * 0.065 / 12;
  const debtFund = futureValue * 0.25 * 0.07 / 12;
  const nps = futureValue * 0.2 * 0.04 / 12;
  const totalPassive = Math.round(equityDiv + reitYield + debtFund + nps);
  const freedomReached = totalPassive >= monthlyExpense;

  const sources = [
    { name: 'Equity Dividends', amount: Math.round(equityDiv), color: '#22c55e', pct: 40 },
    { name: 'REIT Yield', amount: Math.round(reitYield), color: '#3b82f6', pct: 15 },
    { name: 'Debt Fund Interest', amount: Math.round(debtFund), color: '#a855f7', pct: 25 },
    { name: 'NPS Pension', amount: Math.round(nps), color: '#F5A623', pct: 20 },
  ];

  const freedomAge = (() => {
    for (let y = 1; y <= 50; y++) {
      const m = y * 12;
      const fv = invested * Math.pow(1 + r, m) + monthlySIP * ((Math.pow(1 + r, m) - 1) / r);
      const passive = Math.round(fv * (0.4*0.015 + 0.15*0.065 + 0.25*0.07 + 0.2*0.04) / 12);
      if (passive >= monthlyExpense) return { year: y, age: 28 + y };
    }
    return null;
  })();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className={`min-h-screen text-white pt-24 pb-32 px-4 transition-colors duration-1000 ${freedomReached ? 'bg-[#0a1a0a]' : 'bg-navy'}`}
    >
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            <DollarSign className="inline w-10 h-10 text-gold mr-2 -mt-1" />
            Passive Income Dashboard
          </h1>
          <p className="text-gray-400">Watch your money work while you sleep.</p>
        </div>

        {/* Big Number */}
        <motion.div
          key={totalPassive}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className={`text-center p-12 rounded-3xl border mb-8 relative overflow-hidden ${
            freedomReached
              ? 'bg-gradient-to-br from-gold/20 to-yellow-900/10 border-gold/30'
              : 'bg-card border-white/5'
          }`}
        >
          {freedomReached && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <Crown className="w-12 h-12 text-gold mx-auto mb-2" />
              <div className="text-gold text-sm font-bold uppercase tracking-widest">🎉 Financial Freedom Achieved!</div>
            </motion.div>
          )}
          <div className="text-xs text-gray-400 uppercase tracking-widest mb-3">
            Potential Monthly Passive Income ({years} years from now)
          </div>
          <div className={`text-5xl md:text-7xl font-black ${freedomReached ? 'text-gold' : 'text-white'}`}>
            ₹{totalPassive.toLocaleString('en-IN')}
          </div>
          <div className="text-sm text-gray-500 mt-3">
            Your monthly expenses: ₹{monthlyExpense.toLocaleString('en-IN')}
          </div>
          {/* Coverage bar */}
          <div className="max-w-md mx-auto mt-6">
            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden relative">
              <motion.div
                className={`h-full rounded-full ${freedomReached ? 'bg-gold' : 'bg-white/30'}`}
                animate={{ width: `${Math.min(100, (totalPassive / monthlyExpense) * 100)}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1 text-right">{Math.round((totalPassive / monthlyExpense) * 100)}% of expenses covered</div>
          </div>
        </motion.div>

        {/* Slider */}
        <div className="bg-card p-6 rounded-2xl border border-white/5 mb-12">
          <label className="text-xs text-gray-400 uppercase tracking-widest mb-3 block">Years from Now</label>
          <input type="range" min={1} max={30} value={years} onChange={e => setYears(+e.target.value)}
            className="w-full accent-gold mb-2" />
          <div className="flex justify-between text-sm text-gray-500">
            <span>1 year</span>
            <span className="text-gold font-bold text-lg">{years} years</span>
            <span>30 years</span>
          </div>
        </div>

        {/* Sources breakdown */}
        <h3 className="text-xl font-bold mb-6">Income Sources</h3>
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          {sources.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card p-5 rounded-2xl border border-white/5 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${s.color}20` }}>
                <TrendingUp size={18} style={{ color: s.color }} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-300">{s.name}</div>
                <div className="text-xs text-gray-500">{s.pct}% allocation</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold" style={{ color: s.color }}>₹{s.amount.toLocaleString('en-IN')}</div>
                <div className="text-xs text-gray-500">/month</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Freedom milestone */}
        {freedomAge && (
          <div className="bg-card p-8 rounded-3xl border border-gold/20 text-center">
            <Crown className="w-10 h-10 text-gold mx-auto mb-4" />
            <div className="text-sm text-gray-400 mb-2">You'll reach financial freedom at age</div>
            <div className="text-5xl font-black text-gold mb-2">{freedomAge.age}</div>
            <div className="text-xs text-gray-500">(in {freedomAge.year} years from now)</div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
