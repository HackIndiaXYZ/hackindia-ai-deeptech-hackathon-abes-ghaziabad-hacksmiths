import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import gsap from 'gsap';
import Confetti from 'react-confetti';
import html2canvas from 'html2canvas';
import { Trophy, ShieldAlert, Sparkles, Target, Activity, Share2, Check, HelpCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { countUpNumber, drawSVGPath } from '../animations/gsapHelpers';
import Logo from '../components/Logo';

export default function MoneyHealthResults() {
  const { state } = useApp();
  const rawScore = state.healthScore || {
    score: 64, verdict: "You have a solid foundation but significant gaps in tax optimization.", percentile: 68,
    strength: "Strong savings habit", weakness: "Under-utilized 80C limit", personality: "Balanced Builder",
    actions: [
      { title: "Open a PPF Account", desc: "Start contributing to PPF to max out 80C and get risk-free tax-free returns.", time: "15 mins", impact: 46000 },
      { title: "Review Term Insurance", desc: "You only have employer cover. Buy a pure term life insurance plan.", time: "30 mins", impact: 10000000 },
      { title: "Automate SIPs", desc: "Set up auto-debit for your mutual fund SIPs on the 5th of every month.", time: "10 mins", impact: 60000 },
      { title: "Build Emergency Fund", desc: "Move your 2 lakh savings into a separate sweep-in FD for liquidity.", time: "20 mins", impact: 10000 },
      { title: "Claim HRA", desc: "Submit your rent receipts to your employer immediately.", time: "5 mins", impact: 25000 }
    ]
  };

  const [doorsOpen, setDoorsOpen] = useState(false);
  useEffect(() => {
    setTimeout(() => setDoorsOpen(true), 500);
  }, []);

  if (!doorsOpen) {
    return (
      <div className="fixed inset-0 z-50 flex">
        <motion.div initial={{ x: 0 }} animate={{ x: '-100%' }} transition={{ duration: 1, ease: 'easeInOut' }} className="w-1/2 h-full bg-[#060810] border-r border-gold/20" />
        <motion.div initial={{ x: 0 }} animate={{ x: '100%' }} transition={{ duration: 1, ease: 'easeInOut' }} className="w-1/2 h-full bg-[#060810] border-l border-gold/20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy text-white pb-32 pt-24 px-4 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-24">
        
        {/* Top Hero Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <ScoreHero data={rawScore} />
          <PersonalityBadge type={rawScore.personality} strength={rawScore.strength} />
        </div>

        {/* Financial Dimensions — Creative Cards */}
        <FinancialDimensions />

        {/* Comparison Section */}
        <CompareSection percentile={rawScore.percentile} />

        {/* Action Plan */}
        <ActionPlan actions={rawScore.actions} />

        {/* Share */}
        <ShareSection data={rawScore} />
        
      </div>
    </div>
  );
}

/* ============================================================
   FIX 1: ScoreHero — Fixed double-text bug (React StrictMode)
   The typewriter now uses React state instead of direct DOM mutation
   ============================================================ */
function ScoreHero({ data }) {
  const [val, setVal] = useState(0);
  const [verdictText, setVerdictText] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    let obj = { v: 0 };
    const tween = gsap.to(obj, {
      v: data.score,
      duration: 3,
      ease: "power2.out",
      onUpdate: () => setVal(Math.round(obj.v)),
      onComplete: () => {
        if (data.score > 70) {
          gsap.to(containerRef.current, { y: -15, yoyo: true, repeat: 1, duration: 0.2, ease: "sine.inOut" });
        } else if (data.score < 40) {
          gsap.to(containerRef.current, { x: 10, yoyo: true, repeat: 3, duration: 0.1, ease: "sine.inOut" });
        }
      }
    });

    // Fixed typewriter — uses state, not innerHTML
    const text = data.verdict;
    let i = 0;
    let mounted = true;
    const typeTimer = setInterval(() => {
      if (!mounted) return;
      if (i <= text.length) {
        setVerdictText(text.slice(0, i));
        i++;
      } else {
        clearInterval(typeTimer);
      }
    }, 30);

    return () => {
      mounted = false;
      clearInterval(typeTimer);
      tween.kill();
    };
  }, [data]);

  const color = val < 40 ? '#ef4444' : val < 70 ? '#F5A623' : '#22c55e';

  return (
    <div className="flex flex-col items-center">
      <div className="text-sm font-bold tracking-widest text-gold mb-8 uppercase">Your Money Health Score</div>
      <div className="w-64 h-64 relative" ref={containerRef}>
        <CircularProgressbar 
          value={val} 
          text={`${val}`}
          styles={buildStyles({
            pathColor: color,
            textColor: '#fff',
            trailColor: 'rgba(255,255,255,0.05)',
            pathTransition: 'none',
          })}
        />
        {Array.from({length: 12}).map((_, i) => (
          <div key={i} className="absolute inset-0" style={{ transform: `rotate(${i * 30}deg)` }}>
            <div className="w-1 h-1 bg-white/20 rounded-full mx-auto mt-[-10px]" />
          </div>
        ))}
        <div className="absolute inset-4 -z-10 blur-3xl opacity-30 rounded-full" style={{ background: color }} />
      </div>
      <p className="mt-8 text-center text-lg text-gray-300 min-h-[60px] max-w-sm">
        {verdictText}
        {verdictText.length < data.verdict.length && <span className="inline-block w-0.5 h-4 ml-1 bg-gold animate-pulse align-middle" />}
      </p>
    </div>
  );
}

