import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, FileText, Headphones, GraduationCap } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const PREVIEW = [
  {
    icon: GraduationCap,
    title: "Catalyst curriculum",
    desc: "Free lessons from budgeting to investing — track progress in the portal.",
    href: "/portal/education",
  },
  {
    icon: FileText,
    title: "Economics Journal",
    desc: "Submit analysis and opinion pieces for global editorial review.",
    href: "/portal/pathways/essays",
  },
  {
    icon: Headphones,
    title: "Podcasts & media",
    desc: "Student founder conversations and Debriefed audio content.",
    href: "/portal/resources",
  },
  {
    icon: BookOpen,
    title: "Club toolkit",
    desc: "Launch a Finance4All chapter at your school with our playbooks.",
    href: "/portal/resources",
  },
];

export default function ResourcesPreviewSection() {
  const ref = useScrollReveal();

  return (
    <section className="relative px-4 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[140px]" />
      </div>

      <div ref={ref} className="mx-auto max-w-6xl">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400/90">
              Write & learn
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-5xl">
              Resources members actually use
            </h2>
            <p className="mt-4 max-w-xl text-white/55">
              Curriculum, journal submissions, podcasts, and partner programs — not just landing-page
              copy. Sign in to access everything FinanceMeta publishes.
            </p>
          </div>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Get free access <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {PREVIEW.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                to={item.href}
                className="group flex gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition hover:border-white/25 hover:bg-white/[0.07]"
              >
                <div className="rounded-2xl border border-white/10 bg-emerald-500/10 p-3 text-emerald-300 transition group-hover:scale-105">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-emerald-200">{item.title}</h3>
                  <p className="mt-1 text-sm text-white/50">{item.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
