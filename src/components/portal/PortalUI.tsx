import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export const portalInputClass =
  "mt-1.5 border-white/15 bg-white/[0.06] text-white placeholder:text-white/30 focus-visible:border-emerald-400/40 focus-visible:ring-emerald-400/20";

export const portalButtonOutline =
  "border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white";

export function PortalCard({
  className,
  children,
  hover = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.12] bg-white/[0.04] backdrop-blur-xl",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]",
        hover && "transition duration-300 hover:border-white/25 hover:bg-white/[0.07] hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function PortalPageHeader({
  title,
  description,
  action,
  eyebrow,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-emerald-400/80">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function PortalSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "emerald",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "emerald" | "blue" | "amber" | "purple";
}) {
  const accents = {
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-300",
    blue: "from-blue-500/20 to-blue-500/5 text-blue-300",
    amber: "from-amber-500/20 to-amber-500/5 text-amber-300",
    purple: "from-purple-500/20 to-purple-500/5 text-purple-300",
  };

  return (
    <PortalCard className="group relative overflow-hidden p-5">
      <div
        className={cn(
          "absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br opacity-60 blur-2xl transition group-hover:opacity-100",
          accents[accent],
        )}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-white/45">{label}</p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-white">{value}</p>
        </div>
        <div className={cn("rounded-xl bg-gradient-to-br p-2.5", accents[accent])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </PortalCard>
  );
}

export function CategoryBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-0.5 text-xs font-medium capitalize text-white/70",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/15 border-t-emerald-400" />
      <p className="text-sm text-white/40">Loading…</p>
    </div>
  );
}

export function EmptyState({
  message,
  icon: Icon,
}: {
  message: string;
  icon?: LucideIcon;
}) {
  return (
    <PortalCard className="flex flex-col items-center justify-center gap-3 p-12 text-center">
      {Icon && <Icon className="h-10 w-10 text-white/20" />}
      <p className="max-w-sm text-sm text-white/45">{message}</p>
    </PortalCard>
  );
}

export function PortalHero({
  greeting,
  name,
  badges,
}: {
  greeting?: string;
  name: string;
  badges?: React.ReactNode;
}) {
  return (
    <PortalCard className="relative overflow-hidden p-6 sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10" />
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="relative">
        {greeting && (
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-400/90">
            {greeting}
          </p>
        )}
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">{name}</h1>
        {badges && <div className="mt-3 flex flex-wrap items-center gap-2">{badges}</div>}
      </div>
    </PortalCard>
  );
}
