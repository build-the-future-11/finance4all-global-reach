import { cn } from "@/lib/utils";
import type { MemberBadge } from "@/lib/badges";
import { Award, Lock } from "lucide-react";

interface MemberBadgesProps {
  badges: MemberBadge[];
  compact?: boolean;
  className?: string;
}

export default function MemberBadges({ badges, compact, className }: MemberBadgesProps) {
  const earned = badges.filter((b) => b.earned);
  const locked = badges.filter((b) => !b.earned);

  if (compact) {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {earned.map((b) => (
          <span
            key={b.id}
            title={b.description}
            className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-300 ring-1 ring-emerald-400/20"
          >
            <Award className="h-3 w-3" />
            {b.label}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid gap-2 sm:grid-cols-2">
        {earned.map((b) => (
          <div
            key={b.id}
            className="flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3"
          >
            <Award className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
            <div>
              <p className="text-sm font-medium text-white">{b.label}</p>
              <p className="text-xs text-white/50">{b.description}</p>
            </div>
          </div>
        ))}
        {locked.slice(0, 4).map((b) => (
          <div
            key={b.id}
            className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 opacity-60"
          >
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-white/30" />
            <div>
              <p className="text-sm font-medium text-white/60">{b.label}</p>
              <p className="text-xs text-white/35">{b.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
