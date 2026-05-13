import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { pageEnter } from '../animations/variants';
import { useApp } from '../context/AppContext';
import gsap from 'gsap';

export default function CouplesMode() {
  const navigate = useNavigate();
  const { state } = useApp();
  const demo = state.demoData?.couples;
  const [partner1, setPartner1] = useState(demo?.partner1 || { name: '', income: '', investments: '', sec80c: '', hra: 'none' });
  const [partner2, setPartner2] = useState(demo?.partner2 || { name: '', income: '', investments: '', sec80c: '', hra: 'none' });
  const [merged, setMerged] = useState(false);
  const [isMerging, setIsMerging] = useState(false);

  useEffect(() => {
    if (state.demoData?.couples) {
      setPartner1(state.demoData.couples.partner1);
      setPartner2(state.demoData.couples.partner2);
    }
  }, [state.demoData]);

  const startMerge = () => {
    if (!partner1.income || !partner2.income) return;
    setIsMerging(true);
    setTimeout(() => {
      setMerged(true);
      setIsMerging(false);
    }, 1200);
  };

  return (
    <motion.div variants={pageEnter} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-navy pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        {!merged && !isMerging && (
          <div className="text-center mb-12">
            <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4 animate-pulse" fill="currentColor" />
            <h1 className="text-4xl font-bold mb-2">Couples Mode</h1>
            <p className="text-gray-400">Combine your financial powers. See when you both can retire.</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!merged ? (
            <motion.div key="forms" exit={{ opacity: 0, scale: 0.9 }}>
              {/* Two partner forms side by side */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <ProfileForm partnerNum={1} data={partner1} setData={setPartner1} color="blue" />
                <ProfileForm partnerNum={2} data={partner2} setData={setPartner2} color="pink" />
              </div>

              {/* Merge Button */}
              {!isMerging && (
                <div className="flex justify-center">
                  <button
                    onClick={startMerge}
                    disabled={!partner1.income || !partner2.income}
                    className="px-10 py-4 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold text-lg shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] hover:scale-105 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-3"
                  >
                    <Heart className="w-6 h-6" fill="currentColor" /> Merge Financial Profiles
                  </button>
                </div>
              )}

              {/* Merging animation */}
              {isMerging && (
                <div className="flex justify-center py-12">
                  <motion.div
                    animate={{ scale: [1, 1.5, 0], rotate: [0, 180, 360] }}
                    transition={{ duration: 1.2 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center"
                  >
                    <Heart className="w-10 h-10 text-white" fill="currentColor" />
                  </motion.div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="merged"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.4 }}
            >
              <MergedResults p1={partner1} p2={partner2} onReset={() => { setMerged(false); setPartner1({ name: '', income: '', investments: '', sec80c: '', hra: 'none' }); setPartner2({ name: '', income: '', investments: '', sec80c: '', hra: 'none' }); }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function ProfileForm({ partnerNum, data, setData, color }) {
  const isBlue = color === 'blue';
  const borderColor = isBlue ? 'border-blue-500/30' : 'border-pink-500/30';
  const focusBorder = isBlue ? 'focus:border-blue-400' : 'focus:border-pink-400';
  const labelColor = isBlue ? 'text-blue-400' : 'text-pink-400';
  const glowColor = isBlue ? 'from-blue-500/5' : 'from-pink-500/5';

  const update = (k, v) => setData(p => ({ ...p, [k]: v }));

  return (
    <div className={`bg-card p-6 rounded-3xl border ${borderColor} relative bg-gradient-to-br ${glowColor} to-transparent`}>
      {/* Avatar */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${isBlue ? 'bg-blue-500/20 text-blue-400' : 'bg-pink-500/20 text-pink-400'}`}>
          {data.name ? data.name.charAt(0).toUpperCase() : partnerNum}
        </div>
        <input
          type="text"
          placeholder={`Partner ${partnerNum} Name`}
          value={data.name}
          onChange={e => update('name', e.target.value)}
          className={`bg-transparent text-xl font-bold outline-none placeholder:text-gray-600 ${labelColor} flex-1`}
        />
      </div>

      <div className="space-y-4">
        {[
          { key: 'income', label: 'Monthly Income', placeholder: '₹ 50,000' },
          { key: 'investments', label: 'Monthly SIP / Investments', placeholder: '₹ 10,000' },
          { key: 'sec80c', label: '80C Utilized So Far', placeholder: '₹ 0' },
        ].map(f => (
          <div key={f.key}>
            <label className="text-xs text-gray-500 ml-1 mb-1 block">{f.label}</label>
            <input
              type="number"
              placeholder={f.placeholder}
              value={data[f.key]}
              onChange={e => update(f.key, e.target.value)}
              className={`w-full bg-navy border ${borderColor} ${focusBorder} rounded-xl px-4 py-3 outline-none transition-all text-white`}
            />
          </div>
        ))}
        <div>
          <label className="text-xs text-gray-500 ml-1 mb-1 block">HRA Situation</label>
          <select
            value={data.hra}
            onChange={e => update('hra', e.target.value)}
            className={`w-full bg-navy border ${borderColor} ${focusBorder} rounded-xl px-4 py-3 outline-none transition-all text-white appearance-none`}
          >
            <option value="none">No HRA / Living with parents</option>
            <option value="paying">Paying Rent</option>
            <option value="homeLoan">Paying Home Loan</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function MergedResults({ p1, p2, onReset }) {
  const combinedIncome = Number(p1.income) + Number(p2.income);
  const combinedInvestments = Number(p1.investments) + Number(p2.investments);
  const combinedExpenses = combinedIncome - combinedInvestments;

  const fireDateRef = useRef(null);
  const incomeRef = useRef(null);

  const savingsRate = combinedInvestments / (combinedIncome || 1);
  let yearsToFire = 35;
  if (savingsRate > 0.1) yearsToFire = 25;
  if (savingsRate > 0.2) yearsToFire = 20;
  if (savingsRate > 0.3) yearsToFire = 15;
  if (savingsRate > 0.5) yearsToFire = 10;
  if (savingsRate > 0.7) yearsToFire = 5;

  const currentYear = new Date().getFullYear();
  const fireYear = currentYear + yearsToFire;

  // Compatibility score
  const p1Rate = Number(p1.investments) / (Number(p1.income) || 1);
  const p2Rate = Number(p2.investments) / (Number(p2.income) || 1);
  const compatibility = Math.round(100 - Math.abs(p1Rate - p2Rate) * 200);
  const compatPct = Math.max(20, Math.min(100, compatibility));

  // Tax savings
  const p1_80c_remaining = Math.max(0, 150000 - Number(p1.sec80c));
  const p2_80c_remaining = Math.max(0, 150000 - Number(p2.sec80c));
  const totalTaxSaving = Math.round((p1_80c_remaining + p2_80c_remaining) * 0.312);

  useEffect(() => {
    if (incomeRef.current) {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: combinedIncome,
        duration: 2,
        ease: "power1.out",
        onUpdate: () => {
          if (incomeRef.current) incomeRef.current.innerText = `₹${Math.floor(obj.val).toLocaleString('en-IN')}`;
        }
      });
    }
    if (fireDateRef.current) {
      const obj2 = { y: currentYear + 40 };
      gsap.to(obj2, {
        y: fireYear,
        duration: 2.5,
        ease: "power2.out",
        onUpdate: () => {
          if (fireDateRef.current) fireDateRef.current.innerText = Math.round(obj2.y);
        }
      });
    }
  }, [combinedIncome, fireYear, currentYear]);

  const tips = [
    { tag: p1.name || 'P1', color: 'blue', title: 'Buy pure term insurance under MWP act', desc: `Protects the death benefit strictly for ${p2.name || 'your partner'}.` },
    { tag: p2.name || 'P2', color: 'pink', title: `Open ELSS to save ₹${p2_80c_remaining.toLocaleString('en-IN')} in 80C`, desc: 'Invest in tax-saving mutual funds for remaining 80C limit.' },
    { tag: 'Both', color: 'gold', title: 'Max out Joint Healthcare 80D', desc: 'Buy a family floater health insurance to get ₹25,000 deduction each.' },
    p1.hra === 'paying' || p2.hra === 'paying' ? { tag: 'Tax', color: 'green', title: 'Claim HRA exemption', desc: 'The rent-paying partner can save up to ₹1L/year in HRA tax.' } : null,
    p1.hra === 'homeLoan' || p2.hra === 'homeLoan' ? { tag: 'Tax', color: 'green', title: 'Joint home loan: claim ₹2L each under 24(b)', desc: 'Both co-owners can claim ₹2L interest deduction separately.' } : null,
  ].filter(Boolean);

  return (
    <div className="bg-card border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-purple-500/5 pointer-events-none" />

      <div className="text-center mb-10 relative z-10">
        <Sparkles className="w-8 h-8 text-gold mx-auto mb-3" />
        <h2 className="text-3xl font-bold mb-2">Combined Financial Profile</h2>
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <span className="text-blue-400 font-bold">{p1.name || 'Partner 1'}</span>
          <Heart size={14} className="text-pink-500" fill="currentColor" />
          <span className="text-pink-400 font-bold">{p2.name || 'Partner 2'}</span>
        </div>
      </div>

      {/* Key stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-10 relative z-10">
        <div className="bg-navy p-6 rounded-2xl border border-white/5 text-center">
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Combined Income</div>
          <div className="text-3xl font-black text-white"><span ref={incomeRef}>₹0</span></div>
          <div className="text-xs text-gray-500 mt-1">/month</div>
        </div>
        <div className="bg-gradient-to-br from-gold/20 to-card p-6 rounded-2xl border border-gold/30 text-center">
          <div className="text-xs text-gold uppercase tracking-widest mb-2 font-bold">Target FIRE Year</div>
          <div className="text-4xl font-black text-white"><span ref={fireDateRef}>{currentYear}</span></div>
          <div className="text-xs text-gray-500 mt-1">{yearsToFire} years away</div>
        </div>
        <div className="bg-navy p-6 rounded-2xl border border-white/5 text-center">
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Compatibility</div>
          <div className={`text-3xl font-black ${compatPct > 70 ? 'text-green-400' : compatPct > 40 ? 'text-yellow-400' : 'text-red-400'}`}>{compatPct}%</div>
          <div className="text-xs text-gray-500 mt-1">{compatPct > 70 ? 'Great match!' : compatPct > 40 ? 'Room to align' : 'Talk it out!'}</div>
        </div>
      </div>

      {/* Savings comparison */}
      <div className="bg-navy p-6 rounded-2xl border border-white/5 mb-8 relative z-10">
        <h4 className="text-sm font-bold text-gray-400 mb-4">Savings Rate Comparison</h4>
        <div className="space-y-3">
          {[
            { name: p1.name || 'Partner 1', rate: p1Rate, color: 'bg-blue-500' },
            { name: p2.name || 'Partner 2', rate: p2Rate, color: 'bg-pink-500' },
          ].map(p => (
            <div key={p.name} className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-24 shrink-0">{p.name}</span>
              <div className="flex-1 h-3 bg-black/40 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${p.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, p.rate * 100)}%` }}
                  transition={{ duration: 1.5, delay: 0.3 }}
                />
              </div>
              <span className="text-xs font-bold text-white w-12 text-right">{(p.rate * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tax opportunity */}
      {totalTaxSaving > 0 && (
        <div className="bg-green-900/20 border border-green-500/20 p-5 rounded-2xl mb-8 text-center relative z-10">
          <div className="text-xs text-green-400 uppercase tracking-widest mb-1">Joint Tax Saving Potential</div>
          <div className="text-3xl font-black text-green-400">₹{totalTaxSaving.toLocaleString('en-IN')}</div>
          <div className="text-xs text-gray-500 mt-1">by maxing out both 80C limits</div>
        </div>
      )}

      {/* Optimization tips */}
      <h3 className="text-lg font-bold border-b border-white/10 pb-3 mb-5 relative z-10">Optimization Opportunities</h3>
      <div className="space-y-3 relative z-10">
        {tips.map((t, i) => (
          <motion.div key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.15 }}
            className="flex items-start gap-4 p-4 bg-navy rounded-xl border border-white/5 hover:border-gold/30 transition-colors"
          >
            <div className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 ${
              t.color === 'blue' ? 'bg-blue-500 text-white' :
              t.color === 'pink' ? 'bg-pink-500 text-white' :
              t.color === 'green' ? 'bg-green-500 text-white' :
              'bg-gold text-navy'
            }`}>{t.tag}</div>
            <div>
              <h4 className="font-bold text-white text-sm mb-1">{t.title}</h4>
              <p className="text-xs text-gray-400">{t.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <button onClick={onReset} className="w-full mt-8 bg-card border border-white/10 text-gray-400 py-3 rounded-xl hover:text-white transition-colors relative z-10">← Start Over</button>
    </div>
  );
}
