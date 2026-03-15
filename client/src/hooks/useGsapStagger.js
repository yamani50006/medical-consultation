import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

export function useGsapStagger(dependencies = []) {
  const scopeRef = useRef(null);

  useLayoutEffect(() => {
    if (!scopeRef.current) {
      return undefined;
    }

    const context = gsap.context(() => {
      const elements = scopeRef.current.querySelectorAll("[data-gsap='item']");
      if (!elements.length) {
        return;
      }

      gsap.fromTo(
        elements,
        {
          opacity: 0,
          y: 18
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.42,
          ease: "power2.out",
          stagger: 0.06,
          clearProps: "all"
        }
      );
    }, scopeRef);

    return () => context.revert();
  }, dependencies);

  return scopeRef;
}
