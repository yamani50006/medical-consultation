import gsap from "gsap";

function shouldReduceMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function createRevealAnimation(target, options = {}) {
  if (!target) {
    return () => {};
  }

  if (shouldReduceMotion()) {
    gsap.set(target, { clearProps: "all", opacity: 1, y: 0 });
    return () => {};
  }

  const {
    y = 26,
    delay = 0,
    duration = 0.8,
    threshold = 0.18
  } = options;

  gsap.set(target, {
    opacity: 0,
    y,
    force3D: true
  });

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) {
        return;
      }

      gsap.to(target, {
        opacity: 1,
        y: 0,
        duration,
        delay,
        ease: "power3.out",
        overwrite: true
      });

      observer.disconnect();
    },
    { threshold }
  );

  observer.observe(target);

  return () => observer.disconnect();
}

export function createStaggerReveal(container, itemSelector = "[data-animate-item]", options = {}) {
  if (!container) {
    return () => {};
  }

  const items = Array.from(container.querySelectorAll(itemSelector));
  if (items.length === 0) {
    return () => {};
  }

  if (shouldReduceMotion()) {
    gsap.set(items, { clearProps: "all", opacity: 1, y: 0 });
    return () => {};
  }

  const {
    y = 24,
    duration = 0.7,
    stagger = 0.08,
    threshold = 0.12
  } = options;

  gsap.set(items, {
    opacity: 0,
    y,
    force3D: true
  });

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) {
        return;
      }

      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration,
        stagger,
        ease: "power3.out",
        overwrite: true
      });

      observer.disconnect();
    },
    { threshold }
  );

  observer.observe(container);

  return () => observer.disconnect();
}
