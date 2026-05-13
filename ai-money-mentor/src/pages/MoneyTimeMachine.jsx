import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ArrowLeft, TrendingUp, Calendar, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

const PAST_DATA = [
  { year: 1993, asset: 'Infosys IPO', invested: 100000, current: 400000000, label: '₹1L → ₹40Cr' },
  { year: 1995, asset: 'Wipro Shares', invested: 100000, current: 250000000, label: '₹1L → ₹25Cr' },
  { year: 2001, asset: 'Mumbai Flat (Bandra)', invested: 500000, current: 18000000, label: '₹5L → ₹1.8Cr' },
  { year: 2003, asset: 'HDFC Bank Stock', invested: 100000, current: 80000000, label: '₹1L → ₹8Cr' },
  { year: 2005, asset: 'Sensex Index Fund', invested: 500000, current: 5800000, label: '₹5L → ₹58L' },
  { year: 2008, asset: 'Gold (during crash)', invested: 200000, current: 1600000, label: '₹2L → ₹16L' },
  { year: 2010, asset: 'Bajaj Finance', invested: 100000, current: 45000000, label: '₹1L → ₹4.5Cr' },
  { year: 2012, asset: 'Nifty 50 SIP', invested: 500000, current: 3200000, label: '₹5L → ₹32L' },
  { year: 2015, asset: 'Reliance Industries', invested: 200000, current: 2400000, label: '₹2L → ₹24L' },
  { year: 2020, asset: 'Bitcoin (₹5L)', invested: 500000, current: 7500000, label: '₹5L → ₹75L' },
];

const FUTURE_FRAMES = [
  { year: 2026, decision: 'Start ₹10K SIP today', outcome: 'By 2036 you\'ll have ₹23.2L growing at 12% CAGR. Your future self thanks you.', emoji: '🎯' },
  { year: 2028, decision: 'Buy Term Insurance now', outcome: 'Your family has ₹1Cr protection. If you wait, premiums increase 40% and health issues may deny coverage.', emoji: '🛡️' },
  { year: 2030, decision: 'Max out 80C this year', outcome: 'You\'ve saved ₹4.68L in taxes over 4 years. That money is compounding in ELSS.', emoji: '🧾' },
  { year: 2035, decision: 'PPF matured + reinvested', outcome: 'Your ₹15L PPF corpus is now ₹42L after another 15-year cycle. Tax-free compounding magic.', emoji: '✨' },
  { year: 2040, decision: 'If you did nothing since today', outcome: 'Inflation ate 55% of your savings purchasing power. ₹1L today buys only ₹45K worth of goods.', emoji: '😰' },
];

