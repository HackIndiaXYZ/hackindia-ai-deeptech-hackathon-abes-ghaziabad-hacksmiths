import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WEEK_MSGS = [
  [
    { from: 'friend', text: 'Yaar tune abhi tak term insurance nahi liya kya? 😰', time: '10:32 AM' },
    { from: 'friend', text: 'Bhai seriously le le. ₹500/month me ₹1Cr cover milta hai. Tera family depend karta hai tujhpe.', time: '10:33 AM' },
  ],
  [
    { from: 'friend', text: 'Teri SIP this month ₹5,000 thi but tune Zomato pe ₹8,000 kharch kiye 🍕', time: '9:15 PM' },
    { from: 'friend', text: 'I am genuinely worried about you bro.', time: '9:16 PM' },
    { from: 'friend', text: 'Ek kaam kar — Zomato ko half kar aur baaki SIP me daal de. Future self bolega thank you. 🙏', time: '9:17 PM' },
  ],
  [
    { from: 'friend', text: 'Remember when I told you to invest in ELSS for tax saving?', time: '11:45 AM' },
    { from: 'friend', text: 'Deadline 31st March hai. Abhi tak nahi kiya toh ₹46,800 ka tax bachana miss ho jayega 😤', time: '11:46 AM' },
    { from: 'friend', text: 'Paytm Money pe 5 min me ho jayega. Abhi kar le.', time: '11:47 AM' },
  ],
  [
    { from: 'friend', text: 'Bro update: Tera emergency fund sirf 2 months ka hai', time: '3:22 PM' },
    { from: 'friend', text: 'Agar job chali gayi toh 2 mahine me bankrupt 💀', time: '3:22 PM' },
    { from: 'friend', text: 'Sweep-in FD bana le kal. 6 months ka expenses rakh ke chill kar.', time: '3:23 PM' },
    { from: 'friend', text: 'Main tere peeche padunga jab tak tu nahi karta 😤💪', time: '3:24 PM' },
  ],
];

const AI_REPLIES = [
  "Haan yaar tu sahi bol raha hai. Kal karta hoon pakka. 😅",
  "Bhai itna data kahan se laata hai tu mere baare me? 😂",
  "OK OK convinced. Abhi app khol ke karta hoon.",
  "Tere jaisi dost sab ko milni chahiye yaar ❤️",
];

export default function WhatsAppNudge() {
  const navigate = useNavigate();
  const [activeWeek, setActiveWeek] = useState(0);
  const [userMsgs, setUserMsgs] = useState({});
  const [input, setInput] = useState('');

  const allMsgs = [
    ...WEEK_MSGS[activeWeek],
    ...(userMsgs[activeWeek] || []),
  ];

  const sendMsg = () => {
    if (!input.trim()) return;
    const weekMsgs = userMsgs[activeWeek] || [];
    const replyIndex = weekMsgs.filter(m => m.from === 'friend').length;
    const newMsgs = [
      ...weekMsgs,
      { from: 'user', text: input, time: 'Just now' },
    ];
    setInput('');
    setUserMsgs({ ...userMsgs, [activeWeek]: newMsgs });

    setTimeout(() => {
      setUserMsgs(prev => ({
        ...prev,
        [activeWeek]: [
          ...(prev[activeWeek] || []),
          { from: 'friend', text: AI_REPLIES[replyIndex % AI_REPLIES.length], time: 'Just now' },
        ],
      }));
    }, 1500);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-navy text-white pt-24 pb-32 px-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">💬 Financial Nudge Simulator</h1>
          <p className="text-gray-400 text-sm">What if you had a friend who actually cared about your finances?</p>
        </div>

        {/* Week tabs */}
        <div className="flex gap-2 mb-4 justify-center">
          {[0, 1, 2, 3].map(w => (
            <button key={w} onClick={() => setActiveWeek(w)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeWeek === w ? 'bg-green-600 text-white' : 'bg-card text-gray-500 hover:text-white border border-white/5'}`}>
              Week {w + 1}
            </button>
          ))}
        </div>

        {/* WhatsApp mockup */}
        <div className="bg-[#0b141a] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="bg-[#1f2c34] px-4 py-3 flex items-center gap-3 border-b border-white/5">
            <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center text-sm font-bold">₹</div>
            <div>
              <div className="text-sm font-semibold text-white">Money Buddy 💰</div>
              <div className="text-xs text-green-400">online</div>
            </div>
          </div>

          {/* Chat area */}
          <div className="h-[420px] overflow-y-auto p-3 space-y-2" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'400\' height=\'400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'a\' patternUnits=\'userSpaceOnUse\' width=\'20\' height=\'20\'%3E%3Crect width=\'20\' height=\'20\' fill=\'%230b141a\'/%3E%3Ccircle cx=\'10\' cy=\'10\' r=\'0.5\' fill=\'%23ffffff08\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'400\' height=\'400\' fill=\'url(%23a)\'/%3E%3C/svg%3E")' }}>
            {allMsgs.map((m, i) => (
              <motion.div
                key={`${activeWeek}-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm relative ${
                  m.from === 'user'
                    ? 'bg-[#005c4b] text-white rounded-br-none'
                    : 'bg-[#1f2c34] text-gray-200 rounded-bl-none'
                }`}>
                  <div>{m.text}</div>
                  <div className="text-[10px] text-gray-500 text-right mt-1">{m.time}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Input */}
          <div className="bg-[#1f2c34] p-3 flex gap-2 border-t border-white/5">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()}
              placeholder="Type a message..." className="flex-1 bg-[#2a3942] text-white text-sm rounded-full px-4 py-2.5 outline-none placeholder-gray-500" />
            <button onClick={sendMsg} className="bg-green-600 w-10 h-10 rounded-full flex items-center justify-center hover:bg-green-500">
              <Send size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
