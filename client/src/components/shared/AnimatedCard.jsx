import { motion, useReducedMotion } from "framer-motion";
import { Card } from "../ui/Card";
import { cn } from "../../utils/cn";

export default function AnimatedCard({ children, className, index = 0, ...props }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 30 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? undefined
          : {
              duration: 0.52,
              delay: index * 0.08,
              ease: [0.22, 1, 0.36, 1]
            }
      }
      whileHover={reduceMotion ? undefined : { y: -6, scale: 1.015 }}
      className="will-change-transform"
      {...props}
    >
      <Card className={cn("h-full", className)}>{children}</Card>
    </motion.div>
  );
}
