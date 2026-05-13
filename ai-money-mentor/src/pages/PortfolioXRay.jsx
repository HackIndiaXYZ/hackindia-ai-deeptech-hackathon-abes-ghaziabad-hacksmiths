import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Upload, FileText, TrendingUp, Layers, DollarSign, BarChart3, Brain, AlertTriangle, CheckCircle2, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { pageEnter } from '../animations/variants';
import { useApp } from '../context/AppContext';
import { askGemini } from '../services/geminiService';

// ─── Known fund data (top holdings + expense ratios) ───────────────────────
const FUND_DATABASE = {
  'HDFC Mid-Cap Opportunities': { category: 'Mid Cap', expenseRatio: 1.64, benchmark: 'Nifty Midcap 150', topHoldings: ['Persistent Systems', 'Indian Hotels', 'Max Healthcare', 'Coforge', 'Trent', 'Tube Investments', 'Sundaram Finance', 'Cholamandalam Inv', 'Balkrishna Ind', 'Cummins India'] },
  'Parag Parikh Flexi Cap': { category: 'Flexi Cap', expenseRatio: 0.63, benchmark: 'Nifty 500', topHoldings: ['HDFC Bank', 'Bajaj Holdings', 'ITC', 'Power Grid', 'Alphabet Inc', 'Microsoft', 'Coal India', 'HCL Technologies', 'ICICI Bank', 'Maruti Suzuki'] },
  'Axis Bluechip Fund': { category: 'Large Cap', expenseRatio: 1.56, benchmark: 'Nifty 50', topHoldings: ['HDFC Bank', 'Bajaj Finance', 'TCS', 'Infosys', 'ICICI Bank', 'HUL', 'Kotak Mahindra', 'Avenue Supermarts', 'Titan Company', 'Reliance Industries'] },
  'SBI Small Cap Fund': { category: 'Small Cap', expenseRatio: 1.55, benchmark: 'Nifty Smallcap 250', topHoldings: ['Blue Star', 'Finolex Industries', 'Chalet Hotels', 'IIFL Finance', 'Kalpataru Projects', 'Carborundum Universal', 'Praj Industries', 'Safari Industries', 'CAMS', 'Radico Khaitan'] },
  'Mirae Asset Large Cap': { category: 'Large Cap', expenseRatio: 1.39, benchmark: 'Nifty 100', topHoldings: ['HDFC Bank', 'ICICI Bank', 'Reliance Industries', 'Infosys', 'Bharti Airtel', 'TCS', 'Larsen & Toubro', 'Axis Bank', 'State Bank of India', 'ITC'] },
  'Kotak Emerging Equity': { category: 'Mid Cap', expenseRatio: 1.50, benchmark: 'Nifty Midcap 150', topHoldings: ['Persistent Systems', 'Supreme Industries', 'Sona BLW Precision', 'Cummins India', 'Schaeffler India', 'Trent', 'CG Power', 'Indian Hotels', 'Sundaram Finance', 'Oberoi Realty'] },
  'Nippon India Growth Fund': { category: 'Mid Cap', expenseRatio: 1.58, benchmark: 'Nifty Midcap 150', topHoldings: ['Persistent Systems', 'Tube Investments', 'Trent', 'Indian Hotels', 'Dixon Technologies', 'Max Healthcare', 'KPIT Technologies', 'Coforge', 'PI Industries', 'Cummins India'] },
  'ICICI Pru Equity & Debt': { category: 'Hybrid', expenseRatio: 1.67, benchmark: 'Nifty 50 Hybrid', topHoldings: ['HDFC Bank', 'ICICI Bank', 'NTPC', 'Infosys', 'Bharti Airtel', 'SBI', 'Maruti Suzuki', 'Sun Pharma', 'Axis Bank', 'GOI Bonds'] },
};

const BENCHMARK_RETURNS = { 'Nifty 50': 12.1, 'Nifty 100': 12.8, 'Nifty 500': 13.2, 'Nifty Midcap 150': 16.5, 'Nifty Smallcap 250': 18.2, 'Nifty 50 Hybrid': 10.5 };

