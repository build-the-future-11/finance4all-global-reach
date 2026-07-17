import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { AlertCircle, Bookmark, Briefcase, Calendar, FlaskConical, Newspaper, RefreshCw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  type DialogProps,
} from "@/components/ui/dialog";
import { Command } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { AlertDialogContent } from "@/components/ui/alert-dialog";
import { SheetContent } from "@/components/ui/sheet";
import { PopoverContent } from "@/components/ui/popover";
import { portalCopy } from "@/lib/portalCopy";
import { sanitizeUserFacingError } from "@/lib/authErrors";

/* Shared tokens colocated for DX; Fast Refresh trade-off documented in DECISION_LOG D-011. */
/* eslint-disable react-refresh/only-export-components */

export const ACTIVITY_ICONS = {
  news: Newspaper,
  lab_application: FlaskConical,
  connection: Users,
  event: Calendar,
  saved_article: Bookmark,
  opportunity: Briefcase,
} as const;

/** Shared portal form & surface class strings */
export const portalInputClass =
  "mt-1.5 min-h-10 border-white/15 bg-white/[0.06] text-white placeholder:text-white/35 transition-[border-color,background-color,box-shadow] duration-200 focus-visible:border-emerald-400/60 focus-visible:ring-2 focus-visible:ring-emerald-400/25 focus-visible:ring-offset-0";

export const portalTextareaClass =
  "mt-1.5 min-h-[100px] border-white/15 bg-white/[0.06] text-white placeholder:text-white/35 transition-[border-color,background-color,box-shadow] duration-200 focus-visible:border-emerald-400/60 focus-visible:ring-2 focus-visible:ring-emerald-400/25 focus-visible:ring-offset-0";

export const portalButtonOutline =
  "border-white/20 bg-white/5 text-white transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:ring-emerald-400/30";

export const portalButtonPrimary =
  "bg-emerald-500 text-white shadow-[0_4px_14px_rgba(16,185,129,0.18)] transition-[background-color,box-shadow] duration-200 hover:bg-emerald-400 hover:shadow-[0_6px_20px_rgba(16,185,129,0.28)] focus-visible:ring-emerald-400/40";

export const portalLinkClass =
  "font-medium text-emerald-400 underline-offset-4 transition-colors duration-200 hover:text-emerald-300 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-sm";

export const portalDialogClass =
  "border-white/15 bg-[hsl(var(--portal-surface))] text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:rounded-2xl";

export const portalTabsListClass = "flex h-auto flex-wrap gap-1 bg-white/[0.04] p-1";

export const portalTabsTriggerClass =
  "rounded-lg px-3 py-1.5 text-sm transition-all duration-200 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300 data-[state=active]:shadow-none focus-visible:ring-emerald-400/30";

export const portalSelectContentClass =
  "border-white/15 bg-[hsl(var(--portal-surface))] text-white";

export const portalSelectItemClass = "focus:bg-emerald-500/15 focus:text-emerald-200";

export const portalButtonDanger =
  "text-red-400/70 hover:bg-red-500/10 hover:text-red-400 focus-visible:ring-red-400/30";

export const portalSurfaceClass =
  "border-white/15 bg-[hsl(var(--portal-surface))] text-white";

export const landingEyebrowClass =
  "text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-400/85";

export const portalAlertCancelClass =
  "border-white/20 bg-transparent text-white hover:bg-white/10";

export const portalAlertDestructiveClass = "bg-red-600 hover:bg-red-500";

export const portalLabelClass = "text-sm font-medium text-white/70";

export function PortalDialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogContent>) {
  return (
    <DialogContent className={cn(portalDialogClass, className)} {...props}>
      {children}
    </DialogContent>
  );
}

export function PortalCommandDialog({ children, ...props }: DialogProps) {
  return (
    <Dialog {...props}>
      <PortalDialogContent className="overflow-hidden p-0 sm:max-w-xl">
        <Command className="border-0 bg-transparent text-white [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-white/40 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </PortalDialogContent>
    </Dialog>
  );
}

