// src/hooks/useScrollReveal.ts
import { useEffect, useRef } from "react";

export interface SpringOptions {
  threshold?: number;   // how much of the element must be visible
  rootMargin?: string;  // trigger offset for the observer
  distance?: number;    // initial vertical offset in px
  stiffness?: number;   // spring strength
  damping?: number;     // energy retention per frame
  mass?: number;        // spring mass
  once?: boolean;       // animate only once
  scale?: number;       // initial scale before settling
  blur?: number;        // initial blur for a softer Apple-like reveal
  delay?: number;       // ms delay before the animation starts
  restSpeed?: number;   // stop once motion is tiny
  restDistance?: number; // stop once position is near zero
}

export function useScrollReveal(options: SpringOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);

  const {
    threshold = 0.08,
    rootMargin = "0px 0px -12% 0px",
    distance = 28,
    stiffness = 0.085,
    damping = 0.84,
    mass = 1.15,
    once = true,
    scale = 0.985,
    blur = 4,
    delay = 0,
    restSpeed = 0.045,
    restDistance = 0.15,
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    if (prefersReducedMotion) {
      el.style.opacity = "1";
      el.style.transform = "none";
      el.style.filter = "none";
      return;
    }

    let animationFrame = 0;
    let timeoutId = 0;
    let velocity = 0;
    let position = distance;
    let started = false;
    let disposed = false;

    // Initial hidden state
    el.style.opacity = "0";
    el.style.transform = `translate3d(0, ${distance}px, 0) scale(${scale})`;
    el.style.filter = `blur(${blur}px)`;
    el.style.willChange = "transform, opacity, filter";

    const render = () => {
      const progress = 1 - Math.min(1, Math.abs(position) / Math.max(distance, 0.0001));

      // Subtle scale and blur settle for a smoother, premium feel
      const currentScale = scale + (1 - scale) * progress;
      const currentBlur = blur * (1 - progress);
      const currentOpacity = Math.min(1, 0.12 + progress * 0.88);

      el.style.opacity = String(currentOpacity);
      el.style.transform = `translate3d(0, ${position}px, 0) scale(${currentScale})`;
      el.style.filter = `blur(${currentBlur}px)`;
    };

    const step = () => {
      if (disposed) return;

      // Spring physics:
      // force pulls toward 0, damping preserves a little tension and motion
      const force = -stiffness * position;
      const accel = force / mass;
      velocity = damping * (velocity + accel);
      position += velocity;

      render();

      const isAtRest =
        Math.abs(velocity) < restSpeed && Math.abs(position) < restDistance;

      if (!isAtRest) {
        animationFrame = window.requestAnimationFrame(step);
      } else {
        el.style.opacity = "1";
        el.style.transform = "translate3d(0, 0, 0) scale(1)";
        el.style.filter = "blur(0px)";
        el.style.willChange = "auto";
      }
    };

    const start = () => {
      if (started || disposed) return;
      started = true;

      timeoutId = window.setTimeout(() => {
        if (disposed) return;
        animationFrame = window.requestAnimationFrame(step);
      }, delay);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          start();
          if (once) observer.unobserve(el);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);

    return () => {
      disposed = true;
      observer.disconnect();
      window.clearTimeout(timeoutId);
      window.cancelAnimationFrame(animationFrame);
      el.style.willChange = "auto";
    };
  }, [
    threshold,
    rootMargin,
    distance,
    stiffness,
    damping,
    mass,
    once,
    scale,
    blur,
    delay,
    restSpeed,
    restDistance,
  ]);

  return ref;
}