export default function MoneyTimeMachine() {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState(2024);
  const [isDragging, setIsDragging] = useState(false);
  const dialRef = useRef(null);
  const currentYear = 2025;

  const minYear = 1990;
  const maxYear = 2040;
  const totalYears = maxYear - minYear;
  const rotation = ((selectedYear - minYear) / totalYears) * 360;

  const handleDialMove = (e) => {
    if (!isDragging || !dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const angle = Math.atan2(clientY - cy, clientX - cx);
    let degrees = ((angle * 180) / Math.PI + 90 + 360) % 360;
    const year = Math.round(minYear + (degrees / 360) * totalYears);
    setSelectedYear(Math.max(minYear, Math.min(maxYear, year)));
  };

  const isPast = selectedYear < currentYear;
  const pastMatch = PAST_DATA.find(d => d.year === selectedYear);
  const futureMatch = FUTURE_FRAMES.find(d => d.year === selectedYear);

  // Generate tick marks
  const ticks = [];
  for (let y = minYear; y <= maxYear; y += 5) {
    const angle = ((y - minYear) / totalYears) * 360 - 90;
    const rad = (angle * Math.PI) / 180;
    const isMajor = y % 10 === 0;
    ticks.push({ year: y, angle, rad, isMajor });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-navy text-white pt-24 pb-32 px-4"
    >
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            <Clock className="inline w-10 h-10 text-gold mr-3 -mt-1" />
            Money Time Machine
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto">Spin the dial to any year. See what you should have invested — or what today's decisions look like from the future.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Dial */}
          <div className="flex justify-center">
            <div className="relative w-80 h-80 md:w-96 md:h-96">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-2 border-white/10" />

              {/* Tick marks */}
              <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full">
                {ticks.map(t => {
                  const innerR = t.isMajor ? 170 : 178;
                  const outerR = 195;
                  const x1 = 200 + innerR * Math.cos(t.rad);
                  const y1 = 200 + innerR * Math.sin(t.rad);
                  const x2 = 200 + outerR * Math.cos(t.rad);
                  const y2 = 200 + outerR * Math.sin(t.rad);
                  const lx = 200 + 155 * Math.cos(t.rad);
                  const ly = 200 + 155 * Math.sin(t.rad);
                  return (
                    <g key={t.year}>
                      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={t.isMajor ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)'} strokeWidth={t.isMajor ? 2 : 1} />
                      {t.isMajor && (
                        <text x={lx} y={ly + 4} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11" fontWeight="600">
                          {t.year}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Draggable dial area */}
              <div
                ref={dialRef}
                className="absolute inset-8 rounded-full bg-gradient-to-br from-card to-navy border border-white/5 cursor-grab active:cursor-grabbing flex items-center justify-center"
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
                onMouseMove={handleDialMove}
                onTouchStart={() => setIsDragging(true)}
                onTouchEnd={() => setIsDragging(false)}
                onTouchMove={handleDialMove}
              >
                {/* Rotating pointer */}
                <div className="absolute inset-0" style={{ transform: `rotate(${rotation}deg)` }}>
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-12 rounded-full bg-gold shadow-[0_0_10px_rgba(245,166,35,0.8)]" />
                </div>

                {/* Center display */}
                <div className="text-center z-10 pointer-events-none">
                  <div className="text-5xl md:text-6xl font-black text-gold drop-shadow-lg">{selectedYear}</div>
                  <div className="text-xs text-gray-400 mt-1 uppercase tracking-widest">
                    {isPast ? 'Looking Back' : selectedYear === currentYear ? 'Present' : 'Looking Forward'}
                  </div>
                </div>
              </div>

              {/* Glow */}
              <div className={`absolute inset-0 rounded-full blur-3xl opacity-10 pointer-events-none ${isPast ? 'bg-blue-500' : 'bg-gold'}`} />
            </div>
          </div>

          {/* Result */}
          <div className="min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedYear}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                {pastMatch ? (
                  <div className="bg-card p-8 rounded-3xl border border-blue-500/20">
                    <div className="text-xs uppercase tracking-widest text-blue-400 mb-4 flex items-center gap-2">
                      <Calendar size={14} /> What You Missed in {pastMatch.year}
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{pastMatch.asset}</h3>
                    <p className="text-gray-400 mb-6">If you had invested <span className="text-blue-400 font-bold">₹{(pastMatch.invested / 100000).toFixed(0)}L</span> in {pastMatch.year}...</p>
                    <div className="bg-blue-500/10 rounded-2xl p-6 text-center border border-blue-500/20">
                      <div className="text-sm text-gray-400 mb-2">It would be worth today</div>
                      <div className="text-4xl font-black text-blue-400">{pastMatch.label.split('→')[1]}</div>
                      <div className="text-xs text-gray-500 mt-2">{Math.round(pastMatch.current / pastMatch.invested)}x returns</div>
                    </div>
                    <p className="text-xs text-gray-600 mt-4 text-center italic">But you can't go back. You can only start today.</p>
                  </div>
                ) : futureMatch ? (
                  <div className="bg-card p-8 rounded-3xl border border-gold/20">
                    <div className="text-xs uppercase tracking-widest text-gold mb-4 flex items-center gap-2">
                      <Sparkles size={14} /> Looking Ahead to {futureMatch.year}
                    </div>
                    <div className="text-4xl mb-4">{futureMatch.emoji}</div>
                    <h3 className="text-2xl font-bold mb-3">{futureMatch.decision}</h3>
                    <p className="text-gray-400 leading-relaxed">{futureMatch.outcome}</p>
                    <div className="mt-6 p-4 bg-gold/10 rounded-xl border border-gold/20 text-center">
                      <div className="text-xs text-gold">This is your future if you act now.</div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-card p-8 rounded-3xl border border-white/5 text-center">
                    <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-400 mb-2">Spin the Dial</h3>
                    <p className="text-gray-600 text-sm">
                      Drag the dial to a marked year to see<br />
                      {isPast ? 'what you missed' : 'what your future holds'}.
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
