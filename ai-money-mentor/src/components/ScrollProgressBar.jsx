import React from 'react';
import { motion, useScroll } from 'framer-motion';

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      style={{ scaleX: scrollYProgress }}
      className="fixed top-0 left-0 right-0 h-[3px] bg-gold origin-left z-50 rounded-r-full"
    />
  );
}
