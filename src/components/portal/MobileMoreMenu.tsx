import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Bookmark,
  CalendarDays,
  LayoutGrid,
  MoreHorizontal,
  Route,
  Settings,
} from "lucide-react";
import { portalRoutes } from "@/routes/portal";
import { PortalSheetContent } from "@/components/portal/PortalUI";
import { portalCopy } from "@/lib/portalCopy";
import { Sheet, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const moreItems = [
  { to: portalRoutes.pathways, icon: Route, label: "Pathways" },
  { to: portalRoutes.events, icon: CalendarDays, label: "Events" },
  { to: portalRoutes.saved, icon: Bookmark, label: "Saved" },
  { to: portalRoutes.activity, icon: Activity, label: "Activity" },
  { to: portalRoutes.settings, icon: Settings, label: "Settings" },
];

export default function MobileMoreMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="portal-focus-ring portal-interactive relative flex min-w-0 flex-col items-center gap-0.5 rounded-lg px-2.5 py-1.5 text-[10px] font-medium text-white/45 hover:text-white/70"
          aria-label="More portal modules"
        >
          <MoreHorizontal className="h-[18px] w-[18px] shrink-0" aria-hidden />
          <span>More</span>
        </button>
      </SheetTrigger>
      <PortalSheetContent side="bottom">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-white">
            <LayoutGrid className="h-4 w-4 text-emerald-400" aria-hidden />
            More modules
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4 grid grid-cols-3 gap-3 pb-4">
          {moreItems.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className="portal-focus-ring portal-glass portal-interactive flex flex-col items-center gap-2 rounded-xl p-4 hover:border-white/20"
            >
              <Icon className="h-5 w-5 text-emerald-400" aria-hidden />
              <span className="text-xs font-medium text-white/80">{label}</span>
            </Link>
          ))}
        </div>
      </PortalSheetContent>
    </Sheet>
  );
}
