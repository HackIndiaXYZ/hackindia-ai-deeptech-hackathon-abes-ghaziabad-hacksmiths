import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { X } from 'lucide-react';

export default function FinancialObituary() {
  const [show, setShow] = useState(false);
  const { state } = useApp();
  const timerRef = useRef(null);
  const data = state.userData || {};

  const name = data.name || 'You';
  const age = data.age || 28;
  const income = data.income || 85000;

  // Calculate regret numbers
  const delayYears = 7;
  const startAge = age + delayYears;
  const monthlyInvest = Math.round(income * 0.2);
  const rate = 0.12;
  const n = delayYears * 12;
  const r = rate / 12;
  const lostWealth = Math.round(monthlyInvest * ((Math.pow(1 + r, n) - 1) / r) * Math.pow(1 + r, (30 - delayYears) * 12 > 0 ? 1 : 0));
  const lostCrores = (lostWealth / 10000000).toFixed(1);
  const retireAge = 52 + delayYears + Math.round(delayYears * 1.5);

  useEffect(() => {
    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setShow(true), 60000);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, []);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] bg-black/95 flex items-center justify-center p-4"
        onClick={() => setShow(false)}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
          className="max-w-2xl w-full bg-[#0a0a0a] border border-gray-800 p-10 md:p-14 relative"
          onClick={e => e.stopPropagation()}
        >
          <button onClick={() => setShow(false)} className="absolute top-4 right-4 text-gray-600 hover:text-white transition-colors">
            <X size={20} />
          </button>

          {/* Newspaper-style obituary */}
          <div className="text-center border-b border-gray-700 pb-6 mb-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-xs uppercase tracking-[0.4em] text-gray-600 mb-3"
            >
              Financial Obituary Notice
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="text-4xl md:text-5xl font-serif font-bold text-white mb-2"
            >
              R.I.P.
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
              className="text-sm text-gray-500"
            >
              The Financial Future of {name}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="text-gray-400 leading-relaxed text-sm md:text-base font-serif space-y-4"
          >
            <p>
              Here lies the retirement of <span className="text-white font-semibold">{name}</span>, aged{' '}
              <span className="text-white font-semibold">{age}</span>.
            </p>
            <p>
              {name} had the income, the intelligence, and the opportunity. But {name.split(' ')[0]} waited. And waited.
            </p>
            <p>
              By the time {name.split(' ')[0]} started investing at age{' '}
              <span className="text-red-400 font-bold">{startAge}</span>, {name.split(' ')[0]} had already lost{' '}
              <span className="text-red-400 font-bold">₹{lostCrores} Crore</span> to inaction.
            </p>
            <p>
              {name.split(' ')[0]} worked until age{' '}
              <span className="text-red-400 font-bold">{retireAge}</span> instead of retiring at{' '}
              <span className="text-green-400 font-bold">52</span>.
            </p>
            <p className="text-gray-600 italic border-t border-gray-800 pt-4 mt-6">
              {name.split(' ')[0]} is survived by an unused SIP account, unpaid credit card bills, and ₹{Math.round(income * 0.6).toLocaleString('en-IN')} of monthly expenses that never stopped growing.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.5 }}
            className="mt-10 text-center"
          >
            <div className="text-xs text-gray-600 mb-4 uppercase tracking-widest">Don't let this be your story.</div>
            <button
              onClick={() => setShow(false)}
              className="bg-gold hover:bg-yellow-500 text-navy font-bold px-8 py-3 rounded-full transition-all shadow-[0_0_20px_rgba(245,166,35,0.4)] hover:shadow-[0_0_30px_rgba(245,166,35,0.6)]"
            >
              Start Investing Now →
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
