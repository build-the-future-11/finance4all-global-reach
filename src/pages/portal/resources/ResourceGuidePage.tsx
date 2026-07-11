import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { RESOURCE_LIBRARY } from "@/data/resources";
import { useResourceGuide, useResourceLibrary } from "@/hooks/portal/useResources";
import MarkdownContent from "@/components/portal/MarkdownContent";
import { LoadingState, PortalCard, PortalPageHeader } from "@/components/portal/PortalUI";
import { portalRoutes } from "@/routes/portal";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { portalCopy } from "@/lib/portalCopy";
import PortalAnimatedSection from "@/components/portal/PortalAnimatedSection";

export default function ResourceGuidePage() {
  const { id } = useParams();
  const { data: guide, isLoading } = useResourceGuide(id);
  const { data: library } = useResourceLibrary();
  const meta =
    library?.find((r) => r.id === id) ?? RESOURCE_LIBRARY.find((r) => r.id === id);

  useDocumentTitle(guide?.title ?? "Resource");

  if (isLoading) {
    return (
      <div className="min-h-[40vh]">
        <LoadingState />
      </div>
    );
  }

  if (!guide) {
    return (
      <div>
        <Link to={portalRoutes.resources} className="text-sm text-emerald-300 hover:underline">
          ← Resources
        </Link>
        <p className="mt-6 text-white/60">{portalCopy.resources.guideNotFound}</p>
      </div>
    );
  }

  return (
    <div>
      <PortalAnimatedSection>
        <Link
          to={portalRoutes.resources}
          className="mb-6 inline-flex items-center gap-2 text-sm text-emerald-300 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Resources
        </Link>

        <PortalPageHeader title={guide.title} description={guide.summary} />
      </PortalAnimatedSection>

      {guide.checklist && (
        <PortalCard className="mb-6 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/45">Checklist</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-white/70">
            {guide.checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </PortalCard>
      )}

      <PortalCard className="p-6 sm:p-8">
        <MarkdownContent content={guide.body} />
      </PortalCard>

      {meta?.external && (
        <p className="mt-6 text-sm text-white/50">
          External link:{" "}
          <a href={meta.href} target="_blank" rel="noopener noreferrer" className="text-emerald-300 hover:underline">
            {meta.href}
          </a>
        </p>
      )}
    </div>
  );
}
