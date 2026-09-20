import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Check, LoaderCircle } from "lucide-react";
import "./interactions.css";

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => !window.matchMedia || window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!media) return;
    const update = () => setReduced(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}

function useEntered() {
  const ref = useRef<HTMLSpanElement>(null);
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    if (!ref.current || !window.IntersectionObserver) { setEntered(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setEntered(true); observer.disconnect(); }
    }, { threshold: 0.12 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, entered };
}

// Native React interpretations of the interaction patterns requested from Inspira UI.
export function BoxReveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const { ref, entered } = useEntered();
  return <span ref={ref} className="box-reveal" data-entered={entered} style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}><span>{children}</span><i aria-hidden="true" /></span>;
}

export function EncryptedText({ text }: { text: string }) {
  const { ref, entered } = useEntered();
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    if (!entered || reduced) { setDisplay(text); return; }
    let frame = 0;
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const timer = window.setInterval(() => {
      const revealed = Math.floor((frame / 24) * text.length);
      setDisplay([...text].map((char, i) => i < revealed || char === " " ? char : alphabet[(i * 11 + frame * 7) % alphabet.length]).join(""));
      frame += 1;
      if (frame > 24) { setDisplay(text); window.clearInterval(timer); }
    }, 35);
    return () => window.clearInterval(timer);
  }, [entered, reduced, text]);
  return <span ref={ref} className="encrypted-text"><span className="sr-only">{text}</span><span aria-hidden="true">{display}</span></span>;
}

export function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !window.ResizeObserver || !window.IntersectionObserver) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    let width = 0, height = 0, frame = 0, active = true;
    const points = Array.from({ length: 32 }, (_, i) => ({ x: ((i * 137.508) % 100) / 100, y: ((i * 61.803) % 100) / 100 }));
    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      const coordinates = points.map((p, i) => ({ x: p.x * width + Math.sin(time / 7000 + i) * 14, y: p.y * height + Math.cos(time / 9000 + i) * 12 }));
      coordinates.forEach((p, i) => {
        context.fillStyle = "rgba(195,238,166,.48)";
        context.beginPath(); context.arc(p.x, p.y, 2, 0, Math.PI * 2); context.fill();
        coordinates.slice(i + 1).forEach(q => {
          const distance = Math.hypot(p.x - q.x, p.y - q.y);
          if (distance > 155) return;
          context.strokeStyle = `rgba(195,238,166,${(1 - distance / 155) * .27})`;
          context.beginPath(); context.moveTo(p.x, p.y); context.lineTo(q.x, q.y); context.stroke();
        });
      });
      if (active && !reduced && !document.hidden) frame = requestAnimationFrame(draw);
    };
    const resize = () => {
      width = canvas.clientWidth; height = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = width * dpr; canvas.height = height * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      cancelAnimationFrame(frame); draw(0);
    };
    const observer = new ResizeObserver(resize); observer.observe(canvas);
    const visibility = () => { cancelAnimationFrame(frame); if (active && !document.hidden) draw(performance.now()); };
    const intersection = new IntersectionObserver(([entry]) => { active = entry.isIntersecting; visibility(); });
    intersection.observe(canvas);
    document.addEventListener("visibilitychange", visibility);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); intersection.disconnect(); document.removeEventListener("visibilitychange", visibility); };
  }, [reduced]);
  return <canvas className="neural-background" ref={canvasRef} aria-hidden="true" />;
}

export function ContainerScroll({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced || !ref.current || !window.IntersectionObserver) return;
    const element = ref.current;
    let frame = 0, visible = false;
    const update = () => {
      frame = 0;
      if (!visible) return;
      const rect = element.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight * .85)));
      element.style.setProperty("--scroll-rotate", `${(1 - progress) * 11}deg`);
      element.style.setProperty("--scroll-scale", `${.93 + progress * .07}`);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); });
    observer.observe(element);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); element.style.removeProperty("--scroll-rotate"); element.style.removeProperty("--scroll-scale"); };
  }, [reduced]);
  return <div className="container-scroll" ref={ref}><div>{children}</div></div>;
}

export function MorphingTabs({ tabs, label }: { tabs: { label: string; content: ReactNode }[]; label: string }) {
  const [active, setActive] = useState(0);
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const select = (index: number) => { setActive(index); refs.current[index]?.focus(); };
  return <div className="morphing-tabs">
    <div role="tablist" aria-label={label} className="morphing-tab-list" style={{ "--tabs": tabs.length, "--active": active } as CSSProperties}>
      <i aria-hidden="true" />
      {tabs.map((tab, i) => <button ref={el => { refs.current[i] = el; }} key={tab.label} type="button" role="tab" id={`${id}-tab-${i}`} aria-selected={active === i} aria-controls={`${id}-panel-${i}`} tabIndex={active === i ? 0 : -1} onClick={() => setActive(i)} onKeyDown={e => {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); select((active + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length); }
        if (e.key === "Home" || e.key === "End") { e.preventDefault(); select(e.key === "Home" ? 0 : tabs.length - 1); }
      }}>{tab.label}</button>)}
    </div>
    {tabs.map((tab, i) => <div key={tab.label} role="tabpanel" id={`${id}-panel-${i}`} aria-labelledby={`${id}-tab-${i}`} hidden={i !== active} tabIndex={0} className="morphing-panel">{tab.content}</div>)}
  </div>;
}

export function Lens({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  return <div className="lens-area" ref={ref} data-magnified={enabled} onPointerMove={e => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--lens-x", `${e.clientX - rect.left}px`);
    ref.current.style.setProperty("--lens-y", `${e.clientY - rect.top}px`);
  }}>
    <div className="lens-original">{children}</div>
    <div className="lens-glass" aria-hidden="true"><div>{children}</div></div>
    <button type="button" aria-pressed={enabled} onClick={() => setEnabled(value => !value)} className="lens-toggle">{enabled ? "Return to overview" : label}<span aria-hidden="true">{enabled ? "−" : "+"}</span></button>
  </div>;
}

export function MediaText({ children, media }: { children: ReactNode; media: ReactNode }) {
  const { ref, entered } = useEntered();
  return <span className="media-text" ref={ref} data-entered={entered}><span className="media-text-window" aria-hidden="true">{media}</span>{children}</span>;
}

export function MultiStepLoader({ steps, current, error }: { steps: string[]; current: number; error?: string }) {
  return <div className="multi-step-loader" role="status" aria-live="polite" aria-atomic="true"><p>{error || steps[Math.min(current, steps.length - 1)]}</p><ol>{steps.map((step, i) => <li key={step} data-state={i < current ? "complete" : i === current ? "active" : "waiting"}>{i < current ? <Check aria-hidden="true" /> : i === current && !error ? <LoaderCircle className="loader-spin" aria-hidden="true" /> : <span aria-hidden="true">{i + 1}</span>}<span>{step}</span></li>)}</ol></div>;
}
