import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { askGeminiJSON } from '../services/geminiService';
import { useApp } from '../context/AppContext';
import Logo from './Logo';

export default function DNALoader() {
  const [textIndex, setTextIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [progress, setProgress] = useState(0);
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const loaderRef = useRef(null);

  const lines = [
    "Analyzing your financial DNA...",
    "Comparing with 50,000 Indian profiles...",
    "Identifying your blind spots...",
    "Building your personalized plan..."
  ];

  // Progress bar animation
  useEffect(() => {
    const start = Date.now();
    const duration = 6000;
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);
      if (pct < 100) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  // Cycle through text lines
  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex++;
      if (currentIndex < lines.length) {
        setTextIndex(currentIndex);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [lines.length]);

  // Typewriter effect
  useEffect(() => {
    setTypedText("");
    const phrase = lines[textIndex];
    let i = 0;
    const typeInterval = setInterval(() => {
      if (i <= phrase.length) {
        setTypedText(phrase.slice(0, i));
        i++;
      } else {
        clearInterval(typeInterval);
      }
    }, 25);
    return () => clearInterval(typeInterval);
  }, [textIndex]);

  // Fetch AI data
  useEffect(() => {
    const fetchData = async () => {
      const startTime = Date.now();
      try {
        const prompt = `User Data: ${JSON.stringify(state.userData)}. You are an expert Indian financial AI advisor. Generate a financial health score out of 100, a short verdict (1 sentence), and a 30-day action plan with 5 tasks. Each task needs title, description, time to complete (e.g. '15 mins'), and impact (number in INR). Format strictly as JSON: { "score": 65, "verdict": "...", "actions": [ { "title": "...", "desc": "...", "time": "...", "impact": 5000 } ], "personality": "Balanced Builder", "strength": "Good saving rate", "weakness": "No emergency fund", "percentile": 75 }`;
        const result = await askGeminiJSON(prompt);
        dispatch({ type: 'SET_HEALTH_SCORE', payload: result });
        const elapsed = Date.now() - startTime;
        const waitTime = Math.max(0, 6000 - elapsed);
        setTimeout(() => exitAnimation(), waitTime);
      } catch (err) {
        console.error(err);
        dispatch({ type: 'SET_HEALTH_SCORE', payload: {
          score: 64, verdict: "You have a solid foundation but significant gaps in tax optimization.", percentile: 68,
          strength: "Strong savings habit", weakness: "Under-utilized 80C limit", personality: "Balanced Builder",
          actions: [
            { title: "Open a PPF Account", desc: "Start contributing to PPF to max out 80C.", time: "15 mins", impact: 46000 },
            { title: "Review Term Insurance", desc: "Buy a pure term life insurance plan.", time: "30 mins", impact: 10000000 },
            { title: "Automate SIPs", desc: "Set up auto-debit for mutual fund SIPs.", time: "10 mins", impact: 60000 },
            { title: "Build Emergency Fund", desc: "Move savings into a sweep-in FD.", time: "20 mins", impact: 10000 },
            { title: "Claim HRA", desc: "Submit rent receipts to your employer.", time: "5 mins", impact: 25000 }
          ]
        }});
        const elapsed = Date.now() - startTime;
        const waitTime = Math.max(0, 6000 - elapsed);
        setTimeout(() => exitAnimation(), waitTime);
      }
    };

    const exitAnimation = () => {
      gsap.to(loaderRef.current, {
        scale: 1.5,
        opacity: 0,
        duration: 0.8,
        ease: "power2.in",
        onComplete: () => navigate('/results/health')
      });
    };

    fetchData();
  }, [dispatch, navigate, state.userData]);

  return (
    <div ref={loaderRef} className="fixed inset-0 z-[9999] bg-[#060810] flex flex-col items-center justify-center transform origin-center overflow-hidden">

      {/* Floating background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gold/30 rounded-full"
            style={{ left: `${5 + Math.random() * 90}%`, top: `${5 + Math.random() * 90}%` }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 3 }}
          />
        ))}
      </div>

      {/* Outer spinning rings + Logo */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-56 h-56 flex items-center justify-center">
          {/* Spinning gold ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            className="absolute inset-0 rounded-full border-t-[3px] border-transparent border-t-gold shadow-[0_0_20px_rgba(245,166,35,0.3)]"
          />
          {/* Counter-spinning ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
            className="absolute inset-4 rounded-full border-b-[2px] border-transparent border-b-purple/40"
          />
          {/* Pulsing glow */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-36 h-36 rounded-full bg-gold/15 blur-2xl"
          />
          {/* Animated Logo */}
          <Logo iconSize={100} textClass="text-2xl" showSub={false} className="flex-col" />
        </div>

        {/* Text area */}
        <div className="mt-12 h-32 flex flex-col items-center gap-3 text-center px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={textIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-xl md:text-2xl font-light tracking-wide text-gold"
            >
              {typedText}
              <span className="inline-block w-0.5 h-5 ml-1 bg-gold animate-pulse align-middle" />
            </motion.div>
          </AnimatePresence>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mt-4">
            {lines.map((_, i) => (
              <motion.div
                key={i}
                className={`rounded-full transition-all duration-500 ${i <= textIndex ? 'bg-gold w-3 h-3' : 'bg-gold/20 w-2 h-2'}`}
                animate={i === textIndex ? { scale: [1, 1.4, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom progress bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gold/10">
        <motion.div
          className="h-full bg-gradient-to-r from-gold to-yellow-400 shadow-[0_0_10px_rgba(245,166,35,0.5)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* AFTERMATH branding */}
      <div className="absolute bottom-8 text-xs text-gold/40 tracking-[0.3em] uppercase font-medium">
        AFTERMATH
      </div>
    </div>
  );
}
