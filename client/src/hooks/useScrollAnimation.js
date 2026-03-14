import { useEffect, useRef } from "react";
import { createStaggerReveal } from "../animations/revealAnimations";

export function useScrollAnimation(itemSelector, options) {
  const ref = useRef(null);
  const serializedOptions = JSON.stringify(options || {});

  useEffect(() => {
    return createStaggerReveal(ref.current, itemSelector, options);
  }, [itemSelector, serializedOptions]);

  return ref;
}
