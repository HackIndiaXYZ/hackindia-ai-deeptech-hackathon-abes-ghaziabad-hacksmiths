import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Flame, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const CATEGORIES = ['Food Delivery', 'Shopping', 'Subscriptions', 'Travel', 'Groceries', 'Rent/EMI', 'Entertainment', 'Investments', 'Insurance', 'Other'];

export default function BudgetRoast() {
  const navigate = useNavigate();
  const { state } = useApp();
  const demoB = state.demoData?.budget;
  const [spending, setSpending] = useState(demoB ? {
    'Food Delivery': demoB.foodDelivery,
    'Shopping': demoB.shopping,
    'Subscriptions': demoB.subscriptions,
    'Travel': demoB.travel,
    'Groceries': demoB.groceries,
    'Rent/EMI': 15000,
    'Entertainment': demoB.entertainment,
    'Investments': 25000,
    'Insurance': 2000,
    'Other': demoB.others,
  } : {});
  const [roasted, setRoasted] = useState(false);

  useEffect(() => {
    if (state.demoData?.budget) {
      const b = state.demoData.budget;
      setSpending({
        'Food Delivery': b.foodDelivery,
        'Shopping': b.shopping,
        'Subscriptions': b.subscriptions,
        'Travel': b.travel,
        'Groceries': b.groceries,
        'Rent/EMI': 15000,
        'Entertainment': b.entertainment,
        'Investments': 25000,
        'Insurance': 2000,
        'Other': b.others,
      });
    }
  }, [state.demoData]);

  const updateCat = (cat, val) => setSpending({...spending, [cat]: parseInt(val) || 0});

  const total = Object.values(spending).reduce((a, b) => a + b, 0);
  const investAmt = spending['Investments'] || 0;
  const foodDel = spending['Food Delivery'] || 0;
  const subs = spending['Subscriptions'] || 0;
  const shop = spending['Shopping'] || 0;
  const ent = spending['Entertainment'] || 0;

  const roasts = [];
  if (foodDel > investAmt && foodDel > 0) roasts.push(`Bro, you spent ₹${foodDel.toLocaleString('en-IN')} on food delivery but only ₹${investAmt.toLocaleString('en-IN')} on investments. You're literally paying a 2-hour delivery fee to fund someone ELSE's retirement while yours rots. 🍕💀`);
  if (subs > 0 && investAmt < subs * 2) roasts.push(`Your Netflix + Spotify + Hotstar combined costs ₹${subs.toLocaleString('en-IN')}/month. That's more than your emergency fund grows. You're watching other people's success stories while writing your own financial tragedy. 📺😭`);
  if (shop > total * 0.15) roasts.push(`₹${shop.toLocaleString('en-IN')} on shopping? You're collecting things you don't need, bought with money you don't have, to impress people who don't care. If you invested half that, you'd have ₹${(shop * 6 * 15).toLocaleString('en-IN')} in 10 years. 🛍️💸`);
  if (foodDel >= 8000) roasts.push(`₹${foodDel.toLocaleString('en-IN')} on Zomato/Swiggy. At this rate, your delivery guy is building more wealth than you because he's WORKING while you're on the couch deciding between Butter Chicken and Paneer Tikka. 🛵`);
  if (ent > investAmt) roasts.push(`You spent more on entertainment (₹${ent.toLocaleString('en-IN')}) than investments (₹${investAmt.toLocaleString('en-IN')}). Your future self is NOT entertained. In fact, your future self is the one working at 65 because present-you wanted to have fun. 🎭`);
  if (investAmt === 0) roasts.push(`ZERO invested. ₹0. Not even ₹500. Your future retirement plan is basically hoping your kids will take care of you. Bold strategy, let's see if it pays off. (Spoiler: it won't.) 🚨`);
  if (total > 0 && investAmt / total < 0.1) roasts.push(`You invest ${Math.round((investAmt/total)*100)}% of your spending. The average Indian street dog has better financial planning because at least it saves its bones for later. 🐕`);

  // Action plan
  const actions = [];
  if (foodDel > 5000) actions.push({ action: `Cut food delivery by 50% — save ₹${Math.round(foodDel*0.5).toLocaleString('en-IN')}/month`, impact: `₹${(foodDel * 0.5 * 12 * 15).toLocaleString('en-IN')} in 10 years` });
  if (subs > 1000) actions.push({ action: 'Audit subscriptions — keep max 2, cancel rest', impact: `Save ₹${Math.round(subs * 0.5 * 12).toLocaleString('en-IN')}/year` });
  if (shop > 5000) actions.push({ action: '48-hour rule: wait 48hrs before any purchase over ₹2000', impact: 'Eliminates 60% of impulse buys' });
  if (investAmt < total * 0.2) actions.push({ action: `Invest at least 20% of income = ₹${Math.round(total * 0.2).toLocaleString('en-IN')}/month`, impact: `₹${Math.round(total * 0.2 * 12 * 20).toLocaleString('en-IN')} corpus in 20 years` });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-navy text-white pt-24 pb-32 px-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            <Flame className="inline w-10 h-10 text-orange-500 mr-2 -mt-1" /> AI Budget Roast
          </h1>
          <p className="text-gray-400">Enter your spending. Get absolutely destroyed. Then get fixed.</p>
        </div>

        {!roasted ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {CATEGORIES.map(cat => (
              <div key={cat} className="flex items-center gap-4 bg-card p-4 rounded-xl border border-white/5">
                <span className="text-sm font-medium text-gray-300 w-32 shrink-0">{cat}</span>
                <input type="number" placeholder="₹ 0" value={spending[cat] || ''} onChange={e => updateCat(cat, e.target.value)}
                  className="flex-1 bg-navy border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-gold text-right" />
              </div>
            ))}
            <button onClick={() => total > 0 && setRoasted(true)}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 rounded-xl transition-colors mt-6">
              🔥 Roast Me
            </button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {/* Roasts */}
            <div className="space-y-4">
              {roasts.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.5 }}
                  className="bg-red-900/20 p-6 rounded-2xl border border-red-500/20 text-sm leading-relaxed text-gray-200"
                >
                  {r}
                </motion.div>
              ))}
              {roasts.length === 0 && (
                <div className="bg-green-900/20 p-6 rounded-2xl border border-green-500/20 text-center text-green-400">
                  Hmm... your spending actually looks reasonable. I can't roast you. Are you sure you entered everything? 🤔
                </div>
              )}
            </div>

            {/* Tone shift */}
            {actions.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: roasts.length * 0.5 + 1 }}>
                <div className="text-center py-6">
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-4" />
                  <p className="text-gray-500 text-sm italic mb-1">Okay, roast over. Let's actually fix your life.</p>
                  <Sparkles className="w-6 h-6 text-gold mx-auto" />
                </div>

                <div className="space-y-3">
                  {actions.map((a, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: roasts.length * 0.5 + 1.5 + i * 0.2 }}
                      className="bg-card p-5 rounded-2xl border border-gold/20 flex items-center gap-4"
                    >
                      <div className="w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center text-gold font-bold text-sm shrink-0">{i+1}</div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{a.action}</div>
                        <div className="text-xs text-gold mt-1">{a.impact}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            <button onClick={() => { setRoasted(false); setSpending({}); }}
              className="w-full bg-card border border-white/10 text-gray-400 font-medium py-3 rounded-xl hover:text-white transition-colors">
              ← Try Different Numbers
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
