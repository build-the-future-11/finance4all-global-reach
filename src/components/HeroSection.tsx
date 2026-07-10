import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, FlaskConical, Newspaper, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import GlassSurface from "@/components/landing/GlassSurface";

const STATS = [
  { value: 25000, suffix: "+", label: "Students in outreach", context: "since 2023" },
  { value: 15, suffix: "+", label: "Countries with chapters", context: "and growing" },
  { value: 500, suffix: "+", label: "Portal members", context: "research & events" },
];

const PORTAL_SNIPPETS = [
  {
    icon: Newspaper,
    label: "Debriefed",
    headline: "Fed holds; yields slip on soft CPI print",
    meta: "Macro · 4 min read",
    accent: "emerald",
  },
  {
    icon: FlaskConical,
    label: "Meta Labs",
    headline: "Atlas: Emerging-market FX pass-through",
    meta: "Open · 3 mentor slots",
    accent: "blue",
  },
  {
    icon: Users,
    label: "Network",
    headline: "Mumbai chapter · Markets 101 this Thursday",
    meta: "12 members attending",
    accent: "amber",
  },
];

function AnimatedStat({ value, suffix, label, context }: (typeof STATS)[0]) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const start = performance.now();
        const duration = 1600;

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
    <div ref={ref} className="relative pl-4">
      <div className="absolute left-0 top-1 h-full w-px bg-gradient-to-b from-emerald-400/60 to-transparent" />
      <p className="text-2xl font-bold tabular-nums text-white sm:text-3xl">
        {display.toLocaleString()}
        {suffix}
      </p>
      <p className="mt-1 text-xs font-medium text-white/80">{label}</p>
      <p className="text-[10px] uppercase tracking-wider text-white/35">{context}</p>
    </div>
  );
}

const accentMap = {
  emerald: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300",
  blue: "border-blue-400/25 bg-blue-500/10 text-blue-300",
  amber: "border-amber-400/25 bg-amber-500/10 text-amber-300",
};

export default function HeroSection() {
  const glareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      if (glareRef.current) {
        glareRef.current.style.transform = `translate(${x * 16}px, ${y * 16}px)`;
      }
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <section className="relative flex min-h-[100dvh] flex-col justify-center overflow-hidden px-4 pb-20 pt-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="landing-float absolute left-[20%] top-[18%] h-96 w-96 rounded-full bg-emerald-500/12 blur-[130px]" />
        <div className="absolute right-0 top-1/3 h-px w-1/3 bg-gradient-to-l from-emerald-400/20 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div>
          <GlassSurface className="mb-8 inline-flex w-fit rounded-full p-1.5 pr-4" interactive={false}>
            <div className="landing-glass-inner flex items-center gap-3">
              <span className="glass-pill !text-emerald-200">Free membership</span>
              <span className="text-xs text-white/55">Portal · Labs · Chapters · Journal</span>
            </div>
          </GlassSurface>

          <h1 className="text-balance text-4xl font-bold leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-[3.35rem]">
            Finance education that{" "}
            <span className="bg-gradient-to-r from-emerald-200 via-white to-emerald-100 bg-clip-text text-transparent">
              scales with ambition.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-[1.7] text-white/58 sm:text-lg">
            Finance4All started in Indian classrooms teaching budgeting to students who had never
            seen a brokerage account. Today the same Catalyst curriculum, Meta Labs research track,
            and Economics Journal live in one member portal — run by chapters from Mumbai to New York.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/signup"
              className="group inline-flex items-center gap-2 rounded-full bg-emerald-500 px-7 py-3.5 text-sm font-semibold text-black shadow-[0_8px_32px_rgba(52,211,153,0.35)] transition hover:bg-emerald-400"
            >
              Create free account
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/login"
              className="landing-glass inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white transition hover:border-white/25"
            >
              <span className="landing-glass-inner">Sign in to portal</span>
            </Link>
          </div>

          <GlassSurface className="mt-12 p-6 sm:p-8" strong>
            <div className="landing-glass-inner grid gap-8 sm:grid-cols-3">
              {STATS.map((s) => (
                <AnimatedStat key={s.label} {...s} />
              ))}
            </div>
          </GlassSurface>
        </div>

        <div className="relative">
          <div
            ref={glareRef}
            className="pointer-events-none absolute -inset-6 rounded-[40px] bg-[radial-gradient(circle,rgba(52,211,153,0.16),transparent_68%)] transition-transform duration-500"
          />
          <GlassSurface strong className="rounded-[28px]">
            <div className="landing-glass-inner">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
                </div>
                <p className="font-mono text-[10px] text-white/30">finance4all.app/portal</p>
              </div>

              <div className="space-y-3 p-5">
                {PORTAL_SNIPPETS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="landing-glass rounded-2xl p-4 transition"
                    >
                      <div className="landing-glass-inner flex items-start gap-3">
                        <div
                          className={`rounded-xl border p-2.5 ${accentMap[item.accent as keyof typeof accentMap]}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                              {item.label}
                            </p>
                            <span className="text-[10px] text-white/25">{item.meta}</span>
                          </div>
                          <p className="mt-1 text-sm font-medium leading-snug text-white/90">
                            {item.headline}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-white/10 px-5 py-3">
                <p className="text-center text-[11px] text-white/40">
                  Live modules — news, research, pathways, chapters
                </p>
              </div>
            </div>
          </GlassSurface>
        </div>
      </div>

      <a
        href="#about"
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-white/25 transition hover:text-white/55"
        aria-label="Scroll to learn more"
      >
        <span className="text-[10px] uppercase tracking-[0.2em]">The network</span>
        <ChevronDown className="h-5 w-5 animate-bounce" />
      </a>
    </section>
  );
}
