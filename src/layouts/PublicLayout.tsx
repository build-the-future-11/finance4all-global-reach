import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Brand from "@/components/Brand";
import ThemeToggle from "@/components/ThemeToggle";
import { usePageMetadata } from "@/hooks/usePageMetadata";
import "@/styles/public-platform.css";

const publicNavigation = [
  ["Home", "/"], ["Learn", "/learn"], ["Research", "/research"],
  ["Finance Debriefed", "/debriefed"], ["Programs", "/programs"],
  ["Events", "/events"], ["Ecosystem", "/ecosystem"], ["Global Chapters", "/chapters"], ["About", "/about"],
] as const;

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    document.getElementById("public-navigation")?.querySelector<HTMLAnchorElement>("a")?.focus();
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); }
    };
    document.addEventListener("keydown", dismiss);
    return () => document.removeEventListener("keydown", dismiss);
  }, [open]);
  return <header className="public-header">
    <Link to="/" aria-label="Finance for All home" className="public-identity"><Brand /></Link>
    <nav id="public-navigation" aria-label="Main navigation" className={open ? "is-open" : ""}>
      {publicNavigation.map(([label, path]) => <NavLink key={path} to={path} end={path === "/"} onClick={() => setOpen(false)}>{label}</NavLink>)}
    </nav>
    <div className="public-header-actions"><ThemeToggle /><Link className="public-join" to="/portal">Member Portal <ArrowUpRight size={15} aria-hidden="true" /></Link>
      <button ref={trigger} className="public-menu" type="button" aria-controls="public-navigation" aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(value => !value)}>{open ? <X /> : <Menu />}</button>
    </div>
  </header>;
}

export function PublicFooter() {
  return <footer className="public-footer">
    <div><Brand /><p>Open financial education.<br />Questions worth investigating.</p><p>Finance4All is the education and community arm of FinanceMeta.</p></div>
    <nav aria-label="Explore"><strong>Explore</strong>{publicNavigation.slice(1, 6).map(([label, path]) => <Link key={path} to={path}>{label}</Link>)}</nav>
    <nav aria-label="Participate"><strong>Participate</strong><Link to="/events">Events</Link><Link to="/chapters">Global Chapters</Link><Link to="/programs">Programs & opportunities</Link><Link to="/portal">Member Portal</Link><Link to="/signup">Join the member space</Link></nav>
    <nav aria-label="Organization"><strong>FinanceMeta</strong><Link to="/ecosystem">Ecosystem & current status</Link><a href="https://finance-meta-landing.vercel.app/" target="_blank" rel="noreferrer">FinanceMeta website ↗</a><Link to="/iyern">IYERN & IYER Journal</Link><Link to="/evidence">Research & publication standards</Link><a href="https://finance-meta-landing.vercel.app/privacy">Privacy information</a><a href="mailto:financeforalledu@gmail.com">Contact</a></nav>
    <small>© {new Date().getFullYear()} Finance for All. Educational content, not personal financial advice.</small>
  </footer>;
}

export default function PublicLayout({ children, title, description, canonicalPath }: { children: ReactNode; title?: string; description?: string; canonicalPath?: string }) {
  usePageMetadata(title, description, canonicalPath);
  return <div className="public-platform"><a href="#public-content" className="public-skip">Skip to content</a><PublicHeader /><main id="public-content" tabIndex={-1}>{children}</main><PublicFooter /></div>;
}