/* ============================================================
   FIX 2: PersonalityBadge — Fixed 3D flip using inline styles
   Tailwind perspective/transform-style classes don't exist in v3,
   so we use inline styles for the 3D perspective container.
   ============================================================ */
function PersonalityBadge({ type, strength }) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setFlipped(true), 3500);
    return () => clearTimeout(t);
  }, []);

  const getStyle = () => {
    switch(type) {
      case 'Fearful Saver': return { bg: 'bg-slate-700', icon: ShieldAlert, color: 'text-slate-300' };
      case 'Overconfident Investor': return { bg: 'bg-red-900', icon: Activity, color: 'text-red-400' };
      case 'Impulsive Spender': return { bg: 'bg-orange-800', icon: Target, color: 'text-orange-400' };
      case 'Paralyzed Procrastinator': return { bg: 'bg-blue-900', icon: HelpCircle, color: 'text-blue-400' };
      default: return { bg: 'bg-green-900', icon: Trophy, color: 'text-green-400' };
    }
  };
  const s = getStyle();
  const Icon = s.icon;

  return (
    <div className="flex justify-center" style={{ perspective: '1000px' }}>
      <motion.div 
        initial={false}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-80 h-96 cursor-pointer"
        onClick={() => setFlipped(!flipped)}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-gold/20 to-navy border border-gold/30 rounded-3xl flex flex-col items-center justify-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="text-6xl text-gold/50 font-black animate-pulse">?</div>
          <div className="absolute bottom-6 text-gold/60 text-sm tracking-widest uppercase">Revealing Personality</div>
        </div>
        {/* Back */}
        <div 
          className={`absolute inset-0 ${s.bg} border border-white/10 rounded-3xl flex flex-col items-center justify-center p-8 shadow-2xl overflow-hidden`}
          style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
        >
          <Icon className={`w-24 h-24 ${s.color} mb-6`} />
          <h3 className="text-2xl font-black text-white text-center mb-2">{type}</h3>
          <div className="px-4 py-1 bg-black/30 rounded-full text-xs text-white/70 mb-8 border border-white/5">Your Financial Profile</div>
          
          <div className="w-full bg-black/40 rounded-xl p-4 border border-white/5">
            <div className="text-[10px] uppercase text-gray-500 font-bold mb-1">Top Strength</div>
            <div className="text-sm font-medium text-green-400">{strength}</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ============================================================
   PREMIUM: FinancialDimensions — Radial Arc Chart + Detail Cards
   A stunning concentric ring chart paired with interactive cards.
   ============================================================ */
function FinancialDimensions() {
  const [active, setActive] = useState(null);

  const dims = [
    { name: 'Emergency Fund', score: 90, emoji: '🛡️', advice: 'Excellent liquidity — you can handle 6+ months of expenses.', color: '#22c55e' },
    { name: 'Debt Health', score: 85, emoji: '⚖️', advice: 'Minimal bad debt. Your EMI-to-income ratio is healthy.', color: '#3b82f6' },
    { name: 'Investments', score: 75, emoji: '📈', advice: 'Good equity mix but diversify into international funds.', color: '#F5A623' },
    { name: 'Retirement', score: 65, emoji: '🏖️', advice: 'Increase your SIP by ₹5,000/mo to retire 3 years earlier.', color: '#a855f7' },
    { name: 'Tax Efficiency', score: 40, emoji: '🧾', advice: 'You\'re leaving ₹46,800 on the table under Section 80C.', color: '#f97316' },
    { name: 'Insurance', score: 30, emoji: '🏥', advice: 'Critically underinsured. Get a ₹1Cr term plan immediately.', color: '#ef4444' },
  ];

  const getLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Work';
    return 'Critical';
  };

  // Radial chart params
  const cx = 160, cy = 160;
  const baseRadius = 40;
  const ringGap = 18;

  return (
    <div>
      <motion.h3
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-center mb-2"
      >
        Your Financial X-Ray
      </motion.h3>
      <p className="text-center text-gray-500 mb-12 text-sm">Hover over any ring or card to explore your scores.</p>

      <div className="grid lg:grid-cols-2 gap-10 items-center">

        {/* LEFT: Radial Arc Chart */}
        <div className="flex justify-center">
          <svg viewBox="0 0 320 320" className="w-full max-w-[380px]">
            {/* Subtle background circles */}
            {dims.map((_, i) => {
              const r = baseRadius + i * ringGap;
              return <circle key={`bg-${i}`} cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="10" />;
            })}

            {/* Animated arcs */}
            {dims.map((d, i) => {
              const r = baseRadius + i * ringGap;
              const circumference = 2 * Math.PI * r;
              const offset = circumference - (d.score / 100) * circumference;
              const isActive = active === i;
              const isOther = active !== null && active !== i;

              return (
                <motion.circle
                  key={d.name}
                  cx={cx} cy={cy} r={r}
                  fill="none"
                  stroke={d.color}
                  strokeWidth={isActive ? 14 : 10}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{
                    strokeDashoffset: offset,
                    opacity: isOther ? 0.2 : 1,
                  }}
                  transition={{ strokeDashoffset: { duration: 1.8, delay: i * 0.2, ease: "easeOut" }, opacity: { duration: 0.3 } }}
                  style={{
                    transform: 'rotate(-90deg)',
                    transformOrigin: `${cx}px ${cy}px`,
                    filter: isActive ? `drop-shadow(0 0 12px ${d.color})` : `drop-shadow(0 0 4px ${d.color}60)`,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                />
              );
            })}

            {/* Center content */}
            <text x={cx} y={cy - 8} textAnchor="middle" fill="white" fontSize="13" fontWeight="800">
              {active !== null ? dims[active].score : 'SCORE'}
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9" fontWeight="500">
              {active !== null ? dims[active].name : 'Hover a ring'}
            </text>

            {/* Score labels at end of each arc */}
            {dims.map((d, i) => {
              const r = baseRadius + i * ringGap;
              const angle = (d.score / 100) * 360 - 90;
              const rad = (angle * Math.PI) / 180;
              const lx = cx + r * Math.cos(rad);
              const ly = cy + r * Math.sin(rad);
              return (
                <motion.g key={`label-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 + i * 0.15 }}>
                  <circle cx={lx} cy={ly} r="8" fill={d.color} />
                  <text x={lx} y={ly + 3.5} textAnchor="middle" fill="white" fontSize="7" fontWeight="800">
                    {d.score}
                  </text>
                </motion.g>
              );
            })}
          </svg>
        </div>

        {/* RIGHT: Detail Cards */}
        <div className="space-y-3">
          {dims.map((d, i) => {
            const isActive = active === i;
            return (
              <motion.div
                key={d.name}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08, type: "spring" }}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                className={`flex items-center gap-4 p-4 rounded-2xl border cursor-default transition-all duration-300 ${
                  isActive
                    ? 'bg-card border-white/20 shadow-lg scale-[1.02]'
                    : active !== null
                    ? 'bg-card/30 border-white/5 opacity-40'
                    : 'bg-card/50 border-white/5 hover:border-white/20'
                }`}
              >
                {/* Color dot */}
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: d.color, boxShadow: isActive ? `0 0 12px ${d.color}` : 'none' }}
                />
                {/* Emoji */}
                <span className="text-xl shrink-0">{d.emoji}</span>
                {/* Name + advice */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-white truncate">{d.name}</h4>
                    <span className="text-[10px] text-gray-500 font-medium">{getLabel(d.score)}</span>
                  </div>
                  {isActive && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-xs text-gray-400 mt-1 leading-relaxed"
                    >
                      {d.advice}
                    </motion.p>
                  )}
                </div>
                {/* Score bar */}
                <div className="w-20 shrink-0">
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${d.score}%` }}
                      transition={{ duration: 1.2, delay: 0.5 + i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ background: d.color }}
                    />
                  </div>
                  <div className="text-right mt-1 text-xs font-black" style={{ color: d.color }}>{d.score}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CompareSection({ percentile }) {
  const pathRef = useRef(null);
  const [perc, setPerc] = useState(0);

  useEffect(() => {
    drawSVGPath(pathRef, 2);
    let obj = { p: 0 };
    gsap.to(obj, { p: percentile, duration: 2, ease: "power2.out", onUpdate: () => setPerc(Math.round(obj.p)) });
  }, [percentile]);

  return (
    <div className="py-12 border-y border-white/10 text-center">
      <h3 className="text-3xl font-bold mb-12">How You Compare</h3>
      <div className="relative w-full max-w-3xl mx-auto h-64 flex items-end justify-center mb-8">
        <svg viewBox="0 0 800 200" className="w-full h-full">
          <path ref={pathRef} d="M 0 200 C 200 200, 300 20, 400 20 C 500 20, 600 200, 800 200" fill="none" stroke="rgba(245,166,35,0.4)" strokeWidth="3" strokeDasharray="1000" strokeDashoffset="1000" />
          <path d="M 0 200 C 200 200, 300 20, 400 20 C 500 20, 600 200, 800 200 L 800 200 L 0 200 Z" fill="url(#bellGradient)" opacity="0.5" />
          <defs>
            <linearGradient id="bellGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(245,166,35,0.2)" />
              <stop offset="100%" stopColor="rgba(245,166,35,0)" />
            </linearGradient>
          </defs>
        </svg>
        <motion.div 
          initial={{ y: -300, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 2, type: "spring", stiffness: 200, damping: 15 }}
          className="absolute h-full w-px bg-gold flex flex-col items-center justify-start top-0"
          style={{ left: `${percentile}%` }}
        >
          <div className="bg-gold text-navy text-xs font-bold px-3 py-1 rounded-full -mt-4 shadow-[0_0_15px_rgba(245,166,35,0.8)] whitespace-nowrap">You Are Here</div>
          <div className="w-3 h-3 bg-gold rounded-full shrink-0 -mt-1 shadow-[0_0_10px_rgba(245,166,35,1)]" />
        </motion.div>
      </div>
      <p className="text-2xl text-gray-300">
        You score better than <span className="text-gold font-bold text-4xl mx-2">{perc}%</span> of Indians your age.
      </p>
    </div>
  );
}

/* ============================================================
   FIX 4: ActionPlan — Replaced rotateX animation with simple
   opacity+y slide. rotateX requires a perspective parent and
   was rendering items as invisible 2D planes.
   ============================================================ */
function ActionPlan({ actions }) {
  const [checked, setChecked] = useState([]);
  const hasFinished = checked.length === actions.length && actions.length > 0;

  const toggle = (i) => {
    if (checked.includes(i)) setChecked(checked.filter(c => c !== i));
    else setChecked([...checked, i]);
  };

  return (
    <div>
      {hasFinished && <Confetti recycle={false} numberOfPieces={500} colors={['#F5A623', '#7C3AED', '#C026D3', '#FFFFFF']} />}
      <div className="flex items-center space-x-4 mb-10">
        <Sparkles className="text-gold w-8 h-8" />
        <h3 className="text-3xl font-bold">Your 30-Day Action Plan</h3>
      </div>
      <div className="space-y-4">
        {actions.map((act, i) => {
          const isDone = checked.includes(i);
          return (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.5, type: "spring" }}
              className={`p-6 rounded-2xl border flex items-center space-x-6 cursor-pointer transition-all duration-300 ${isDone ? 'bg-card/30 border-white/5 opacity-50' : 'bg-card border-gold/20 hover:border-gold hover:shadow-[0_0_20px_rgba(245,166,35,0.15)]'}`}
              onClick={() => toggle(i)}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 transition-all ${isDone ? 'bg-green-500 border-green-500 text-navy' : 'border-gray-500 text-transparent'}`}>
                <Check size={18} strokeWidth={4} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`text-lg font-bold ${isDone ? 'line-through' : ''}`}>{act.title}</h4>
                  <div className="text-gold font-bold flex items-center">
                    <span className="text-xs text-gray-400 font-normal mr-2">Impact:</span> ₹{act.impact.toLocaleString('en-IN')}
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-2">{act.desc}</p>
                <div className="text-xs bg-navy inline-block px-3 py-1 rounded border border-white/10 text-gray-300">⏱ {act.time}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ShareSection({ data }) {
  const cardRef = useRef(null);

  const captureAndShare = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { backgroundColor: '#0B0F1A' });
    const imgData = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'MyMoneyHealth.png';
    link.href = imgData;
    link.click();
    
    setTimeout(() => {
      const text = `I just checked my Financial AI Health Score! I scored ${data.score}/100 and learned I'm a "${data.personality}". Get your free assessment at AFTERMATH.in`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }, 500);
  };

  return (
    <div className="py-20 flex flex-col items-center">
      <div 
        ref={cardRef} 
        className="w-[400px] h-[400px] bg-gradient-to-br from-navy to-[#1a103c] rounded-[40px] border-[4px] border-gold p-8 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/20 blur-3xl rounded-full" />
        <Logo className="mb-6" iconSize={48} textClass="text-2xl" showSub={true} />
        <div className="text-sm text-gray-400 mb-6 uppercase tracking-widest">My Financial Score</div>
        <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-gold to-yellow-600 drop-shadow-lg mb-4">
          {data.score}
        </div>
        <div className="px-6 py-2 bg-black/40 rounded-full border border-white/10 text-gold font-medium mb-4">
          {data.personality}
        </div>
        <p className="text-xs text-gray-400">Can you beat my score?</p>
      </div>

      <button 
        onClick={captureAndShare}
        className="mt-12 group flex items-center space-x-3 bg-[#25D366] hover:bg-[#1ebd5a] text-white font-bold px-10 py-4 rounded-full shadow-[0_0_20px_rgba(37,211,102,0.4)] transition-all"
      >
        <Share2 size={20} className="group-hover:scale-110 transition-transform" />
        <span>Share to WhatsApp</span>
      </button>
    </div>
  );
}
