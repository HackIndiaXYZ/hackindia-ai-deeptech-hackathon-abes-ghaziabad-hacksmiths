import React from 'react';
import { motion } from 'framer-motion';

export default function Logo({ className = "", textClass = "text-xl", iconSize = 40, showSub = false }) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Financial Chart Icon — bars with upward arrow */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative flex items-center justify-center shrink-0"
        style={{ width: iconSize, height: iconSize }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          {/* Bar 1 (short) */}
          <motion.rect
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            x="12" y="60" width="16" height="30" rx="3"
            fill="rgba(255,255,255,0.85)"
            style={{ transformOrigin: '20px 90px' }}
          />
          {/* Bar 2 (medium) */}
          <motion.rect
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            x="34" y="42" width="16" height="48" rx="3"
            fill="rgba(255,255,255,0.85)"
            style={{ transformOrigin: '42px 90px' }}
          />
          {/* Bar 3 (tall) */}
          <motion.rect
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            x="56" y="25" width="16" height="65" rx="3"
            fill="rgba(255,255,255,0.85)"
            style={{ transformOrigin: '64px 90px' }}
          />
          {/* Upward Arrow Line */}
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            d="M 15 72 L 42 50 L 64 35 L 88 15"
            stroke="#F5A623"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Arrow head */}
          <motion.path
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1.6 }}
            d="M 80 12 L 92 14 L 86 24"
            stroke="#F5A623"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </motion.div>
      
      <div className="flex flex-col justify-center">
        <span className={`font-light tracking-[0.15em] text-white uppercase leading-none ${textClass}`}>
          AFTER <span className="font-bold">MATH</span>
        </span>
        {showSub && (
          <span className="text-[10px] sm:text-xs text-gray-400 font-normal tracking-widest mt-1">
            Your Personal Money Mentor
          </span>
        )}
      </div>
    </div>
  );
}
