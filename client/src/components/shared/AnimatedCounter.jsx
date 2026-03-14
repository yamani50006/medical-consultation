import { useCounterAnimation } from "../../hooks/useCounterAnimation";

export default function AnimatedCounter({ value, className, suffix = "", formatter }) {
  const ref = useCounterAnimation(value, formatter || ((next) => `${Math.round(next)}${suffix}`));

  return <span ref={ref} className={className} />;
}
