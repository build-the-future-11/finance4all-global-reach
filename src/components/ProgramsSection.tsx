import { useState, useRef } from "react";
import { Link } from "react-router-dom";
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
import SectionHeader from "@/components/landing/SectionHeader";

const programs = [
  {
    icon: School,
    title: "Global Literacy Outreach",
    short: "Catalyst workshops in underserved schools — budgeting, banking, investing.",
    detail:
      "Volunteers deliver the same 90-minute Catalyst modules found in the Education hub. Chapters report attendance; curriculum updates sync to the portal so Mumbai and London teach from one source.",
    href: "/portal/education",
  },
  {
    icon: Newspaper,
    title: "Economics Journal",
    short: "Student opinion and market analysis with editorial review.",
    detail:
      "Submissions flow through Pathways. Editors push back on unsupported claims and unclear structure before pieces are promoted externally. Standards live in the Resources library.",
    href: "/portal/pathways/essays",
  },
  {
    icon: FlaskConical,
    title: "Meta Labs",
    short: "Mentor-led research with defined deliverables.",
    detail:
      "Atlas Economics Lab, IYERN, and fintech tracks each list open projects with lead researchers. Applications include motivation statements — reviewed by humans, not auto-scored.",
    href: "/portal/labs",
  },
  {
    icon: BookOpen,
    title: "Global School Clubs",
    short: "Faculty-backed chapters with a month-by-month playbook.",
    detail:
      "The club toolkit covers officer roles, first events, and sponsor outreach. Quant firms often support puzzle nights when chapters document learning outcomes.",
    href: "/portal/resources/club-toolkit",
  },
  {
    icon: GraduationCap,
    title: "Catalyst Education",
    short: "Full lesson library — the outreach curriculum, online.",
    detail:
      "Seven modules from financial foundations through research writing. Each lesson includes key terms, markdown body, and an exercise members can complete at their own pace.",
    href: "/portal/education",
  },
  {
    icon: Mic,
    title: "Student Podcasts",
    short: "Founder interviews curated for members.",
    detail:
      "External playlist linked from Resources — conversations with young entrepreneurs on building companies while still in school.",
    href: "/portal/resources",
  },
  {
    icon: Briefcase,
    title: "Industry Projects",
    short: "Case-style challenges via Pathways.",
    detail:
      "Members tackle structured finance problems with rubrics aligned to how practitioners evaluate work — not open-ended \"build a startup\" prompts.",
    href: "/portal/pathways",
  },
  {
    icon: Trophy,
    title: "Economics Olympiad",
    short: "Competition prep and partner links.",
    detail:
      "Practice cases and olympiad resources aggregated in Pathways for members preparing for national and international rounds.",
    href: "/portal/pathways",
  },
  {
    icon: Monitor,
    title: "Finance Debriefed",
    short: "Weekly macro digest and live headlines.",
    detail:
      "Member news hub with optional live headline feed, Substack integration, and explainers that decode the week's narratives for beginners.",
    href: "/portal/debriefed",
  },
];

const partners = [
  "Jane Street",
  "The Economics Lab",
  "Colgate",
  "KFC",
  "Stanford Researchers",
  "MIT Researchers",
  "UC Berkeley Researchers",
  "Harvard Researchers",
  "EconScholars",
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
        group relative cursor-pointer overflow-hidden rounded-2xl
        border border-white/10
        bg-white/[0.03]
        p-6
        transition-all duration-300
        hover:border-white/20
        hover:bg-white/[0.05]
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
            expanded ? "max-h-48 opacity-100 mt-3" : "max-h-0 opacity-0"
          }`}
        >
          <p className="text-xs text-white/60 border-t border-white/10 pt-3">
            {program.detail}
          </p>
          {program.href && (
            <Link
              to={program.href}
              onClick={(e) => e.stopPropagation()}
              className="mt-3 inline-block text-xs font-medium text-emerald-300 hover:underline"
            >
              Open in portal →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function PartnersSection() {
  return (
    <div className="mt-24 rounded-3xl border border-white/10 bg-white/[0.02] p-10 sm:p-12">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white sm:text-3xl">Partners & collaborators</h3>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/50">
          Researchers, chapter sponsors, and programs that connect members to real mentorship —
          not logo walls without substance.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {partners.map((p) => (
          <div
            key={p}
            className="rounded-full border border-white/12 bg-white/[0.04] px-5 py-2 text-sm text-white/65 transition hover:border-white/25 hover:text-white/90"
          >
            {p}
          </div>
        ))}
      </div>
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
        <SectionHeader
          eyebrow="Initiatives"
          title="Nine programs. Each links to the portal."
          description="Expand a card to read how it works — then open the module where members actually participate."
          className="mb-16"
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => (
            <ProgramCard key={p.title} program={p} />
          ))}
        </div>

        <PartnersSection />
      </div>
    </section>
  );
}
