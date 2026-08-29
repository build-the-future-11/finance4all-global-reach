import { Link } from "react-router-dom";
import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { portalRoutes } from "@/routes/portal";
import { usePortalSetupHealth } from "@/hooks/portal/usePortalSetupHealth";

export default function SetupBanner() {
  const { profile } = useAuth();
  const { data } = usePortalSetupHealth();
  const [dismissed, setDismissed] = useState(false);
  const isAdmin = profile?.role === "admin";

  if (!isSupabaseConfigured) {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
        <div>
          <p className="font-medium text-red-200">Member services unavailable</p>
          <p className="mt-1 text-red-100/80">
            The portal cannot reach its account and data services right now. Please try again later
            or contact the FinanceMeta team if the issue continues.
          </p>
        </div>
      </div>
    );
  }

  if (dismissed || !data) return null;
  if (data.bookmarks && data.notifications && data.contact && data.education && data.cms) return null;

  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
      <div className="min-w-0 flex-1">
        {isAdmin ? (
          <>
            <p className="font-medium text-amber-200">Some member services need attention</p>
            <p className="mt-1 text-amber-100/80">
              Saved content, notifications, contact inbox, or learning progress may be unavailable.
              Check the Admin System tab before inviting new members.
            </p>
            <Link
              to={portalRoutes.admin}
              className="mt-2 inline-block text-xs font-medium text-amber-300 hover:underline"
            >
              Open Admin System →
            </Link>
          </>
        ) : (
          <>
            <p className="font-medium text-amber-200">Some features are temporarily unavailable</p>
            <p className="mt-1 text-amber-100/80">
              Saved content, notifications, or learning progress may be limited right now. Please
              try again shortly.
            </p>
          </>
        )}
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded p-1 text-amber-300/70 hover:bg-amber-500/20 hover:text-amber-200"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
