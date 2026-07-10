import { Link } from "react-router-dom";
import {
  BookOpen,
  ExternalLink,
  FileText,
  Headphones,
  Mic,
  Sparkles,
  Video,
  Wrench,
} from "lucide-react";
import { RESOURCE_LIBRARY, UPCOMING_WEBINARS } from "@/data/resources";
import type { ResourceType } from "@/data/resources";
import FinanceAssistant from "@/components/portal/FinanceAssistant";
import {
  PortalCard,
  PortalPageHeader,
  PortalSection,
} from "@/components/portal/PortalUI";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { portalRoutes } from "@/routes/portal";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const TYPE_META: Record<ResourceType, { icon: typeof BookOpen; label: string }> = {
  curriculum: { icon: BookOpen, label: "Curriculum" },
  journal: { icon: FileText, label: "Journal" },
  podcast: { icon: Headphones, label: "Podcast" },
  toolkit: { icon: Wrench, label: "Toolkit" },
  partner: { icon: Sparkles, label: "Partner" },
  webinar: { icon: Video, label: "Webinar" },
};

export default function ResourcesHub() {
  useDocumentTitle("Resources");
  const freeCount = RESOURCE_LIBRARY.filter((r) => r.free).length;

  return (
    <div>
      <PortalPageHeader
        eyebrow="FinanceMeta library"
        title="Resources"
        description="Curriculum packs, journal submissions, podcasts, partner programs, and tools — everything FinanceMeta offers members, in one place."
        action={
          <Link to={portalRoutes.education}>
            <Button className="bg-emerald-500 hover:bg-emerald-400">Education hub</Button>
          </Link>
        }
      />

      <PortalCard className="mb-8 grid gap-4 p-6 sm:grid-cols-3">
        <div>
          <p className="text-3xl font-bold text-white">{RESOURCE_LIBRARY.length}</p>
          <p className="text-xs text-white/45">Resource collections</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-emerald-300">{freeCount}</p>
          <p className="text-xs text-white/45">Free for all members</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-white">{UPCOMING_WEBINARS.length}</p>
          <p className="text-xs text-white/45">Live session series</p>
        </div>
      </PortalCard>

      <PortalSection title="Live & recurring sessions">
        <div className="grid gap-4 md:grid-cols-3">
          {UPCOMING_WEBINARS.map((w) => (
            <Link key={w.id} to={w.href}>
              <PortalCard hover className="h-full p-5">
                <Mic className="h-5 w-5 text-emerald-400" />
                <h3 className="mt-3 font-semibold text-white">{w.title}</h3>
                <p className="mt-1 text-xs text-emerald-300/80">{w.host} · {w.date}</p>
                <p className="mt-2 text-sm text-white/55">{w.description}</p>
              </PortalCard>
            </Link>
          ))}
        </div>
      </PortalSection>

      <PortalSection title="Resource library">
        <div className="grid gap-4 sm:grid-cols-2">
          {RESOURCE_LIBRARY.map((item) => {
            const meta = TYPE_META[item.type];
            const Icon = meta.icon;
            const inner = (
              <PortalCard hover className="h-full p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.06] p-2.5 text-emerald-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  {item.free && (
                    <Badge className="border-0 bg-emerald-500/15 text-[10px] text-emerald-300">
                      Free
                    </Badge>
                  )}
                </div>
                <p className="mt-3 text-[10px] uppercase tracking-wider text-white/35">{meta.label}</p>
                <h3 className="mt-1 font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-white/55">{item.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span key={tag} className="text-[10px] text-white/35">
                      #{tag}
                    </span>
                  ))}
                </div>
                {item.external && (
                  <span className="mt-3 inline-flex items-center gap-1 text-xs text-emerald-300">
                    External <ExternalLink className="h-3 w-3" />
                  </span>
                )}
              </PortalCard>
            );

            if (item.external) {
              return (
                <a key={item.id} href={item.href} target="_blank" rel="noopener noreferrer">
                  {inner}
                </a>
              );
            }
            return (
              <Link key={item.id} to={item.href}>
                {inner}
              </Link>
            );
          })}
        </div>
      </PortalSection>

      <div className="mt-10">
        <FinanceAssistant compact />
      </div>
    </div>
  );
}
