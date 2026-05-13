import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useInView } from 'react-intersection-observer';
import gsap from 'gsap';
import { pageEnter } from '../animations/variants';
import { countUpNumber } from '../animations/gsapHelpers';
import { Users, Baby, Briefcase, TrendingUp, AlertOctagon, Sparkles as SparklesIcon } from 'lucide-react';

export default function LifeSimulator() {
  const [sip, setSip] = useState(25000);
  const [growth, setGrowth] = useState(12);
  const [retireAge, setRetireAge] = useState(50);
  const [savings, setSavings] = useState(1000000);

  const [events, setEvents] = useState({ marry: false, child: false, loss: false, stepUp: false });

  // GSAP tweened data for Recharts
  const targetData = useMemo(() => generateData(sip, growth, retireAge, savings, events), [sip, growth, retireAge, savings, events]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Initial draw animation
    if (chartData.length === 0) {
      let temp = [];
      let i = 0;
      const interval = setInterval(() => {
        temp.push(targetData[i]);
        setChartData([...temp]);
        i++;
        if (i >= targetData.length) clearInterval(interval);
      }, 2500 / targetData.length);
      return () => clearInterval(interval);
    } else {
      // Spring animate changes
      const dummy = { p: 0 };
      const startData = [...chartData];
      
      gsap.to(dummy, {
        p: 1,
        duration: 0.8,
        ease: "back.out(1.2)",
        onUpdate: () => {
          const interpolated = startData.map((d, i) => {
            const t = targetData[i] || targetData[targetData.length-1];
            if(!t) return d;
            return {
              age: d.age,
              netWorth: d.netWorth + (t.netWorth - d.netWorth) * dummy.p,
              income: d.income + (t.income - d.income) * dummy.p,
            };
          });
          setChartData(interpolated);
        }
      });
    }
  }, [targetData]);

  const fireDateAge = useMemo(() => {
    const firePoint = targetData.find(d => d.netWorth >= 50000000); // arbitrarily 5Cr as FIRE
    return firePoint ? firePoint.age : retireAge;
  }, [targetData, retireAge]);

  const milestones = [30, 40, 50, 60, retireAge];

  return (
    <motion.div variants={pageEnter} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-navy pt-24 pb-12 overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Life Simulator</h1>
          <p className="text-xl text-gold/80">Drag the sliders. Watch your future change in real time.</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-card p-6 rounded-3xl border border-white/5 shadow-xl">
              <h3 className="text-lg font-bold mb-6 flex items-center"><TrendingUp className="mr-2 text-gold w-5 h-5"/> Financial Levers</h3>
              <CustomSlider label="Monthly SIP" value={sip} min={5000} max={200000} step={1000} onChange={setSip} prefix="₹" />
              <CustomSlider label="Expected Return (%)" value={growth} min={6} max={20} step={1} onChange={setGrowth} suffix="%" />
              <CustomSlider label="Retirement Age" value={retireAge} min={40} max={65} step={1} onChange={setRetireAge} />
              <CustomSlider label="Current Savings" value={savings} min={0} max={10000000} step={100000} onChange={setSavings} prefix="₹" />
            </div>

            <div className="space-y-4">
              <ToggleCard icon={<Users />} title="What if I get married in 2 years?" active={events.marry} onClick={() => setEvents(p => ({...p, marry: !p.marry}))} color="blue" />
              <ToggleCard icon={<Baby />} title="What if I have a child in 3 years?" active={events.child} onClick={() => setEvents(p => ({...p, child: !p.child}))} color="pink" />
              <ToggleCard icon={<Briefcase />} title="What if I lose my job for 6 months?" active={events.loss} onClick={() => setEvents(p => ({...p, loss: !p.loss}))} color="red" />
              <ToggleCard icon={<TrendingUp />} title="What if I step-up SIP by 10% yearly?" active={events.stepUp} onClick={() => setEvents(p => ({...p, stepUp: !p.stepUp}))} color="green" />
            </div>
          </div>

          {/* Main Chart */}
          <div className="lg:col-span-3 flex flex-col space-y-8">
            <div className="bg-card/30 p-8 rounded-3xl border border-white/5 relative h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F5A623" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="age" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.5)' }} />
                  <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.5)' }} tickFormatter={(val) => `₹${(val/100000).toFixed(0)}L`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(245,166,35,0.4)', strokeWidth: 2, strokeDasharray: '5 5' }} />
                  
                  <ReferenceLine x={fireDateAge} stroke="#F5A623" strokeDasharray="3 3" label={{ position: 'top', value: 'FIRE', fill: '#F5A623', fontSize: 14, fontWeight: 'bold' }} />
                  
                  <Area type="monotone" dataKey="netWorth" stroke="#F5A623" strokeWidth={3} fillOpacity={1} fill="url(#colorNetWorth)" isAnimationActive={false} />
                  
                  {/* Glowing Dot at End of Line (simulated with standard SVG overlay or just let standard dot render) */}
                </AreaChart>
              </ResponsiveContainer>
              
              <motion.div 
                initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 2.5, type: 'spring', bounce: 0.6 }}
                className="absolute top-4 right-4 bg-navy/80 backdrop-blur border border-gold px-4 py-2 rounded-xl"
              >
                <div className="text-xs text-gold uppercase tracking-widest font-bold">You Can Retire At</div>
                <div className="text-3xl font-black text-white">{fireDateAge}</div>
              </motion.div>
            </div>

            {/* Milestones */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {milestones.map((mAge) => {
                const pt = chartData.find(d => d.age >= mAge) || { netWorth: 0 };
                const isRetire = mAge === retireAge;
                return (
                  <div key={mAge} className={`p-4 rounded-2xl relative overflow-hidden transition-all ${isRetire ? 'bg-gradient-to-br from-gold/20 to-navy border border-gold/50 shadow-[0_0_20px_rgba(245,166,35,0.2)]' : 'bg-card border border-white/5'}`}>
                    <div className={`text-xs font-bold mb-1 ${isRetire ? 'text-gold' : 'text-gray-500'}`}>Age {mAge}</div>
                    <AnimatedNumber value={pt.netWorth} prefix="₹" suffix="L" divider={100000} className={`font-black ${isRetire ? 'text-2xl text-white' : 'text-xl text-gray-300'}`} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      <RegretSection baseSip={sip} baseGrowth={growth} />
    </motion.div>
  );
}

function RegretSection({ baseSip, baseGrowth }) {
  const [ref, inView] = useInView({ threshold: 0.3, triggerOnce: true });
  const lossRef = useRef(null);
  const [ticker, setTicker] = useState(0);

  // Math for delay cost
  const fvNow = calculateArea(baseSip, baseGrowth, 30);
  const fvLater = calculateArea(baseSip, baseGrowth, 28); // 2 yrs delay
  const loss = Math.max(0, fvNow - fvLater);

  useEffect(() => {
    if(inView) {
      countUpNumber(lossRef, loss, 4, "₹");
      const i = setInterval(() => setTicker(t => t + Math.floor(loss / (30*365*24*60*60))), 1000); // rupees per second lost
      return () => clearInterval(i);
    }
  }, [inView, loss]);

  return (
    <div ref={ref} className="mt-32 max-w-[1400px] mx-auto relative px-6 z-10">
      {inView && <div className="fixed inset-0 bg-black/80 z-[-1] transition-opacity duration-1000 pointer-events-none" />}
      
      <div className="text-center mb-16 relative">
        <h2 className="text-5xl font-bold mb-6 font-mono tracking-tighter text-gray-300">The Cost of Procrastination</h2>
        <div className="text-7xl md:text-[120px] font-black text-red-500 mb-6 drop-shadow-[0_0_30px_rgba(239,68,68,0.6)] animate-[pulse_2s_infinite]">
          <span ref={lossRef}>0</span>
        </div>
        <p className="text-2xl text-red-300 font-light">Lost forever by delaying investments by just 2 years.</p>
        
        <div className="mt-6 inline-block bg-red-900/30 border border-red-500/50 px-6 py-3 rounded-full text-red-400 font-mono tracking-widest text-sm">
          Every second you wait costs you ₹{ticker.toLocaleString('en-IN')}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <motion.div initial={{ x: -100, opacity: 0 }} animate={inView ? { x: 0, opacity: 1 } : {}} transition={{ delay: 0.5, type: 'spring' }} className="bg-gradient-to-b from-[#2a0808] to-black border border-red-900/50 p-10 rounded-3xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-20 mix-blend-overlay" />
          <AlertOctagon className="w-16 h-16 text-red-500/50 mb-6" />
          <h3 className="text-3xl font-black text-red-400 mb-4">Do Nothing</h3>
          <p className="text-gray-400 text-lg leading-relaxed">Inflation slowly eats your savings. Time compounding works against you. You work 10 years longer than necessary.</p>
        </motion.div>
        
        <motion.div initial={{ x: 100, opacity: 0 }} animate={inView ? { x: 0, opacity: 1 } : {}} transition={{ delay: 0.8, type: 'spring' }} className="bg-gradient-to-b from-[#062c16] to-black border border-green-900/50 p-10 rounded-3xl relative overflow-hidden">
          <SparklesIcon className="w-16 h-16 text-green-400 mb-6 animate-pulse" />
          <h3 className="text-3xl font-black text-green-400 mb-4">Start Today</h3>
          <p className="text-green-100/70 text-lg leading-relaxed">Your money works 24/7. Compound interest accelerates your wealth. You buy back your freedom and time.</p>
        </motion.div>
      </div>
    </div>
  );
}

// Helpers
function calculateArea(monthlySip, r, years) {
  const n = years * 12;
  const i = r / 100 / 12;
  return monthlySip * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
}

function generateData(sip, growth, retireAge, initial, events) {
  let data = [];
  let currentNw = initial;
  const currentAge = 28;
  const i = growth / 100 / 12;

  for (let age = currentAge; age <= 70; age++) {
    for (let month = 1; month <= 12; month++) {
      let runSip = sip;
      if (events.stepUp && age > currentAge) runSip = sip * Math.pow(1.1, age - currentAge);
      if (events.loss && age === 32 && month <= 6) runSip = 0; // job loss condition
      
      let exp = 0;
      if (events.marry && age === 30 && month === 1) exp = 1500000;
      if (events.child && age === 31 && month === 1) exp = 500000;

      if (age < retireAge) {
        currentNw = (currentNw * (1 + i)) + runSip - exp;
      } else {
        // retirement withdrawal
        const withdrawal = (currentNw * 0.04) / 12; // 4% rule
        currentNw = (currentNw * (1 + (6/100/12))) - withdrawal; // 6% safe return post retire
      }
    }
    data.push({
      age,
      netWorth: Math.max(0, currentNw),
      income: age < retireAge ? (sip * 3) : 0 // rough income est
    });
  }
  return data;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const nw = payload[0].value;
    return (
      <div className="bg-navy border border-gold/40 p-4 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-gray-400 text-xs uppercase mb-2 font-bold tracking-widest">Age {label}</p>
        <p className="text-white text-2xl font-black mb-1">₹{(nw/100000).toFixed(1)}L</p>
        <p className="text-gold text-xs font-semibold">Projected Net Worth</p>
      </div>
    );
  }
  return null;
};

function CustomSlider({ label, value, min, max, step, onChange, prefix='', suffix='' }) {
  const percentage = ((value - min) / (max - min)) * 100;
  return (
    <div className="mb-6">
      <div className="flex justify-between items-end mb-3">
        <label className="text-sm font-bold text-gray-300">{label}</label>
        <div className="text-gold font-bold text-lg">{prefix}{value.toLocaleString('en-IN')}{suffix}</div>
      </div>
      <div className="relative w-full h-2 bg-navy rounded-full outline-none">
        <div className="absolute top-0 left-0 h-full bg-gold rounded-full transition-all" style={{ width: `${percentage}%` }} />
        <input 
          type="range" min={min} max={max} step={step} value={value} 
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
        <div className="absolute top-1/2 -mt-3 w-6 h-6 bg-gold rounded-full shadow-[0_0_10px_rgba(245,166,35,0.8)] pointer-events-none transition-all" style={{ left: `calc(${percentage}% - 12px)` }} />
      </div>
    </div>
  );
}

function AnimatedNumber({ value, prefix='', suffix='', divider=1, className='' }) {
  const ref = useRef(null);
  useEffect(() => {
    let obj = { v: 0 }; // We should technically animate from old val, but simplifies.
    gsap.to(obj, { v: value / divider, duration: 1, ease: 'power2.out', onUpdate: () => {
      if(ref.current) ref.current.innerText = `${prefix}${Math.floor(obj.v).toLocaleString('en-IN')}${suffix}`;
    }});
  }, [value, prefix, suffix, divider]);
  return <span ref={ref} className={className}>0</span>;
}

function ToggleCard({ icon, title, active, onClick, color }) {
  const colors = {
    blue: 'border-blue-500/50 bg-blue-900/20 text-blue-400',
    pink: 'border-pink-500/50 bg-pink-900/20 text-pink-400',
    red: 'border-red-500/50 bg-red-900/20 text-red-400',
    green: 'border-green-500/50 bg-green-900/20 text-green-400',
  };
  
  return (
    <motion.div 
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center space-x-4 ${active ? colors[color] : 'border-white/5 bg-navy/50 text-gray-500 hover:border-white/20'}`}
    >
      <div className={`shrink-0 ${active && 'animate-bounce'}`}>{icon}</div>
      <div className="font-medium text-sm">{title}</div>
      <div className="ml-auto w-10 h-6 bg-black rounded-full relative border border-white/10 shrink-0">
        <motion.div animate={{ left: active ? 18 : 2 }} className={`absolute top-1 bottom-1 w-4 rounded-full ${active ? 'bg-current' : 'bg-gray-600'}`} />
      </div>
    </motion.div>
  );
}
