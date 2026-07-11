import { Link } from "react-router-dom";
import { ShieldX } from "lucide-react";
import { portalRoutes } from "@/routes/portal";
import { PortalCard, portalButtonOutline, portalButtonPrimary } from "@/components/portal/PortalUI";
import { Button } from "@/components/ui/button";

interface AccessDeniedProps {
  title?: string;
  description?: string;
}

export default function AccessDenied({
  title = "Access restricted",
  description = "This area is limited to specific member roles. If you believe you should have access, contact your chapter lead or an admin.",
}: AccessDeniedProps) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center py-12">
      <PortalCard className="max-w-md p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 ring-1 ring-red-400/20">
          <ShieldX className="h-7 w-7 text-red-400/80" />
        </div>
        <h1 className="text-xl font-semibold text-white">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-white/55">{description}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild className={portalButtonPrimary}>
            <Link to={portalRoutes.dashboard}>Back to dashboard</Link>
          </Button>
          <Button asChild variant="outline" className={portalButtonOutline}>
            <Link to={portalRoutes.settings}>Account settings</Link>
          </Button>
        </div>
      </PortalCard>
    </div>
  );
}
