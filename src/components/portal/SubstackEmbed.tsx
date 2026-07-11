import { ExternalLink } from "lucide-react";
import { PortalCard } from "@/components/portal/PortalUI";

export default function SubstackEmbed() {
  return (
    <PortalCard className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <div>
          <p className="text-sm font-semibold text-white">Finance Debriefed</p>
          <p className="text-xs text-white/45">Weekly newsletter on Substack</p>
        </div>
        <a
          href="https://financedebriefed.substack.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-emerald-300 hover:underline"
        >
          Open <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      <iframe
        src="https://financedebriefed.substack.com/embed"
        width="100%"
        height="320"
        className="border-0 bg-portal-surface"
        title="Finance Debriefed Substack"
        loading="lazy"
      />
    </PortalCard>
  );
}
