import gsap from "gsap";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function animateHeroIntro(root) {
  if (!root || prefersReducedMotion()) {
    return () => {};
  }

  const ctx = gsap.context(() => {
    const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

    timeline
      .from("[data-hero-badge]", { y: 18, opacity: 0, duration: 0.45 })
      .from("[data-hero-title]", { y: 28, opacity: 0, duration: 0.55 }, "-=0.2")
      .from("[data-hero-copy]", { y: 20, opacity: 0, duration: 0.48 }, "-=0.24")
      .from("[data-hero-actions]", { y: 18, opacity: 0, duration: 0.42 }, "-=0.24")
      .from("[data-hero-preview]", { y: 38, opacity: 0, duration: 0.65 }, "-=0.2")
      .from("[data-float-shape]", { scale: 0.88, opacity: 0, stagger: 0.08, duration: 0.5 }, "-=0.45");
  }, root);

  return () => ctx.revert();
}

export function animateCounter(node, value, formatter = (next) => Math.round(next).toString()) {
  if (!node) {
    return () => {};
  }

  if (prefersReducedMotion()) {
    node.textContent = formatter(value);
    return () => {};
  }

  const proxy = { count: 0 };
  const tween = gsap.to(proxy, {
    count: value,
    duration: 1.4,
    ease: "power3.out",
    onUpdate: () => {
      node.textContent = formatter(proxy.count);
    }
  });

  return () => tween.kill();
}

export function animateDashboardWidgets(container, selector = "[data-dashboard-widget]") {
  if (!container || prefersReducedMotion()) {
    return () => {};
  }

  const items = Array.from(container.querySelectorAll(selector));
  if (items.length === 0) {
    return () => {};
  }

  const ctx = gsap.context(() => {
    gsap.from(items, {
      opacity: 0,
      y: 26,
      duration: 0.7,
      stagger: 0.08,
      ease: "power3.out"
    });
  }, container);

  return () => ctx.revert();
}
