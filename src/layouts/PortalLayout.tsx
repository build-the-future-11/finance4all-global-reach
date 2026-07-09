import { Link, NavLink, Outlet } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { portalNav, portalRoutes } from "@/routes/portal";
import ThemeToggle from "@/components/ThemeToggle";
import MobileBottomNav from "@/components/portal/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function PortalLayout() {
  const { profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const canReview = profile?.role === "lead_researcher" || profile?.role === "admin";
  const isAdmin = profile?.role === "admin";

  const navItems = portalNav.filter((item) => !item.adminOnly || isAdmin);

  return (
    <div className="min-h-screen bg-[#060a12] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/[0.07] blur-[160px]" />
        <div className="absolute right-0 bottom-0 h-[400px] w-[400px] rounded-full bg-blue-500/[0.06] blur-[140px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#060a12]/85 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 text-white/60 hover:bg-white/10 lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link to="/portal" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 text-xs font-bold text-white">
                F4
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold leading-none text-white">Finance4All</p>
                <p className="text-[11px] text-white/45">Member Portal</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="hidden text-xs text-white/40 transition hover:text-white/70 sm:inline"
            >
              ← Site
            </Link>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="hidden text-white/50 hover:bg-white/10 hover:text-white sm:inline-flex"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
            {profile && (
              <Link to={portalRoutes.settings}>
                <Avatar className="h-8 w-8 border border-white/15 transition hover:ring-2 hover:ring-emerald-400/30">
                  <AvatarImage src={profile.avatarUrl} />
                  <AvatarFallback className="bg-emerald-500/20 text-xs text-emerald-300">
                    {initials(profile.displayName)}
                  </AvatarFallback>
                </Avatar>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 lg:gap-8 lg:py-8">
        <aside
          className={`${
            mobileOpen ? "block" : "hidden"
          } fixed inset-x-0 top-[57px] z-30 max-h-[calc(100vh-57px)] overflow-y-auto border-b border-white/[0.08] bg-[#060a12]/95 p-4 backdrop-blur-2xl lg:static lg:block lg:w-60 lg:shrink-0 lg:overflow-visible lg:border-0 lg:bg-transparent lg:p-0 xl:w-64`}
        >
          <nav className="sticky top-24 flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const children = item.children?.filter(
                (child) => child.path !== portalRoutes.labsReview || canReview,
              );
              return (
                <div key={item.path} className="space-y-0.5">
                  <NavLink
                    to={item.path}
                    end={item.path === portalRoutes.dashboard}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? "bg-emerald-500/15 text-emerald-300 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.2)]"
                          : "text-white/55 hover:bg-white/[0.06] hover:text-white/90"
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </NavLink>
                  {children && children.length > 0 && (
                    <div className="ml-4 space-y-0.5 border-l border-white/[0.08] pl-3">
                      {children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          end={!child.path.includes(":")}
                          onClick={() => setMobileOpen(false)}
                          className={({ isActive }) =>
                            `block rounded-lg px-2.5 py-1.5 text-xs transition ${
                              isActive
                                ? "font-medium text-emerald-300"
                                : "text-white/40 hover:text-white/65"
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

            {profile && (
              <div className="mt-4 hidden rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 lg:block">
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-9 w-9 border border-white/10">
                    <AvatarImage src={profile.avatarUrl} />
                    <AvatarFallback className="bg-emerald-500/20 text-xs text-emerald-300">
                      {initials(profile.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{profile.displayName}</p>
                    <p className="truncate text-xs capitalize text-white/40">
                      {profile.role.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 w-full justify-start text-xs text-white/45 hover:bg-white/5 hover:text-white/70"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  Sign out
                </Button>
              </div>
            )}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 pb-20 lg:pb-8">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
