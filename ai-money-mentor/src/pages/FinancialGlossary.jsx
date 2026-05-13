import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GLOSSARY = [
  { category: 'Basics', terms: [
    { term: 'FIRE', full: 'Financial Independence, Retire Early', meaning: 'A movement focused on aggressive saving and investing to achieve financial freedom decades before traditional retirement age (60+). The goal is to accumulate 25-30x your annual expenses.' },
    { term: 'Net Worth', meaning: 'Total assets (savings, investments, property) minus total liabilities (loans, debts). A positive net worth means you own more than you owe.' },
    { term: 'Emergency Fund', meaning: 'A liquid savings reserve covering 6-12 months of essential expenses. Acts as a financial safety net against job loss, medical emergencies, or unexpected costs.' },
    { term: 'Inflation', meaning: 'The rate at which money loses purchasing power over time. In India, average inflation is ~6-7% per year — meaning ₹1,00,000 today will buy only ~₹50,000 worth of goods in 12 years.' },
    { term: 'Compound Interest', meaning: 'Earning interest on both your principal AND previously earned interest. It\'s the most powerful force in wealth building — ₹10,000/month at 12% becomes ₹1 Crore in ~20 years.' },
    { term: 'Savings Rate', meaning: 'Percentage of income saved/invested. A 20% savings rate is good, 40%+ is excellent. This single metric determines how fast you reach FIRE.' },
    { term: 'Liquidity', meaning: 'How quickly you can convert an asset into cash without significant loss. Savings accounts are highly liquid, real estate is not.' },
  ]},
  { category: 'Investments', terms: [
    { term: 'SIP', full: 'Systematic Investment Plan', meaning: 'A method of investing a fixed amount at regular intervals (usually monthly) into mutual funds. It automates investing and uses rupee cost averaging to reduce risk.' },
    { term: 'Mutual Fund', meaning: 'A pool of money collected from many investors, managed by a professional fund manager, and invested in stocks, bonds, or other securities. Common types: Equity, Debt, Hybrid.' },
    { term: 'ELSS', full: 'Equity Linked Savings Scheme', meaning: 'A tax-saving mutual fund with a 3-year lock-in period. Offers Section 80C deduction up to ₹1.5L/year AND potential for high market returns (12-15%+).' },
    { term: 'PPF', full: 'Public Provident Fund', meaning: 'Government-backed savings scheme with 15-year lock-in. Currently ~7.1% return, fully tax-free (EEE status). Safe but illiquid.' },
    { term: 'NPS', full: 'National Pension System', meaning: 'Government pension scheme with market-linked returns. Extra ₹50,000 deduction under 80CCD(1B) above 80C limit. Locked until age 60.' },
    { term: 'FD', full: 'Fixed Deposit', meaning: 'A bank deposit with a fixed interest rate for a set period. Currently ~6-7% return — often doesn\'t beat inflation after tax. Safest but worst long-term growth.' },
    { term: 'Equity', meaning: 'Ownership stake in a company via stocks. Higher risk, higher returns (12-15% long-term average in India). Best for goals 5+ years away.' },
    { term: 'Debt Fund', meaning: 'Mutual fund investing in bonds and government securities. Lower risk than equity (6-8% returns). Better than FD for tax efficiency on 3+ year holdings.' },
    { term: 'Index Fund', meaning: 'A mutual fund that mimics a market index (e.g., Nifty 50). Lower fees than active funds, often performs better than 80% of fund managers over 10+ years.' },
    { term: 'Liquid Fund', meaning: 'Ultra-short-term debt fund for parking idle cash. Better returns than savings account (~5-6%), can withdraw within 1 day. Ideal for emergency fund.' },
    { term: 'Rupee Cost Averaging', meaning: 'By investing a fixed amount regularly (SIP), you buy more units when prices are low and fewer when high. This averages out your purchase cost over time.' },
  ]},
  { category: 'Tax Planning', terms: [
    { term: 'Section 80C', meaning: 'Allows deduction up to ₹1,50,000/year from taxable income for investments like ELSS, PPF, EPF, life insurance premiums, and home loan principal repayment.' },
    { term: 'Section 80D', meaning: 'Deduction for health insurance premiums — up to ₹25,000 for self/family and additional ₹25,000-₹50,000 for parents. Reduces taxable income.' },
    { term: 'Section 24(b)', meaning: 'Deduction up to ₹2,00,000/year on home loan interest for self-occupied property. Both co-owners can claim separately for joint loans.' },
    { term: 'HRA', full: 'House Rent Allowance', meaning: 'Tax exemption on rent paid by salaried employees. Calculated as the lowest of: actual HRA received, rent paid minus 10% of salary, or 50%/40% of salary (metro/non-metro).' },
    { term: 'Old vs New Tax Regime', meaning: 'Old regime allows deductions (80C, 80D, HRA) but has higher base rates. New regime has lower rates but no deductions. Choose based on your total deductions — if >₹3.75L, old regime is usually better.' },
    { term: 'TDS', full: 'Tax Deducted at Source', meaning: 'Tax automatically deducted by your employer or bank before paying you. Filed in Form 16 (salary) or Form 16A (other income).' },
    { term: 'Capital Gains Tax', meaning: 'Tax on profit from selling assets. Short-term (<1 year for equity, <2 years for property) taxed at higher rates. Long-term equity gains above ₹1L taxed at 10%.' },
    { term: 'LTCG/STCG', full: 'Long Term / Short Term Capital Gains', meaning: 'LTCG: Gains from holding equity >1 year — taxed at 10% above ₹1L. STCG: Gains from equity held <1 year — taxed at 15%.' },
  ]},
  { category: 'Insurance', terms: [
    { term: 'Term Insurance', meaning: 'Pure life insurance — pays a lump sum to your family if you die during the policy term. Cheapest form of insurance. A 28-year-old can get ₹1Cr cover for ~₹700/month.' },
    { term: 'Health Insurance', meaning: 'Covers hospitalization and medical expenses. Essential to have a personal policy even with employer coverage — employer coverage ends when you leave the job.' },
    { term: 'Family Floater', meaning: 'A single health insurance policy covering the entire family (spouse + children) under one sum insured. More affordable than individual policies for each member.' },
    { term: 'MWP Act', full: 'Married Women\'s Property Act', meaning: 'A legal provision that protects term insurance proceeds strictly for wife and children. Creditors cannot claim the death benefit.' },
    { term: 'Claim Ratio', meaning: 'Percentage of insurance claims settled by the company. Higher is better. Always check this before buying — anything above 95% is good.' },
  ]},
  { category: 'Debt Management', terms: [
    { term: 'EMI', full: 'Equated Monthly Installment', meaning: 'Fixed monthly payment for a loan that includes both principal and interest. Higher EMI = faster repayment = less total interest paid.' },
    { term: 'Credit Score', meaning: 'A 3-digit number (300-900) representing your creditworthiness. 750+ is considered good. Affects loan approval and interest rates. Check free on CIBIL website.' },
    { term: 'Debt-to-Income Ratio', meaning: 'Total monthly debt payments divided by gross monthly income. Should be below 40%. Lenders use this to assess your borrowing capacity.' },
    { term: 'Prepayment', meaning: 'Paying extra towards your loan principal above the EMI. Even small prepayments can save lakhs in interest and reduce loan tenure by years.' },
    { term: 'Credit Card APR', meaning: 'Annual interest rate on unpaid credit card balance — typically 36-42% in India. Always pay full balance. Minimum payment is a debt trap.' },
    { term: 'Debt Avalanche', meaning: 'Strategy of paying off debts starting from the highest interest rate first. Mathematically optimal — saves the most money in interest.' },
    { term: 'Debt Snowball', meaning: 'Strategy of paying off smallest debts first for psychological wins and motivation. Less optimal than avalanche but builds momentum.' },
  ]},
  { category: 'AFTERMATH Features', terms: [
    { term: 'Financial Obituary', meaning: 'A shock feature that shows what happens to your money if you never start investing. Appears after 60 seconds of inactivity to jolt you into action.' },
    { term: 'Money Time Machine', meaning: 'Interactive tool showing how investments would have grown if started in any year from 1990-2040. Spin the dial to see past/future scenarios.' },
    { term: 'Budget Roast', meaning: 'AI-powered feature that savagely critiques your spending habits and provides a personalized action plan to fix them.' },
    { term: 'Spending Villain', meaning: 'Identifies your biggest money-wasting habit and assigns it a villain character. Then provides a step-by-step plan to "defeat" it.' },
    { term: 'Fear Index', meaning: 'A psychological quiz that profiles your money anxiety type — Ostrich, Hoarder, Gambler, or Monk — and gives tailored strategies.' },
    { term: 'Regret Engine', meaning: 'Shows the real cost of common financial excuses like "I\'ll start SIP next year" or "I don\'t need insurance yet" in hard rupee numbers.' },
    { term: '₹1 Crore Challenge', meaning: 'Gamified countdown showing exactly how much monthly SIP and how many years you need to reach your first ₹1 Crore.' },
    { term: 'Midnight Mirror', meaning: 'A reflective prompt that appears between 11 PM - 2 AM asking deep financial questions to encourage introspection.' },
    { term: 'Compatibility Score', meaning: 'In Couples Mode, measures how aligned two partners are in their savings rates. 80%+ means great financial compatibility.' },
    { term: 'Passive Income Freedom', meaning: 'The percentage of your monthly expenses covered by passive income sources (FD interest, dividends, rental income). 100% = financial freedom.' },
  ]},
];

