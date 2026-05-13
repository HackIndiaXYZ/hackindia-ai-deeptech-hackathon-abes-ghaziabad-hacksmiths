import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingDown, Landmark, BarChart3, LineChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function InflationMonster() {
  const navigate = useNavigate();
  const { state } = useApp();
  const demoI = state.demoData?.inflation;
  const [cash, setCash] = useState(demoI?.savingsAmount || 500000);
  const [eatenToday, setEatenToday] = useState(0);
  const [showFix, setShowFix] = useState(null);

  useEffect(() => {
    if (state.demoData?.inflation) {
      setCash(state.demoData.inflation.savingsAmount);
    }
  }, [state.demoData]);
  const inflationRate = 0.06;
  const dailyLoss = (cash * inflationRate) / 365;

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const secondsElapsed = (Date.now() - start) / 1000;
      setEatenToday(dailyLoss * (secondsElapsed / 86400) * 100); // accelerated 100x for demo
    }, 50);
    return () => clearInterval(interval);
  }, [dailyLoss]);

  const monsterSize = 80 + Math.min(120, eatenToday * 0.5);
  const yearlyloss = Math.round(cash * inflationRate);

  const fixes = [
    { name: 'Fixed Deposit (6.5%)', icon: Landmark, return: 0.065, color: '#3b82f6', desc: 'Safe but barely beats inflation.' },
    { name: 'Liquid Fund (7.2%)', icon: BarChart3, return: 0.072, color: '#a855f7', desc: 'Better returns with easy withdrawal.' },
    { name: 'Equity Fund (12%)', icon: LineChart, return: 0.12, color: '#22c55e', desc: 'Best long-term growth to crush inflation.' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-navy text-white pt-24 pb-32 px-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            <TrendingDown className="inline w-10 h-10 text-red-500 mr-2 -mt-1" /> The Inflation Monster
          </h1>
          <p className="text-gray-400">Watch inflation eat your savings in real-time.</p>
        </div>

        {/* Cash input */}
        <div className="bg-card p-6 rounded-2xl border border-white/5 mb-8">
          <label className="text-xs text-gray-400 uppercase tracking-widest mb-2 block">Cash in Savings Account</label>
          <input type="range" min={50000} max={5000000} step={10000} value={cash} onChange={e => setCash(+e.target.value)}
            className="w-full accent-red-500 mb-2" />
          <div className="text-2xl font-black text-white">₹{cash.toLocaleString('en-IN')}</div>
        </div>

        {/* Monster */}
        <div className="bg-gradient-to-b from-red-900/10 to-navy p-12 rounded-3xl border border-red-500/20 text-center mb-8 relative overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.05, 1], y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-center mb-6"
            style={{ fontSize: `${monsterSize}px`, lineHeight: 1 }}
          >
            👹
          </motion.div>

          <div className="text-xs text-red-400 uppercase tracking-widest mb-2">Rupees eaten so far</div>
          <motion.div
            className="text-4xl md:text-5xl font-black text-red-400 tabular-nums mb-2"
          >
            ₹{eatenToday.toFixed(2)}
          </motion.div>
          <div className="text-sm text-gray-500">and counting...</div>

          <div className="mt-6 grid grid-cols-2 gap-4 text-center">
            <div className="bg-black/30 p-3 rounded-xl">
              <div className="text-xs text-gray-500">Lost per day</div>
              <div className="text-lg font-bold text-red-400">₹{Math.round(dailyLoss).toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-black/30 p-3 rounded-xl">
              <div className="text-xs text-gray-500">Lost per year</div>
              <div className="text-lg font-bold text-red-400">₹{yearlyloss.toLocaleString('en-IN')}</div>
            </div>
          </div>

          {/* Animated rupee notes flying to monster */}
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-xl pointer-events-none"
              style={{ left: `${20 + i * 15}%`, bottom: 0 }}
              animate={{ y: [0, -200], opacity: [1, 0], rotate: [0, 180] }}
              transition={{ duration: 2, delay: i * 0.8, repeat: Infinity }}
            >
              💸
            </motion.div>
          ))}
        </div>

        {/* Fix buttons */}
        <h3 className="text-xl font-bold mb-4 text-center">Fight Back</h3>
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {fixes.map((f, i) => {
            const gain = Math.round(cash * f.return);
            const netGain = gain - yearlyloss;
            const isActive = showFix === i;
            return (
              <motion.button
                key={f.name}
                onClick={() => setShowFix(isActive ? null : i)}
                whileHover={{ y: -4 }}
                className={`p-6 rounded-2xl border text-left transition-all ${
                  isActive ? 'border-green-500/30 bg-green-900/10' : 'border-white/5 bg-card hover:border-white/20'
                }`}
              >
                <f.icon size={24} className="mb-3" style={{ color: f.color }} />
                <div className="text-sm font-bold text-white mb-1">{f.name}</div>
                <div className="text-xs text-gray-500 mb-3">{f.desc}</div>
                {isActive && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">
                    <div className="text-xs text-gray-400">Annual returns: <span className="text-green-400 font-bold">₹{gain.toLocaleString('en-IN')}</span></div>
                    <div className="text-xs text-gray-400 mt-1">Net vs inflation: <span className={netGain > 0 ? 'text-green-400' : 'text-red-400'}>₹{netGain.toLocaleString('en-IN')}</span></div>
                    {netGain > 0 && <div className="text-xs text-green-400 mt-2 font-bold">✅ Monster shrinks!</div>}
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
