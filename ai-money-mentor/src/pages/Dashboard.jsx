import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Brain, LayoutDashboard, Activity, TrendingUp, Calculator, Heart, Fingerprint, Settings, ArrowUpRight, CheckCircle2, Circle, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { pageEnter, staggerContainer, fadeUp } from '../animations/variants';
import { countUpNumber } from '../animations/gsapHelpers';
import { askGeminiJSON } from '../services/geminiService';
import Logo from '../components/Logo';
import { loadFullDemoState } from '../data/demoData';
import toast from 'react-hot-toast';
import gsap from 'gsap';

export default function Dashboard() {
  const { state, dispatch } = useApp();
  const userData = state.userData || { name: 'Rahul', monthlyIncome: 85000, monthlyExpenses: 55000, investments: 50000, debtAmount: 300000 };
  const healthData = state.healthScore || { score: 72, actions: [{title: "Open PPF", desc: "Start 80C tax saving"}, {title: "Buy Term Plan", desc: "Protect your family"}, {title: "Increase SIP", desc: "Beat inflation"}] };
  
  const surplus = Number(userData.monthlyIncome) - Number(userData.monthlyExpenses);
  const fireYear = new Date().getFullYear() + 15; // mock
  const [insights, setInsights] = useState(null);
  
  useEffect(() => {
    // Generate AI insights
    const fetchInsights = async () => {
      try {
        const result = await askGeminiJSON(`Generate 3 short personalized financial insights based on this data: ${JSON.stringify(userData)}. Output strictly JSON: { "insights": [ { "category": "Tax"|"Debt"|"Invest", "text": "...", "impact": 15000 } ] }`);
        setInsights(result.insights);
      } catch(e) {
        setInsights([
          { category: "Tax", text: "You can save an additional ₹46,800 by maxing out ELSS under 80C.", impact: 46800 },
          { category: "Debt", text: "Prepaying ₹10k/mo on your loan will reduce tenure by 4 years.", impact: 120000 },
          { category: "Invest", text: "Your emergency fund is sitting idle in a savings account. Move it to a liquid fund.", impact: 8500 }
        ]);
      }
    };
    fetchInsights();
  }, [userData]);

  return (
    <div className="min-h-screen bg-navy overflow-hidden">
      
      <main className="h-screen overflow-y-auto pt-24 pb-24 px-6 md:px-10">
        <motion.div variants={pageEnter} initial="initial" animate="animate" exit="exit" className="max-w-6xl mx-auto space-y-8">
          
          {/* Hero */}
          <div className="mb-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black mb-2 flex items-center">
                  Welcome back, {userData.name || 'Investor'} <span className="ml-3 wave-emoji">👋</span>
                </h1>
                <p className="text-gray-400 font-medium">
                  {format(new Date(), 'EEEE, MMMM do, yyyy')} • "The best time to plant a tree was 20 years ago."
                </p>
              </div>
              <button
                onClick={() => { loadFullDemoState(dispatch); toast.success('Demo data loaded for all features!'); }}
                className="shrink-0 px-5 py-2.5 bg-gradient-to-r from-gold/20 to-purple-500/20 border border-gold/30 rounded-xl text-sm font-bold text-gold hover:from-gold/30 hover:to-purple-500/30 transition-all flex items-center gap-2"
              >
                <Sparkles size={16} /> Load Demo Data
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Main Score Overview */}
            <div className="lg:col-span-1 bg-card border border-white/5 rounded-3xl p-8 relative overflow-hidden group hover:border-gold/30 transition-colors shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 blur-3xl rounded-full" />
              <div className="flex justify-between items-start mb-6 z-10 relative">
                <h3 className="font-bold text-lg">Money Health</h3>
                <div className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded flex items-center font-bold">
                  <ArrowUpRight size={14} className="mr-1" /> +4 pts
                </div>
              </div>
              <div className="w-40 h-40 mx-auto relative z-10 mb-6">
                <CircularProgressbar 
                  value={healthData.score} text={`${healthData.score}`}
                  styles={buildStyles({ pathColor: '#F5A623', textColor: '#fff', trailColor: 'rgba(255,255,255,0.05)' })}
                />
              </div>
              <p className="text-center text-sm text-gray-400">Score improved since your last SIP increase.</p>
            </div>

            {/* Mini Life Simulator */}
            <div className="lg:col-span-2 bg-gradient-to-br from-[#0a101d] to-[#120f26] border border-white/5 rounded-3xl p-8 relative shadow-2xl flex flex-col justify-between">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-lg mb-1">Wealth Trajectory</h3>
                  <p className="text-xs text-gray-400">Projected growth to retirement</p>
                </div>
                <div className="bg-gold/20 border border-gold text-gold px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest flex items-center">
                  FIRE: {fireYear}
                </div>
              </div>
              <div className="h-40 w-full">
                <MiniChart />
              </div>
            </div>

          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Monthly Surplus" value={surplus} prefix="₹" icon={<Activity className="text-green-400 w-8 h-8"/>} delay={0.1} />
            <StatCard title="Total Investments" value={userData.investments} prefix="₹" icon={<TrendingUp className="text-blue-400 w-8 h-8"/>} delay={0.2} />
            <StatCard title="Debt Remaining" value={userData.debtAmount || 0} prefix="₹" icon={<AlertCircle className="text-red-400 w-8 h-8"/>} delay={0.3} />
            <StatCard title="Emergency Fund" value="4.2" suffix=" mo" icon={<ShieldCheck className="text-gold w-8 h-8"/>} delay={0.4} />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Next Actions */}
            <div className="bg-card border border-white/5 rounded-3xl p-8">
              <div className="flex items-center space-x-2 mb-6">
                <CheckCircle2 className="text-gold" />
                <h3 className="font-bold text-lg">Your 30-Day Plan</h3>
              </div>
              <ActionsList actions={healthData.actions.slice(0,3)} />
            </div>

            {/* AI Insights */}
            <div className="bg-card border border-white/5 rounded-3xl p-8">
              <div className="flex items-center space-x-2 mb-6">
                <Sparkles className="text-purple-400" />
                <h3 className="font-bold text-lg">AI Insights</h3>
              </div>
              <div className="space-y-4">
                {!insights ? (
                  [1,2,3].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl shimmer-border animate-pulse" />)
                ) : (
                  insights.map((ins, i) => (
                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.15 }} key={i} className="p-4 bg-navy rounded-xl border border-white/5 flex items-start space-x-4">
                      <div className="text-xs font-bold px-2 py-1 rounded bg-black/50 text-gold uppercase tracking-widest shrink-0">{ins.category}</div>
                      <div>
                        <p className="text-sm text-gray-300 mb-2">{ins.text}</p>
                        <div className="text-xs font-bold text-green-400">+ ₹{ins.impact.toLocaleString('en-IN')} impact</div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Feature Grid */}
          <div>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Sparkles className="text-gold w-5 h-5" /> Explore Features
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { emoji: '🔥', name: 'Budget Roast', desc: 'Get roasted. Get fixed.', path: '/budget-roast', color: 'from-orange-500/10 to-transparent' },
                { emoji: '🕰️', name: 'Time Machine', desc: 'What if you invested then?', path: '/time-machine', color: 'from-blue-500/10 to-transparent' },
                { emoji: '🏆', name: '₹1Cr Challenge', desc: 'How fast can you get there?', path: '/crore-challenge', color: 'from-gold/10 to-transparent' },
                { emoji: '🔬', name: 'Portfolio X-Ray', desc: 'Scan your mutual funds.', path: '/portfolio-xray', color: 'from-cyan-500/10 to-transparent' },
                { emoji: '💼', name: 'Salary Coach', desc: 'Are you being underpaid?', path: '/salary-coach', color: 'from-green-500/10 to-transparent' },
                { emoji: '🏠', name: 'RE vs SIP', desc: 'The ultimate Indian battle.', path: '/real-estate-vs-sip', color: 'from-purple-500/10 to-transparent' },
                { emoji: '🧘', name: 'Market Guru', desc: '3 legends, 3 different answers.', path: '/market-guru', color: 'from-indigo-500/10 to-transparent' },
                { emoji: '😱', name: 'Fear Index', desc: "What's your money anxiety?", path: '/fear-index', color: 'from-pink-500/10 to-transparent' },
                { emoji: '💔', name: 'Regret Engine', desc: 'The real cost of excuses.', path: '/regret', color: 'from-red-500/10 to-transparent' },
                { emoji: '💑', name: 'Couples Mode', desc: 'Merge your financial futures.', path: '/couples', color: 'from-pink-500/10 to-transparent' },

                { emoji: '📖', name: 'Glossary', desc: '50+ terms explained simply.', path: '/glossary', color: 'from-cyan-500/10 to-transparent' },
              ].map((f, i) => (
                <Link key={f.path} to={f.path}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className={`bg-gradient-to-br ${f.color} bg-card border border-white/5 rounded-2xl p-5 hover:border-gold/30 hover:-translate-y-1 transition-all cursor-pointer group`}
                  >
                    <div className="text-2xl mb-2 group-hover:scale-110 transition-transform inline-block">{f.emoji}</div>
                    <div className="text-sm font-bold text-white mb-1">{f.name}</div>
                    <div className="text-xs text-gray-500">{f.desc}</div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom Banner */}
          <div className="bg-gradient-to-r from-gold to-yellow-600 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center shadow-[0_0_30px_rgba(245,166,35,0.3)]">
            <h2 className="text-navy font-black text-2xl mb-2 md:mb-0">Your FIRE date is {format(new Date(fireYear, 0, 1), 'MMMM yyyy')}</h2>
            <div className="bg-navy text-white px-6 py-2 rounded-full font-bold text-sm">
              You are {fireYear - new Date().getFullYear()} years away from freedom
            </div>
          </div>

        </motion.div>
      </main>
    </div>
  );
}




