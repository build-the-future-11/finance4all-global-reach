import { Link } from "react-router-dom";
import { Bookmark, ExternalLink, Shield } from "lucide-react";
import { portalRoutes } from "@/routes/portal";
import { portalCopy } from "@/lib/portalCopy";
import { portalLinkClass } from "@/components/portal/PortalUI";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: portalCopy.footer.settings, href: portalRoutes.settings },
  { label: portalCopy.footer.saved, href: portalRoutes.saved, icon: Bookmark },
  { label: portalCopy.footer.activity, href: portalRoutes.activity },
];

export default function PortalFooter() {
  return (
    <footer className="mt-10 hidden border-t border-white/[0.08] pt-6 lg:block">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-white/40">{portalCopy.footer.tagline}</p>
        <nav className="flex flex-wrap items-center gap-4" aria-label="Portal footer">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="portal-focus-ring rounded-md text-xs text-white/45 transition-colors duration-portal hover:text-emerald-300"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="/"
            className="portal-focus-ring inline-flex items-center gap-1 rounded-md text-xs text-white/45 transition-colors duration-portal hover:text-emerald-300"
          >
            {portalCopy.footer.site} <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
        </nav>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-white/35">
        <Shield className="h-3 w-3 shrink-0" aria-hidden />
        {portalCopy.footer.securityNote}
      </p>
    </footer>
  );
}
