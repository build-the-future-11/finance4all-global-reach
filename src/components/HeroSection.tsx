import { Link } from "react-router-dom";
import { Github, ExternalLink, ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";

export default function HeroSection() {
  const gridRef = useRef<HTMLDivElement>(null);
  const blobsRef = useRef<HTMLDivElement[]>([]);
  const glareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;

      // layered parallax
      blobsRef.current.forEach((blob, i) => {
        if (!blob) return;
        const depth = (i + 1) * 25;
        blob.style.transform = `translate3d(${x * depth}px, ${y * depth}px,0)`;
      });

      // spotlight grid
      const grid = gridRef.current;
      if (grid) {
        const rect = grid.getBoundingClientRect();
        grid.style.setProperty("--x", `${e.clientX - rect.left}px`);
        grid.style.setProperty("--y", `${e.clientY - rect.top}px`);
      }

      // glass glare movement
      const glare = glareRef.current;
      if (glare) {
        glare.style.transform = `translate(${x * 40}px, ${y * 40}px)`;
      }
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <section className="relative h-screen flex flex-col items-center justify-center text-center overflow-hidden px-4">

      {/* BACKGROUND BLOBS */}

      <div className="absolute inset-0 -z-30 overflow-hidden">

        <div
          ref={(el) => (blobsRef.current[0] = el!)}
          className="absolute top-1/4 left-1/4 h-[520px] w-[520px] rounded-full bg-pink-500/40 blur-[160px] transition-transform duration-700"
        />

        <div
          ref={(el) => (blobsRef.current[1] = el!)}
          className="absolute top-10 right-1/4 h-[640px] w-[640px] rounded-full bg-emerald-400/40 blur-[200px] transition-transform duration-700"
        />

        <div
          ref={(el) => (blobsRef.current[2] = el!)}
          className="absolute bottom-20 left-1/3 h-[520px] w-[520px] rounded-full bg-blue-500/35 blur-[160px] transition-transform duration-700"
        />

        <div
          ref={(el) => (blobsRef.current[3] = el!)}
          className="absolute bottom-10 right-1/4 h-[480px] w-[480px] rounded-full bg-purple-500/35 blur-[160px] transition-transform duration-700"
        />

      </div>

      {/* PARTICLES */}

      <div className="absolute inset-0 -z-20 pointer-events-none">
        <div className="absolute h-2 w-2 bg-white/40 rounded-full blur-sm top-1/3 left-1/4 animate-pulse"></div>
        <div className="absolute h-2 w-2 bg-white/40 rounded-full blur-sm top-1/2 left-3/4 animate-pulse"></div>
        <div className="absolute h-2 w-2 bg-white/40 rounded-full blur-sm bottom-1/4 left-1/3 animate-pulse"></div>
      </div>

      {/* ATMOSPHERIC GLASS */}

      <div className="absolute inset-0 -z-10 bg-black/50 backdrop-blur-[12px]" />

      {/* DOT GRID */}

      <div
        ref={gridRef}
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.35) 1.2px, transparent 1.2px)",
          backgroundSize: "40px 40px",
          maskImage:
            "radial-gradient(circle 260px at var(--x) var(--y), rgba(0,0,0,1), rgba(0,0,0,0.3) 60%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(circle 260px at var(--x) var(--y), rgba(0,0,0,1), rgba(0,0,0,0.3) 60%, transparent 100%)",
        }}
      />

      {/* HERO CONTENT */}

      <div className="relative z-10 max-w-4xl">

        <div className="relative rounded-[36px] p-12 border border-white/20 backdrop-blur-2xl bg-white/[0.06] shadow-[0_40px_140px_rgba(0,0,0,0.7)] overflow-hidden">

          {/* moving glass glare */}

          <div
            ref={glareRef}
            className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] opacity-30 bg-[radial-gradient(circle,rgba(255,255,255,0.5),transparent_60%)] transition-transform duration-500"
          />

          {/* shine sweep */}

          <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.15),transparent)] opacity-40 animate-[shine_6s_linear_infinite]" />

          <h1 className="mb-6 text-5xl sm:text-6xl font-bold tracking-tight leading-tight">

            <span className="bg-gradient-to-r from-emerald-300 via-white to-purple-300 bg-clip-text text-transparent">
              Global Financial Literacy
            </span>

            <br />

            <span className="text-white">
              Initiative
            </span>

          </h1>

          <p className="mb-8 text-lg sm:text-xl text-white/85 leading-relaxed">
            Empowering the next generation of financial thinkers through
            research, global education programs, and student-led initiatives.
            Finance4All Meta began as a grassroots outreach program teaching
            financial literacy across schools in India and is now expanding
            into a global network of students passionate about economics,
            markets, and entrepreneurship.
          </p>

          {/* IMPACT */}

          <div className="flex flex-wrap justify-center gap-12 mb-10 text-white">

            <div>
              <p className="text-3xl font-bold text-emerald-300">25,000+</p>
              <p className="text-xs uppercase tracking-widest text-white/60">
                Students Impacted
              </p>
            </div>

            <div>
              <p className="text-3xl font-bold text-emerald-300">15+</p>
              <p className="text-xs uppercase tracking-widest text-white/60">
                Countries
              </p>
            </div>

            <div>
              <p className="text-3xl font-bold text-emerald-300">50+</p>
              <p className="text-xs uppercase tracking-widest text-white/60">
                Global Members
              </p>
            </div>

          </div>

          {/* BUTTONS */}

          <div className="flex flex-wrap justify-center gap-4">

            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-3 text-white font-medium shadow-[0_12px_60px_rgba(0,255,180,0.45)] transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_90px_rgba(0,255,180,0.7)]"
            >
              Enter Member Portal
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="#programs"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-3 text-white backdrop-blur-lg transition-all duration-300 hover:bg-white/10 hover:scale-105"
            >
              Explore Programs
              <ExternalLink className="h-4 w-4" />
            </a>

            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-8 py-3 text-emerald-200 backdrop-blur-lg transition-all duration-300 hover:bg-emerald-400/20 hover:scale-105"
            >
              Create Account
            </Link>

          </div>

        </div>

        {/* GITHUB */}

        <div className="mt-10">

          <a
            href="https://github.com/build-the-future-11/FinanceMeta-Global"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-white font-medium backdrop-blur-xl transition-all duration-300 hover:bg-white/20 hover:border-white/30 hover:scale-105"
          >
            <Github className="h-4 w-4" />
            Open Source Project
            <ExternalLink className="h-3 w-3 opacity-70" />
          </a>

        </div>

      </div>

    </section>
  );
}
