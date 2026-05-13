import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { askGeminiJSON } from '../services/geminiService';
import { useApp } from '../context/AppContext';
import Logo from './Logo';

// ─────────────────────────────────────────────────────────────────
// LOCAL FALLBACK: compute a real personalised score from user data
// This runs when the Gemini API fails so results are NEVER generic.
// ─────────────────────────────────────────────────────────────────
function computeLocalHealthScore(userData) {
  const income     = Number(userData.monthlyIncome   || 0);
  const expenses   = Number(userData.monthlyExpenses || 0);
  const savings    = Number(userData.savings         || 0);
  const invest     = Number(userData.investments     || 0);
  const debt       = Number(userData.debtAmount      || 0);
  const age        = Number(userData.age             || 30);
  const goal       = userData.primaryGoal            || 'financial freedom';
  const city       = userData.city                   || 'your city';

  const surplus      = income - expenses;
  const savingsRate  = income > 0 ? surplus / income : 0;
  const emergencyMos = expenses > 0 ? savings / expenses : 0;
  const dtiMonths    = income > 0 ? debt / income : 0; // debt-to-income in months
  const investRatio  = income > 0 ? invest / income : 0;

  // Score calculation (0-100)
  let score = 40; // base

  // Savings rate component (max +20)
  if      (savingsRate >= 0.50) score += 20;
  else if (savingsRate >= 0.35) score += 15;
  else if (savingsRate >= 0.20) score += 10;
  else if (savingsRate >= 0.10) score += 5;
  else                          score -= 10;

  // Emergency fund component (max +15)
  if      (emergencyMos >= 6)  score += 15;
  else if (emergencyMos >= 3)  score += 8;
  else if (emergencyMos >= 1)  score += 3;
  else                         score -= 5;

  // Debt component (max +15 / min -20)
  if      (debt === 0)          score += 15;
  else if (dtiMonths <= 3)      score += 10;
  else if (dtiMonths <= 6)      score += 5;
  else if (dtiMonths <= 12)     score -= 5;
  else                          score -= 20;

  // Investment component (max +10)
  if      (investRatio >= 6)   score += 10;
  else if (investRatio >= 3)   score += 5;
  else if (investRatio >= 1)   score += 2;

  score = Math.round(Math.max(10, Math.min(95, score)));

  // ── Determine verdicts / labels ──────────────────────────────
  const savingsPct = Math.round(savingsRate * 100);
  const emergencyLabel =
    emergencyMos >= 6  ? 'excellent (6+ months)' :
    emergencyMos >= 3  ? 'adequate (3–6 months)' :
    emergencyMos >= 1  ? 'low (under 3 months)'  : 'critical (under 1 month)';

  const verdict =
    score >= 75
      ? `Great job! Your ${savingsPct}% savings rate puts you ahead of most Indians in ${city}. Optimize taxes and accelerate investments to reach "${goal}" faster.`
      : score >= 55
      ? `You have a solid base with a ${savingsPct}% savings rate, but ${debt > 0 ? 'debt obligations' : 'low investments'} are slowing your path to "${goal}".`
      : score >= 35
      ? `Your finances need attention — ${savingsPct < 10 ? 'low savings rate' : 'high debt'} is a barrier. Focus on cutting expenses and ${debt > 0 ? 'clearing debt' : 'building savings'} first.`
      : `Urgent action required. Your current spending pattern makes "${goal}" very difficult without significant changes.`;

  const strength =
    savingsRate >= 0.30  ? `Strong savings rate of ${savingsPct}% — well above the national average` :
    emergencyMos >= 6    ? `Solid emergency fund covering ${emergencyMos.toFixed(1)} months of expenses` :
    invest > income * 6  ? `Good investment base of ₹${(invest/100000).toFixed(1)}L` :
    debt === 0           ? `Debt-free lifestyle giving you maximum financial freedom` :
                          `Monthly surplus of ₹${surplus.toLocaleString('en-IN')} to work with`;

  const weakness =
    emergencyMos < 3     ? `Emergency fund covers only ${emergencyMos.toFixed(1)} months — target is 6 months` :
    dtiMonths > 12       ? `High debt of ₹${(debt/100000).toFixed(1)}L is ${dtiMonths.toFixed(0)} months of income` :
    savingsRate < 0.20   ? `Low savings rate of ${savingsPct}% — try to reach 30%` :
                          `Under-optimized 80C/80D tax deductions — leaving money on the table`;

  const personality =
    score >= 75 ? 'Balanced Builder' :
    score >= 60 ? 'Cautious Saver' :
    score >= 45 ? 'Impulsive Spender' :
                  'Fearful Saver';

  const tip =
    debt > income * 6   ? `Allocate an extra ₹${Math.round(surplus * 0.3).toLocaleString('en-IN')}/mo to debt repayment before investing to save big on interest.` :
    emergencyMos < 3    ? `Build your emergency fund to ₹${(expenses * 6).toLocaleString('en-IN')} in a sweep-in FD — this is your first priority before anything else.` :
    savingsRate >= 0.30 ? `Shift ₹${Math.round(income * 0.10).toLocaleString('en-IN')}/mo from savings to equity SIPs to beat inflation and grow towards "${goal}".` :
                         `Cut your top 3 discretionary expenses by 20% to free up ₹${Math.round(expenses * 0.1).toLocaleString('en-IN')}/mo for investments.`;

  // ── Actions based on actual gaps ─────────────────────────────
  const actions = [];

  if (emergencyMos < 6) {
    const needed = Math.round(expenses * 6 - savings);
    actions.push({
      title: 'Build Emergency Fund',
      desc: `You need ₹${needed.toLocaleString('en-IN')} more to reach 6 months of expenses. Open a sweep-in FD for instant liquidity.`,
      time: '20 mins',
      impact: needed,
    });
  }

  if (debt > income * 3) {
    actions.push({
      title: 'Accelerate Debt Repayment',
      desc: `Paying ₹${Math.round(surplus * 0.3).toLocaleString('en-IN')}/mo extra on your debt of ₹${(debt/100000).toFixed(1)}L will save significant interest.`,
      time: '15 mins',
      impact: Math.round(debt * 0.15),
    });
  }

  actions.push({
    title: 'Max Out Section 80C',
    desc: `Invest ₹1.5L/yr in ELSS to save ₹46,800 in taxes annually. At your income this is a guaranteed high-return move.`,
    time: '10 mins',
    impact: 46800,
  });

  const sipAmount = Math.max(2000, Math.round(surplus * 0.35));
  actions.push({
    title: `Start ₹${sipAmount.toLocaleString('en-IN')}/mo Equity SIP`,
    desc: `A ₹${sipAmount.toLocaleString('en-IN')}/mo SIP at 12% annual return grows to ₹${Math.round(sipAmount * 12 * 20 * 3).toLocaleString('en-IN')} in 20 years — key for "${goal}".`,
    time: '10 mins',
    impact: Math.round(sipAmount * 12 * 20 * 3),
  });

  actions.push({
    title: 'Buy ₹1Cr Term Life Insurance',
    desc: `A pure term plan at age ${age} costs just ~₹${age < 35 ? '700' : '1,200'}/mo. This protects your family if anything happens.`,
    time: '30 mins',
    impact: 10000000,
  });

  if (actions.length < 5) {
    actions.push({
      title: 'Open an NPS Account',
      desc: 'Get an additional ₹50,000 deduction under Section 80CCD(1B) on top of your 80C limit.',
      time: '20 mins',
      impact: 15600,
    });
  }

  const percentile = Math.round(Math.min(90, Math.max(15, score - 8 + (age < 30 ? 5 : 0))));

  return {
    score,
    verdict,
    percentile,
    strength,
    weakness,
    personality,
    tip,
    match: Math.round(70 + score * 0.25),
    actions: actions.slice(0, 5),
  };
}

