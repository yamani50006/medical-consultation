import { useEffect, useRef } from "react";
import { createRevealAnimation } from "../animations/revealAnimations";

export function useRevealAnimation(options) {
  const ref = useRef(null);
  const serializedOptions = JSON.stringify(options || {});

  useEffect(() => {
    return createRevealAnimation(ref.current, options);
  }, [serializedOptions]);

  return ref;
}
