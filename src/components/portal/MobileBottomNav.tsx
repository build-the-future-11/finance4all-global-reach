import { NavLink } from "react-router-dom";
import {
  FlaskConical,
  GraduationCap,
  LayoutDashboard,
  Library,
  Newspaper,
  Users,
} from "lucide-react";
import { portalRoutes } from "@/routes/portal";
import { cn } from "@/lib/utils";

const items = [
  { to: portalRoutes.dashboard, icon: LayoutDashboard, label: "Home" },
  { to: portalRoutes.debriefed, icon: Newspaper, label: "News" },
  { to: portalRoutes.education, icon: GraduationCap, label: "Learn" },
  { to: portalRoutes.labs, icon: FlaskConical, label: "Labs" },
  { to: portalRoutes.network, icon: Users, label: "Network" },
  { to: portalRoutes.resources, icon: Library, label: "Resources" },
];

export default function MobileBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.08] bg-[#060a12]/95 backdrop-blur-2xl lg:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around px-1 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === portalRoutes.dashboard}
            className={({ isActive }) =>
              cn(
                "flex min-w-0 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[9px] font-medium transition",
                isActive ? "text-emerald-400" : "text-white/45",
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
