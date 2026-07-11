import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Search } from "lucide-react";
import { RESOURCE_LIBRARY, UPCOMING_WEBINARS } from "@/data/resources";
import { RESOURCE_GUIDES } from "@/data/resourceGuides";
import { useResourceGuidesIndex, useResourceLibrary, useWebinars } from "@/hooks/portal/useResources";
import GlossarySearch from "@/components/portal/GlossarySearch";
import { PortalCard, PortalPageHeader, PortalSection, portalInputClass } from "@/components/portal/PortalUI";
import { Input } from "@/components/ui/input";
import { portalRoutes } from "@/routes/portal";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { portalCopy } from "@/lib/portalCopy";
import PortalAnimatedSection from "@/components/portal/PortalAnimatedSection";
import InterestPillBar from "@/components/portal/InterestPillBar";
import PersonalizedForYou from "@/components/portal/PersonalizedForYou";

export default function ResourcesHub() {
  useDocumentTitle("Resources");
  const [query, setQuery] = useState("");
  const { data: resourceLibrary, isLoading: libraryLoading } = useResourceLibrary();
  const { data: webinars, isLoading: webinarsLoading } = useWebinars();
  const { data: guidesIndex } = useResourceGuidesIndex();

  const library = libraryLoading ? RESOURCE_LIBRARY : (resourceLibrary ?? RESOURCE_LIBRARY);
  const upcomingWebinars = webinarsLoading ? UPCOMING_WEBINARS : (webinars ?? UPCOMING_WEBINARS);
  const guideIds = useMemo(
    () => new Set(guidesIndex ? Object.keys(guidesIndex) : Object.keys(RESOURCE_GUIDES)),
    [guidesIndex],
  );

  const guides = useMemo(() => library.filter((r) => guideIds.has(r.id)), [library, guideIds]);
  const external = useMemo(() => library.filter((r) => r.external), [library]);
  const portalLinks = useMemo(
    () => library.filter((r) => !r.external && !guideIds.has(r.id)),
    [library, guideIds],
  );

  const q = query.trim().toLowerCase();
  const filterItems = useMemo(
    () =>
      <T extends { title: string; description: string; tags?: string[] }>(items: T[]) =>
        !q
          ? items
          : items.filter(
              (i) =>
                i.title.toLowerCase().includes(q) ||
                i.description.toLowerCase().includes(q) ||
                i.tags?.some((t) => t.toLowerCase().includes(q)),
            ),
    [q],
  );

  const filteredGuides = useMemo(() => filterItems(guides), [filterItems, guides]);
  const filteredWebinars = useMemo(() => filterItems(upcomingWebinars), [filterItems, upcomingWebinars]);
  const filteredPortal = useMemo(() => filterItems(portalLinks), [filterItems, portalLinks]);
  const filteredExternal = useMemo(() => filterItems(external), [filterItems, external]);

  return (
    <div className="space-y-8">
      <PortalAnimatedSection>
        <PortalPageHeader
          eyebrow={portalCopy.resources.eyebrow}
          title={portalCopy.resources.title}
          description={portalCopy.resources.description}
        />
      </PortalAnimatedSection>

      <InterestPillBar />

      <PortalAnimatedSection delay={40}>
        <PersonalizedForYou />
      </PortalAnimatedSection>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={portalCopy.resources.searchPlaceholder}
          className={`pl-9 ${portalInputClass}`}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <PortalCard className="p-4 text-center">
          <p className="text-2xl font-bold text-emerald-300">{guides.length}</p>
          <p className="text-xs text-white/45">Written guides</p>
        </PortalCard>
        <PortalCard className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-300">{upcomingWebinars.length}</p>
          <p className="text-xs text-white/45">Sessions</p>
        </PortalCard>
        <PortalCard className="p-4 text-center">
          <p className="text-2xl font-bold text-amber-300">{portalLinks.length}</p>
          <p className="text-xs text-white/45">Portal links</p>
        </PortalCard>
        <PortalCard className="p-4 text-center">
          <p className="text-2xl font-bold text-purple-300">{external.length}</p>
          <p className="text-xs text-white/45">External</p>
        </PortalCard>
      </div>

      <PortalSection title="Written guides">
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredGuides.map((item) => (
            <Link key={item.id} to={`${portalRoutes.resources}/${item.id}`}>
              <PortalCard hover className="h-full p-5">
                <p className="text-xs uppercase tracking-wider text-white/40">Guide</p>
                <h3 className="mt-2 font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{item.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] text-white/40">
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="mt-4 inline-block text-sm text-emerald-300">Read guide →</span>
              </PortalCard>
            </Link>
          ))}
        </div>
      </PortalSection>

      <PortalSection title="Recurring sessions">
        <div className="grid gap-3 md:grid-cols-3">
          {filteredWebinars.map((w) => (
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

      {filteredPortal.length > 0 && (
        <PortalSection title="In the portal">
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredPortal.map((item) => (
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

      {filteredExternal.length > 0 && (
        <PortalSection title="External">
          <div className="grid gap-2 sm:grid-cols-2">
            {filteredExternal.map((item) => (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="portal-glass portal-focus-ring portal-interactive flex items-center justify-between rounded-xl px-4 py-3 text-sm transition hover:border-white/20"
              >
                <span className="text-white/80">{item.title}</span>
                <ExternalLink className="h-4 w-4 text-white/35" />
              </a>
            ))}
          </div>
        </PortalSection>
      )}

      <GlossarySearch compact />
    </div>
  );
}
