export const pageTransitionVariants = {
  initial: {
    opacity: 0,
    y: 24,
    scale: 0.985,
    filter: "blur(8px)"
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.42,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -16,
    scale: 0.99,
    filter: "blur(6px)",
    transition: {
      duration: 0.24,
      ease: [0.4, 0, 1, 1]
    }
  }
};

export const reducedMotionPageVariants = {
  initial: { opacity: 1 },
  animate: { opacity: 1, transition: { duration: 0.01 } },
  exit: { opacity: 1, transition: { duration: 0.01 } }
};