// ─────────────────────────────────────────────────────────────────
// DNA LOADER COMPONENT
// ─────────────────────────────────────────────────────────────────
export default function DNALoader() {
  const [textIndex, setTextIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [progress, setProgress] = useState(0);
  const [apiStatus, setApiStatus] = useState('pending'); // 'pending' | 'success' | 'fallback'
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const loaderRef = useRef(null);

  const lines = [
    'Analyzing your financial DNA...',
    'Comparing with 50,000 Indian profiles...',
    'Identifying your blind spots...',
    'Building your personalized plan...',
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
      if (currentIndex < lines.length) setTextIndex(currentIndex);
    }, 1500);
    return () => clearInterval(interval);
  }, [lines.length]);

  // Typewriter effect
  useEffect(() => {
    setTypedText('');
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

      const exitAnimation = () => {
        gsap.to(loaderRef.current, {
          scale: 1.5,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.in',
          onComplete: () => navigate('/results/health'),
        });
      };

      try {
        const prompt = `You are an expert Indian financial advisor AI. Analyze this user's financial data and generate a personalized health score.

User Data: ${JSON.stringify(state.userData)}

Return ONLY valid JSON (no markdown fences, no extra text) in exactly this format:
{
  "score": <integer 10-95 based on actual financial health>,
  "verdict": "<1-2 sentence personalized assessment mentioning their actual numbers>",
  "percentile": <integer 15-90>,
  "strength": "<their biggest actual financial strength based on the numbers>",
  "weakness": "<their biggest actual financial weakness based on the numbers>",
  "personality": "<one of: Balanced Builder, Cautious Saver, Impulsive Spender, Fearful Saver, Overconfident Investor>",
  "tip": "<one specific actionable tip tailored to their data>",
  "match": <integer 70-95>,
  "actions": [
    { "title": "<action>", "desc": "<personalized desc with their actual numbers>", "time": "<X mins>", "impact": <number in INR> },
    { "title": "<action>", "desc": "<personalized desc>", "time": "<X mins>", "impact": <number> },
    { "title": "<action>", "desc": "<personalized desc>", "time": "<X mins>", "impact": <number> },
    { "title": "<action>", "desc": "<personalized desc>", "time": "<X mins>", "impact": <number> },
    { "title": "<action>", "desc": "<personalized desc>", "time": "<X mins>", "impact": <number> }
  ]
}`;

        const result = await askGeminiJSON(prompt);

        // Validate the result has required fields
        if (!result || typeof result.score !== 'number' || !result.actions) {
          throw new Error('Invalid response structure from AI');
        }

        setApiStatus('success');
        dispatch({ type: 'SET_HEALTH_SCORE', payload: result });
      } catch (err) {
        console.warn('Gemini API failed, computing local personalized score:', err.message);
        setApiStatus('fallback');
        // Use LOCAL computation — NOT hardcoded values
        const localScore = computeLocalHealthScore(state.userData);
        dispatch({ type: 'SET_HEALTH_SCORE', payload: localScore });
      }

      const elapsed = Date.now() - startTime;
      const waitTime = Math.max(0, 6000 - elapsed);
      setTimeout(exitAnimation, waitTime);
    };

    fetchData();
  }, [dispatch, navigate, state.userData]);

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-[9999] bg-[#060810] flex flex-col items-center justify-center transform origin-center overflow-hidden"
    >
      {/* Floating background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gold/30 rounded-full"
            style={{ left: `${5 + Math.random() * 90}%`, top: `${5 + Math.random() * 90}%` }}
            animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 3 }}
          />
        ))}
      </div>

      {/* Spinning rings + Logo */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-56 h-56 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-t-[3px] border-transparent border-t-gold shadow-[0_0_20px_rgba(245,166,35,0.3)]"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
            className="absolute inset-4 rounded-full border-b-[2px] border-transparent border-b-purple/40"
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-36 h-36 rounded-full bg-gold/15 blur-2xl"
          />
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
                className={`rounded-full transition-all duration-500 ${
                  i <= textIndex ? 'bg-gold w-3 h-3' : 'bg-gold/20 w-2 h-2'
                }`}
                animate={i === textIndex ? { scale: [1, 1.4, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              />
            ))}
          </div>

          {/* API status hint (subtle) */}
          {apiStatus === 'fallback' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              className="text-xs text-gold/50 mt-2"
            >
              Computing your personalized score...
            </motion.div>
          )}
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
