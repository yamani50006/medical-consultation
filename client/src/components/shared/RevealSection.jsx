import { cn } from "../../utils/cn";
import { useRevealAnimation } from "../../hooks/useRevealAnimation";

export default function RevealSection({ children, className, options }) {
  const ref = useRevealAnimation(options);

  return (
    <section ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </section>
  );
}
