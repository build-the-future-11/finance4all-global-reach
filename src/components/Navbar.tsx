import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const links = [
  { label: "About", href: "#about" },
  { label: "Programs", href: "#programs" },
  { label: "Projects", href: "#projects" },
  { label: "Founder", href: "#founder" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // Close mobile menu on resize
  useEffect(() => {
    const resize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Optimized mouse move (RAF throttled)
  const handleMove = (e: React.MouseEvent) => {
    if (!navRef.current) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      const rect = navRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      navRef.current!.style.setProperty("--x", `${x}px`);
      navRef.current!.style.setProperty("--y", `${y}px`);
    });
  };

  return (
    <>
      {/* SVG FILTER (lighter + smoother) */}
      <svg className="pointer-events-none fixed w-0 h-0">
        <filter id="liquid-glass" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.01 0.018"
            numOctaves="2"
            seed="6"
            result="turbulence"
          >
            <animate
              attributeName="baseFrequency"
              values="0.01 0.018;0.018 0.025;0.01 0.018"
              dur="30s"
              repeatCount="indefinite"
            />
          </feTurbulence>

          <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="8" />
        </filter>
      </svg>

      <nav className="fixed inset-x-0 top-0 z-50 px-4 py-3">
        <div className="relative mx-auto max-w-6xl">

          {/* Ambient glow */}
          <div className="pointer-events-none absolute left-1/4 top-0 h-32 w-32 rounded-full bg-emerald-300/20 blur-[120px]" />
          <div className="pointer-events-none absolute right-1/3 bottom-0 h-36 w-36 rounded-full bg-purple-300/20 blur-[140px]" />

          {/* NAV CONTAINER */}
          <div
            ref={navRef}
            onMouseMove={handleMove}
            className="group relative overflow-hidden rounded-full border border-white/20 px-6 py-3 backdrop-blur-xl bg-white/[0.05] shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
          >

            {/* Glass distortion (isolated layer) */}
            <div
              className="absolute inset-0 rounded-full opacity-70"
              style={{
                filter: "url(#liquid-glass)",
                WebkitFilter: "url(#liquid-glass)",
              }}
            />

            {/* Cursor light */}
            <div
              className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(circle 180px at var(--x) var(--y), rgba(255,255,255,0.15), transparent 70%)",
              }}
            />

            {/* Subtle top sheen */}
            <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-white/40 via-white/10 to-transparent opacity-30" />

            {/* Border highlight */}
            <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/25" />

            {/* CONTENT */}
            <div className="relative z-10 flex items-center justify-between">

              {/* Logo */}
              <a href="#" className="flex items-center gap-2 text-lg tracking-tight">
                <span className="font-semibold text-white">Finance4All</span>
                <span className="text-white/50">Meta</span>
              </a>

              {/* Desktop */}
              <div className="hidden items-center gap-2 md:flex">
                {links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    className="rounded-full px-4 py-2 text-sm font-medium text-white/80 transition-all duration-300 hover:bg-white/15 hover:text-white hover:scale-[1.05]"
                  >
                    {l.label}
                  </a>
                ))}
                <ThemeToggle />
              </div>

              {/* Mobile toggle */}
              <div className="flex items-center gap-2 md:hidden">
                <ThemeToggle />

                <button
                  aria-label="Toggle menu"
                  onClick={() => setOpen((v) => !v)}
                  className="rounded-full border border-white/30 bg-white/10 p-2 backdrop-blur-xl transition hover:bg-white/20"
                >
                  {open ? (
                    <X className="h-5 w-5 text-white" />
                  ) : (
                    <Menu className="h-5 w-5 text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu (animated) */}
          <div
            className={`md:hidden transition-all duration-300 ease-out ${
              open
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 -translate-y-2 pointer-events-none"
            }`}
          >
            <div className="mt-3 rounded-3xl border border-white/20 bg-white/[0.07] p-3 backdrop-blur-xl">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 text-white/80 transition hover:bg-white/15 hover:text-white"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>

        </div>
      </nav>
    </>
  );
}
