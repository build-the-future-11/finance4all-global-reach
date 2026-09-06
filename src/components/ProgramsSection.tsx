import { useState, useRef } from "react";
import {
  Mic,
  Briefcase,
  Trophy,
  Monitor,
  GraduationCap,
  BookOpen,
  FlaskConical,
  Newspaper,
  School,
  ChevronDown,
} from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const programs = [
  {
    icon: School,
    title: "Global Literacy Outreach",
    short: "A planned financial-literacy workshop format.",
    detail:
      "Launch requires a named lead, consent-safe participant records, a frozen lesson plan, and a published outcome report.",
  },
  {
    icon: Newspaper,
    title: "Economics Journal",
    short: "A planned evidence-led student publication.",
    detail:
      "Launch requires an editorial standard, source citations, corrections policy, and a clear analysis-versus-advice boundary.",
  },
  {
    icon: FlaskConical,
    title: "Research Lab",
    short: "A planned directory for reproducible student research.",
    detail:
      "Projects become active only with a named lead, research question, baseline, data provenance, and reproducible artifact.",
  },
  {
    icon: BookOpen,
    title: "Global School Clubs",
    short: "A planned local chapter and curriculum model.",
    detail:
      "A chapter becomes active only after a verified lead publishes a qualifying output and maintains a current evidence record.",
  },
  {
    icon: GraduationCap,
    title: "School Visits",
    short: "A planned community workshop format.",
    detail:
      "Workshops remain planned until safeguarding, consent, curriculum, attendance, and outcome-reporting requirements are met.",
  },
  {
    icon: Mic,
    title: "Student Podcasts",
    short: "A planned interview and explanation series.",
    detail:
      "Episodes require a named producer, guest consent, sources, corrections process, and a published recording before listing.",
  },
  {
    icon: Briefcase,
    title: "Industry Projects",
    short: "A planned project-based learning track.",
    detail:
      "Projects require a defined problem, reviewer, public rubric, working artifact, and evidence before any adoption claim.",
  },
  {
    icon: Trophy,
    title: "Economics Olympiad",
    short: "A planned competition in economic reasoning.",
    detail:
      "Launch requires frozen rules, scoring, conflicts policy, data windows, anti-leakage controls, and reproducible judging records.",
  },
  {
    icon: Monitor,
    title: "Digital Education",
    short: "A planned library of sourced learning material.",
    detail:
      "Content is published only with sources, review ownership, revision history, and a measurable completion rule.",
  },
];

function ProgramCard({ program }: { program: typeof programs[0] }) {
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const Icon = program.icon;

  const handleMove = (e: React.MouseEvent) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    cardRef.current?.style.setProperty("--x", `${x}px`);
    cardRef.current?.style.setProperty("--y", `${y}px`);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      onClick={() => setExpanded(!expanded)}
      className="
        group relative cursor-pointer p-6 rounded-3xl
        border border-white/20
        backdrop-blur-xl
        bg-white/[0.04]
        transition-all duration-500
        hover:border-white/40
        hover:-translate-y-1
        overflow-hidden
      "
    >
      {/* cursor glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition"
        style={{
          background:
            "radial-gradient(circle 250px at var(--x) var(--y), rgba(255,255,255,0.15), transparent 60%)",
        }}
      />

      {/* gradient edge glow */}
      <div className="absolute inset-0 rounded-3xl pointer-events-none bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.2),transparent)] opacity-20" />

      <div className="relative flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <div className="p-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md text-emerald-300">
              <Icon className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white">
                {program.title}
              </h3>

              <p className="text-xs text-white/70 mt-1">
                {program.short}
              </p>
            </div>
          </div>

          <ChevronDown
            className={`h-4 w-4 text-white/70 transition-transform duration-300 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </div>

        <div
          className={`transition-all duration-500 overflow-hidden ${
            expanded ? "max-h-40 opacity-100 mt-3" : "max-h-0 opacity-0"
          }`}
        >
          <p className="text-xs text-white/60 border-t border-white/10 pt-3">
            {program.detail}
          </p>
        </div>
      </div>
    </div>
  );
}

function ImpactNumbers() {
  const stats = [
    { value: "7", label: "Planned program families" },
    { value: "1", label: "Synthetic research baseline" },
    { value: "0", label: "Unsupported impact claims" },
  ];

  return (
    <div className="mt-28 grid sm:grid-cols-3 gap-6">
      {stats.map((s) => (
        <div
          key={s.label}
          className="
            p-10 text-center rounded-3xl
            border border-white/20
            backdrop-blur-xl
            bg-white/[0.05]
            hover:bg-white/[0.08]
            transition
          "
        >
          <p className="text-4xl font-bold text-white">{s.value}</p>

          <p className="text-xs uppercase tracking-widest text-white/60 mt-2">
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function ProgramsSection() {
  const ref = useScrollReveal();

  return (
    <section id="programs" className="relative px-4 py-36 overflow-hidden">
      {/* background blobs */}

      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 left-1/4 w-[380px] h-[380px] rounded-full bg-emerald-400/20 blur-[140px]" />
        <div className="absolute top-20 right-1/4 w-[420px] h-[420px] rounded-full bg-purple-400/20 blur-[160px]" />
        <div className="absolute bottom-10 left-1/3 w-[420px] h-[420px] rounded-full bg-blue-400/20 blur-[150px]" />
      </div>

      <div ref={ref} className="mx-auto max-w-6xl">
        <div className="text-center mb-20">
          <p className="text-sm uppercase tracking-widest text-emerald-300 mb-3">
            Initiatives
          </p>

          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            Programs With Explicit
            <span className="bg-gradient-to-r from-emerald-300 to-purple-300 bg-clip-text text-transparent">
              {" "}Evidence Gates
            </span>
          </h2>

          <p className="text-white/70 mt-4 text-sm">
            Click a planned program to inspect what must exist before it is
            described as active.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => (
            <ProgramCard key={p.title} program={p} />
          ))}
        </div>

        <ImpactNumbers />

      </div>
    </section>
  );
}