export default function FinancialGlossary() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...GLOSSARY.map(g => g.category)];

  const filtered = GLOSSARY.map(group => ({
    ...group,
    terms: group.terms.filter(t =>
      (activeCategory === 'All' || group.category === activeCategory) &&
      (search === '' ||
        t.term.toLowerCase().includes(search.toLowerCase()) ||
        t.meaning.toLowerCase().includes(search.toLowerCase()) ||
        (t.full && t.full.toLowerCase().includes(search.toLowerCase()))
      )
    )
  })).filter(g => g.terms.length > 0);

  const totalTerms = GLOSSARY.reduce((acc, g) => acc + g.terms.length, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-navy text-white pt-24 pb-32 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <BookOpen className="w-10 h-10 text-gold mx-auto mb-3" />
          <h1 className="text-4xl font-extrabold mb-2">Financial Glossary</h1>
          <p className="text-gray-400">{totalTerms} essential terms every Indian investor should know</p>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-lg mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search any term..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-card border border-white/10 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-gold text-white placeholder:text-gray-600"
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                activeCategory === cat
                  ? 'bg-gold text-navy'
                  : 'bg-card border border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Terms */}
        <div className="space-y-8">
          {filtered.map(group => (
            <div key={group.category}>
              <h3 className="text-xs uppercase tracking-[0.2em] text-gold font-bold mb-4 border-b border-white/5 pb-2">{group.category}</h3>
              <div className="space-y-2">
                {group.terms.map((t, i) => (
                  <motion.div
                    key={t.term}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-card border border-white/5 rounded-xl p-5 hover:border-gold/20 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0">
                        <span className="text-lg font-black text-gold">{t.term}</span>
                        {t.full && <span className="text-xs text-gray-500 ml-2">({t.full})</span>}
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mt-2 leading-relaxed">{t.meaning}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-600">
              <p className="text-xl mb-2">No terms found</p>
              <p className="text-sm">Try a different search or category</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
