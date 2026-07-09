import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types/domain";
import { portalRoutes } from "@/routes/portal";

interface RoleGuardProps {
  allowed: UserRole[];
  children: React.ReactNode;
}

export default function RoleGuard({ allowed, children }: RoleGuardProps) {
  const { profile } = useAuth();

  if (!profile || !allowed.includes(profile.role)) {
    return <Navigate to={portalRoutes.labs} replace />;
  }

  return <>{children}</>;
}
