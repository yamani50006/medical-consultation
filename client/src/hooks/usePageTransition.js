import { useReducedMotion } from "framer-motion";
import { pageTransitionVariants, reducedMotionPageVariants } from "../animations/pageTransitions";

export function usePageTransition() {
  const reduceMotion = useReducedMotion();

  return {
    reduceMotion,
    variants: reduceMotion ? reducedMotionPageVariants : pageTransitionVariants
  };
}