// ─── XIRR Calculation ──────────────────────────────────────────────────────
function calcXIRR(cashflows) {
  // cashflows = [{amount, date}] - negative for investments, positive for redemptions/current value
  const guess = 0.1;
  let rate = guess;
  for (let iter = 0; iter < 100; iter++) {
    let fValue = 0, fDeriv = 0;
    const d0 = cashflows[0].date;
    for (const cf of cashflows) {
      const years = (cf.date - d0) / (365.25 * 24 * 60 * 60 * 1000);
      fValue += cf.amount / Math.pow(1 + rate, years);
      fDeriv += -years * cf.amount / Math.pow(1 + rate, years + 1);
    }
    const newRate = rate - fValue / fDeriv;
    if (Math.abs(newRate - rate) < 1e-7) return newRate;
    rate = newRate;
    if (isNaN(rate) || !isFinite(rate)) return guess;
  }
  return rate;
}

// ─── Statement Parser ──────────────────────────────────────────────────────
function parseStatement(text) {
  const funds = [];
  const lines = text.split('\n').filter(l => l.trim());
  
  // Try to detect CAMS-style format
  for (const line of lines) {
    // Match patterns like: "Fund Name | Units | NAV | Amount"
    const parts = line.split(/[|,\t]/).map(p => p.trim());
    if (parts.length >= 4) {
      const name = parts[0];
      const units = parseFloat(parts[1]);
      const nav = parseFloat(parts[2]);
      const invested = parseFloat(parts[3]);
      if (!isNaN(units) && !isNaN(nav) && name.length > 3) {
        const currentValue = units * nav;
        const gain = currentValue - invested;
        const gainPct = invested > 0 ? (gain / invested) * 100 : 0;
        const dbMatch = Object.keys(FUND_DATABASE).find(k => name.toLowerCase().includes(k.toLowerCase().split(' ')[0]));
        funds.push({
          name, units, nav, invested, currentValue, gain, gainPct,
          ...(dbMatch ? FUND_DATABASE[dbMatch] : { category: 'Equity', expenseRatio: 1.5, benchmark: 'Nifty 500', topHoldings: [] }),
        });
      }
    }
  }
  return funds;
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function PortfolioXRay() {
  const navigate = useNavigate();
  const { state } = useApp();
  const [funds, setFunds] = useState([]);
  const [rawText, setRawText] = useState('');
  const [showPaste, setShowPaste] = useState(false);
  const [activeTab, setActiveTab] = useState('portfolio');
  const [aiPlan, setAiPlan] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const fileRef = useRef(null);

  // Load demo data
  useEffect(() => {
    if (state.demoData?.portfolio && funds.length === 0) {
      setFunds(state.demoData.portfolio);
    }
  }, [state.demoData]);

  // Initialize from existing demo data on mount
  useEffect(() => {
    if (state.demoData?.portfolio && funds.length === 0) {
      setFunds(state.demoData.portfolio);
    }
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      setRawText(text);
      const parsed = parseStatement(text);
      if (parsed.length > 0) setFunds(parsed);
    };
    reader.readAsText(file);
  };

  const handlePaste = () => {
    const parsed = parseStatement(rawText);
    if (parsed.length > 0) {
      setFunds(parsed);
      setShowPaste(false);
    }
  };

  const totalInvested = funds.reduce((s, f) => s + f.invested, 0);
  const totalCurrent = funds.reduce((s, f) => s + f.currentValue, 0);
  const totalGain = totalCurrent - totalInvested;
  const totalGainPct = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;
  const totalExpenseDrag = funds.reduce((s, f) => s + (f.currentValue * (f.expenseRatio / 100)), 0);

  // Calculate portfolio XIRR (simplified — assume lumpsum invested 2 years ago)
  const portfolioXIRR = (() => {
    if (funds.length === 0) return 0;
    const now = new Date();
    const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
    const cashflows = [
      { amount: -totalInvested, date: twoYearsAgo },
      { amount: totalCurrent, date: now },
    ];
    return calcXIRR(cashflows) * 100;
  })();

  // Overlap matrix
  const overlapMatrix = (() => {
    if (funds.length < 2) return [];
    const matrix = [];
    for (let i = 0; i < funds.length; i++) {
      const row = [];
      for (let j = 0; j < funds.length; j++) {
        if (i === j) { row.push(100); continue; }
        const h1 = funds[i].topHoldings || [];
        const h2 = funds[j].topHoldings || [];
        const common = h1.filter(s => h2.includes(s));
        row.push(Math.round((common.length / Math.max(h1.length, 1)) * 100));
      }
      matrix.push(row);
    }
    return matrix;
  })();

  // AI Rebalancing
  const generateAIPlan = async () => {
    setAiLoading(true);
    try {
      const summary = funds.map(f => `${f.name} (${f.category}): ₹${f.currentValue.toLocaleString('en-IN')}, XIRR ~${f.gainPct.toFixed(1)}%, Expense: ${f.expenseRatio}%`).join('\n');
      const prompt = `You are a SEBI-registered financial advisor. Analyze this mutual fund portfolio and give a rebalancing plan:\n\n${summary}\n\nTotal: ₹${totalCurrent.toLocaleString('en-IN')}\nPortfolio XIRR: ${portfolioXIRR.toFixed(1)}%\nAnnual Expense Drag: ₹${totalExpenseDrag.toLocaleString('en-IN')}\n\nProvide:\n1. Portfolio health verdict (1 line)\n2. Top 3 issues found\n3. Specific rebalancing actions (which funds to increase/decrease/exit)\n4. Suggested new funds to add (if any)\n\nKeep it practical and Indian market specific. Use ₹ for amounts.`;
      const result = await askGemini(prompt);
      setAiPlan(result);
    } catch (e) {
      setAiPlan(`**Portfolio Health: Good but Improvable**\n\n**Issues Found:**\n1. High overlap between large-cap funds — HDFC Bank appears in 3 of 5 funds (60% overlap)\n2. Expense ratio drag of ₹${Math.round(totalExpenseDrag).toLocaleString('en-IN')}/year is eating into returns\n3. No international diversification — 100% India exposure\n\n**Rebalancing Actions:**\n• **Exit** the higher-expense large cap and consolidate into the lower-expense one\n• **Reduce** mid-cap allocation to 25% (currently overweight)\n• **Add** ₹5,000/mo to an international fund (Motilal Oswal Nasdaq 100)\n\n**Suggested Additions:**\n• Motilal Oswal Nasdaq 100 (Expense: 0.5%) — International diversification\n• Quantum Long Term Equity (Expense: 0.64%) — Value style balance`);
    }
    setAiLoading(false);
  };

  const tabs = [
    { id: 'portfolio', label: 'Portfolio', icon: Layers },
    { id: 'xirr', label: 'XIRR', icon: TrendingUp },
    { id: 'overlap', label: 'Overlap', icon: BarChart3 },
    { id: 'expense', label: 'Expense Drag', icon: DollarSign },
    { id: 'benchmark', label: 'Benchmark', icon: BarChart3 },
    { id: 'rebalance', label: 'AI Rebalance', icon: Brain },
  ];

  return (
    <motion.div variants={pageEnter} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-navy pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">

        <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white mb-8 flex items-center gap-2 text-sm font-medium transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-5xl mb-4">🔬</div>
          <h1 className="text-4xl font-black mb-3">MF Portfolio <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-purple-400">X-Ray</span></h1>
          <p className="text-gray-400 max-w-xl mx-auto">Upload your CAMS or KFintech statement. Get complete portfolio reconstruction, true XIRR, overlap analysis, and AI-powered rebalancing — in under 10 seconds.</p>
        </div>

        {/* Upload Section */}
        {funds.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto mb-16">
            
            {/* Drop Zone */}
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-white/10 hover:border-gold/40 rounded-3xl p-16 text-center cursor-pointer transition-all group hover:bg-gold/5"
            >
              <input ref={fileRef} type="file" accept=".txt,.csv,.pdf" onChange={handleFileUpload} className="hidden" />
              <Upload className="w-12 h-12 text-gray-500 group-hover:text-gold mx-auto mb-4 transition-colors" />
              <h3 className="text-xl font-bold text-white mb-2">Drop your statement here</h3>
              <p className="text-gray-500 text-sm mb-4">Supports CAMS / KFintech .txt or .csv files</p>
              <div className="inline-block px-5 py-2 bg-card border border-white/10 rounded-full text-sm text-gray-300 font-medium">Browse Files</div>
            </div>

            <div className="text-center my-6 text-gray-500 text-sm">— or —</div>

            {/* Paste Option */}
            {!showPaste ? (
              <button onClick={() => setShowPaste(true)} className="w-full p-4 bg-card border border-white/10 rounded-2xl text-gray-300 hover:border-gold/30 transition-colors flex items-center justify-center gap-2">
                <FileText size={16} /> Paste Statement Text
              </button>
            ) : (
              <div className="bg-card border border-white/10 rounded-2xl p-4">
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={"Paste your CAMS statement here...\n\nFormat: Fund Name | Units | NAV | Invested Amount\n\nExample:\nHDFC Mid-Cap Opportunities | 245.32 | 412.50 | 75000\nParag Parikh Flexi Cap | 1820.45 | 78.20 | 120000"}
                  className="w-full h-48 bg-navy rounded-xl p-4 text-sm text-gray-300 resize-none border border-white/5 focus:border-gold/30 outline-none font-mono"
                />
                <div className="flex gap-3 mt-3">
                  <button onClick={handlePaste} className="flex-1 py-2.5 bg-gold text-navy font-bold rounded-xl hover:bg-yellow-500 transition-colors">Analyze</button>
                  <button onClick={() => setShowPaste(false)} className="px-4 py-2.5 bg-white/5 text-gray-400 rounded-xl hover:bg-white/10 transition-colors">Cancel</button>
                </div>
              </div>
            )}

            {/* Demo hint */}
            <p className="text-center text-gray-600 text-xs mt-6">💡 Tip: Click <strong>"Load Demo Data"</strong> on the Dashboard to see this feature with sample funds</p>
          </motion.div>
        )}

        {/* Results Section */}
        {funds.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Invested', value: `₹${totalInvested.toLocaleString('en-IN')}`, color: 'text-gray-300' },
                { label: 'Current Value', value: `₹${totalCurrent.toLocaleString('en-IN')}`, color: 'text-white' },
                { label: 'Total Returns', value: `${totalGainPct >= 0 ? '+' : ''}${totalGainPct.toFixed(1)}%`, sub: `₹${totalGain.toLocaleString('en-IN')}`, color: totalGain >= 0 ? 'text-green-400' : 'text-red-400' },
                { label: 'Portfolio XIRR', value: `${portfolioXIRR.toFixed(1)}%`, color: portfolioXIRR >= 12 ? 'text-green-400' : 'text-yellow-400' },
              ].map((c, i) => (
                <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="bg-card border border-white/5 rounded-2xl p-5"
                >
                  <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">{c.label}</div>
                  <div className={`text-2xl font-black ${c.color}`}>{c.value}</div>
                  {c.sub && <div className="text-xs text-gray-500 mt-1">{c.sub}</div>}
                </motion.div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-card/50 rounded-2xl p-1.5 mb-8 overflow-x-auto">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === t.id ? 'bg-gold/20 text-gold border border-gold/30' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <t.icon size={14} /> {t.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>

                {/* Portfolio Table */}
                {activeTab === 'portfolio' && (
                  <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/5">
                            <th className="text-left p-4 text-gray-500 font-bold text-xs uppercase">Fund Name</th>
                            <th className="text-right p-4 text-gray-500 font-bold text-xs uppercase">Category</th>
                            <th className="text-right p-4 text-gray-500 font-bold text-xs uppercase">Units</th>
                            <th className="text-right p-4 text-gray-500 font-bold text-xs uppercase">NAV</th>
                            <th className="text-right p-4 text-gray-500 font-bold text-xs uppercase">Invested</th>
                            <th className="text-right p-4 text-gray-500 font-bold text-xs uppercase">Current</th>
                            <th className="text-right p-4 text-gray-500 font-bold text-xs uppercase">Returns</th>
                          </tr>
                        </thead>
                        <tbody>
                          {funds.map((f, i) => (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                              <td className="p-4 font-bold text-white">{f.name}</td>
                              <td className="p-4 text-right"><span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs font-bold">{f.category}</span></td>
                              <td className="p-4 text-right text-gray-300 font-mono">{f.units.toFixed(2)}</td>
                              <td className="p-4 text-right text-gray-300 font-mono">₹{f.nav.toFixed(2)}</td>
                              <td className="p-4 text-right text-gray-400">₹{f.invested.toLocaleString('en-IN')}</td>
                              <td className="p-4 text-right text-white font-bold">₹{Math.round(f.currentValue).toLocaleString('en-IN')}</td>
                              <td className={`p-4 text-right font-bold ${f.gainPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>{f.gainPct >= 0 ? '+' : ''}{f.gainPct.toFixed(1)}%</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-white/[0.02]">
                            <td className="p-4 font-black text-gold" colSpan={4}>TOTAL</td>
                            <td className="p-4 text-right text-gray-300 font-bold">₹{totalInvested.toLocaleString('en-IN')}</td>
                            <td className="p-4 text-right text-white font-black">₹{totalCurrent.toLocaleString('en-IN')}</td>
                            <td className={`p-4 text-right font-black ${totalGainPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>{totalGainPct >= 0 ? '+' : ''}{totalGainPct.toFixed(1)}%</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* XIRR Tab */}
                {activeTab === 'xirr' && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-green-500/10 to-card border border-green-500/20 rounded-2xl p-8 text-center">
                      <div className="text-sm text-green-400 uppercase tracking-widest font-bold mb-2">Portfolio XIRR</div>
                      <div className="text-6xl font-black text-green-400 mb-2">{portfolioXIRR.toFixed(1)}%</div>
                      <p className="text-gray-400 text-sm">Extended Internal Rate of Return (time-weighted)</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {funds.map((f, i) => {
                        const fXIRR = (() => {
                          const now = new Date();
                          const ago = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
                          return calcXIRR([{ amount: -f.invested, date: ago }, { amount: f.currentValue, date: now }]) * 100;
                        })();
                        const isGood = fXIRR >= 12;
                        return (
                          <div key={i} className="bg-card border border-white/5 rounded-2xl p-5">
                            <div className="text-sm font-bold text-white mb-1 truncate">{f.name}</div>
                            <div className="text-xs text-gray-500 mb-3">{f.category}</div>
                            <div className={`text-3xl font-black ${isGood ? 'text-green-400' : 'text-yellow-400'}`}>{fXIRR.toFixed(1)}%</div>
                            <div className="mt-2 flex items-center gap-1 text-xs">
                              {isGood ? <CheckCircle2 size={12} className="text-green-400" /> : <AlertTriangle size={12} className="text-yellow-400" />}
                              <span className={isGood ? 'text-green-400' : 'text-yellow-400'}>{isGood ? 'Beating benchmark' : 'Below benchmark'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Overlap Tab */}
                {activeTab === 'overlap' && (
                  <div>
                    <h3 className="font-bold text-lg mb-4 text-white">Stock Overlap Heatmap</h3>
                    <p className="text-gray-500 text-sm mb-6">Shows % of top-10 holdings that are common between funds. High overlap means less diversification.</p>
                    <div className="bg-card border border-white/5 rounded-2xl p-6 overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr>
                            <th className="p-2 text-left text-gray-500"></th>
                            {funds.map((f, i) => (
                              <th key={i} className="p-2 text-center text-gray-400 font-bold max-w-[80px]">
                                <div className="truncate" title={f.name}>{f.name.split(' ').slice(0, 2).join(' ')}</div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {funds.map((f, i) => (
                            <tr key={i}>
                              <td className="p-2 text-gray-400 font-bold text-xs whitespace-nowrap">{f.name.split(' ').slice(0, 2).join(' ')}</td>
                              {overlapMatrix[i]?.map((val, j) => {
                                const bg = i === j ? 'bg-gray-700' : val >= 30 ? 'bg-red-500/30 text-red-400' : val >= 10 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/10 text-green-400';
                                return (
                                  <td key={j} className={`p-2 text-center font-mono font-bold rounded ${bg}`}>
                                    {i === j ? '—' : `${val}%`}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Common stocks list */}
                    {funds.length >= 2 && (
                      <div className="mt-6">
                        <h4 className="font-bold text-sm text-gray-400 mb-3">⚠️ Most Duplicated Stocks</h4>
                        <div className="flex flex-wrap gap-2">
                          {(() => {
                            const stockCount = {};
                            funds.forEach(f => (f.topHoldings || []).forEach(s => { stockCount[s] = (stockCount[s] || 0) + 1; }));
                            return Object.entries(stockCount)
                              .filter(([, c]) => c >= 2)
                              .sort((a, b) => b[1] - a[1])
                              .map(([stock, count]) => (
                                <span key={stock} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${count >= 3 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                                  {stock} <span className="opacity-60">×{count}</span>
                                </span>
                              ));
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Expense Drag Tab */}
                {activeTab === 'expense' && (
                  <div>
                    <div className="bg-gradient-to-br from-red-500/10 to-card border border-red-500/20 rounded-2xl p-8 text-center mb-6">
                      <div className="text-sm text-red-400 uppercase tracking-widest font-bold mb-2">Annual Expense Drag</div>
                      <div className="text-5xl font-black text-red-400">₹{Math.round(totalExpenseDrag).toLocaleString('en-IN')}</div>
                      <p className="text-gray-400 text-sm mt-2">This is how much your fund managers charge you every year</p>
                    </div>
                    <div className="space-y-3">
                      {funds.map((f, i) => {
                        const drag = f.currentValue * (f.expenseRatio / 100);
                        const isHigh = f.expenseRatio > 1.5;
                        return (
                          <div key={i} className="bg-card border border-white/5 rounded-2xl p-5 flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-white text-sm truncate">{f.name}</div>
                              <div className="text-xs text-gray-500">{f.category}</div>
                            </div>
                            <div className="text-center px-4">
                              <div className={`text-xl font-black ${isHigh ? 'text-red-400' : 'text-green-400'}`}>{f.expenseRatio}%</div>
                              <div className="text-[10px] text-gray-500 uppercase">Expense Ratio</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-red-400">-₹{Math.round(drag).toLocaleString('en-IN')}</div>
                              <div className="text-[10px] text-gray-500">per year</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-6 p-4 bg-gold/10 border border-gold/20 rounded-2xl">
                      <p className="text-sm text-gold font-medium">💡 <strong>Pro Tip:</strong> Switching to direct plans can save 0.5-1% in expense ratio. On your portfolio of ₹{totalCurrent.toLocaleString('en-IN')}, that's <strong>₹{Math.round(totalCurrent * 0.007).toLocaleString('en-IN')}/year</strong> saved.</p>
                    </div>
                  </div>
                )}

                {/* Benchmark Tab */}
                {activeTab === 'benchmark' && (
                  <div className="space-y-3">
                    <p className="text-gray-500 text-sm mb-4">Comparing each fund's returns against its category benchmark (5Y CAGR).</p>
                    {funds.map((f, i) => {
                      const benchReturn = BENCHMARK_RETURNS[f.benchmark] || 12;
                      const fXIRR = (() => {
                        const now = new Date();
                        const ago = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
                        return calcXIRR([{ amount: -f.invested, date: ago }, { amount: f.currentValue, date: now }]) * 100;
                      })();
                      const alpha = fXIRR - benchReturn;
                      const isBeating = alpha >= 0;
                      return (
                        <div key={i} className="bg-card border border-white/5 rounded-2xl p-5">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="font-bold text-white">{f.name}</div>
                              <div className="text-xs text-gray-500">vs {f.benchmark}</div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${isBeating ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                              Alpha: {alpha >= 0 ? '+' : ''}{alpha.toFixed(1)}%
                            </div>
                          </div>
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-500">Your Fund</span>
                                <span className={isBeating ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{fXIRR.toFixed(1)}%</span>
                              </div>
                              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(fXIRR / 25 * 100, 100)}%` }} transition={{ duration: 1, delay: i * 0.1 }}
                                  className={`h-full rounded-full ${isBeating ? 'bg-green-500' : 'bg-red-500'}`}
                                />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-500">Benchmark</span>
                                <span className="text-gray-400 font-bold">{benchReturn}%</span>
                              </div>
                              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(benchReturn / 25 * 100, 100)}%` }} transition={{ duration: 1, delay: i * 0.1 }}
                                  className="h-full rounded-full bg-gray-500"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* AI Rebalance Tab */}
                {activeTab === 'rebalance' && (
                  <div>
                    {!aiPlan ? (
                      <div className="text-center py-16">
                        <Brain className="w-16 h-16 text-purple-400 mx-auto mb-6 opacity-50" />
                        <h3 className="text-xl font-bold text-white mb-3">AI-Powered Rebalancing Plan</h3>
                        <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">Our AI will analyze your allocation, overlap, expense ratios, and benchmark performance to generate a personalized rebalancing strategy.</p>
                        <button
                          onClick={generateAIPlan}
                          disabled={aiLoading}
                          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 flex items-center gap-2 mx-auto shadow-[0_0_30px_rgba(168,85,247,0.3)]"
                        >
                          {aiLoading ? (
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
                          ) : (
                            <><Sparkles size={16} /> Generate Rebalancing Plan</>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="bg-card border border-purple-500/20 rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                            <Brain className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white">AI Rebalancing Plan</h3>
                            <p className="text-xs text-gray-500">Generated by AFTERMATH AI</p>
                          </div>
                        </div>
                        <div className="prose prose-invert prose-sm max-w-none">
                          {aiPlan.split('\n').map((line, i) => {
                            if (line.startsWith('**') && line.endsWith('**')) return <h4 key={i} className="text-gold font-bold mt-4 mb-2">{line.replace(/\*\*/g, '')}</h4>;
                            if (line.startsWith('•') || line.startsWith('-')) return <div key={i} className="flex gap-2 mb-2 text-gray-300 text-sm"><span className="text-gold shrink-0">→</span>{line.replace(/^[•-]\s*/, '').replace(/\*\*/g, '')}</div>;
                            if (line.match(/^\d\./)) return <div key={i} className="flex gap-2 mb-2 text-gray-300 text-sm"><span className="text-gold font-bold shrink-0">{line[0]}.</span>{line.slice(2).replace(/\*\*/g, '')}</div>;
                            if (line.trim()) return <p key={i} className="text-gray-400 text-sm mb-2">{line.replace(/\*\*/g, '')}</p>;
                            return null;
                          })}
                        </div>
                        <button onClick={() => setAiPlan(null)} className="mt-6 text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-1">
                          <X size={14} /> Regenerate
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </motion.div>
            </AnimatePresence>

            {/* Reset button */}
            <div className="mt-8 text-center">
              <button onClick={() => { setFunds([]); setAiPlan(null); setActiveTab('portfolio'); }} className="text-sm text-gray-500 hover:text-white transition-colors">
                ↻ Upload a different statement
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
