import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { RESOURCE_LIBRARY, UPCOMING_WEBINARS } from "@/data/resources";
import { RESOURCE_GUIDES } from "@/data/resourceGuides";
import GlossarySearch from "@/components/portal/GlossarySearch";
import { PortalCard, PortalPageHeader, PortalSection } from "@/components/portal/PortalUI";
import { portalRoutes } from "@/routes/portal";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function ResourcesHub() {
  useDocumentTitle("Resources");

  const guides = RESOURCE_LIBRARY.filter((r) => RESOURCE_GUIDES[r.id]);
  const external = RESOURCE_LIBRARY.filter((r) => r.external);
  const portalLinks = RESOURCE_LIBRARY.filter((r) => !r.external && !RESOURCE_GUIDES[r.id]);

  return (
    <div>
      <PortalPageHeader
        eyebrow="Member library"
        title="Resources"
        description="Facilitator guides, journal standards, and partner programs. Guides with full text are written for Finance4All chapters — not generic downloads."
      />

      <PortalSection title="Written guides">
        <div className="grid gap-4 sm:grid-cols-2">
          {guides.map((item) => (
            <Link key={item.id} to={`${portalRoutes.resources}/${item.id}`}>
              <PortalCard hover className="h-full p-5">
                <p className="text-xs uppercase tracking-wider text-white/40">Guide</p>
                <h3 className="mt-2 font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{item.description}</p>
                <span className="mt-4 inline-block text-sm text-emerald-300">Read guide →</span>
              </PortalCard>
            </Link>
          ))}
        </div>
      </PortalSection>

      <PortalSection title="Recurring sessions">
        <div className="grid gap-3 md:grid-cols-3">
          {UPCOMING_WEBINARS.map((w) => (
            <Link key={w.id} to={w.href}>
              <PortalCard hover className="h-full p-5">
                <p className="text-xs text-emerald-300/80">{w.host}</p>
                <h3 className="mt-1 font-medium text-white">{w.title}</h3>
                <p className="mt-2 text-sm text-white/50">{w.description}</p>
                <p className="mt-3 text-xs text-white/35">{w.date}</p>
              </PortalCard>
            </Link>
          ))}
        </div>
      </PortalSection>

      {portalLinks.length > 0 && (
        <PortalSection title="In the portal">
          <div className="grid gap-3 sm:grid-cols-2">
            {portalLinks.map((item) => (
              <Link key={item.id} to={item.href}>
                <PortalCard hover className="p-4">
                  <h3 className="font-medium text-white">{item.title}</h3>
                  <p className="mt-1 text-sm text-white/50">{item.description}</p>
                </PortalCard>
              </Link>
            ))}
          </div>
        </PortalSection>
      )}

      {external.length > 0 && (
        <PortalSection title="External">
          <div className="space-y-2">
            {external.map((item) => (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3 text-sm transition hover:bg-white/[0.04]"
              >
                <span className="text-white/80">{item.title}</span>
                <ExternalLink className="h-4 w-4 text-white/35" />
              </a>
            ))}
          </div>
        </PortalSection>
      )}

      <div className="mt-10">
        <GlossarySearch compact />
      </div>
    </div>
  );
}
