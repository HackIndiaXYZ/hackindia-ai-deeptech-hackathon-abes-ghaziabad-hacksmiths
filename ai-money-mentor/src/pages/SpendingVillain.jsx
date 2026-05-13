import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Skull, Zap, Shield, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['Food Delivery', 'Shopping/Impulse', 'Subscriptions', 'Late-Night Orders', 'EMIs on Gadgets', 'Weekend Spending', 'Online Gaming', 'Cigarettes/Drinks'];

const VILLAINS = {
  'Food Delivery': { name: 'The Delivery Demon', emoji: '🍕', color: '#ef4444', desc: 'It arrives in 30 minutes but haunts your bank account forever.' },
  'Shopping/Impulse': { name: 'The Impulse Imp', emoji: '🛍️', color: '#f97316', desc: 'One-click ordering is its superpower.' },
  'Subscriptions': { name: 'The Subscription Vampire', emoji: '🧛', color: '#a855f7', desc: 'Small amounts, drained silently every month.' },
  'Late-Night Orders': { name: 'The Midnight Muncher', emoji: '🌙', color: '#3b82f6', desc: 'Strikes when your willpower is sleeping.' },
  'EMIs on Gadgets': { name: 'The EMI Enslaver', emoji: '⛓️', color: '#6b7280', desc: 'Buying things you can\'t afford on installments.' },
  'Weekend Spending': { name: 'The Weekend Impulse Monster', emoji: '🎉', color: '#ec4899', desc: 'TGIF is its battle cry.' },
  'Online Gaming': { name: 'The Loot Box Leech', emoji: '🎮', color: '#22c55e', desc: 'Virtual items, very real money lost.' },
  'Cigarettes/Drinks': { name: 'The Vice Vulture', emoji: '🚬', color: '#78716c', desc: 'Burns your health AND your wallet.' },
};

export default function SpendingVillain() {
  const navigate = useNavigate();
  const [spending, setSpending] = useState({});
  const [revealed, setRevealed] = useState(false);

  const updateCat = (cat, val) => setSpending({...spending, [cat]: parseInt(val) || 0});
  const entries = Object.entries(spending).filter(([_, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  const topCat = entries.length > 0 ? entries[0][0] : null;
  const topAmount = topCat ? spending[topCat] : 0;
  const villain = topCat ? VILLAINS[topCat] || { name: 'The Unknown Thief', emoji: '👻', color: '#F5A623', desc: 'Silently draining you.' } : null;
  const yearlyLoss = topAmount * 12;
  const tenYearGrowth = Math.round(topAmount * 12 * ((Math.pow(1 + 0.01, 120) - 1) / 0.01) * 0.01);

  const plan = topCat ? [
    { day: 'Week 1', task: `Track every ₹ spent on ${topCat}. Awareness is step one.` },
    { day: 'Week 2', task: `Set a hard budget: cut ${topCat} spending by 50%.` },
    { day: 'Week 3', task: `Replace the habit: substitute with a free/cheaper alternative.` },
    { day: 'Week 4', task: `Auto-invest the saved amount (₹${Math.round(topAmount * 0.5).toLocaleString('en-IN')}) via SIP.` },
  ] : [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-navy text-white pt-24 pb-32 px-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            <Skull className="inline w-10 h-10 text-red-500 mr-2 -mt-1" /> Spending Villain Detector
          </h1>
          <p className="text-gray-400">Find the villain silently destroying your wealth.</p>
        </div>

        {!revealed ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <p className="text-sm text-gray-500 mb-4 text-center">Enter your monthly spending in these categories:</p>
            {CATEGORIES.map(cat => (
              <div key={cat} className="flex items-center gap-4 bg-card p-4 rounded-xl border border-white/5">
                <span className="text-2xl w-8 text-center">{VILLAINS[cat]?.emoji || '💰'}</span>
                <span className="text-sm font-medium text-gray-300 flex-1">{cat}</span>
                <input type="number" placeholder="₹ 0" onChange={e => updateCat(cat, e.target.value)}
                  className="w-28 bg-navy border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-red-500 text-right" />
              </div>
            ))}
            <button onClick={() => entries.length > 0 && setRevealed(true)}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl transition-colors mt-6">
              🔍 Reveal My Villain
            </button>
          </motion.div>
        ) : villain && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {/* Villain reveal */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-center p-10 rounded-3xl border relative overflow-hidden"
              style={{ borderColor: villain.color + '40', background: villain.color + '08' }}
            >
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-8xl mb-4">
                {villain.emoji}
              </motion.div>
              <div className="text-xs uppercase tracking-widest mb-2" style={{ color: villain.color }}>Your #1 Financial Villain</div>
              <h2 className="text-3xl font-black text-white mb-2">{villain.name}</h2>
              <p className="text-gray-400 text-sm mb-6">{villain.desc}</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/30 p-4 rounded-xl">
                  <div className="text-xs text-gray-500 mb-1">Stolen this year</div>
                  <div className="text-2xl font-black" style={{ color: villain.color }}>₹{yearlyLoss.toLocaleString('en-IN')}</div>
                </div>
                <div className="bg-black/30 p-4 rounded-xl">
                  <div className="text-xs text-gray-500 mb-1">If invested instead (10yr)</div>
                  <div className="text-2xl font-black text-green-400">₹{(tenYearGrowth / 100000).toFixed(1)}L</div>
                </div>
              </div>
            </motion.div>

            {/* Defeat plan */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Shield className="text-green-400 w-6 h-6" />
                <h3 className="text-xl font-bold">30-Day Defeat Plan</h3>
              </div>
              <div className="space-y-3">
                {plan.map((p, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.2 }}
                    className="bg-card p-5 rounded-2xl border border-green-500/10 flex items-center gap-4">
                    <div className="w-16 text-xs text-green-400 font-bold shrink-0">{p.day}</div>
                    <div className="text-sm text-gray-300">{p.task}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            <button onClick={() => { setRevealed(false); setSpending({}); }}
              className="w-full bg-card border border-white/10 text-gray-400 font-medium py-3 rounded-xl hover:text-white transition-colors">
              ← Scan Again
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
