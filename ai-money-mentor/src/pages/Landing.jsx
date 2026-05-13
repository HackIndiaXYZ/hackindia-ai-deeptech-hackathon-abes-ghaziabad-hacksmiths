import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { Brain, FileText, Trophy, Lock, ChevronDown, ShieldAlert } from 'lucide-react';
import { pageEnter } from '../animations/variants';
import { countUpNumber } from '../animations/gsapHelpers';
import Logo from '../components/Logo';

const particleOptions = {
  fullScreen: { enable: false, zIndex: 0 },
  fpsLimit: 60,
  particles: {
    color: { value: '#F5A623' },
    links: { color: '#F5A623', distance: 100, enable: true, opacity: 0.15, width: 1 },
    move: { direction: 'top', enable: true, outModes: { default: 'out' }, random: false, speed: 0.5, straight: true },
    number: { density: { enable: true, area: 800 }, value: 80 },
    opacity: { value: { min: 0.2, max: 0.6 } },
    shape: { type: 'circle' },
    size: { value: { min: 1, max: 3 } },
  },
  detectRetina: true,
};

export default function Landing() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const countRef95 = useRef(null);
  const countRefLoss = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      countUpNumber(countRef95, 95, 2);
    }, 1500);
  }, []);

  const [fearRef, fearInView] = useInView({ triggerOnce: true, threshold: 0.5 });
  useEffect(() => {
    if (fearInView) {
      countUpNumber(countRefLoss, 4700000, 3, "₹");
    }
  }, [fearInView]);

  const words = "of Indians Have No Financial Plan".split(" ");

  return (
    <motion.div variants={pageEnter} initial="initial" animate="animate" exit="exit" className="w-full min-h-screen bg-navy relative">
      <div className="fixed inset-0 z-0 bg-conic-gradient opacity-30 pointer-events-none" />
      {init && (
        <div className="fixed inset-0 z-0">
          <Particles id="tsparticles" options={particleOptions} className="w-full h-full" />
        </div>
      )}

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-navy/80 backdrop-blur-md border-b text-white border-white/5 py-4 px-6 flex justify-between items-center">
        <Logo iconSize={32} textClass="text-xl" />
        <div className="hidden md:flex space-x-8">
          {['How it Works', 'Discover', 'Testimonials'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="relative group text-sm font-medium text-gray-300 hover:text-white transition-colors">
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold transition-all group-hover:w-full"></span>
            </a>
          ))}
        </div>
        <Link to="/onboarding" className="shimmer-border overflow-hidden rounded-full p-[2px] cursor-pointer">
          <div className="px-6 py-2 bg-navy rounded-full text-sm font-bold border border-gold/30 hover:bg-gold/10 transition-colors">
            Get Started
          </div>
        </Link>
      </nav>

      <div className="relative z-10">
        {/* HERO SECTION */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 pt-20 text-center">
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="mb-8"
          >
            <Logo iconSize={80} textClass="text-3xl" showSub={true} />
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 max-w-4xl leading-tight flex flex-wrap justify-center gap-x-3 gap-y-2">
            <motion.span 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-gold"
            >
              <span ref={countRef95}>0</span>%
            </motion.span>
            {words.map((word, i) => (
              <motion.span 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + (i * 0.12) }}
              >
                {word}
              </motion.span>
            ))}
          </h1>
          
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 1.5 }}
            className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl"
          >
            We built the financial advisor that was only available to the top 5 percent.
          </motion.p>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.8, type: "spring" }}
          >
            <Link 
              to="/onboarding" 
              className="px-8 py-4 bg-gradient-to-r from-gold to-yellow-400 text-navy font-bold text-lg rounded-full shadow-[0_0_30px_rgba(245,166,35,0.4)] hover:shadow-[0_0_50px_rgba(245,166,35,0.6)] transition-all animate-[pulse_2s_infinite_ease-in-out] inline-block"
            >
              Start Free Assessment
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
            className="absolute bottom-10 animate-bounce"
          >
            <ChevronDown className="text-gold w-8 h-8 opacity-60" />
          </motion.div>
        </section>

        {/* DEMO VIDEO SECTION */}
        <section className="py-24 px-6 max-w-5xl mx-auto relative z-20">
          <motion.div 
            initial={{ opacity: 0, y: 100 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, type: "spring" }}
            className="relative mx-auto rounded-t-3xl rounded-b-lg border-[8px] border-b-[24px] border-gray-800 bg-gray-900 shadow-2xl"
          >
            {/* Camera dot */}
            <div className="absolute -top-[16px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gray-950 flex items-center justify-center">
              <div className="w-[3px] h-[3px] rounded-full bg-blue-900/50" />
            </div>
            {/* Screen */}
            <div className="aspect-[16/10] bg-navy w-full rounded-md overflow-hidden relative flex items-center justify-center">
               <div className="absolute inset-0 bg-conic-gradient opacity-20" />
               <Brain className="w-20 h-20 text-gold/30 animate-pulse absolute" />
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm group">
                  <div className="w-20 h-20 bg-gold/90 text-navy rounded-full flex items-center justify-center font-bold shadow-[0_0_30px_rgba(245,166,35,0.6)] cursor-pointer hover:scale-110 transition-transform">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                  <span className="mt-4 font-bold text-gold tracking-widest text-sm uppercase">Watch App Demo</span>
               </div>
            </div>
            {/* Bottom lip */}
            <div className="absolute -bottom-[24px] left-1/2 -translate-x-1/2 w-[15%] h-[8px] bg-gray-700 rounded-b-md" />
          </motion.div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-24 px-6 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <WorkCard step="01" Icon={FileText} title="Enter Your Details" desc="In just 3 minutes answer 5 simple questions about your money." delay={0.1} />
            <WorkCard step="02" Icon={Brain} title="AI Analyzes 6 Dimensions" desc="Our AI compares your profile with 50,000 Indian financial profiles." delay={0.3} />
            <WorkCard step="03" Icon={Trophy} title="Get Your Action Plan" desc="Receive a personalized roadmap to financial freedom." delay={0.5} />
          </div>
        </section>

        {/* DISCOVER SECTION */}
        <section id="discover" className="py-24 px-6 bg-gray-900/30">
          <div className="max-w-6xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once:true }}
              className="text-4xl font-bold text-center mb-16"
            >
              What You Will Discover
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-6">
              {['Emergency Fund', 'Debt Health', 'Retirement', 'Tax Efficiency', 'Investments', 'Insurance'].map((dim, i) => (
                <DimensionCard key={dim} title={dim} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* FEAR SECTION */}
        <section ref={fearRef} className="py-32 px-6 bg-black relative overflow-hidden">
          <div className="absolute inset-0 bg-red-900/10" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold mb-8">What Is Inaction Costing You?</h2>
            <div className="text-6xl md:text-8xl font-black text-red-500 mb-6 drop-shadow-[0_0_20px_rgba(255,0,0,0.5)] animate-pulse">
              <span ref={countRefLoss}>0</span>
            </div>
            <p className="text-xl text-gray-400">Average wealth lost by a 28 year old who delays investing by just 2 years.</p>
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <section id="testimonials" className="py-24 overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-navy to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-navy to-transparent z-10 pointer-events-none" />
          <div className="flex w-[200%] animate-marquee space-x-6 px-6">
            {testimonials.concat(testimonials).map((t, i) => (
              <div key={i} className="w-80 bg-card p-6 rounded-2xl border border-white/5 shrink-0">
                <p className="text-gray-300 mb-4 text-sm leading-relaxed">"{t.quote}"</p>
                <div className="text-gold font-bold">{t.name}</div>
                <div className="text-xs text-gray-500">{t.age} yrs • {t.city}</div>
              </div>
            ))}
          </div>
        </section>

        <footer className="py-12 text-center border-t border-white/5 bg-navy/80">
          <div className="flex justify-center mb-6">
            <Logo iconSize={48} textClass="text-2xl" showSub={true} />
          </div>
          <Link to="/onboarding" className="px-6 py-3 border border-gold text-gold rounded-full hover:bg-gold hover:text-navy transition-all font-semibold inline-block">
            Build Your Wealth Plan
          </Link>
          <div className="mt-12 text-sm text-gray-600">© 2026 AFTERMATH. Developed at Hackathon.</div>
        </footer>
      </div>
    </motion.div>
  );
}

