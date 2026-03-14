import { motion, useReducedMotion } from "framer-motion";
import { Inbox } from "lucide-react";

export default function EmptyState({ title, description, action, icon: Icon = Inbox }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      className="rounded-[28px] border border-dashed border-border/70 bg-card/50 px-6 py-10 text-center"
    >
      <div className="mx-auto grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-6" />
      </div>
      <h3 className="mt-5 font-display text-xl font-semibold">{title}</h3>
      {description ? <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </motion.div>
  );
}
