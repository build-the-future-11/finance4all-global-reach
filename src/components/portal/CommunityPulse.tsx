import { Globe2, FlaskConical, Users, MessageSquare } from "lucide-react";
import { useCommunityStats } from "@/hooks/portal/useCommunityStats";
import { PortalCard } from "@/components/portal/PortalUI";

const HIGHLIGHTS = [
  "Researchers from Stanford, MIT, IIT, Princeton & more",
  "Student-led labs producing publication-quality work",
  "Global chapters connecting finance & economics talent",
];

export default function CommunityPulse() {
  const { data: stats } = useCommunityStats();

  const metrics = [
    {
      label: "Members",
      value: stats?.members ?? "—",
      icon: Users,
      accent: "text-emerald-300",
    },
    {
      label: "Chapters",
      value: stats?.chapters ?? "—",
      icon: Globe2,
      accent: "text-blue-300",
    },
    {
      label: "Open labs",
      value: stats?.openProjects ?? "—",
      icon: FlaskConical,
      accent: "text-amber-300",
    },
    {
      label: "Introductions",
      value: stats?.introductions ?? "—",
      icon: MessageSquare,
      accent: "text-purple-300",
    },
  ];

  return (
    <PortalCard className="relative overflow-hidden border-emerald-400/15 bg-gradient-to-br from-emerald-500/[0.08] via-transparent to-blue-500/[0.06] p-6">
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="relative">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-400/90">
          FinanceMeta Network
        </p>
        <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
          A global research community
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-white/55">
          Finance4All Meta connects students and researchers across economics, markets, and
          fintech — from Debriefed news to Meta Labs research and Axiom Pathways opportunities.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${m.accent}`} />
                  <span className="text-xs text-white/45">{m.label}</span>
                </div>
                <p className="mt-1 text-2xl font-bold text-white">{m.value}</p>
              </div>
            );
          })}
        </div>

        <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/40">
          {HIGHLIGHTS.map((line) => (
            <li key={line} className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-emerald-400/70" />
              {line}
            </li>
          ))}
        </ul>
      </div>
    </PortalCard>
  );
}
