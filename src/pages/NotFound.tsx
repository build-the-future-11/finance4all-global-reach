import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortalFullPageShell, portalButtonOutline, portalButtonPrimary } from "@/components/portal/PortalUI";

export default function NotFound() {
  const location = useLocation();

  return (
    <PortalFullPageShell className="text-center">
      <p className="text-8xl font-bold text-white/10">404</p>
      <h1 className="mt-2 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-white/50">
        <code className="text-white/70">{location.pathname}</code> doesn't exist.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild variant="outline" className={portalButtonOutline}>
          <Link to="/">
            <Home className="mr-2 h-4 w-4" aria-hidden />
            Home
          </Link>
        </Button>
        <Button asChild className={portalButtonPrimary}>
          <Link to="/portal">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
            Portal
          </Link>
        </Button>
      </div>
    </PortalFullPageShell>
  );
}
