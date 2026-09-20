import { Link, NavLink, Outlet } from "react-router-dom";
import { ChevronRight, LogOut, Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/useAuth";
import { portalNav, portalRoutes } from "@/routes/portal";
import ThemeToggle from "@/components/ThemeToggle";
import { BrandMark } from "@/components/Brand";
import MobileBottomNav from "@/components/portal/MobileBottomNav";
import NotificationsCenter from "@/components/portal/NotificationsCenter";
import PortalSearch from "@/components/portal/PortalSearch";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function PortalBrand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="portal-brand">
      <BrandMark className="h-10 w-10 text-[#153d30] dark:text-[#d9ff8a] dark:[--brand-ink:#153d30]" />
      {!compact && <span><strong>Finance for All</strong><small>Member space</small></span>}
    </span>
  );
}

export default function PortalLayout() {
  const { profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try { return window.localStorage.getItem("finance-portal-sidebar") === "collapsed"; } catch { return false; }
  });
  useDocumentTitle("Portal");

  useEffect(() => {
    try { window.localStorage.setItem("finance-portal-sidebar", collapsed ? "collapsed" : "open"); } catch { /* noop */ }
  }, [collapsed]);

  const canReview = profile?.role === "lead_researcher" || profile?.role === "admin";
  const isAdmin = profile?.role === "admin";
  const navItems = portalNav.filter((item) => !item.adminOnly || isAdmin);

  return (
    <div className={`portal-shell ${collapsed ? "portal-sidebar-collapsed" : ""}`}>
      <header className="portal-mobile-header">
        <button type="button" className="portal-icon-button lg:hidden" onClick={() => setMobileOpen((value) => !value)} aria-label="Toggle menu">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <Link to={portalRoutes.dashboard}><PortalBrand /></Link>
        <div className="portal-header-actions">
          <PortalSearch />
          <NotificationsCenter />
          <ThemeToggle />
          {profile && (
            <Link to={portalRoutes.settings} aria-label="Open profile settings">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarImage src={profile.avatarUrl} />
                <AvatarFallback className="bg-primary/10 text-xs text-primary">{initials(profile.displayName)}</AvatarFallback>
              </Avatar>
            </Link>
          )}
        </div>
      </header>

      <aside className={`portal-sidebar ${mobileOpen ? "is-open" : ""}`}>
        <div className="portal-sidebar-head">
          <Link to={portalRoutes.dashboard} onClick={() => setMobileOpen(false)}><PortalBrand compact={collapsed} /></Link>
          <button type="button" className="portal-collapse-button hidden lg:grid" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}>
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        {!collapsed && (
          <div className="portal-context-card">
            <span>Your member space</span>
            <strong>Learn. Build. Contribute.</strong>
            <p>Everything you are part of, in one place.</p>
          </div>
        )}

        <nav className="portal-navigation" aria-label="Member portal">
          {navItems.map((item) => {
            const Icon = item.icon;
            const children = item.children?.filter((child) => child.path !== portalRoutes.labsReview || canReview);
            return (
              <div className="portal-nav-group" key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === portalRoutes.dashboard}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) => `portal-nav-link ${isActive ? "active" : ""}`}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {!collapsed && <><span>{item.label}</span><ChevronRight className="portal-nav-arrow h-3.5 w-3.5" /></>}
                </NavLink>
                {!collapsed && children && children.length > 0 && (
                  <div className="portal-subnav">
                    {children.map((child) => (
                      <NavLink key={child.path} to={child.path} end={!child.path.includes(":")} onClick={() => setMobileOpen(false)} className={({ isActive }) => isActive ? "active" : ""}>{child.label}</NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="portal-sidebar-foot">
          {profile && !collapsed && (
            <Link to={portalRoutes.settings} className="portal-profile-card">
              <Avatar className="h-9 w-9"><AvatarImage src={profile.avatarUrl} /><AvatarFallback className="bg-primary/10 text-xs text-primary">{initials(profile.displayName)}</AvatarFallback></Avatar>
              <span><strong>{profile.displayName}</strong><small>{profile.role.replace("_", " ")}</small></span>
            </Link>
          )}
          <Button variant="ghost" size={collapsed ? "icon" : "sm"} className="portal-signout" onClick={() => signOut()} title="Sign out">
            <LogOut className="h-4 w-4" />{!collapsed && <span>Sign out</span>}
          </Button>
        </div>
      </aside>

      {mobileOpen && <button className="portal-sidebar-scrim" type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}

      <main className="portal-main">
        <div className="portal-desktop-bar">
          <div><span>Member portal</span><strong>Finance for All</strong></div>
          <div className="portal-header-actions"><PortalSearch /><NotificationsCenter /><ThemeToggle /></div>
        </div>
        <div className="portal-content"><Outlet /></div>
      </main>
      <MobileBottomNav />
    </div>
  );
}
