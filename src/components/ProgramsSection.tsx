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
    short: "Teaching financial fundamentals in underserved schools worldwide.",
    detail:
      "Our volunteers visit underprivileged schools across multiple countries to teach essential concepts like budgeting, saving, investing, and entrepreneurship—giving students tools rarely covered in traditional curricula.",
  },
  {
    icon: Newspaper,
    title: "Economics Journal",
    short: "Student-run publication with global reach.",
    detail:
      "Students from around the world submit opinion columns and market analysis. The strongest pieces are promoted to outlets connected to major financial and economic publications.",
  },
  {
    icon: FlaskConical,
    title: "Research Lab",
    short: "Mentored research with leading universities.",
    detail:
      "Students collaborate on research projects guided by mentors affiliated with institutions including Stanford University, MIT, the University of Chicago, and others.",
  },
  {
    icon: BookOpen,
    title: "Global School Clubs",
    short: "Structured curriculum backed by industry pros.",
    detail:
      "Clubs run educational programs using a curriculum supported by professionals connected to quantitative trading firms such as Jane Street.",
  },
  {
    icon: GraduationCap,
    title: "School Visits",
    short: "Hands-on financial workshops in communities.",
    detail:
      "Interactive workshops in underprivileged communities teaching budgeting, investing basics, and entrepreneurship fundamentals.",
  },
  {
    icon: Mic,
    title: "Student Podcasts",
    short: "Conversations with young entrepreneurs.",
    detail:
      "A podcast series featuring successful student founders sharing their journeys and insights for the next generation.",
  },
  {
    icon: Briefcase,
    title: "Industry Projects",
    short: "Real problems judged by professionals.",
    detail:
      "Students tackle real finance challenges evaluated by industry professionals and university professors.",
  },
  {
    icon: Trophy,
    title: "Economics Olympiad",
    short: "Global competition in economic reasoning.",
    detail:
      "A worldwide olympiad where students apply economic thinking to real-world market problems.",
  },
  {
    icon: Monitor,
    title: "Digital Education",
    short: "Scaling financial literacy online.",
    detail:
      "Educational content delivered through digital platforms reaching thousands of students globally.",
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
    { value: "25,000+", label: "Students Impacted" },
    { value: "15+", label: "Countries Reached" },
    { value: "50+", label: "Global Members" },
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

function PartnersSection() {
  return (
    <div className="mt-32">
      <div className="text-center mb-12">
        <h3 className="text-3xl font-bold text-white">
          Partners & Collaborators
        </h3>

        <p className="text-white/70 text-sm mt-3 max-w-xl mx-auto">
          Finance4All Meta collaborates with researchers, institutions,
          and organizations advancing financial education worldwide.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {partners.map((p) => (
          <div
            key={p}
            className="
              px-6 py-2 rounded-full
              border border-white/20
              bg-white/[0.05]
              text-white/80
              hover:text-white
              hover:border-white/40
              hover:bg-white/[0.08]
              transition
            "
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
        <div className="text-center mb-20">
          <p className="text-sm uppercase tracking-widest text-emerald-300 mb-3">
            Initiatives
          </p>

          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            Programs Driving Global
            <span className="bg-gradient-to-r from-emerald-300 to-purple-300 bg-clip-text text-transparent">
              {" "}Financial Education
            </span>
          </h2>

          <p className="text-white/70 mt-4 text-sm">
            Click any program to explore how students are building the future
            of financial literacy.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => (
            <ProgramCard key={p.title} program={p} />
          ))}
        </div>

        <ImpactNumbers />

        <PartnersSection />
      </div>
    </section>
  );
}
