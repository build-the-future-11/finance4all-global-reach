import { cn } from "@/lib/utils";
import type { UserProfile } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Shield, Sparkles } from "lucide-react";

const ROLE_LABELS: Record<UserProfile["role"], string> = {
  member: "Member",
  lead_researcher: "Lead Researcher",
  admin: "Administrator",
};

const ROLE_ACCENTS: Record<UserProfile["role"], string> = {
  member: "from-emerald-500/30 via-emerald-600/10 to-blue-500/20",
  lead_researcher: "from-blue-500/30 via-purple-500/10 to-emerald-500/20",
  admin: "from-amber-500/30 via-orange-500/10 to-emerald-500/20",
};

interface MembershipCardProps {
  profile: UserProfile;
  chapterName?: string;
  className?: string;
  compact?: boolean;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function MembershipCard({
  profile,
  chapterName,
  className,
  compact,
}: MembershipCardProps) {
  const memberSince = new Date(profile.createdAt).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/[0.15] shadow-[0_20px_60px_rgba(0,0,0,0.35)]",
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-90",
          ROLE_ACCENTS[profile.role],
        )}
      />
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBIMzBWMzBIMFYwWiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+')] opacity-40" />

      <div className={cn("relative", compact ? "p-5" : "p-6 sm:p-7")}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/50">
            <Sparkles className="h-3 w-3 text-emerald-300" />
            Finance4All
          </div>
          {profile.role !== "member" && (
            <Badge className="border-0 bg-white/15 text-[10px] text-white backdrop-blur-sm">
              <Shield className="mr-1 h-3 w-3" />
              {ROLE_LABELS[profile.role]}
            </Badge>
          )}
        </div>

        <div className={cn("flex items-center gap-4", compact ? "mt-4" : "mt-6")}>
          <Avatar className={cn("border-2 border-white/25", compact ? "h-14 w-14" : "h-16 w-16")}>
            <AvatarImage src={profile.avatarUrl} />
            <AvatarFallback className="bg-black/20 text-lg text-emerald-200">
              {initials(profile.displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold text-white">{profile.displayName}</p>
            <p className="truncate text-xs text-white/55">{profile.email}</p>
            {chapterName && (
              <p className="mt-1 text-xs text-emerald-200/80">{chapterName}</p>
            )}
          </div>
        </div>

        <div className="mt-5 flex items-end justify-between border-t border-white/15 pt-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/40">Member since</p>
            <p className="text-sm font-medium text-white/80">{memberSince}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-white/40">ID</p>
            <p className="font-mono text-xs text-white/50">{profile.id.slice(0, 8)}…</p>
          </div>
        </div>
      </div>
    </div>
  );
}
