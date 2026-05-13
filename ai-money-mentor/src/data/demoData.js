// Comprehensive demo data for all AFTERMATH features

export const DEMO_USER = {
  name: 'Rahul Sharma',
  age: 28,
  city: 'Bangalore',
  income: 85000,
  monthlyIncome: 85000,
  expenses: 55000,
  monthlyExpenses: 55000,
  emergencyFund: 200000,
  termInsurance: false,
  healthInsurance: 'employer only',
  mutualFunds: 50000,
  investments: 50000,
  fd: 0,
  stocks: 0,
  gold: 0,
  debt: 300000,
  debtAmount: 300000,
  emi: 10300,
  savingsAccount: 120000,
  jobTitle: 'Software Engineer',
  companyType: 'Product',
  yearsExperience: 5,
};

export const DEMO_HEALTH_SCORE = {
  score: 72,
  verdict: "You have a solid foundation with strong savings, but critical gaps in insurance and tax optimization are holding you back.",
  percentile: 68,
  strength: "Strong savings habit — 35% of income invested monthly",
  weakness: "Under-utilized 80C limit and no term life insurance",
  personality: "Balanced Builder",
  dimensions: [
    { name: 'Emergency Fund', score: 55, max: 100, desc: 'Covers 3.6 months — needs 6 months minimum' },
    { name: 'Insurance', score: 30, max: 100, desc: 'No term insurance, only employer health coverage' },
    { name: 'Debt Health', score: 65, max: 100, desc: '₹3L personal loan at 12%, EMI ₹10,300' },
    { name: 'Investment Rate', score: 75, max: 100, desc: 'Saving 35% of income — solid but can optimize' },
    { name: 'Tax Efficiency', score: 40, max: 100, desc: 'Not utilizing 80C/80D fully' },
    { name: 'Retirement Readiness', score: 60, max: 100, desc: 'SIP ₹50K/mo, need ₹5Cr for FIRE at 45' },
  ],
  actions: [
    { title: 'Open a PPF Account', desc: 'Start contributing to PPF to max out 80C and get risk-free tax-free returns.', time: '15 mins', impact: 46000 },
    { title: 'Buy ₹1Cr Term Insurance', desc: 'Premium ~₹700/mo at age 28. Pure term life insurance protects your family.', time: '30 mins', impact: 10000000 },
    { title: 'Increase SIP by ₹5K', desc: 'Take monthly SIP from ₹50K to ₹55K — adds ₹42L over 20 years.', time: '10 mins', impact: 4200000 },
    { title: 'Build Emergency Fund', desc: 'Move your ₹2L savings into a separate sweep-in FD for instant liquidity.', time: '20 mins', impact: 10000 },
    { title: 'Claim HRA Exemption', desc: 'Submit your rent receipts to your employer immediately for tax savings.', time: '5 mins', impact: 25000 },
  ],
};

export const DEMO_PERSONALITY = {
  type: 'Balanced Builder',
  personality: 'Balanced Builder',
  match: 89,
  emoji: '🏗️',
  description: 'You are methodical and disciplined. You save consistently but sometimes miss aggressive wealth-building opportunities.',
  strength: 'High savings velocity with diversified core holdings',
  weakness: 'Under-invested in equity and missing tax optimizations',
  tip: 'Shift liquid funds to arbitrage for better post-tax returns and increase equity allocation to 60%.',
  strengths: ['Consistent saver', 'Low debt tolerance', 'Emergency fund conscious'],
  weaknesses: ['Under-invested in equity', 'Missing tax optimizations', 'No insurance safety net'],
};

// Couples Mode demo
export const DEMO_COUPLES = {
  partner1: { name: 'Rahul', income: '85000', investments: '25000', sec80c: '50000', hra: 'paying' },
  partner2: { name: 'Priya', income: '65000', investments: '15000', sec80c: '30000', hra: 'none' },
};

// Budget Roast demo
export const DEMO_BUDGET = {
  foodDelivery: 8000,
  shopping: 6000,
  subscriptions: 2500,
  travel: 5000,
  groceries: 7000,
  fuel: 3000,
  entertainment: 4000,
  others: 5000,
};

// Salary Coach demo
export const DEMO_SALARY = {
  currentSalary: 85000,
  jobTitle: 'Software Engineer',
  companyType: 'Product Startup',
  city: 'Bangalore',
  experience: 5,
};

// Fear Index demo
export const DEMO_FEAR = {
  answers: [3, 4, 2, 5, 3, 4, 2, 3, 4, 2],
  profile: 'The Cautious Planner',
};

// Regret Engine demo  
export const DEMO_REGRET = {
  income: 75000,
  selectedScenario: 'no_sip',
};

// Time Machine demo
export const DEMO_TIME_MACHINE = {
  year: 2015,
  investment: 10000,
};

