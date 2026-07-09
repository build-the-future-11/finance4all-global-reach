import { cn } from "@/lib/utils";

export function PortalCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-xl",
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
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-white/60">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-emerald-400" />
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <PortalCard className="p-10 text-center">
      <p className="text-white/50">{message}</p>
    </PortalCard>
  );
}
