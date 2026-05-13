import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Briefcase, TrendingUp, MessageSquare, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const MARKET_DATA = {
  'Software Engineer': { '0-2': 600000, '2-5': 1200000, '5-10': 2400000, '10+': 4000000 },
  'Data Analyst': { '0-2': 450000, '2-5': 900000, '5-10': 1800000, '10+': 2800000 },
  'Product Manager': { '0-2': 800000, '2-5': 1500000, '5-10': 3000000, '10+': 5000000 },
  'Marketing Manager': { '0-2': 400000, '2-5': 800000, '5-10': 1600000, '10+': 2600000 },
  'Finance Analyst': { '0-2': 500000, '2-5': 1000000, '5-10': 2000000, '10+': 3500000 },
  'Designer': { '0-2': 400000, '2-5': 900000, '5-10': 1800000, '10+': 2800000 },
  'Sales Executive': { '0-2': 350000, '2-5': 700000, '5-10': 1400000, '10+': 2200000 },
  'HR Manager': { '0-2': 400000, '2-5': 800000, '5-10': 1500000, '10+': 2400000 },
};

const CITY_MULT = { 'Mumbai': 1.15, 'Bangalore': 1.1, 'Delhi': 1.05, 'Hyderabad': 1.0, 'Pune': 0.98, 'Chennai': 0.95, 'Kolkata': 0.9, 'Other': 0.85 };

