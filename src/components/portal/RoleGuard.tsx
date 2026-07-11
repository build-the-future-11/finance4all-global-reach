import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types/domain";
import AccessDenied from "@/components/portal/AccessDenied";

interface RoleGuardProps {
  allowed: UserRole[];
  children: React.ReactNode;
}

export default function RoleGuard({ allowed, children }: RoleGuardProps) {
  const { profile } = useAuth();

  if (!profile || !allowed.includes(profile.role)) {
    return (
      <AccessDenied
        title="This page requires elevated access"
        description={`Only ${allowed.map((r) => r.replace("_", " ")).join(" or ")} roles can view this area. Your current role is ${profile?.role?.replace("_", " ") ?? "unknown"}.`}
      />
    );
  }

  return <>{children}</>;
}
