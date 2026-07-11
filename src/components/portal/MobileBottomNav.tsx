import { NavLink } from "react-router-dom";
import {
  FlaskConical,
  GraduationCap,
  LayoutDashboard,
  Newspaper,
  Users,
} from "lucide-react";
import { portalRoutes } from "@/routes/portal";
import { cn } from "@/lib/utils";
import { portalCopy } from "@/lib/portalCopy";

import MobileMoreMenu from "@/components/portal/MobileMoreMenu";

const items = [
  { to: portalRoutes.dashboard, icon: LayoutDashboard, label: portalCopy.nav.mobile.home },
  { to: portalRoutes.debriefed, icon: Newspaper, label: portalCopy.nav.mobile.news },
  { to: portalRoutes.education, icon: GraduationCap, label: portalCopy.nav.mobile.learn },
  { to: portalRoutes.labs, icon: FlaskConical, label: portalCopy.nav.mobile.labs },
  { to: portalRoutes.network, icon: Users, label: portalCopy.nav.mobile.network },
];

export default function MobileBottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.08] bg-portal-bg-elevated/95 backdrop-blur-2xl lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-1 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === portalRoutes.dashboard}
            className={({ isActive }) =>
              cn(
                "portal-focus-ring portal-interactive relative flex min-w-0 flex-col items-center gap-0.5 rounded-lg px-2.5 py-1.5 text-[10px] font-medium",
                isActive ? "portal-mobile-nav-active text-emerald-400" : "text-white/45 hover:text-white/70",
              )
            }
          >
            <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
        <MobileMoreMenu />
      </div>
    </nav>
  );
}
