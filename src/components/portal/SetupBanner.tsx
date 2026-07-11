import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { portalRoutes } from "@/routes/portal";

async function tableExists(table: string): Promise<boolean> {
  const { error } = await supabase.from(table).select("*").limit(1);
  if (error?.code === "42P01" || error?.message?.includes("does not exist")) return false;
  return !error;
}

export function usePortalSetupHealth() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["portal-setup-health", user?.id],
    enabled: Boolean(user) && isSupabaseConfigured,
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const [bookmarks, notifications, contact, education] = await Promise.all([
        tableExists("news_bookmarks"),
        tableExists("notifications"),
        tableExists("contact_submissions"),
        tableExists("education_lesson_progress"),
      ]);

      return {
        bookmarks,
        notifications,
        contact,
        education,
        needsSecurityMigration: notifications,
      };
    },
  });
}

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
          <p className="font-medium text-red-200">Backend not configured</p>
          <p className="mt-1 text-red-100/80">
            Set <code className="rounded bg-black/20 px-1">VITE_SUPABASE_URL</code> and{" "}
            <code className="rounded bg-black/20 px-1">VITE_SUPABASE_ANON_KEY</code> in your
            environment. See <code className="rounded bg-black/20 px-1">.env.example</code>.
          </p>
        </div>
      </div>
    );
  }

  if (dismissed || !data) return null;
  if (data.bookmarks && data.notifications && data.contact && data.education) return null;

  const missing: string[] = [];
  if (!data.bookmarks || !data.notifications) missing.push("003_bookmarks_notifications.sql");
  if (!data.contact) missing.push("007_contact_submissions.sql");
  if (!data.education) missing.push("006_education_progress.sql");

  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
      <div className="min-w-0 flex-1">
        {isAdmin ? (
          <>
            <p className="font-medium text-amber-200">Workspace setup incomplete</p>
            <p className="mt-1 text-amber-100/80">
              Run pending migrations in Supabase SQL Editor:{" "}
              {missing.map((m) => (
                <code key={m} className="mr-1 rounded bg-black/20 px-1">
                  {m}
                </code>
              ))}
              . Migration 005 blocks notification spam and role escalation.
            </p>
          </>
        ) : (
          <>
            <p className="font-medium text-amber-200">Some features are temporarily unavailable</p>
            <p className="mt-1 text-amber-100/80">
              Bookmarks, notifications, or other features aren't fully enabled yet. Everything else
              works — your chapter lead can complete setup.
            </p>
          </>
        )}
        <Link
          to={portalRoutes.settings}
          className="mt-2 inline-block text-xs font-medium text-amber-300 hover:underline"
        >
          Learn more in Settings →
        </Link>
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
