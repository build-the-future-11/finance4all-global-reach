import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const GLOBAL_REPO = "https://github.com/build-the-future-11/FinanceMeta-Global";
const PORTAL_REPO = "https://github.com/build-the-future-11/finance4all-global-reach";

type ReleaseRevision = { sha?: string };

function EvidenceLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 text-emerald-300 underline decoration-emerald-300/35 underline-offset-4 hover:text-emerald-200"
    >
      {children}
      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
    </a>
  );
}

export default function Evidence() {
  useDocumentTitle("Evidence");
  const [revision, setRevision] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void fetch("/release-revision.json", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((value: ReleaseRevision | null) => {
        if (active && value?.sha && /^[0-9a-f]{40}$/i.test(value.sha)) setRevision(value.sha);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#060a12] px-5 py-10 text-white sm:px-8 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          FinanceMeta
        </Link>

        <header className="mt-12 max-w-3xl border-b border-white/10 pb-10">
          <div className="flex items-center gap-2 text-emerald-300">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            <p className="text-sm font-medium">Public evidence boundary</p>
          </div>
          <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">What is verified today</h1>
          <p className="mt-5 text-base leading-7 text-white/65">
            This page separates running infrastructure from planned programs and research claims.
            A feature or idea is not presented as an outcome until a reviewable record exists.
          </p>
        </header>

        <section className="py-10" aria-labelledby="release-heading">
          <h2 id="release-heading" className="text-2xl font-semibold">Portal release</h2>
          <dl className="mt-6 divide-y divide-white/10 border-y border-white/10">
            <div className="grid gap-2 py-5 sm:grid-cols-[13rem_1fr]">
              <dt className="text-sm text-white/45">Current deployment revision</dt>
              <dd className="min-w-0 font-mono text-sm text-white/80">
                {revision ? (
                  <EvidenceLink href={`${PORTAL_REPO}/commit/${revision}`}>{revision}</EvidenceLink>
                ) : (
                  "Available on production deployments"
                )}
              </dd>
            </div>
            <div className="grid gap-2 py-5 sm:grid-cols-[13rem_1fr]">
              <dt className="text-sm text-white/45">Verified surface</dt>
              <dd className="text-sm leading-6 text-white/75">
                Build, public routes, authentication entry points, protected routing, and database authorization contracts.
              </dd>
            </div>
            <div className="grid gap-2 py-5 sm:grid-cols-[13rem_1fr]">
              <dt className="text-sm text-white/45">Source and checks</dt>
              <dd className="text-sm">
                <EvidenceLink href={`${PORTAL_REPO}/actions/workflows/ci.yml`}>Portal CI history</EvidenceLink>
              </dd>
            </div>
          </dl>
        </section>

        <section className="border-t border-white/10 py-10" aria-labelledby="program-heading">
          <h2 id="program-heading" className="text-2xl font-semibold">Programs and research</h2>
          <div className="mt-6 grid gap-8 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-white">Program registry</p>
              <p className="mt-2 text-sm leading-6 text-white/60">
                Programs remain planned until their evidence gates are met. The machine-readable registry is the source of truth.
              </p>
              <p className="mt-3 text-sm">
                <EvidenceLink href={`${GLOBAL_REPO}/blob/main/registry/programs.json`}>Open program registry</EvidenceLink>
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Research registry</p>
              <p className="mt-2 text-sm leading-6 text-white/60">
                Research status, limitations, and whether results exist are recorded separately from product copy.
              </p>
              <p className="mt-3 text-sm">
                <EvidenceLink href={`${GLOBAL_REPO}/blob/main/registry/projects.json`}>Open research registry</EvidenceLink>
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 py-10" aria-labelledby="limits-heading">
          <h2 id="limits-heading" className="text-2xl font-semibold">What is not claimed</h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/60">
            A successful deployment does not prove educational impact, research novelty, profitability,
            adoption, chapter reach, or member outcomes. Those require their own frozen methods, data,
            results, and independent review.
          </p>
        </section>
      </div>
    </main>
  );
}
