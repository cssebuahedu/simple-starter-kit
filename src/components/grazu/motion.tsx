import { createElement, useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";

/**
 * Homepage motion primitives. Entrance states are CSS-only and gated behind
 * `html.motion-ready` + `prefers-reduced-motion: no-preference`, so content is
 * always visible without JS or for reduced-motion users. One shared observer
 * reveals each element once; elements skipped above the viewport (fast scroll,
 * anchor jumps) are revealed immediately so nothing stays hidden.
 */
let observer: IntersectionObserver | null = null;

function reducedMotion() {
  return typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function sharedObserver() {
  if (observer) return observer;
  document.documentElement.classList.add("motion-ready");
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting || entry.boundingClientRect.bottom < 0) {
          (entry.target as HTMLElement).dataset["inview"] = "true";
          observer?.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0 },
  );
  return observer;
}

export type RevealVariant = "up" | "rise" | "left" | "fade" | "line" | "image";

type ScrollRevealProps = {
  as?: ElementType;
  variant?: RevealVariant;
  /** Delay in ms, used for sequencing / stagger. */
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  [prop: string]: unknown;
};

export function ScrollReveal({ as = "div", variant = "up", delay = 0, className, style, children, ...rest }: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (reducedMotion()) { el.dataset["inview"] = "true"; return; }
    const io = sharedObserver();
    io.observe(el);
    return () => io.unobserve(el);
  }, []);
  return createElement(
    as,
    { ...rest, ref, className, "data-reveal": variant, style: { ...style, "--d": `${delay}ms` } as CSSProperties },
    children,
  );
}

/** Counts from 0 to the real value once, when first visible. Writes text directly (no re-renders). */
export function AnimatedCounter({ value, duration = 1500 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (done.current || reducedMotion() || typeof IntersectionObserver === "undefined") { el.textContent = String(value); return; }
    el.textContent = "0";
    let frame = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = String(Math.round(value * eased));
          if (t < 1) frame = requestAnimationFrame(tick);
          else { el.textContent = String(value); done.current = true; }
        };
        frame = requestAnimationFrame(tick);
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(frame); el.textContent = String(value); };
  }, [value, duration]);
  return <span ref={ref}>{value}</span>;
}

/** Scroll-linked vertical drift for a background layer while its section is on screen. */
export function useParallax<T extends HTMLElement>(strength = 0.18) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    const factor = window.matchMedia("(max-width: 767px)").matches ? strength * 0.4 : strength;
    let frame = 0;
    const apply = () => {
      frame = 0;
      const y = window.scrollY;
      if (y > window.innerHeight * 1.2) return;
      el.style.translate = `0 ${(y * factor).toFixed(1)}px`;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(apply); };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); el.style.translate = ""; };
  }, [strength]);
  return ref;
}
