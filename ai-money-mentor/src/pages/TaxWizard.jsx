import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as PieTooltip } from 'recharts';
import gsap from 'gsap';
import { pageEnter, staggerContainer } from '../animations/variants';
import { countUpNumber } from '../animations/gsapHelpers';
import { ChevronDown, ChevronRight, Calculator, Check, AlertTriangle, HelpCircle } from 'lucide-react';

export default function TaxWizard() {
  const [mode, setMode] = useState('comparison'); // 'analysis' or 'comparison'
  const [income, setIncome] = useState({ basic: 800000, hra: 300000, rent: 250000, city: 'metro', lta: 50000, special: 200000 });
  const [deductions, setDeductions] = useState({
    section80C: { expanded: false, ppf: 50000, elss: 50000, lic: 20000, homePrincipal: 0, tuition: 0 },
    section80D: { expanded: false, self: 15000, parents: 0 },
    homeInterest: 0,
    nps: 50000
  });

  const total80C = Object.entries(deductions.section80C).filter(([k]) => k !== 'expanded').reduce((acc, [_, v]) => acc + Number(v), 0);
  const capped80C = Math.min(150000, total80C);
  const total80D = Object.entries(deductions.section80D).filter(([k]) => k !== 'expanded').reduce((acc, [_, v]) => acc + Number(v), 0);
  const homeInt = Number(deductions.homeInterest);
  const cappedHomeInt = Math.min(200000, homeInt);
  const nps = Number(deductions.nps);

  const totalIncome = Object.entries(income).filter(([k]) => k !== 'city').reduce((acc, [_, v]) => acc + Number(v), 0);
  
  // HRA Calculation (simplified rough calc for demo)
  const hraExemption = Math.min(income.hra, income.rent - (0.1 * income.basic), income.city === 'metro' ? 0.5 * income.basic : 0.4 * income.basic);
  const validHraExemption = Math.max(0, hraExemption);

  // Old Regime
  const oldGross = totalIncome - validHraExemption - income.lta; // std deduction 50k
  const oldNetTaxable = Math.max(0, oldGross - 50000 - capped80C - total80D - cappedHomeInt - nps);
  const oldTax = calculateSlabTax(oldNetTaxable, 'old');

  // New Regime
  const newGross = totalIncome - 50000; // std ded added to new regime in recent budgets
  const newNetTaxable = Math.max(0, newGross);
  const newTax = calculateSlabTax(newNetTaxable, 'new');

  const updateIncome = (k, v) => setIncome(p => ({ ...p, [k]: v }));
  const update80C = (k, v) => setDeductions(p => ({ ...p, section80C: { ...p.section80C, [k]: v } }));
  const update80D = (k, v) => setDeductions(p => ({ ...p, section80D: { ...p.section80D, [k]: v } }));

  return (
    <motion.div variants={pageEnter} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-navy pt-24 pb-20 px-4">
      <div className="max-w-[1200px] mx-auto space-y-12">
        
        {/* Toggle & Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
          <div>
            <h1 className="text-4xl font-bold flex items-center mb-2"><Calculator className="mr-3 text-gold" size={36} /> Tax Wizard</h1>
            <p className="text-gray-400">Optimize securely under Indian tax laws.</p>
          </div>
          <div className="bg-card p-1 rounded-full border border-white/10 flex relative w-64">
            <motion.div 
              layoutId="taxModePill" 
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gold rounded-full z-0"
              animate={{ left: mode === 'comparison' ? '4px' : 'calc(50% + 0px)' }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
            <button onClick={() => setMode('comparison')} className={`flex-1 py-2 text-sm font-bold z-10 transition-colors ${mode === 'comparison' ? 'text-navy' : 'text-gray-400 hover:text-white'}`}>Compare</button>
            <button onClick={() => setMode('analysis')} className={`flex-1 py-2 text-sm font-bold z-10 transition-colors ${mode === 'analysis' ? 'text-navy' : 'text-gray-400 hover:text-white'}`}>Analyze Mode</button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Left: Income */}
          <div className="bg-card p-6 md:p-8 rounded-3xl border border-white/5 space-y-6">
            <h3 className="text-xl font-bold mb-6 border-b border-white/10 pb-4">Income Structure</h3>
            <InputRow label="Basic Salary" value={income.basic} onChange={v => updateIncome('basic', v)} />
            <InputRow label="HRA Received" value={income.hra} onChange={v => updateIncome('hra', v)} />
            <InputRow label="Actual Rent Paid" value={income.rent} onChange={v => updateIncome('rent', v)} />
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">City Type</label>
              <select value={income.city} onChange={e => updateIncome('city', e.target.value)} className="bg-navy border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-gold transition-colors">
                <option value="metro">Metro</option>
                <option value="non-metro">Non-Metro</option>
              </select>
            </div>
            <InputRow label="LTA" value={income.lta} onChange={v => updateIncome('lta', v)} />
            <InputRow label="Special Allowances" value={income.special} onChange={v => updateIncome('special', v)} />
          </div>

          {/* Form Right: Deductions */}
          <div className="bg-card p-6 md:p-8 rounded-3xl border border-white/5 space-y-2">
            <h3 className="text-xl font-bold mb-6 border-b border-white/10 pb-4">Deductions & Exemptions</h3>
            
            {/* 80C Accordion */}
            <div className="border border-white/5 bg-navy/50 rounded-2xl overflow-hidden">
              <button 
                onClick={() => setDeductions(p => ({ ...p, section80C: { ...p.section80C, expanded: !p.section80C.expanded } }))} 
                className="w-full px-6 py-4 flex justify-between items-center hover:bg-white/5 transition-colors"
              >
                <span className="font-bold flex items-center">Section 80C <span className="ml-2 text-xs bg-gold/20 text-gold px-2 py-1 rounded">₹{capped80C.toLocaleString('en-IN')}/1.5L</span></span>
                <ChevronDown className={`transition-transform ${deductions.section80C.expanded ? 'rotate-180 text-gold' : 'text-gray-500'}`} />
              </button>
              <AnimatePresence>
                {deductions.section80C.expanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 pb-6 pt-2 space-y-4 border-t border-white/5">
                    <InputRow label="PPF" value={deductions.section80C.ppf} onChange={v => update80C('ppf', v)} small />
                    <InputRow label="ELSS Mutual Funds" value={deductions.section80C.elss} onChange={v => update80C('elss', v)} small />
                    <InputRow label="Life Insurance Prem." value={deductions.section80C.lic} onChange={v => update80C('lic', v)} small />
                    <InputRow label="Home Loan Principal" value={deductions.section80C.homePrincipal} onChange={v => update80C('homePrincipal', v)} small />
                    <InputRow label="Tuition Fees" value={deductions.section80C.tuition} onChange={v => update80C('tuition', v)} small />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 80D Accordion */}
            <div className="border border-white/5 bg-navy/50 rounded-2xl overflow-hidden mt-2">
              <button 
                onClick={() => setDeductions(p => ({ ...p, section80D: { ...p.section80D, expanded: !p.section80D.expanded } }))} 
                className="w-full px-6 py-4 flex justify-between items-center hover:bg-white/5 transition-colors"
              >
                <span className="font-bold flex items-center">Section 80D (Health) <span className="ml-2 text-xs bg-gold/20 text-gold px-2 py-1 rounded">₹{total80D.toLocaleString('en-IN')}</span></span>
                <ChevronDown className={`transition-transform ${deductions.section80D.expanded ? 'rotate-180 text-gold' : 'text-gray-500'}`} />
              </button>
              <AnimatePresence>
                {deductions.section80D.expanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 pb-6 pt-2 space-y-4 border-t border-white/5">
                    <InputRow label="Self & Family" value={deductions.section80D.self} onChange={v => update80D('self', v)} small />
                    <InputRow label="Senior Parents" value={deductions.section80D.parents} onChange={v => update80D('parents', v)} small />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="pt-4 space-y-4">
              <InputRow label="Section 24(B) Home Int" value={deductions.homeInterest} onChange={v => setDeductions(p => ({...p, homeInterest: v}))} />
              <InputRow label="Section 80CCD(1B) NPS" value={deductions.nps} onChange={v => setDeductions(p => ({...p, nps: v}))} />
            </div>
          </div>
        </div>

        {/* Dynamic Result Area */}
        <AnimatePresence mode="wait">
          {mode === 'comparison' ? (
            <motion.div key="comp" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}>
              <ComparisonResult oldTax={oldTax} newTax={newTax} oldParams={{totalIncome:-1}} />
            </motion.div>
          ) : (
            <motion.div key="anal" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}>
              <AnalysisResult totalIncome={totalIncome} bestTax={Math.min(oldTax, newTax)} investments={total80C + total80D + nps} missed={150000 - capped80C} />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
}

// Subcomponents
function InputRow({ label, value, onChange, small }) {
  return (
    <div className={`flex items-center justify-between ${small ? 'pl-4' : ''}`}>
      <label className={`${small ? 'text-xs text-gray-400' : 'text-sm font-medium text-gray-300'}`}>{label}</label>
      <div className="relative w-1/3">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
        <input 
          type="number" 
          value={value} 
          onChange={e => onChange(Number(e.target.value))} 
          className={`w-full bg-navy border border-white/10 rounded-lg pl-8 pr-3 text-white outline-none focus:border-gold transition-colors text-right ${small ? 'py-1 text-xs' : 'py-2'}`}
        />
      </div>
    </div>
  );
}

function ComparisonResult({ oldTax, newTax }) {
  const isOldBetter = oldTax < newTax;
  const savings = Math.abs(oldTax - newTax);
  const badgeRef = useRef(null);

  useEffect(() => {
    if(badgeRef.current) {
      gsap.fromTo(badgeRef.current, { scale: 0 }, { scale: 1.4, duration: 0.5, ease: "back.out(1.5)", onComplete: () => gsap.to(badgeRef.current, { scale: 1, duration: 0.2 }) });
    }
  }, [savings, isOldBetter]);

  return (
    <div className="grid md:grid-cols-2 gap-8 my-12">
      <RegimeCol title="Old Regime" tax={oldTax} isWinner={isOldBetter} />
      <RegimeCol title="New Regime" tax={newTax} isWinner={!isOldBetter} />
      {savings > 0 && (
        <div className="md:col-span-2 flex justify-center mt-[-30px] z-10 relative">
          <div ref={badgeRef} className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-2 rounded-full font-black text-navy shadow-[0_0_20px_rgba(34,197,94,0.6)] border-2 border-green-300">
            Saves ₹{savings.toLocaleString('en-IN')}
          </div>
        </div>
      )}
    </div>
  );
}

function RegimeCol({ title, tax, isWinner }) {
  const valRef = useRef(null);
  useEffect(() => {
    countUpNumber(valRef, tax, 1, "₹");
  }, [tax]);

  return (
    <div className={`bg-card p-8 rounded-3xl relative transition-all duration-500 ${isWinner ? 'border-2 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.15)] bg-gradient-to-b from-green-900/10 to-card' : 'border border-white/5'}`}>
      {isWinner && <div className="absolute top-4 right-4 bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full flex items-center"><Check size={14} className="mr-1"/> Recommended</div>}
      <h3 className="text-xl font-bold mb-8 text-gray-300">{title}</h3>
      <div className="text-sm text-gray-400 mb-1 uppercase tracking-widest font-bold">Total Tax Liability</div>
      <div className={`text-5xl font-black mb-8 ${isWinner ? 'text-green-400' : 'text-white'}`}>
        <span ref={valRef}>0</span>
      </div>
      
      {/* Visual Rows */}
      <div className="space-y-4">
        {[1,2,3].map(i => (
          <motion.div key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className="h-2 w-full bg-navy rounded-full overflow-hidden">
            <div className={`h-full ${isWinner ? 'bg-green-500/30' : 'bg-gray-600/30'}`} style={{ width: `${Math.random() * 60 + 20}%` }} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function AnalysisResult({ totalIncome, bestTax, investments, missed }) {
  const takeHome = totalIncome - bestTax - investments;
  const data = [
    { name: 'Tax', value: bestTax, color: '#ef4444' },
    { name: 'Investments', value: investments, color: '#F5A623' },
    { name: 'Take Home', value: takeHome, color: '#22c55e' }
  ];

  return (
    <div className="grid lg:grid-cols-2 gap-8 my-12">
      <div className="bg-card p-8 rounded-3xl border border-white/5">
        <h3 className="text-2xl font-bold mb-6 text-center">Tax Breakdown</h3>
        <div className="h-64 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value" animationDuration={1500} animationBegin={200}>
                {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" className="hover:opacity-80 transition-opacity cursor-pointer outline-none" />)}
              </Pie>
              <PieTooltip contentStyle={{ backgroundColor: '#0B0F1A', border: '1px solid rgba(245,166,35,0.3)', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Take Home</div>
            <div className="text-gold font-black text-xl">₹{(takeHome/100000).toFixed(1)}L</div>
          </div>
        </div>
        <div className="flex justify-center space-x-6 mt-6">
          {data.map(d => (
            <div key={d.name} className="flex items-center text-xs text-gray-400">
              <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: d.color }} /> {d.name}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card p-8 rounded-3xl border border-white/5">
        <div className="flex items-center space-x-3 mb-6">
          <AlertTriangle className="text-red-500" />
          <h3 className="text-xl font-bold text-red-500">Money Left On The Table</h3>
        </div>
        <div className="space-y-4">
          <MissedCard title="Section 80C Gap" amount={missed} steps={['Log into ELSS provider.', 'Setup ₹' + (missed/12).toFixed(0) + ' monthly SIP.', 'Claim in ITR']} />
          <MissedCard title="NPS Tier 1" amount={50000} steps={['Open NPS account online.', 'Contribute 50k before March 31.', 'Get 80CCD(1B) receipt.']} />
        </div>
      </div>
    </div>
  );
}

function MissedCard({ title, amount, steps }) {
  const [open, setOpen] = useState(false);
  const valRef = useRef(null);
  
  useEffect(() => { countUpNumber(valRef, amount, 2, "₹"); }, [amount]);

  if(amount <= 0) return null;

  return (
    <motion.div initial={{ rotateX: 90, opacity: 0 }} whileInView={{ rotateX: 0, opacity: 1 }} viewport={{ once:true }} className="bg-navy rounded-2xl border border-red-900/50 overflow-hidden perspective-[1000px]">
      <div className="p-4 flex justify-between items-center bg-gradient-to-r from-red-900/20 to-transparent">
        <div>
          <h4 className="font-bold text-gray-300">{title}</h4>
          <div className="text-2xl font-black text-red-400"><span ref={valRef}>0</span></div>
        </div>
        <button onClick={() => setOpen(!open)} className="text-xs font-bold text-gold bg-gold/10 px-3 py-2 rounded-lg hover:bg-gold/20 transition-colors">How To Claim</button>
      </div>
      <AnimatePresence>
        {open && (
           <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-4 border-t border-red-900/30 space-y-2">
             {steps.map((s,i) => <div key={i} className="flex text-sm text-gray-400"><span className="text-red-500 font-bold mr-2">{i+1}.</span> {s}</div>)}
           </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Very basic tax calc for demo
function calculateSlabTax(taxable, mode) {
  let tax = 0;
  if(mode === 'old') {
    if(taxable <= 250000) return 0;
    if(taxable <= 500000) return taxable <= 500000 ? 0 : 0; // standard rebate 87A makes it 0 if <= 5L
    // if income > 5L, standard slabs
    if(taxable > 250000) tax += Math.min(250000, taxable - 250000) * 0.05;
    if(taxable > 500000) tax += Math.min(500000, taxable - 500000) * 0.20;
    if(taxable > 1000000) tax += (taxable - 1000000) * 0.30;
  } else {
    // New regime slabs
    if(taxable <= 700000) return 0; // Rebate 87A
    if(taxable > 300000) tax += Math.min(300000, taxable - 300000) * 0.05;
    if(taxable > 600000) tax += Math.min(300000, taxable - 600000) * 0.10;
    if(taxable > 900000) tax += Math.min(300000, taxable - 900000) * 0.15;
    if(taxable > 1200000) tax += Math.min(300000, taxable - 1200000) * 0.20;
    if(taxable > 1500000) tax += (taxable - 1500000) * 0.30;
  }
  return tax * 1.04; // Health & Edu Cess
}