function WorkCard({ step, Icon, title, desc, delay }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ delay, duration: 0.6 }}
      whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.4)', borderColor: 'rgba(245,166,35,0.4)' }}
      className="bg-card p-8 rounded-3xl border-t-2 border-t-gold/50 border border-white/5 relative group transition-all overflow-hidden"
    >
      <div className="absolute top-2 right-4 text-7xl font-black text-white/5 group-hover:text-gold/10 transition-colors pointer-events-none">
        {step}
      </div>
      <div className="w-16 h-16 rounded-2xl bg-navy flex items-center justify-center mb-6 text-gold group-hover:scale-110 transition-transform">
        <Icon strokeWidth={1.5} size={32} className={step === '02' ? 'animate-pulse' : ''} />
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed text-sm">{desc}</p>
    </motion.div>
  );
}

function DimensionCard({ title, index }) {
  const [ref, inView] = useInView({ triggerOnce: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(245,166,35,0.2)' }}
      className="bg-card/50 overflow-hidden relative p-8 rounded-2xl border border-white/5 group cursor-pointer"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center opacity-100 group-hover:backdrop-blur-[1px] transition-all">
        <Lock className="text-gold mb-2 w-8 h-8 group-hover:animate-bounce" />
        <span className="font-bold text-sm">Unlock Your Score</span>
      </div>
      <div className="filter blur-sm px-4">
        <h3 className="text-gold font-bold mb-2">{title}</h3>
        <div className="h-4 bg-navy rounded-full overflow-hidden mb-2">
          <div className="w-2/3 h-full bg-green-500" />
        </div>
        <p className="text-xs text-gray-500 mt-2">Score pending...</p>
      </div>
    </motion.div>
  );
}

const testimonials = [
  { name: "Priya S.", age: 28, city: "Bangalore", quote: "I didn't realize I was losing so much to taxes. The actionable plan helped me save ₹45k this year alone." },
  { name: "Rahul M.", age: 32, city: "Mumbai", quote: "Finally, financial advice that doesn't feel like a sales pitch. The life simulator was an eye opener." },
  { name: "Ananya K.", age: 26, city: "Pune", quote: "The UI design is incredible, but the AI insights were exactly what I needed to start my emergency fund." },
  { name: "Vikram R.", age: 30, city: "Delhi", quote: "Couples mode completely changed how my wife and I discuss our finances. We finally have a unified FIRE date!" },
  { name: "Sneha T.", age: 29, city: "Hyderabad", quote: "Thought I was doing okay. Learned I'm a 'Fearful Saver'. Now I'm actively investing in index funds." },
  { name: "Amit B.", age: 34, city: "Chennai", quote: "It's like having a top-tier CA and financial planner available 24/7. Absolutely mind blown." }
];