function StatCard({ title, value, prefix='', suffix='', icon, delay }) {
  const ref = useRef(null);
  useEffect(() => {
    if(typeof value === 'number') countUpNumber(ref, value, 2, prefix, suffix);
    else if(ref.current) ref.current.innerText = prefix + value + suffix;
  }, [value]);

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, type: "spring" }} className="bg-card p-6 rounded-3xl border border-white/5 relative overflow-hidden group hover:-translate-y-1 transition-transform">
      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity scale-150">{icon}</div>
      <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">{title}</div>
      <div className="text-2xl lg:text-3xl font-black text-white"><span ref={ref}>0</span></div>
    </motion.div>
  );
}

function MiniChart() {
  const data = Array.from({length: 20}).map((_,i) => ({ age: 30+i, value: 10 + i*i*0.5 + Math.random()*20 }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="miniColor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F5A623" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="value" stroke="#F5A623" strokeWidth={2} fillOpacity={1} fill="url(#miniColor)" isAnimationActive={true} animationDuration={2000} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function ActionsList({ actions }) {
  const [items, setItems] = useState(actions.map((a,i) => ({...a, id: i})));

  const complete = (id) => {
    setItems(items.filter(i => i.id !== id));
  };

  return (
    <div className="space-y-3 min-h-[200px]">
      <AnimatePresence>
        {items.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-gray-500 py-10">All done for today! 🎉</motion.div>
        )}
        {items.map(act => (
          <motion.div 
            key={act.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9, height: 0, marginBottom: 0 }}
            onClick={() => complete(act.id)}
            className="flex items-start space-x-4 p-4 bg-navy rounded-2xl border border-white/5 cursor-pointer hover:border-gold/30 transition-colors group"
          >
            <div className="mt-0.5 shrink-0 text-gray-600 group-hover:text-green-500 transition-colors">
              <Circle size={20} className="group-hover:hidden" />
              <CheckCircle2 size={20} className="hidden group-hover:block" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-200 mb-1 line-clamp-1">{act.title}</h4>
              <p className="text-xs text-gray-500 line-clamp-1">{act.desc}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
