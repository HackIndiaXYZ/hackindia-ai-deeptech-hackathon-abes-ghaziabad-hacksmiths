import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, TrendingUp, Trophy, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function RealEstateVsSIP() {
  const navigate = useNavigate();
  const { state } = useApp();
  const demoR = state.demoData?.reVsSip;
  const [propertyPrice, setPropertyPrice] = useState(demoR?.propertyPrice || 5000000);
  const [rentalYield, setRentalYield] = useState(2.5);
  const [appreciation, setAppreciation] = useState(6);
  const [sipReturn, setSipReturn] = useState(demoR?.sipReturn || 12);
  const [loanRate, setLoanRate] = useState(demoR?.loanRate || 8.5);
  const [years] = useState(20);

  useEffect(() => {
    if (state.demoData?.reVsSip) {
      const d = state.demoData.reVsSip;
      setPropertyPrice(d.propertyPrice);
      setLoanRate(d.loanRate);
      setSipReturn(d.sipReturn);
    }
  }, [state.demoData]);

  // Real Estate calc
  const downPayment = propertyPrice * 0.2;
  const loanAmount = propertyPrice * 0.8;
  const emiRate = loanRate / 100 / 12;
  const emiMonths = years * 12;
  const emi = Math.round(loanAmount * emiRate * Math.pow(1 + emiRate, emiMonths) / (Math.pow(1 + emiRate, emiMonths) - 1));
  const totalEmiPaid = emi * emiMonths;
  const maintenanceCost = propertyPrice * 0.01 * years;
  const propertyTax = propertyPrice * 0.002 * years;
  const totalRealEstateCost = downPayment + totalEmiPaid + maintenanceCost + propertyTax;
  const futurePropertyValue = Math.round(propertyPrice * Math.pow(1 + appreciation / 100, years));
  const totalRent = Math.round(propertyPrice * (rentalYield / 100) * ((Math.pow(1 + 0.05, years) - 1) / 0.05));
  const realEstateWealth = futurePropertyValue + totalRent - totalEmiPaid - maintenanceCost - propertyTax;

  // SIP calc - invest EMI amount
  const sipMonthly = emi;
  const sipRate = sipReturn / 100 / 12;
  const sipWealth = Math.round(downPayment * Math.pow(1 + sipRate, emiMonths) + sipMonthly * ((Math.pow(1 + sipRate, emiMonths) - 1) / sipRate));

  const winner = sipWealth > realEstateWealth ? 'sip' : 'realestate';
  const margin = Math.abs(sipWealth - realEstateWealth);

  const milestones = [5, 10, 15, 20].map(y => {
    const m = y * 12;
    const propVal = Math.round(propertyPrice * Math.pow(1 + appreciation / 100, y));
    const sipVal = Math.round(downPayment * Math.pow(1 + sipRate, m) + sipMonthly * ((Math.pow(1 + sipRate, m) - 1) / sipRate));
    return { year: y, property: propVal, sip: sipVal };
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-navy text-white pt-24 pb-32 px-4">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">Real Estate vs SIP Battle</h1>
          <p className="text-gray-400">The ultimate Indian personal finance showdown. 20-year simulation.</p>
        </div>

        {/* Sliders */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Property Price', value: propertyPrice, set: setPropertyPrice, min: 1000000, max: 50000000, step: 500000, display: `₹${(propertyPrice/10000000).toFixed(1)}Cr` },
            { label: 'Property Appreciation', value: appreciation, set: setAppreciation, min: 2, max: 15, step: 0.5, display: `${appreciation}%/yr` },
            { label: 'Rental Yield', value: rentalYield, set: setRentalYield, min: 1, max: 6, step: 0.5, display: `${rentalYield}%` },
            { label: 'SIP Return', value: sipReturn, set: setSipReturn, min: 8, max: 18, step: 0.5, display: `${sipReturn}%/yr` },
          ].map(s => (
            <div key={s.label} className="bg-card p-4 rounded-xl border border-white/5">
              <div className="text-xs text-gray-500 mb-2">{s.label}</div>
              <input type="range" min={s.min} max={s.max} step={s.step} value={s.value} onChange={e => s.set(+e.target.value)} className="w-full accent-gold mb-1" />
              <div className="text-lg font-bold text-gold">{s.display}</div>
            </div>
          ))}
        </div>

        {/* Winner */}
        <motion.div key={winner} initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-card p-8 rounded-3xl border border-gold/20 text-center mb-12">
          <Trophy className="w-12 h-12 text-gold mx-auto mb-4" />
          <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">After {years} Years, The Winner Is</div>
          <div className="text-3xl md:text-4xl font-black text-gold mb-2">
            {winner === 'sip' ? '📈 Team SIP' : '🏠 Team Real Estate'}
          </div>
          <div className="text-sm text-gray-400">By a margin of ₹{(margin / 100000).toFixed(1)}L</div>
        </motion.div>

        {/* Battle comparison */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className={`p-8 rounded-3xl border ${winner === 'realestate' ? 'border-green-500/30 bg-green-900/5' : 'border-white/5 bg-card'}`}>
            <Home className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold mb-4">🏠 Real Estate</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Property Value</span><span className="text-green-400">₹{(futurePropertyValue/100000).toFixed(0)}L</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Rental Income</span><span className="text-green-400">₹{(totalRent/100000).toFixed(0)}L</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Total EMI Paid</span><span className="text-red-400">-₹{(totalEmiPaid/100000).toFixed(0)}L</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Maintenance + Tax</span><span className="text-red-400">-₹{((maintenanceCost+propertyTax)/100000).toFixed(0)}L</span></div>
              <div className="border-t border-white/10 pt-2 flex justify-between font-bold">
                <span>Net Wealth</span><span className="text-gold">₹{(realEstateWealth/100000).toFixed(0)}L</span>
              </div>
            </div>
          </div>
          <div className={`p-8 rounded-3xl border ${winner === 'sip' ? 'border-green-500/30 bg-green-900/5' : 'border-white/5 bg-card'}`}>
            <TrendingUp className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="text-xl font-bold mb-4">📈 SIP</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Monthly SIP</span><span>₹{emi.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">SIP Return Rate</span><span>{sipReturn}% CAGR</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Total Invested</span><span>₹{((downPayment + emi * emiMonths)/100000).toFixed(0)}L</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Liquidity</span><span className="text-green-400">100% liquid</span></div>
              <div className="border-t border-white/10 pt-2 flex justify-between font-bold">
                <span>Net Wealth</span><span className="text-gold">₹{(sipWealth/100000).toFixed(0)}L</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5-year milestones */}
        <h3 className="text-xl font-bold mb-4 text-center">Battle Timeline</h3>
        <div className="grid grid-cols-4 gap-3">
          {milestones.map(m => (
            <div key={m.year} className="bg-card p-4 rounded-xl border border-white/5 text-center">
              <div className="text-xs text-gray-500 mb-2">Year {m.year}</div>
              <div className="text-sm font-bold text-blue-400 mb-1">🏠 ₹{(m.property/100000).toFixed(0)}L</div>
              <div className="text-sm font-bold text-green-400">📈 ₹{(m.sip/100000).toFixed(0)}L</div>
              <div className="text-[10px] text-gray-600 mt-1">{m.sip > m.property ? 'SIP leads' : 'RE leads'}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
