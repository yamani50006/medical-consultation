import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

export function useAdminSectionAnimation(dependencies = []) {
  const scopeRef = useRef(null);

  useLayoutEffect(() => {
    if (!scopeRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const ctx = gsap.context(() => {
      const cards = scopeRef.current.querySelectorAll("[data-admin-animate='card']");
      const rows = scopeRef.current.querySelectorAll("[data-admin-animate='row']");
      const alerts = scopeRef.current.querySelectorAll("[data-admin-animate='alert']");

      if (cards.length) {
        gsap.from(cards, {
          opacity: 0,
          y: 20,
          duration: 0.55,
          stagger: 0.08,
          ease: "power2.out",
          clearProps: "all"
        });
      }

      if (rows.length) {
        gsap.from(rows, {
          opacity: 0,
          y: 16,
          duration: 0.45,
          stagger: 0.04,
          ease: "power2.out",
          clearProps: "all",
          delay: cards.length ? 0.12 : 0
        });
      }

      if (alerts.length) {
        gsap.from(alerts, {
          opacity: 0,
          x: 18,
          duration: 0.42,
          stagger: 0.06,
          ease: "power2.out",
          clearProps: "all",
          delay: 0.1
        });
      }
    }, scopeRef);

    return () => ctx.revert();
  }, dependencies);

  return scopeRef;
}