export function PortalDialogHeader({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <DialogHeader className={className}>
      <DialogTitle className="text-white">{title}</DialogTitle>
      {description && (
        <DialogDescription className="text-white/55">{description}</DialogDescription>
      )}
    </DialogHeader>
  );
}

export function PortalInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return <Input className={cn(portalInputClass, className)} {...props} />;
}

export function PortalTextarea({
  className,
  ...props
}: React.ComponentProps<typeof Textarea>) {
  return <Textarea className={cn(portalTextareaClass, className)} {...props} />;
}

export function PortalLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return <Label className={cn(portalLabelClass, className)} {...props} />;
}

export function PortalTabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsList>) {
  return <TabsList className={cn(portalTabsListClass, className)} {...props} />;
}

export function PortalTabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsTrigger>) {
  return <TabsTrigger className={cn(portalTabsTriggerClass, className)} {...props} />;
}

export function PortalTabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsContent>) {
  return (
    <TabsContent
      className={cn("animate-in fade-in duration-300 focus-visible:outline-none", className)}
      {...props}
    />
  );
}

export function PortalAlert({
  variant = "info",
  children,
  className,
}: {
  variant?: "info" | "success" | "error" | "warning";
  children: React.ReactNode;
  className?: string;
}) {
  const variants = {
    info: "border-white/15 bg-white/[0.04] text-white/70",
    success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
    error: "border-red-500/20 bg-red-500/10 text-red-300",
    warning: "border-amber-500/25 bg-amber-500/10 text-amber-100/90",
  };

  return (
    <p
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
        variants[variant],
        className,
      )}
    >
      {children}
    </p>
  );
}

export function PortalSelectContent({
  className,
  ...props
}: React.ComponentProps<typeof SelectContent>) {
  return <SelectContent className={cn(portalSelectContentClass, className)} {...props} />;
}

export function PortalSelectItem({
  className,
  ...props
}: React.ComponentProps<typeof SelectItem>) {
  return <SelectItem className={cn(portalSelectItemClass, className)} {...props} />;
}

export function PortalToggleRow({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4",
        className,
      )}
    >
      <div className="min-w-0 pr-4">
        <p className="text-sm font-medium text-white">{title}</p>
        {description && <p className="mt-0.5 text-xs text-white/45">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function PortalInterestPill({
  active = false,
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "portal-focus-ring portal-interactive rounded-full px-3 py-1.5 text-xs font-medium",
        active
          ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30"
          : "bg-white/[0.05] text-white/55 ring-1 ring-white/10 hover:bg-white/10",
        className,
      )}
      aria-pressed={active}
      {...props}
    >
      {children}
    </button>
  );
}

export function PortalProgressBar({
  value,
  className,
  label,
}: {
  value: number;
  className?: string;
  label?: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      className={cn("h-2 overflow-hidden rounded-full bg-white/10", className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500 ease-portal"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export function PortalSectionHeading({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="font-semibold tracking-tight text-white">{title}</h3>
      {description && <p className="mt-1 text-sm text-white/50">{description}</p>}
    </div>
  );
}

export function PortalFullPageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col items-center justify-center bg-portal-bg px-4 text-white",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/3 top-1/4 h-72 w-72 rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>
      {children}
    </div>
  );
}

export function PortalDataRow({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <PortalCard className={cn("flex flex-wrap items-center justify-between gap-3 p-4", className)} {...props}>
      {children}
    </PortalCard>
  );
}

export function PortalFormField({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <PortalLabel htmlFor={htmlFor}>{label}</PortalLabel>
      {children}
      {hint && <p className="mt-1 text-xs text-white/35">{hint}</p>}
    </div>
  );
}

export function PortalAlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogContent>) {
  return <AlertDialogContent className={cn(portalDialogClass, className)} {...props} />;
}

export function PortalSheetContent({
  className,
  ...props
}: React.ComponentProps<typeof SheetContent>) {
  return (
    <SheetContent className={cn(portalSurfaceClass, "rounded-t-2xl border-t", className)} {...props} />
  );
}

export function PortalPopoverContent({
  className,
  ...props
}: React.ComponentProps<typeof PopoverContent>) {
  return <PopoverContent className={cn(portalSurfaceClass, className)} {...props} />;
}

