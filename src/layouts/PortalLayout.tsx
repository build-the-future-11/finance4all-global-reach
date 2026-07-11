import { Link, NavLink, Outlet } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { portalNav, portalRoutes } from "@/routes/portal";
import ThemeToggle from "@/components/ThemeToggle";
import MobileBottomNav from "@/components/portal/MobileBottomNav";
import SessionIdleNotice from "@/components/portal/SessionIdleNotice";
import NotificationsCenter from "@/components/portal/NotificationsCenter";
import PortalSearch from "@/components/portal/PortalSearch";
import SetupBanner from "@/components/portal/SetupBanner";
import KeyboardShortcutsDialog from "@/components/portal/KeyboardShortcutsDialog";
import PortalBreadcrumbs from "@/components/portal/PortalBreadcrumbs";
import PageTransition from "@/components/portal/PageTransition";
import PortalFooter from "@/components/portal/PortalFooter";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { portalCopy } from "@/lib/portalCopy";
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
  useDocumentTitle("Portal");

  const canReview = profile?.role === "lead_researcher" || profile?.role === "admin";
  const isAdmin = profile?.role === "admin";

  const navItems = portalNav.filter((item) => !item.adminOnly || isAdmin);

  return (
    <div className="min-h-screen bg-portal-bg text-white">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="landing-orb left-1/4 top-0 h-[32rem] w-[32rem] bg-emerald-500/[0.08]" />
        <div className="landing-orb landing-float-delay right-0 bottom-0 h-96 w-96 bg-blue-500/[0.06]" />
        <div
          className="absolute inset-0 opacity-[0.25]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse 80% 70% at 50% 20%, black, transparent)",
          }}
        />
      </div>

      <header className="portal-glass-header sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-3">
            <button
              className="portal-focus-ring portal-interactive rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white/90 lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link to="/portal" className="portal-focus-ring group flex items-center gap-2.5 rounded-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 text-xs font-bold text-white shadow-[0_2px_8px_rgba(52,211,153,0.25)] transition group-hover:shadow-[0_4px_16px_rgba(52,211,153,0.35)]">
                F4
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold leading-none text-white">Finance4All</p>
                <p className="text-[11px] text-white/45">Member Portal</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <PortalSearch />
            <Link
              to="/"
              className="portal-focus-ring hidden rounded-md px-2 py-1 text-xs text-white/40 transition-colors duration-portal hover:text-white/70 sm:inline"
            >
              ← Site
            </Link>
            <NotificationsCenter />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="portal-focus-ring hidden text-white/50 transition-colors duration-portal hover:bg-white/10 hover:text-white sm:inline-flex"
              onClick={() => signOut()}
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
            {profile && (
              <Link to={portalRoutes.settings} className="portal-focus-ring rounded-full">
                <Avatar className="h-8 w-8 border border-white/15 transition duration-portal hover:ring-2 hover:ring-emerald-400/30">
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
          } fixed inset-x-0 top-[57px] z-30 max-h-[calc(100vh-57px)] overflow-y-auto border-b border-white/[0.08] bg-portal-bg-elevated/95 p-4 backdrop-blur-2xl lg:static lg:block lg:w-60 lg:shrink-0 lg:overflow-visible lg:border-0 lg:bg-transparent lg:p-0 xl:w-64`}
        >
          <nav className="sticky top-24 flex flex-col gap-1" aria-label="Portal navigation">
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
                      cn(
                        "portal-nav-item group flex items-center gap-3",
                        isActive && "portal-nav-active",
                      )
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
                            cn(
                              "portal-focus-ring portal-interactive block rounded-lg px-2.5 py-1.5 text-xs",
                              isActive
                                ? "font-medium text-emerald-300"
                                : "text-white/40 hover:text-white/65",
                            )
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
              <div className="mt-4 hidden portal-glass p-3 lg:block">
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
          <SetupBanner />
          <PortalBreadcrumbs />
          <PageTransition>
            <Outlet />
          </PageTransition>
          <PortalFooter />
        </main>
      </div>
      <MobileBottomNav />
      <SessionIdleNotice />
      <KeyboardShortcutsDialog />
    </div>
  );
}
