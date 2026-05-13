import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function MidnightMirror() {
  const [visible, setVisible] = useState(false);
  const [currentReflection, setCurrentReflection] = useState(0);
  const { state } = useApp();
  const data = state.userData || {};
  const name = data.name || 'You';

  useEffect(() => {
    const check = () => {
      const hour = new Date().getHours();
      setVisible(hour >= 23 || hour < 2);
    };
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, []);

  const daysSinceFirstJob = Math.round((new Date() - new Date(new Date().getFullYear() - 3, 0, 1)) / 86400000); // approximate

  const reflections = [
    {
      text: `It's been approximately ${daysSinceFirstJob} days since you could have started building wealth. What do you have to show for it financially?`,
      action: null,
    },
    {
      text: `Your parents worked 30 years to give you opportunities they never had. What are you building with that privilege?`,
      action: null,
    },
    {
      text: `At this hour, you're reading about finance instead of sleeping. That's actually a good sign. It means you care. Here's one thing you can do in the next 5 minutes:`,
      action: 'Open any investment app and set up a ₹500 SIP. It takes 3 minutes. The amount doesn\'t matter. The habit does.',
    },
    {
      text: `₹100 invested today at age ${data.age || 28} becomes ₹9,300 by retirement at 12% CAGR. Every day you wait, that number shrinks.`,
      action: null,
    },
    {
      text: `The best financial decision is rarely the mathematically optimal one. It's the one you actually make. Tonight, make one small decision. Let it be imperfect. Let it be small. Just make it.`,
      action: 'Set a reminder for tomorrow morning: "Open investment account." That\'s enough for tonight.',
    },
  ];

  if (!visible) return null;

  const r = reflections[currentReflection];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed bottom-24 right-6 z-[100] w-80 md:w-96"
      >
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-[#0a0a12] border border-purple-500/20 rounded-2xl p-6 shadow-2xl shadow-purple-500/10"
        >
          <div className="flex items-center gap-2 mb-4">
            <Moon className="w-4 h-4 text-purple-400" />
            <span className="text-xs tracking-widest uppercase text-purple-400/70">Midnight Mirror</span>
            <button onClick={() => setVisible(false)} className="ml-auto text-gray-600 hover:text-white text-xs">✕</button>
          </div>

          <motion.p key={currentReflection} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-sm text-gray-300 leading-relaxed mb-4 font-serif italic">
            "{r.text}"
          </motion.p>

          {r.action && (
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-xs text-purple-300 mb-4">
              <ArrowRight size={12} className="inline mr-1" /> {r.action}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {reflections.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === currentReflection ? 'bg-purple-400' : 'bg-purple-900'}`} />
              ))}
            </div>
            <button
              onClick={() => setCurrentReflection((currentReflection + 1) % reflections.length)}
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              Next reflection →
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