export function PortalCard({
  className,
  children,
  hover = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div
      className={cn(
        "portal-glass",
        hover &&
          "portal-interactive hover:border-white/20 hover:bg-white/[0.06] hover:shadow-[0_12px_40px_rgba(0,0,0,0.28)] hover:-translate-y-0.5",
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
      <div className="min-w-0">
        {eyebrow && (
          <p className={cn("mb-2", landingEyebrowClass)}>
            {eyebrow}
          </p>
        )}
        <h1 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2.5 max-w-2xl text-pretty text-sm leading-relaxed text-white/55 sm:text-base">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0 max-sm:w-full max-sm:[&>button]:w-full">{action}</div>}
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
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
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
    <PortalCard className="group portal-card-shimmer relative overflow-hidden p-5">
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

export function LoadingState({ label = portalCopy.ui.loading }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20" role="status" aria-live="polite">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/15 border-t-emerald-400" aria-hidden />
      <p className="text-sm text-white/45">{label}</p>
    </div>
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <PortalCard className="animate-pulse p-5" aria-hidden>
      <div className="mb-3 h-4 w-20 rounded-md bg-white/10" />
      <div className="mb-2 h-6 w-3/4 rounded-md bg-white/10" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="mb-2 h-3 rounded-md bg-white/[0.06]" style={{ width: `${90 - i * 15}%` }} />
      ))}
    </PortalCard>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function EmptyState({
  message,
  icon: Icon,
  action,
}: {
  message: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <PortalCard className="relative overflow-hidden p-8 sm:p-12">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/8 via-transparent to-blue-500/8" />
      <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-blue-400/10 blur-3xl" />
      <div className="relative flex flex-col items-center text-center">
        {Icon && (
          <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <Icon className="h-8 w-8 text-emerald-400/70" />
          </div>
        )}
        <p className="max-w-md text-sm leading-relaxed text-white/50">{message}</p>
        {action && <div className="mt-6 w-full">{action}</div>}
      </div>
    </PortalCard>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <PortalCard className="flex flex-col items-center gap-4 p-10 text-center">
      <AlertCircle className="h-10 w-10 text-red-400/60" />
      <p className="max-w-md text-sm text-white/55">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          className={portalButtonOutline}
          onClick={onRetry}
        >
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          Try again
        </Button>
      )}
    </PortalCard>
  );
}

export function QueryStatus({
  isLoading,
  error,
  isEmpty,
  emptyMessage,
  onRetry,
  children,
  skeletonCount = 3,
}: {
  isLoading: boolean;
  error: unknown;
  isEmpty?: boolean;
  emptyMessage?: string;
  onRetry?: () => void;
  children: React.ReactNode;
  skeletonCount?: number;
}) {
  if (isLoading) return <SkeletonList count={skeletonCount} />;
  if (error)
    return (
      <ErrorState
        message={
          sanitizeUserFacingError(
            error instanceof Error
              ? error.message
              : typeof error === "object" && error && "message" in error
                ? String((error as { message: unknown }).message)
                : portalCopy.ui.errorDefault,
          )
        }
        onRetry={onRetry}
      />
    );
  if (isEmpty) return <EmptyState message={emptyMessage ?? portalCopy.ui.emptyDefault} />;
  return <>{children}</>;
}

export function PortalHero({
  greeting,
  name,
  subtitle,
  badges,
}: {
  greeting?: string;
  name: string;
  subtitle?: string;
  badges?: React.ReactNode;
}) {
  return (
    <PortalCard className="portal-hero-mesh relative overflow-hidden p-6 sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/12 via-transparent to-indigo-500/10" />
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl portal-orb-float" />
      <div className="pointer-events-none absolute -bottom-16 left-1/4 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl portal-orb-float-delay" />
      <div className="portal-hero-grid pointer-events-none absolute inset-0 opacity-30" />
      <div className="relative">
        {greeting && (
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-400/90">
            {greeting}
          </p>
        )}
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">{name}</h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
            {subtitle}
          </p>
        )}
        {badges && <div className="mt-3 flex flex-wrap items-center gap-2">{badges}</div>}
      </div>
    </PortalCard>
  );
}
