import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

export default function PageHeader({ title, subtitle, className, badge }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn("mb-8 space-y-3", className)}
    >
      {badge ? (
        <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {badge}
        </span>
      ) : null}
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        {subtitle ? <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">{subtitle}</p> : null}
      </div>
    </motion.div>
  );
}
