import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Activity, Fingerprint, TrendingUp, Calculator, Heart, Settings, ArrowUpRight, AlertCircle, Sparkles, BookOpen } from 'lucide-react';
import Logo from './Logo';

const GROUPS = [
  {
    label: 'Core',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Money Health', path: '/results/health', icon: Activity },
      { name: 'Personality', path: '/results/personality', icon: Fingerprint },
      { name: 'Life Simulator', path: '/simulator', icon: TrendingUp },
      { name: 'Tax Wizard', path: '/tax', icon: Calculator },
    ]
  },
  {
    label: 'Tools',
    items: [
      { name: 'Salary Coach', path: '/salary-coach', icon: ArrowUpRight },
      { name: 'RE vs SIP', path: '/real-estate-vs-sip', icon: Calculator },
      { name: 'Passive Income', path: '/passive-income', icon: TrendingUp },
      { name: 'Gen. Wealth', path: '/generational-wealth', icon: Heart },
      { name: 'Market Guru', path: '/market-guru', icon: Sparkles },
    ]
  },
  {
    label: 'Challenges',
    items: [
      { name: '₹1Cr Challenge', path: '/crore-challenge', icon: Sparkles },
      { name: 'Budget Roast', path: '/budget-roast', icon: AlertCircle },
      { name: 'Portfolio X-Ray', path: '/portfolio-xray', icon: Activity },
      { name: 'Time Machine', path: '/time-machine', icon: Settings },
      { name: 'Regret Engine', path: '/regret', icon: AlertCircle },
    ]
  },
  {
    label: 'Social & Psychology',
    items: [
      { name: 'Couples Mode', path: '/couples', icon: Heart },
      { name: 'Fear Index', path: '/fear-index', icon: Fingerprint },
      { name: 'WhatsApp Nudge', path: '/whatsapp-nudge', icon: Sparkles },
      { name: 'Glossary', path: '/glossary', icon: BookOpen },
    ]
  },
];

export default function GlobalSidebar() {
  const loc = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger toggle — always visible */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-5 left-5 z-[70] w-10 h-10 bg-card/80 backdrop-blur border border-white/10 rounded-xl flex items-center justify-center hover:border-gold/40 transition-all group shadow-lg"
        aria-label="Toggle navigation"
      >
        <div className="flex flex-col gap-[5px] items-center">
          <span className={`block w-4 h-[2px] bg-gray-400 group-hover:bg-gold transition-all duration-300 ${open ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`block w-4 h-[2px] bg-gray-400 group-hover:bg-gold transition-all duration-300 ${open ? 'opacity-0 scale-0' : ''}`} />
          <span className={`block w-4 h-[2px] bg-gray-400 group-hover:bg-gold transition-all duration-300 ${open ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </div>
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 w-72 h-screen bg-card border-r border-white/5 z-[65] flex flex-col py-6 shadow-2xl shadow-black/50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 mb-6">
              <Logo iconSize={28} textClass="text-base" />
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors">×</button>
            </div>

            {/* Nav groups */}
            <nav className="flex-1 overflow-y-auto px-3 space-y-5 pb-8">
              {GROUPS.map(group => (
                <div key={group.label}>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-bold px-3 mb-2">{group.label}</div>
                  <div className="space-y-0.5">
                    {group.items.map(item => {
                      const isActive = loc.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setOpen(false)}
                          className={`flex items-center px-3 py-2.5 rounded-xl text-[13px] relative group transition-all ${
                            isActive
                              ? 'text-navy font-bold'
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {isActive && (
                            <motion.div layoutId="globalSidebarPill" className="absolute inset-0 bg-gold rounded-xl -z-10 shadow-[0_0_12px_rgba(245,166,35,0.3)]" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                          )}
                          <item.icon size={16} className="mr-3 shrink-0" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Footer */}
            <div className="px-6 pt-4 border-t border-white/5">
              <div className="text-[10px] text-gray-600 tracking-widest uppercase">AFTERMATH v2.0</div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
