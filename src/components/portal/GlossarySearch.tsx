import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { useExplainers } from "@/hooks/portal/useDebriefed";
import { searchGlossary } from "@/lib/glossarySearch";
import { PortalCard } from "@/components/portal/PortalUI";
import { Input } from "@/components/ui/input";

interface GlossarySearchProps {
  compact?: boolean;
}

export default function GlossarySearch({ compact }: GlossarySearchProps) {
  const { data: explainers } = useExplainers();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (query.trim().length < 2) return [];
    return searchGlossary(
      query,
      explainers?.map((e) => ({
        title: e.title,
        summary: e.summary,
        body: e.body,
        slug: e.slug,
      })) ?? [],
    );
  }, [query, explainers]);

  return (
    <PortalCard className={compact ? "p-4" : "p-6"}>
      <h3 className="font-semibold text-white">Glossary search</h3>
      <p className="mt-1 text-sm text-white/50">
        Search member explainers and education guides — sourced from Finance4All content, not generated guesses.
      </p>

      <div className="relative mt-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. IPO, inflation, diversification…"
          className="border-white/15 bg-white/[0.06] pl-9 text-white placeholder:text-white/30"
        />
      </div>

      {query.trim().length >= 2 && (
        <ul className="mt-4 space-y-2">
          {results.length === 0 ? (
            <li className="text-sm text-white/45">
              No matches. Browse{" "}
              <Link to="/portal/debriefed/explainers" className="text-emerald-300 hover:underline">
                all explainers
              </Link>{" "}
              or the{" "}
              <Link to="/portal/education" className="text-emerald-300 hover:underline">
                education hub
              </Link>
              .
            </li>
          ) : (
            results.map((r) => (
              <li key={r.href}>
                <Link
                  to={r.href}
                  className="block rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 transition hover:border-white/20 hover:bg-white/[0.06]"
                >
                  <p className="text-sm font-medium text-white">{r.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-white/50">{r.snippet}</p>
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
    </PortalCard>
  );
}
