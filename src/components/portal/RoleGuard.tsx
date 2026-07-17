import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types/domain";
import AccessDenied from "@/components/portal/AccessDenied";
import { PortalFullPageShell } from "@/components/portal/PortalUI";

interface RoleGuardProps {
  allowed: UserRole[];
  children: React.ReactNode;
}

export default function RoleGuard({ allowed, children }: RoleGuardProps) {
  const { profile, loading } = useAuth();

  if (loading || !profile) {
    return (
      <PortalFullPageShell>
        <div className="portal-glass flex flex-col items-center gap-4 rounded-2xl px-10 py-12">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-400" aria-hidden />
          <p className="text-sm text-white/50" role="status">
            Checking access…
          </p>
        </div>
      </PortalFullPageShell>
    );
  }

  if (!allowed.includes(profile.role)) {
    return (
      <AccessDenied
        title="This page requires elevated access"
        description={`Only ${allowed.map((r) => r.replace("_", " ")).join(" or ")} roles can view this area. Your current role is ${profile.role.replace("_", " ")}.`}
      />
    );
  }

  return <>{children}</>;
}
