import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const STATS = [
  { value: 25000, suffix: "+", label: "Students impacted" },
  { value: 15, suffix: "+", label: "Countries" },
  { value: 500, suffix: "+", label: "Global members" },
];

function AnimatedStat({ value, suffix, label }: (typeof STATS)[0]) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const start = performance.now();
        const duration = 1800;

        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          setDisplay(Math.round(value * eased));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl font-bold tabular-nums text-white sm:text-4xl">
        {display.toLocaleString()}
        {suffix}
      </p>
      <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">
        {label}
      </p>
    </div>
  );
}

export default function HeroSection() {
  const glareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      if (glareRef.current) {
        glareRef.current.style.transform = `translate(${x * 30}px, ${y * 30}px)`;
      }
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-4 pb-16 pt-28">
      {/* Floating orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="landing-float absolute left-[10%] top-[20%] h-72 w-72 rounded-full bg-emerald-500/25 blur-[100px]" />
        <div className="landing-float landing-float-delay absolute right-[15%] top-[30%] h-96 w-96 rounded-full bg-indigo-500/20 blur-[120px]" />
        <div className="landing-float absolute bottom-[15%] left-[30%] h-80 w-80 rounded-full bg-fuchsia-500/15 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        {/* Badge */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-200 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            Finance4All Meta · Global research network since 2023
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-center text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl lg:text-8xl">
          <span className="block bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">
            The future of
          </span>
          <span className="mt-1 block bg-gradient-to-r from-emerald-300 via-cyan-200 to-violet-300 bg-clip-text text-transparent">
            financial literacy
          </span>
          <span className="mt-1 block text-white/90">is global.</span>
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-center text-base leading-relaxed text-white/60 sm:text-lg">
          From school outreach across India to a 500+ member research network — FinanceMeta
          connects students to news, labs, pathways, and chapters at institutions worldwide.
        </p>

        {/* Stats */}
        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-3 gap-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl sm:p-8">
          {STATS.map((s) => (
            <AnimatedStat key={s.label} {...s} />
          ))}
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/signup"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 px-8 py-3.5 text-sm font-semibold text-black shadow-[0_0_60px_rgba(52,211,153,0.45)] transition hover:scale-105 hover:shadow-[0_0_80px_rgba(52,211,153,0.6)]"
          >
            Join the network
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition hover:border-white/35 hover:bg-white/10"
          >
            Member portal
          </Link>
          <a
            href="#programs"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3.5 text-sm font-medium text-white/70 transition hover:text-white"
          >
            Explore programs
          </a>
        </div>

        {/* Glass preview card */}
        <div className="relative mx-auto mt-16 max-w-4xl">
          <div
            ref={glareRef}
            className="pointer-events-none absolute -inset-4 rounded-[40px] bg-[radial-gradient(circle,rgba(52,211,153,0.15),transparent_70%)] transition-transform duration-300"
          />
          <div className="relative overflow-hidden rounded-[32px] border border-white/15 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-1 shadow-[0_40px_120px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
            <div className="rounded-[28px] border border-white/10 bg-[#060a12]/90 p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-400/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400/80" />
                </div>
                <p className="text-xs text-white/35">finance4all — member portal</p>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {["Debriefed", "Meta Labs", "Network"].map((label, i) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-emerald-400/30"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <p className="text-xs text-white/40">Module</p>
                    <p className="mt-1 font-semibold text-white">{label}</p>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                        style={{ width: `${70 + i * 10}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <a
        href="#about"
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-white/30 transition hover:text-white/60"
        aria-label="Scroll down"
      >
        <span className="text-[10px] uppercase tracking-widest">Discover</span>
        <ChevronDown className="h-5 w-5 animate-bounce" />
      </a>
    </section>
  );
}
