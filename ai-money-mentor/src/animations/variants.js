export const pageEnter = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

export const pageExit = {
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.3 } },
};

export const cardEnter = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export const slideInLeft = {
  initial: { x: -60, opacity: 0 },
  animate: { x: 0, opacity: 1 },
};

export const slideInRight = {
  initial: { x: 60, opacity: 0 },
  animate: { x: 0, opacity: 1 },
};

export const fadeUp = {
  initial: { y: 40, opacity: 0 },
  animate: { y: 0, opacity: 1 },
};
