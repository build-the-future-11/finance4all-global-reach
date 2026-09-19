import { NavLink } from "react-router-dom";
import {
  FlaskConical,
  LayoutDashboard,
  Newspaper,
  Route,
  Settings,
  Users,
} from "lucide-react";
import { portalRoutes } from "@/routes/portal";
import { cn } from "@/lib/utils";

const items = [
  { to: portalRoutes.dashboard, icon: LayoutDashboard, label: "Home" },
  { to: portalRoutes.debriefed, icon: Newspaper, label: "Learn" },
  { to: portalRoutes.labs, icon: FlaskConical, label: "Research" },
  { to: portalRoutes.pathways, icon: Route, label: "Work" },
  { to: portalRoutes.network, icon: Users, label: "People" },
  { to: portalRoutes.settings, icon: Settings, label: "Profile" },
];

export default function MobileBottomNav() {
  return (
    <nav className="portal-bottom-nav fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur-2xl lg:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === portalRoutes.dashboard}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition",
                isActive ? "text-primary" : "text-muted-foreground",
              )
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
