import { Link, NavLink, Outlet } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { portalNav, portalRoutes } from "@/routes/portal";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PortalLayout() {
  const { profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const canReview = profile?.role === "lead_researcher" || profile?.role === "admin";

  return (
    <div className="min-h-screen bg-[#060a12] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-[160px]" />
        <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-blue-500/10 blur-[180px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#060a12]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-white/50 transition hover:text-white/80">
              ← Site
            </Link>
            <div>
              <p className="text-lg font-semibold">Finance4All Portal</p>
              <p className="text-xs text-white/50">{profile?.displayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {profile && (
              <Badge variant="outline" className="hidden border-white/20 capitalize text-white/60 sm:inline-flex">
                {profile.role.replace("_", " ")}
              </Badge>
            )}
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="hidden text-white/60 hover:text-white sm:inline-flex"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
            <button
              className="rounded-lg p-2 text-white/60 hover:bg-white/10 lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8">
        <aside className={`${mobileOpen ? "block" : "hidden"} w-full shrink-0 lg:block lg:w-64`}>
          <nav className="sticky top-24 space-y-1">
            {portalNav.map((item) => {
              const Icon = item.icon;
              const children = item.children?.filter(
                (child) => child.path !== portalRoutes.labsReview || canReview,
              );
              return (
                <div key={item.path} className="space-y-1">
                  <NavLink
                    to={item.path}
                    end={item.path === portalRoutes.dashboard}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                        isActive
                          ? "bg-white/10 text-white"
                          : "text-white/60 hover:bg-white/5 hover:text-white/90"
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </NavLink>
                  {children && children.length > 0 && (
                    <div className="ml-7 space-y-0.5 border-l border-white/10 pl-3">
                      {children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          end={!child.path.includes(":")}
                          onClick={() => setMobileOpen(false)}
                          className={({ isActive }) =>
                            `block rounded-lg px-2 py-1.5 text-xs transition ${
                              isActive
                                ? "text-emerald-300"
                                : "text-white/45 hover:text-white/70"
                            }`
                          }
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 pb-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