// Crore Challenge demo
export const DEMO_CRORE = {
  currentAge: 28,
  monthlySIP: 25000,
  existingCorpus: 200000,
};

// Passive Income demo
export const DEMO_PASSIVE = {
  monthlyExpenses: 55000,
  fdCorpus: 500000,
  rentalIncome: 0,
  dividendCorpus: 200000,
  sipCorpus: 600000,
};

// Real Estate vs SIP demo
export const DEMO_RE_VS_SIP = {
  propertyPrice: 5000000,
  downPayment: 1000000,
  loanRate: 8.5,
  sipAmount: 30000,
  sipReturn: 12,
  years: 20,
};

// Generational Wealth demo
export const DEMO_GENERATIONAL = {
  currentAge: 28,
  monthlySIP: 25000,
  childStartAge: 30,
};

// Inflation Monster demo
export const DEMO_INFLATION = {
  savingsAmount: 500000,
  inflationRate: 6.5,
};

// Portfolio X-Ray demo
export const DEMO_PORTFOLIO = [
  {
    name: 'Parag Parikh Flexi Cap',
    category: 'Flexi Cap', units: 1820.45, nav: 78.20, invested: 120000,
    currentValue: 142319, gain: 22319, gainPct: 18.6,
    expenseRatio: 0.63, benchmark: 'Nifty 500',
    topHoldings: ['HDFC Bank', 'Bajaj Holdings', 'ITC', 'Power Grid', 'Alphabet Inc', 'Microsoft', 'Coal India', 'HCL Technologies', 'ICICI Bank', 'Maruti Suzuki'],
  },
  {
    name: 'HDFC Mid-Cap Opportunities',
    category: 'Mid Cap', units: 245.32, nav: 412.50, invested: 75000,
    currentValue: 101195, gain: 26195, gainPct: 34.9,
    expenseRatio: 1.64, benchmark: 'Nifty Midcap 150',
    topHoldings: ['Persistent Systems', 'Indian Hotels', 'Max Healthcare', 'Coforge', 'Trent', 'Tube Investments', 'Sundaram Finance', 'Cholamandalam Inv', 'Balkrishna Ind', 'Cummins India'],
  },
  {
    name: 'Axis Bluechip Fund',
    category: 'Large Cap', units: 512.80, nav: 52.30, invested: 200000,
    currentValue: 26819, gain: -173181, gainPct: -86.6,
    expenseRatio: 1.56, benchmark: 'Nifty 50',
    topHoldings: ['HDFC Bank', 'Bajaj Finance', 'TCS', 'Infosys', 'ICICI Bank', 'HUL', 'Kotak Mahindra', 'Avenue Supermarts', 'Titan Company', 'Reliance Industries'],
  },
  {
    name: 'SBI Small Cap Fund',
    category: 'Small Cap', units: 328.60, nav: 158.40, invested: 35000,
    currentValue: 52050, gain: 17050, gainPct: 48.7,
    expenseRatio: 1.55, benchmark: 'Nifty Smallcap 250',
    topHoldings: ['Blue Star', 'Finolex Industries', 'Chalet Hotels', 'IIFL Finance', 'Kalpataru Projects', 'Carborundum Universal', 'Praj Industries', 'Safari Industries', 'CAMS', 'Radico Khaitan'],
  },
  {
    name: 'Mirae Asset Large Cap',
    category: 'Large Cap', units: 680.20, nav: 103.50, invested: 55000,
    currentValue: 70401, gain: 15401, gainPct: 28.0,
    expenseRatio: 1.39, benchmark: 'Nifty 100',
    topHoldings: ['HDFC Bank', 'ICICI Bank', 'Reliance Industries', 'Infosys', 'Bharti Airtel', 'TCS', 'Larsen & Toubro', 'Axis Bank', 'State Bank of India', 'ITC'],
  },
];

// Full demo state for AppContext
export function loadFullDemoState(dispatch) {
  dispatch({ type: 'SET_USER_DATA', payload: DEMO_USER });
  dispatch({ type: 'SET_HEALTH_SCORE', payload: DEMO_HEALTH_SCORE });
  dispatch({ type: 'SET_PERSONALITY', payload: DEMO_PERSONALITY });
  dispatch({ type: 'COMPLETE_ONBOARDING' });
  dispatch({ type: 'SET_DEMO_DATA', payload: {
    couples: DEMO_COUPLES,
    budget: DEMO_BUDGET,
    salary: DEMO_SALARY,
    fear: DEMO_FEAR,
    regret: DEMO_REGRET,
    timeMachine: DEMO_TIME_MACHINE,
    crore: DEMO_CRORE,
    passive: DEMO_PASSIVE,
    reVsSip: DEMO_RE_VS_SIP,
    generational: DEMO_GENERATIONAL,
    inflation: DEMO_INFLATION,
    portfolio: DEMO_PORTFOLIO,
  }});
}

