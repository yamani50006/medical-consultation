import { useEffect, useRef } from "react";
import { animateCounter } from "../animations/gsapAnimations";

export function useCounterAnimation(value, formatter) {
  const ref = useRef(null);

  useEffect(() => animateCounter(ref.current, value, formatter), [formatter, value]);

  return ref;
}
