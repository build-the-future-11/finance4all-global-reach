import { Link } from "react-router-dom";
import { Award, CheckCircle2, FlaskConical } from "lucide-react";
import { useMyCertificates } from "@/hooks/portal/useCertificates";
import { useMyLabApplications } from "@/hooks/portal/useLabs";
import { useEducationProgress } from "@/hooks/portal/useEducationProgress";
import { portalRoutes } from "@/routes/portal";
import { PortalCard, PortalSection } from "@/components/portal/PortalUI";
import { Badge } from "@/components/ui/badge";

/**
 * Contribution history derived from real persisted records only:
 * accepted lab applications, issued certificates, and lesson completions.
 * This is not a full verified-contribution ledger (that remains a later P1).
 */
export default function ContributionHistory() {
  const { data: apps } = useMyLabApplications();
  const { data: certificates } = useMyCertificates();
  const { completed } = useEducationProgress();

  const accepted = (apps ?? []).filter((a) => a.status === "accepted");
  const lessonCount = completed.size;
  const certCount = certificates?.length ?? 0;

  const items: Array<{
    id: string;
    icon: typeof Award;
    title: string;
    meta: string;
    href: string;
    status: string;
  }> = [
    ...accepted.map((app) => ({
      id: `lab-${app.id}`,
      icon: FlaskConical,
      title: "Accepted research project",
      meta: `Accepted ${new Date(app.reviewedAt ?? app.submittedAt).toLocaleDateString()}`,
      href: `${portalRoutes.labs}/${app.projectId}`,
      status: "Verified acceptance",
    })),
    ...(certificates ?? []).map((cert) => ({
      id: `cert-${cert.id}`,
      icon: Award,
      title: cert.title,
      meta: `Issued ${new Date(cert.issuedAt).toLocaleDateString()}`,
      href: portalRoutes.education,
      status: "Certificate",
    })),
  ];

  if (lessonCount > 0) {
    items.push({
      id: "lessons",
      icon: CheckCircle2,
      title: "Catalyst lesson progress",
      meta: `${lessonCount} lesson${lessonCount === 1 ? "" : "s"} completed`,
      href: portalRoutes.education,
      status: "Learning",
    });
  }

  return (
    <PortalSection
      title="Contribution history"
      description="Accepted research applications, curriculum certificates, and lesson completions from your account."
    >
      {items.length === 0 ? (
        <PortalCard className="p-5">
          <p className="text-sm text-white/55">
            No verified contributions yet. Complete Catalyst lessons, apply to an open Meta Lab, or
            finish the curriculum certificate to build this record.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link to={portalRoutes.education} className="text-emerald-300 hover:underline">
              Open Education →
            </Link>
            <Link to={portalRoutes.labs} className="text-emerald-300 hover:underline">
              Browse Meta Labs →
            </Link>
          </div>
        </PortalCard>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.id} to={item.href}>
                <PortalCard hover className="flex items-start gap-3 p-4">
                  <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-300">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-white">{item.title}</p>
                      <Badge variant="outline" className="border-white/20 text-white/60">
                        {item.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-white/45">{item.meta}</p>
                  </div>
                </PortalCard>
              </Link>
            );
          })}
        </div>
      )}
    </PortalSection>
  );
}
