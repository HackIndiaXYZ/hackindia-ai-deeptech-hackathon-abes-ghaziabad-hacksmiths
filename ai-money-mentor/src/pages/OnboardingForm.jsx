import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Check, ShieldCheck, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import gsap from 'gsap';

const steps = [
  { id: 1, name: 'Basics' },
  { id: 2, name: 'Income' },
  { id: 3, name: 'Assets' },
  { id: 4, name: 'Debts' },
  { id: 5, name: 'Goals' }
];

export default function OnboardingForm() {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [init, setInit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    age: '', city: '',
    monthlyIncome: '', monthlyExpenses: '',
    savings: '', investments: '',
    hasDebt: null, debtAmount: '',
    primaryGoal: ''
  });

  const progressLineRef = useRef(null);
  const goldDotRef = useRef(null);

  useEffect(() => {
    initParticlesEngine(async (engine) => await loadSlim(engine)).then(() => setInit(true));
    
    // Floating gold dot
    const moveDot = () => {
      if(!goldDotRef.current) return;
      gsap.to(goldDotRef.current, {
        x: Math.random() * window.innerWidth * 0.8,
        y: Math.random() * window.innerHeight * 0.8,
        duration: 10 + Math.random() * 10,
        ease: "sine.inOut",
        onComplete: moveDot
      });
    };
    moveDot();
  }, []);

  useEffect(() => {
    if (progressLineRef.current) {
      const percentage = ((currentStep - 1) / (steps.length - 1)) * 100;
      gsap.to(progressLineRef.current, { width: `${percentage}%`, duration: 0.5, ease: 'power2.out' });
    }
  }, [currentStep]);

  const handleNext = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (currentStep < 5) {
        setCurrentStep(c => c + 1);
      } else {
        dispatch({ type: 'SET_USER_DATA', payload: formData });
        navigate('/loading');
      }
    }, 400); // simulate premium feel
  };

  const loadDemoData = () => {
    const demoMap = {
      1: { age: '28', city: 'Bangalore' },
      2: { monthlyIncome: '85000', monthlyExpenses: '55000' },
      3: { savings: '200000', investments: '50000' },
      4: { hasDebt: true, debtAmount: '300000' },
      5: { primaryGoal: 'Retire Early (FIRE)' }
    };
    const data = demoMap[currentStep];
    if(data) {
      setFormData(prev => ({ ...prev, ...data }));
    }
  };

  const updateForm = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  return (
    <div className="min-h-screen bg-navy relative overflow-hidden flex flex-col items-center pt-20 px-4">
      {/* Background */}
      {init && (
        <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
          <Particles options={{ particles: { color: { value: '#F5A623' }, move: { enable: true, speed: 0.3 }, number: { value: 30 } } }} />
        </div>
      )}
      <div ref={goldDotRef} className="fixed w-4 h-4 rounded-full bg-gold/50 blur-sm z-0 pointer-events-none" />

      {/* Shapes */}
      <div className="absolute top-20 left-10 w-32 h-32 rounded-full border border-gold/10 opacity-20 pointer-events-none animate-pulse" />
      <div className="absolute bottom-20 right-10 w-48 h-48 rotate-45 border border-gold/10 opacity-20 pointer-events-none animate-spin-slow" />

      {/* Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative z-10 w-full max-w-2xl bg-[#0F172A] border border-[rgba(245,166,35,0.15)] rounded-[20px] backdrop-blur-md p-8 md:p-10 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-10">
          <motion.h2 layoutId="formTitle" className="text-2xl font-bold text-white">Financial Assessment</motion.h2>
          <button onClick={loadDemoData} className="flex items-center space-x-2 text-gold text-sm font-medium hover:bg-gold/10 px-3 py-1.5 rounded-full transition-colors">
            <Sparkles size={16} /> <span>Load Demo Data</span>
          </button>
        </div>

        {/* Step Indicator */}
        <div className="relative mb-12">
          <div className="absolute top-4 left-0 w-full h-0.5 bg-white/10" />
          <div ref={progressLineRef} className="absolute top-4 left-0 h-0.5 bg-gold w-0" />
          <div className="flex justify-between relative z-10">
            {steps.map(s => {
              const isCompleted = s.id < currentStep;
              const isCurrent = s.id === currentStep;
              return (
                <div key={s.id} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all relative
                    ${isCompleted ? 'bg-gold text-navy' : isCurrent ? 'bg-navy border-2 border-gold text-gold' : 'bg-navy border border-gray-600 text-gray-500'}
                  `}>
                    {isCompleted ? <Check size={14} strokeWidth={4} /> : s.id}
                    {isCurrent && <div className="absolute inset-0 rounded-full border border-gold animate-ping opacity-50" />}
                  </div>
                  <span className={`text-[10px] mt-2 absolute top-10 whitespace-nowrap ${isCurrent ? 'text-gold' : 'text-gray-500'}`}>{s.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="min-h-[280px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              {currentStep === 1 && (
                <div className="space-y-6">
                  <FloatingInput label="Your Age" value={formData.age} onChange={(v) => updateForm('age', v)} type="number" />
                  <FloatingInput label="City (e.g., Mumbai, Bangalore)" value={formData.city} onChange={(v) => updateForm('city', v)} type="text" />
                </div>
              )}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <FloatingInput label="Monthly Income (₹)" value={formData.monthlyIncome} onChange={(v) => updateForm('monthlyIncome', v)} type="number" prefix="₹" />
                  <FloatingInput label="Monthly Expenses (₹)" value={formData.monthlyExpenses} onChange={(v) => updateForm('monthlyExpenses', v)} type="number" prefix="₹" />
                </div>
              )}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <FloatingInput label="Total Savings / Emergency Fund" value={formData.savings} onChange={(v) => updateForm('savings', v)} type="number" prefix="₹" />
                  <FloatingInput label="Total Investments (Mutual Funds, Stocks)" value={formData.investments} onChange={(v) => updateForm('investments', v)} type="number" prefix="₹" />
                </div>
              )}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <p className="text-sm text-gray-400 mb-2">Do you have any ongoing loans or debt?</p>
                  <div className="flex space-x-4">
                    <ToggleButton selected={formData.hasDebt === true} color="gold" onClick={() => updateForm('hasDebt', true)}>Yes, I have debt</ToggleButton>
                    <ToggleButton selected={formData.hasDebt === false} color="red" onClick={() => { updateForm('hasDebt', false); updateForm('debtAmount', '0'); }}>No debt</ToggleButton>
                  </div>
                  <AnimatePresence>
                    {formData.hasDebt && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="pt-4 overflow-hidden">
                        <FloatingInput label="Total Debt Remaining" value={formData.debtAmount} onChange={(v) => updateForm('debtAmount', v)} type="number" prefix="₹" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <FloatingInput label="What is your primary financial goal?" value={formData.primaryGoal} onChange={(v) => updateForm('primaryGoal', v)} type="text" />
                  <div className="p-4 rounded-xl bg-navy/50 border border-white/5 flex items-start space-x-4">
                    <ShieldCheck className="text-gold shrink-0 mt-1" />
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">Bank-level Security</h4>
                      <p className="text-xs text-gray-400">Your data is never stored permanently. It's only used for this session's AI analysis.</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="mt-12 flex justify-end">
          {currentStep < 5 ? (
            <button 
              onClick={handleNext}
              disabled={loading}
              className="group flex items-center space-x-2 bg-gold text-navy font-bold px-8 py-3 rounded-full hover:bg-goldLight transition-all relative overflow-hidden"
            >
              <span>{loading ? 'Processing...' : 'Next'}</span>
              {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              {loading && <div className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin" />}
            </button>
          ) : (
            <button 
              onClick={handleNext}
              disabled={loading}
              className="group flex items-center space-x-2 bg-gradient-to-r from-purple to-purplePink text-white font-bold px-8 py-3.5 rounded-full hover:shadow-[0_0_20px_rgba(192,38,211,0.5)] transition-all"
            >
              <span>{loading ? 'Analyzing...' : 'Analyze My Health'}</span>
              {!loading ? <Activity size={18} className="group-hover:rotate-180 transition-transform duration-500" /> : <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function FloatingInput({ label, value, onChange, type, prefix }) {
  const [focused, setFocused] = useState(false);
  const active = focused || String(value).length > 0;
  
  return (
    <div className={`relative bg-navy rounded-xl border transition-all duration-300 ${focused ? 'border-gold shadow-[0_0_0_3px_rgba(245,166,35,0.3)]' : 'border-white/10'}`}>
      {prefix && <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold ${active ? 'text-gold' : 'text-gray-500'}`}>{prefix}</span>}
      <motion.label 
        initial={false}
        animate={{
          top: active ? '8px' : '50%',
          fontSize: active ? '10px' : '14px',
          color: active ? '#9CA3AF' : '#6B7280'
        }}
        className={`absolute pointer-events-none transition-all duration-300 -translate-y-1/2 ${prefix ? 'left-8' : 'left-4'}`}
      >
        {label}
      </motion.label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full bg-transparent outline-none text-white font-medium pb-2 pt-6 ${prefix ? 'pl-8' : 'pl-4'} pr-10`}
      />
      {String(value).length > 0 && type === 'number' && (
        <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} className="absolute right-4 top-1/2 -translate-y-1/2">
          <CheckCircle2 size={18} className="text-green-500" />
        </motion.div>
      )}
    </div>
  );
}

import { CheckCircle2 } from 'lucide-react';

function ToggleButton({ children, selected, color, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex-1 py-3 px-4 rounded-xl border font-medium transition-colors relative overflow-hidden ${
        selected 
          ? color === 'gold' ? 'bg-gold text-navy border-gold' : 'bg-red-500 text-white border-red-500'
          : 'bg-navy text-gray-400 border-white/10 hover:border-white/30'
      }`}
    >
      {selected && (
        <motion.div layoutId="ripple" className="absolute inset-0 bg-white/20" initial={{ scale: 0, opacity: 0.5 }} animate={{ scale: 2, opacity: 0 }} transition={{ duration: 0.5 }} />
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
