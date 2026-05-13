import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Rocket, TrendingUp, Scissors, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function CroreChallenge() {
  const navigate = useNavigate();
  const { state } = useApp();
  const demoC = state.demoData?.crore;
  const [savings, setSavings] = useState(demoC?.existingCorpus || 200000);
  const [monthly, setMonthly] = useState(demoC?.monthlySIP || 10000);
  const [rate] = useState(12);
  const [simulations, setSimulations] = useState({ base: null, moreSip: null, raise: null, cutExpense: null });

  useEffect(() => {
    if (state.demoData?.crore) {
      setSavings(state.demoData.crore.existingCorpus);
      setMonthly(state.demoData.crore.monthlySIP);
    }
  }, [state.demoData]);

  const TARGET = 10000000; // 1 crore

  const calcMonths = (initial, sip, annualRate) => {
    let balance = initial;
    const r = annualRate / 100 / 12;
    let months = 0;
    while (balance < TARGET && months < 600) {
      balance = balance * (1 + r) + sip;
      months++;
    }
    return months >= 600 ? null : months;
  };

  useEffect(() => {
    const base = calcMonths(savings, monthly, rate);
    const moreSip = calcMonths(savings, monthly + 2000, rate);
    const raise = calcMonths(savings, monthly * 1.2, rate);
    const cutExpense = calcMonths(savings + 5000, monthly + 3000, rate);
    setSimulations({ base, moreSip, raise, cutExpense });
  }, [savings, monthly, rate]);

  const formatTime = (totalMonths) => {
    if (!totalMonths) return 'Not reachable in 50 years';
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    const days = Math.round((months / 12) * 365) % 30;
    return `${years} years, ${months} months, ${days} days`;
  };

  const formatDate = (totalMonths) => {
    if (!totalMonths) return '—';
    const d = new Date();
    d.setMonth(d.getMonth() + totalMonths);
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const baseMonths = simulations.base;
  const progressPct = baseMonths ? Math.min(100, (savings / TARGET) * 100) : 0;
  const percentile = baseMonths ? Math.min(95, Math.max(20, 100 - Math.round(baseMonths / 4))) : 50;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-navy text-white pt-24 pb-32 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            <Trophy className="inline w-10 h-10 text-gold mr-2 -mt-1" /> The ₹1 Crore Challenge
          </h1>
          <p className="text-gray-400">How fast can you become a Crorepati?</p>
        </div>

        {/* Inputs */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-card p-6 rounded-2xl border border-white/5">
            <label className="text-xs text-gray-400 uppercase tracking-widest mb-2 block">Current Savings</label>
            <input type="range" min={0} max={5000000} step={10000} value={savings}
              onChange={e => setSavings(+e.target.value)}
              className="w-full accent-gold mb-2" />
            <div className="text-2xl font-black text-gold">₹{savings.toLocaleString('en-IN')}</div>
          </div>
          <div className="bg-card p-6 rounded-2xl border border-white/5">
            <label className="text-xs text-gray-400 uppercase tracking-widest mb-2 block">Monthly Investment</label>
            <input type="range" min={1000} max={100000} step={1000} value={monthly}
              onChange={e => setMonthly(+e.target.value)}
              className="w-full accent-gold mb-2" />
            <div className="text-2xl font-black text-gold">₹{monthly.toLocaleString('en-IN')}/mo</div>
          </div>
        </div>

        {/* Countdown */}
        <motion.div
          key={baseMonths}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-card to-navy p-10 rounded-3xl border border-gold/20 text-center mb-12 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gold/10">
            <motion.div className="h-full bg-gold" animate={{ width: `${progressPct}%` }} transition={{ duration: 1 }} />
          </div>
          <div className="text-xs uppercase tracking-widest text-gray-500 mb-4">You will become a Crorepati in</div>
          <div className="text-3xl md:text-4xl font-extrabold text-gold mb-2">{formatTime(baseMonths)}</div>
          <div className="text-sm text-gray-400 mb-6">Target Date: <span className="text-white font-bold">{formatDate(baseMonths)}</span></div>

          {/* Progress bar */}
          <div className="max-w-xl mx-auto">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>₹0</span>
              <span>₹1 Crore</span>
            </div>
            <div className="h-3 w-full bg-black/50 rounded-full overflow-hidden relative">
              <motion.div
                className="h-full bg-gradient-to-r from-gold to-yellow-300 rounded-full"
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1.5 }}
              />
              <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-gold rounded-full border-2 border-navy shadow-lg"
                style={{ left: `calc(${progressPct}% - 8px)` }} />
            </div>
            <div className="text-xs text-gray-500 mt-2 text-right">{progressPct.toFixed(1)}% there</div>
          </div>
        </motion.div>

        {/* Simulation buttons */}
        <h3 className="text-xl font-bold mb-6 text-center">What If Scenarios</h3>
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {[
            { label: 'Increase SIP by ₹2,000', months: simulations.moreSip, icon: TrendingUp, color: 'text-green-400' },
            { label: '20% salary raise', months: simulations.raise, icon: Rocket, color: 'text-blue-400' },
            { label: 'Cut ₹3,000 expenses', months: simulations.cutExpense, icon: Scissors, color: 'text-purple-400' },
          ].map((s, i) => {
            const diff = baseMonths && s.months ? baseMonths - s.months : 0;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card p-6 rounded-2xl border border-white/5 text-center"
              >
                <s.icon className={`w-8 h-8 mx-auto mb-3 ${s.color}`} />
                <div className="text-sm font-medium text-gray-300 mb-3">{s.label}</div>
                <div className="text-2xl font-bold text-white mb-1">{formatTime(s.months)}</div>
                {diff > 0 && (
                  <div className="text-xs text-green-400 font-bold">🔥 {Math.floor(diff / 12)}y {diff % 12}m faster!</div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Percentile */}
        <div className="bg-card p-8 rounded-3xl border border-white/5 text-center">
          <Award className="w-12 h-12 text-gold mx-auto mb-4" />
          <div className="text-sm text-gray-400 mb-2">You'll hit ₹1 Crore faster than</div>
          <div className="text-5xl font-black text-gold mb-2">{percentile}%</div>
          <div className="text-sm text-gray-400">of Indians your age</div>
        </div>
      </div>
    </motion.div>
  );
}
