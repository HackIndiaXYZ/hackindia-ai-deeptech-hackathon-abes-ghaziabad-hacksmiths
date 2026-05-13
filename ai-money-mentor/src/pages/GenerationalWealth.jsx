import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Users, AlertTriangle, Home, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function GenerationalWealth() {
  const navigate = useNavigate();
  const { state } = useApp();
  const demoG = state.demoData?.generational;
  const [step, setStep] = useState('input');
  const [form, setForm] = useState({ targetAmount: 10000000, childAge: demoG?.childStartAge || 25, lifestyle: 'comfortable' });

  useEffect(() => {
    if (state.demoData?.generational) {
      setForm(f => ({ ...f, childAge: state.demoData.generational.childStartAge }));
    }
  }, [state.demoData]);

  const lifestyleMult = { basic: 0.8, comfortable: 1, premium: 1.5 };
  const target = form.targetAmount * (lifestyleMult[form.lifestyle] || 1);
  const yearsToGive = Math.max(1, form.childAge);
  const monthlyRate = 0.12 / 12;
  const months = yearsToGive * 12;
  const monthlyNeeded = Math.round(target / ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate));

  // Parent timeline
  const parentTimeline = [
    { year: 0, event: 'Start investing', value: 0 },
    { year: 5, event: 'Foundation built', value: Math.round(monthlyNeeded * ((Math.pow(1 + monthlyRate, 60) - 1) / monthlyRate)) },
    { year: 10, event: 'Compounding kicks in', value: Math.round(monthlyNeeded * ((Math.pow(1 + monthlyRate, 120) - 1) / monthlyRate)) },
    { year: Math.min(15, yearsToGive), event: 'Wealth transfer ready', value: Math.round(monthlyNeeded * ((Math.pow(1 + monthlyRate, Math.min(15, yearsToGive) * 12) - 1) / monthlyRate)) },
    { year: yearsToGive, event: '🎓 Gift to child', value: Math.round(target) },
  ];

  // Child timeline - what happens to inherited money
  const childGrowth = [
    { year: 0, event: 'Receives inheritance', value: Math.round(target) },
    { year: 10, event: 'Grows to', value: Math.round(target * Math.pow(1.12, 10)) },
    { year: 20, event: 'Next generation', value: Math.round(target * Math.pow(1.12, 20)) },
    { year: 30, event: 'Family legacy', value: Math.round(target * Math.pow(1.12, 30)) },
  ];

  const noInvestLoss = Math.round(target - (monthlyNeeded * months)); // money lost to not compounding

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-navy text-white pt-24 pb-32 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            <Heart className="inline w-10 h-10 text-red-400 mr-2 -mt-1" /> Generational Wealth
          </h1>
          <p className="text-gray-400">What will you leave behind for the next generation?</p>
        </div>

        {step === 'input' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg mx-auto space-y-6">
            <div className="bg-card p-6 rounded-2xl border border-white/5">
              <label className="text-xs text-gray-400 uppercase tracking-widest mb-3 block">How much do you want to leave your children?</label>
              <input type="range" min={1000000} max={100000000} step={1000000} value={form.targetAmount}
                onChange={e => setForm({...form, targetAmount: +e.target.value})} className="w-full accent-gold mb-2" />
              <div className="text-2xl font-black text-gold">₹{(form.targetAmount / 10000000).toFixed(1)} Crore</div>
            </div>
            <div className="bg-card p-6 rounded-2xl border border-white/5">
              <label className="text-xs text-gray-400 uppercase tracking-widest mb-3 block">At what age do you want to give it?</label>
              <input type="range" min={5} max={35} value={form.childAge}
                onChange={e => setForm({...form, childAge: +e.target.value})} className="w-full accent-gold mb-2" />
              <div className="text-2xl font-black text-gold">{form.childAge} years from now</div>
            </div>
            <div className="bg-card p-6 rounded-2xl border border-white/5">
              <label className="text-xs text-gray-400 uppercase tracking-widest mb-3 block">What kind of life?</label>
              <div className="grid grid-cols-3 gap-2">
                {['basic', 'comfortable', 'premium'].map(l => (
                  <button key={l} onClick={() => setForm({...form, lifestyle: l})}
                    className={`p-3 rounded-xl border text-sm font-medium capitalize transition-all ${form.lifestyle === l ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setStep('results')}
              className="w-full bg-gold text-navy font-bold py-4 rounded-xl hover:bg-yellow-400 transition-colors">
              Calculate My Legacy →
            </button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
            {/* Monthly needed */}
            <div className="bg-card p-8 rounded-3xl border border-gold/20 text-center">
              <div className="text-xs text-gray-400 uppercase tracking-widest mb-3">Invest this much monthly to leave ₹{(target / 10000000).toFixed(1)}Cr</div>
              <div className="text-5xl font-black text-gold mb-2">₹{monthlyNeeded.toLocaleString('en-IN')}</div>
              <div className="text-xs text-gray-500">per month at 12% CAGR for {yearsToGive} years</div>
            </div>

            {/* Two-generation timeline */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Parent journey */}
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Users size={18} /> Your Journey</h3>
                <div className="space-y-3 relative">
                  <div className="absolute left-4 top-6 bottom-6 w-px bg-gold/20" />
                  {parentTimeline.map((t, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.2 }}
                      className="flex items-center gap-4 pl-2 relative">
                      <div className="w-5 h-5 rounded-full bg-gold/20 border-2 border-gold shrink-0 z-10" />
                      <div className="flex-1 bg-card p-3 rounded-xl border border-white/5">
                        <div className="text-xs text-gray-500">Year {t.year}</div>
                        <div className="text-sm font-medium text-white">{t.event}</div>
                        <div className="text-sm font-bold text-gold">₹{(t.value / 100000).toFixed(1)}L</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Child journey */}
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Heart size={18} className="text-red-400" /> Their Legacy</h3>
                <div className="space-y-3 relative">
                  <div className="absolute left-4 top-6 bottom-6 w-px bg-green-500/20" />
                  {childGrowth.map((t, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + i * 0.2 }}
                      className="flex items-center gap-4 pl-2 relative">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 border-2 border-green-500 shrink-0 z-10" />
                      <div className="flex-1 bg-card p-3 rounded-xl border border-white/5">
                        <div className="text-xs text-gray-500">Year {t.year}</div>
                        <div className="text-sm font-medium text-white">{t.event}</div>
                        <div className="text-sm font-bold text-green-400">₹{(t.value / 10000000).toFixed(1)}Cr</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={() => setStep('input')} className="w-full bg-card border border-white/10 text-gray-400 py-3 rounded-xl hover:text-white transition-colors">← Change Inputs</button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
