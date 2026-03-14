import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../../utils/cn";

export default function FadeInSection({ children, className }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 22 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? undefined
          : {
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1]
            }
      }
      className={cn(className)}
    >
      {children}
    </motion.section>
  );
}
