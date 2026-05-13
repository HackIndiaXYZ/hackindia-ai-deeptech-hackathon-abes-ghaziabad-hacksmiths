import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from './context/AppContext';
import Logo from './components/Logo';

import ScrollProgressBar from './components/ScrollProgressBar';
import FloatingChatAssistant from './components/FloatingChatAssistant';
import CustomCursor from './components/CustomCursor';
import FinancialObituary from './components/FinancialObituary';
import MidnightMirror from './components/MidnightMirror';
import GlobalSidebar from './components/GlobalSidebar';
import { Toaster } from 'react-hot-toast';

// Page Imports
import Landing from './pages/Landing';
import OnboardingForm from './pages/OnboardingForm';
import DNALoader from './components/DNALoader';
import MoneyHealthResults from './pages/MoneyHealthResults';
import PersonalityReveal from './pages/PersonalityReveal';
import Dashboard from './pages/Dashboard';
import LifeSimulator from './pages/LifeSimulator';
import TaxWizard from './pages/TaxWizard';
import CouplesMode from './pages/CouplesMode';
import RegretEngine from './pages/RegretEngine';

// New Feature Imports
import MoneyTimeMachine from './pages/MoneyTimeMachine';
import CroreChallenge from './pages/CroreChallenge';
import PassiveIncomeDashboard from './pages/PassiveIncomeDashboard';
import SalaryCoach from './pages/SalaryCoach';
import BudgetRoast from './pages/BudgetRoast';
import PortfolioXRay from './pages/PortfolioXRay';
import GenerationalWealth from './pages/GenerationalWealth';
import RealEstateVsSIP from './pages/RealEstateVsSIP';
import WhatsAppNudge from './pages/WhatsAppNudge';
import FearIndex from './pages/FearIndex';
import MarketGuru from './pages/MarketGuru';
import FinancialGlossary from './pages/FinancialGlossary';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);

  const showChatAssistant = !['/', '/onboarding'].includes(location.pathname);
  const showSidebar = !['/', '/onboarding', '/loading'].includes(location.pathname);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1500);
    dispatch({ type: 'SET_USER_DATA', payload: { name: 'Rahul', age: 28, income: 85000, expenses: 55000, emergencyFund: 200000, termInsurance: false, healthInsurance: 'employer only', mutualFunds: 50000, fd: 0, stocks: 0, gold: 0, debt: 300000, emi: 10300 } });
    return () => clearTimeout(t);
  }, [dispatch]);

  const exitDemo = () => {
    setIsDemo(false);
    dispatch({ type: 'SET_USER_DATA', payload: {} });
    navigate('/onboarding');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[99999] bg-navy flex items-center justify-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} className="relative">
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute inset-0 bg-gold blur-3xl opacity-30 rounded-full" />
          <Logo iconSize={80} textClass="text-3xl" showSub />
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {isDemo && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-gold/90 backdrop-blur text-navy text-xs font-bold text-center py-1 cursor-pointer hover:bg-gold transition-colors" onClick={exitDemo}>
          You are viewing a demo. Your real results may differ. Click to enter your own data.
        </div>
      )}
      
      <div className={isDemo ? 'pt-6' : ''}>
        <CustomCursor />
        <FinancialObituary />
        <MidnightMirror />
      <Toaster position="bottom-center" toastOptions={{
        style: {
          background: '#0F172A',
          color: '#fff',
          border: '1px solid rgba(245,166,35,0.2)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          borderRadius: '100px',
        }
      }} />
      <ScrollProgressBar />
      {showSidebar && <GlobalSidebar />}
      {showChatAssistant && <FloatingChatAssistant />}
      
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route path="/onboarding" element={<OnboardingForm />} />
          <Route path="/loading" element={<DNALoader />} />
          <Route path="/results/health" element={<MoneyHealthResults />} />
          <Route path="/results/personality" element={<PersonalityReveal />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/simulator" element={<LifeSimulator />} />
          <Route path="/tax" element={<TaxWizard />} />
          <Route path="/couples" element={<CouplesMode />} />
          <Route path="/regret" element={<RegretEngine />} />
          {/* New Feature Routes */}
          <Route path="/time-machine" element={<MoneyTimeMachine />} />
          <Route path="/crore-challenge" element={<CroreChallenge />} />
          <Route path="/passive-income" element={<PassiveIncomeDashboard />} />
          <Route path="/salary-coach" element={<SalaryCoach />} />
          <Route path="/budget-roast" element={<BudgetRoast />} />
          <Route path="/portfolio-xray" element={<PortfolioXRay />} />
          <Route path="/generational-wealth" element={<GenerationalWealth />} />
          <Route path="/real-estate-vs-sip" element={<RealEstateVsSIP />} />
          <Route path="/whatsapp-nudge" element={<WhatsAppNudge />} />
          <Route path="/fear-index" element={<FearIndex />} />
          <Route path="/market-guru" element={<MarketGuru />} />
          <Route path="/glossary" element={<FinancialGlossary />} />
        </Routes>
      </AnimatePresence>
      </div>
    </>
  );
}

export default App;
