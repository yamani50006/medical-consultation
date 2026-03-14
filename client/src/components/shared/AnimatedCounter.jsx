import { useEffect, useRef } from "react";
import { animateCounter } from "../../animations/gsapAnimations";

export default function AnimatedCounter({ value, className, suffix = "", formatter }) {
  const ref = useRef(null);

  useEffect(() => {
    return animateCounter(
      ref.current,
      value,
      formatter || ((next) => `${Math.round(next)}${suffix}`)
    );
  }, [formatter, suffix, value]);

  return <span ref={ref} className={className} />;
}