export default function SalaryCoach() {
  const navigate = useNavigate();
  const { state } = useApp();
  const demoS = state.demoData?.salary;
  const [step, setStep] = useState('input');
  const [form, setForm] = useState(demoS ? { salary: String(demoS.currentSalary * 12), title: demoS.jobTitle, experience: '2-5', city: demoS.city, company: 'product' } : { salary: '', title: 'Software Engineer', experience: '2-5', city: 'Bangalore', company: 'product' });
  const [chat, setChat] = useState([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (state.demoData?.salary) {
      const d = state.demoData.salary;
      setForm({ salary: String(d.currentSalary * 12), title: d.jobTitle, experience: '2-5', city: d.city, company: 'product' });
    }
  }, [state.demoData]);

  const currentSalary = parseInt(form.salary) || 0;
  const expKey = form.experience;
  const baseMarket = (MARKET_DATA[form.title] || MARKET_DATA['Software Engineer'])[expKey] || 1200000;
  const cityMult = CITY_MULT[form.city] || 1;
  const compMult = form.company === 'product' ? 1.1 : form.company === 'startup' ? 1.05 : 0.95;
  const marketSalary = Math.round(baseMarket * cityMult * compMult);
  const gap = marketSalary - currentSalary;
  const gapMonthly = Math.round(gap / 12);
  const lifetimeLoss = Math.round(gap * 20 * 1.5); // 20 years compounded roughly
  const compounded20yr = Math.round((gapMonthly * ((Math.pow(1 + 0.01, 240) - 1) / 0.01)));

  const scripts = [
    `"I've been reviewing market compensation data for ${form.title} roles in ${form.city} with ${form.experience} years of experience. The market range is ₹${(marketSalary * 0.9 / 100000).toFixed(1)}L to ₹${(marketSalary * 1.15 / 100000).toFixed(1)}L. Given my contributions, I'd like to discuss aligning my compensation closer to ₹${(marketSalary / 100000).toFixed(1)}L."`,
    `"In the last year, I've [mention 2-3 specific achievements]. These directly impacted [revenue/efficiency/team]. I believe a revision of ₹${gapMonthly.toLocaleString('en-IN')}/month reflects the value I bring."`,
    `"I'm committed to this role and want to grow here. I'm not comparing with outside offers — I'm asking for fair market compensation. Can we work together to make this happen?"`,
  ];

  const managerResponses = [
    { trigger: '', response: "Okay, what did you want to discuss? I have a few minutes." },
    { trigger: '', response: "I appreciate you bringing this up. Unfortunately, we've already finalized the appraisal cycle numbers. What makes you feel your current pay doesn't reflect your role?" },
    { trigger: '', response: "Those are fair points. Let me be honest — budgets are tight this quarter. However, I can push for a mid-year correction. Would a 15% increase with a guaranteed 6-month review work?" },
    { trigger: '', response: "I hear you. Let me take this to HR and leadership. I'll have a concrete answer by next Friday. Your work has been noticed and I want to make sure we retain you." },
  ];

  const sendMessage = () => {
    if (!msg.trim()) return;
    const newChat = [...chat, { role: 'user', text: msg }];
    const responseIndex = Math.min(newChat.filter(m => m.role === 'manager').length, managerResponses.length - 1);
    setTimeout(() => {
      setChat(prev => [...prev, { role: 'manager', text: managerResponses[responseIndex].response }]);
    }, 1000);
    setChat(newChat);
    setMsg('');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-navy text-white pt-24 pb-32 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            <Briefcase className="inline w-10 h-10 text-gold mr-2 -mt-1" /> Salary Negotiation Coach
          </h1>
          <p className="text-gray-400">Know your worth. Practice your pitch. Get paid right.</p>
        </div>

        {step === 'input' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg mx-auto space-y-4">
            <input type="number" placeholder="Current Annual Salary (₹)" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})}
              className="w-full bg-card border border-white/10 rounded-xl p-4 text-white focus:border-gold outline-none" />
            <select value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              className="w-full bg-card border border-white/10 rounded-xl p-4 text-white focus:border-gold outline-none">
              {Object.keys(MARKET_DATA).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={form.experience} onChange={e => setForm({...form, experience: e.target.value})}
              className="w-full bg-card border border-white/10 rounded-xl p-4 text-white focus:border-gold outline-none">
              {['0-2', '2-5', '5-10', '10+'].map(e => <option key={e} value={e}>{e} years</option>)}
            </select>
            <select value={form.city} onChange={e => setForm({...form, city: e.target.value})}
              className="w-full bg-card border border-white/10 rounded-xl p-4 text-white focus:border-gold outline-none">
              {Object.keys(CITY_MULT).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={form.company} onChange={e => setForm({...form, company: e.target.value})}
              className="w-full bg-card border border-white/10 rounded-xl p-4 text-white focus:border-gold outline-none">
              <option value="product">Product Company</option>
              <option value="startup">Startup</option>
              <option value="service">Service/IT</option>
            </select>
            <button onClick={() => currentSalary > 0 && setStep('results')}
              className="w-full bg-gold text-navy font-bold py-4 rounded-xl hover:bg-yellow-400 transition-colors">
              Analyze My Salary →
            </button>
          </motion.div>
        )}

        {step === 'results' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {/* Comparison */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card p-8 rounded-3xl border border-red-500/20 text-center">
                <div className="text-xs text-red-400 uppercase tracking-widest mb-3">You're Earning</div>
                <div className="text-4xl font-black text-red-400">₹{(currentSalary/100000).toFixed(1)}L</div>
                <div className="text-xs text-gray-500 mt-1">/year</div>
              </div>
              <div className="bg-card p-8 rounded-3xl border border-green-500/20 text-center">
                <div className="text-xs text-green-400 uppercase tracking-widest mb-3">You Should Earn</div>
                <div className="text-4xl font-black text-green-400">₹{(marketSalary/100000).toFixed(1)}L</div>
                <div className="text-xs text-gray-500 mt-1">/year (market median)</div>
              </div>
            </div>

            {gap > 0 && (
              <div className="bg-card p-6 rounded-2xl border border-gold/20 text-center">
                <div className="text-sm text-gray-400 mb-2">Lifetime wealth loss from being underpaid</div>
                <div className="text-3xl font-black text-gold">₹{(compounded20yr / 10000000).toFixed(1)} Cr</div>
                <div className="text-xs text-gray-500 mt-1">Over 20 years (₹{gapMonthly.toLocaleString('en-IN')}/mo invested at 12%)</div>
              </div>
            )}

            {/* Scripts */}
            <div>
              <h3 className="text-xl font-bold mb-4">📋 Your Negotiation Script</h3>
              <div className="space-y-3">
                {scripts.map((s, i) => (
                  <div key={i} className="bg-card p-5 rounded-2xl border border-white/5 text-sm text-gray-300 leading-relaxed italic">
                    Step {i + 1}: {s}
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => { setStep('roleplay'); setChat([{ role: 'manager', text: managerResponses[0].response }]); }}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
              <MessageSquare size={18} /> Practice Negotiation (Role-Play) →
            </button>
          </motion.div>
        )}

        {step === 'roleplay' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
            <div className="bg-card rounded-3xl border border-white/10 overflow-hidden">
              <div className="p-4 border-b border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">M</div>
                <div>
                  <div className="text-sm font-bold">Your Manager</div>
                  <div className="text-xs text-gray-500">Role-play mode</div>
                </div>
              </div>
              <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                {chat.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      m.role === 'user' ? 'bg-gold/20 text-gold rounded-br-none' : 'bg-white/5 text-gray-300 rounded-bl-none'
                    }`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-white/10 flex gap-2">
                <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your negotiation response..." className="flex-1 bg-navy border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-gold" />
                <button onClick={sendMessage} className="bg-gold text-navy p-3 rounded-xl hover:bg-yellow-400"><Send size={18} /></button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
