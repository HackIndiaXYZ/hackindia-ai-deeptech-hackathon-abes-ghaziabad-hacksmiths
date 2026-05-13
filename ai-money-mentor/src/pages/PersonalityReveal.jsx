import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import Confetti from 'react-confetti';
import { Shield, Flame, Zap, TreePine, Hourglass, Lightbulb, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { pageEnter, fadeUp } from '../animations/variants';
import { countUpNumber } from '../animations/gsapHelpers';

export default function PersonalityReveal() {
  const { state } = useApp();
  const rawScore = state.healthScore || {
    personality: "Balanced Builder", match: 89,
    strength: "High savings velocity, diversified core", 
    weakness: "Could optimize tax on debt funds", 
    tip: "Shift liquid funds to arbitrage for better post-tax returns."
  };

  const [flipped, setFlipped] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [typedName, setTypedName] = useState("");
  const cardRef = useRef(null);
  const matchRef = useRef(null);
  
  // Bobbing animation
  useEffect(() => {
    if (!flipped && cardRef.current) {
      gsap.to(cardRef.current, { y: "-=20", duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut" });
    }
  }, [flipped]);

  // Flip trigger (simulate network delay)
  useEffect(() => {
    const t = setTimeout(() => {
      if (cardRef.current) gsap.killTweensOf(cardRef.current);
      setFlipped(true);
      
      // Typewriter and details
      let i = 0;
      const typeInt = setInterval(() => {
        if (i <= rawScore.personality.length) {
          setTypedName(rawScore.personality.slice(0, i));
          i++;
        } else {
          clearInterval(typeInt);
          setTimeout(() => setShowDetails(true), 500);
        }
      }, 50);

      if (matchRef.current) {
        countUpNumber(matchRef, rawScore.match, 2, "", "%");
      }
      
    }, 3000);
    return () => clearTimeout(t);
  }, [rawScore]);

  const getStyle = () => {
    switch(rawScore.personality) {
      case 'Fearful Saver': return { bg: 'bg-gradient-to-br from-slate-600 to-slate-900', icon: Shield, color: 'text-slate-300 border-slate-500' };
      case 'Overconfident Investor': return { bg: 'bg-gradient-to-br from-red-600 to-red-900', icon: Flame, color: 'text-red-400 border-red-500' };
      case 'Impulsive Spender': return { bg: 'bg-gradient-to-br from-orange-500 to-orange-900', icon: Zap, color: 'text-orange-400 border-orange-500' };
      case 'Paralyzed Procrastinator': return { bg: 'bg-gradient-to-br from-blue-600 to-blue-900', icon: Hourglass, color: 'text-blue-400 border-blue-500' };
      default: return { bg: 'bg-gradient-to-br from-green-600 to-green-900', icon: TreePine, color: 'text-green-400 border-green-500' };
    }
  };
  const s = getStyle();
  const Icon = s.icon;

  return (
    <motion.div variants={pageEnter} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-navy pt-24 pb-20 px-4 overflow-hidden flex flex-col items-center">
      {flipped && <Confetti recycle={false} numberOfPieces={300} colors={['#F5A623', '#0B0F1A', '#ffffff']} />}
      
      <div className="perspective-[1200px] mb-16 relative">
        <motion.div 
          ref={cardRef}
          initial={false}
          animate={{ rotateY: flipped ? 180 : 0, scale: flipped ? 1.1 : 1 }}
          transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }} // Flip starts slow, speeds up in middle
          className="w-[340px] h-[480px] transform-style-3d relative"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Back of Card (Initially Visible) */}
          <div className="absolute inset-0 bg-card rounded-[40px] border-2 border-gold/40 flex flex-col items-center justify-center p-8 backface-hidden shadow-[0_0_50px_rgba(245,166,35,0.15)]" style={{ backfaceVisibility: 'hidden' }}>
            {/* Ornate Gold Pattern */}
            <div className="absolute inset-4 border border-gold/20 rounded-[28px] pointer-events-none" />
            <div className="absolute inset-6 border border-gold/10 rounded-[20px] pointer-events-none" />
            
            <div className="w-24 h-24 rounded-full border border-gold/30 flex items-center justify-center animate-spin-slow mb-6">
              <div className="w-16 h-16 rounded-full border-t border-r border-gold border-b-transparent border-l-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }} />
            </div>
            
            <div className="text-center font-bold text-gray-400 uppercase tracking-widest text-sm leading-loose">
              Analyzing<br/>Patterns...
            </div>
          </div>

          {/* Front of Card (Revealed) */}
          <div className={`absolute inset-0 ${s.bg} rounded-[40px] border-[3px] ${s.color} flex flex-col items-center justify-start py-12 px-8 backface-hidden shadow-2xl overflow-hidden`} style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}>
            {/* Dark overlay grid */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />
            
            {/* Match Percentage Ring */}
            <div className="relative w-32 h-32 flex items-center justify-center mb-8 shrink-0">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="60" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                <motion.circle 
                  cx="64" cy="64" r="60" fill="none" stroke="currentColor" strokeWidth="6"
                  strokeDasharray="377" strokeDashoffset={flipped ? 377 - (377 * 0.89) : 377} // 89% match roughly
                  transition={{ duration: 2, delay: 1 }}
                  className={`text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]`}
                />
              </svg>
              <div className="bg-black/40 rounded-full w-24 h-24 flex items-center justify-center border border-white/10 z-10 backdrop-blur-md">
                <Icon className={`w-12 h-12 text-white`} />
              </div>
            </div>

            <div className="text-center relative z-10 space-y-2">
              <div className="text-xs uppercase tracking-widest text-white/60 font-bold mb-2">You Are A</div>
              <h2 className="text-3xl font-black text-white leading-tight min-h-[80px]">{typedName}<span className="animate-pulse">_</span></h2>
              <div className="text-sm font-medium text-white/80 bg-black/30 w-max mx-auto px-4 py-1.5 rounded-full border border-white/10">
                <span ref={matchRef}>0</span> Match
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {!flipped && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl text-gold animate-pulse tracking-wide">
          Your Financial Personality Is Being Determined...
        </motion.div>
      )}

      <AnimatePresence>
        {showDetails && (
          <motion.div 
            initial="initial" animate="animate" variants={staggerContainer} 
            className="w-full max-w-4xl grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <motion.div variants={fadeUp} className="bg-gradient-to-b from-[#062c16] to-card border border-green-500/30 p-6 rounded-3xl flex flex-col shadow-[0_10px_30px_rgba(34,197,94,0.1)]">
              <div className="w-10 h-10 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-4">
                <ThumbsUp size={20} />
              </div>
              <h3 className="text-green-400 font-bold mb-2">Top Strength</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{rawScore.strength}</p>
            </motion.div>
            
            <motion.div variants={fadeUp} className="bg-gradient-to-b from-[#3a0d14] to-card border border-red-500/30 p-6 rounded-3xl flex flex-col shadow-[0_10px_30px_rgba(239,68,68,0.1)]">
              <div className="w-10 h-10 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-4">
                <ThumbsDown size={20} />
              </div>
              <h3 className="text-red-400 font-bold mb-2">Blind Spot</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{rawScore.weakness}</p>
            </motion.div>

            <motion.div variants={fadeUp} className="md:col-span-2 lg:col-span-1 bg-gradient-to-b from-[#2a1b02] to-card border border-gold/40 p-6 rounded-3xl flex flex-col shadow-[0_10px_30px_rgba(245,166,35,0.15)] relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-gold opacity-10 blur-2xl group-hover:opacity-20 transition-opacity" />
              <div className="w-10 h-10 bg-gold/20 text-gold rounded-full flex items-center justify-center mb-4">
                <Lightbulb size={20} className="group-hover:animate-pulse" />
              </div>
              <h3 className="text-gold font-bold mb-2">Pro Tip</h3>
              <p className="text-gray-300 text-sm leading-relaxed italic">"{rawScore.tip}"</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </motion.div>
  );
}

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.15 } }
};
