import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Briefcase,
  Calendar,
  Clock,
  FlaskConical,
  GraduationCap,
  Library,
  Newspaper,
  Search,
  Users,
} from "lucide-react";
import { usePortalSearch, type SearchResult } from "@/hooks/portal/usePortalSearch";
import { portalCopy } from "@/lib/portalCopy";
import { sanitizeSearchQuery } from "@/lib/security";
import { PortalCommandDialog } from "@/components/portal/PortalUI";
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const TYPE_ICONS: Record<SearchResult["type"], typeof Newspaper> = {
  news: Newspaper,
  lab: FlaskConical,
  opportunity: Briefcase,
  event: Calendar,
  member: Users,
  explainer: BookOpen,
  education: GraduationCap,
  resource: Library,
};

const TYPE_LABELS: Record<SearchResult["type"], string> = {
  news: "News",
  lab: "Labs",
  opportunity: "Pathways",
  event: "Events",
  member: "Members",
  explainer: "Explainers",
  education: "Education",
  resource: "Resources",
};

const RECENT_KEY = "f4a-recent-searches";
const MAX_RECENT = 5;

function readRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveRecent(query: string) {
  const q = sanitizeSearchQuery(query);
  if (q.length < 2) return;
  const prev = readRecent().filter((r) => r.toLowerCase() !== q.toLowerCase());
  const next = [q, ...prev].slice(0, MAX_RECENT);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

function groupResults(results: SearchResult[]) {
  const groups: Partial<Record<SearchResult["type"], SearchResult[]>> = {};
  for (const r of results) {
    (groups[r.type] ??= []).push(r);
  }
  return groups;
}

export default function PortalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const navigate = useNavigate();
  const { data: results, isLoading } = usePortalSearch(query);

  const handleSelect = useCallback(
    (href: string, searchQuery?: string) => {
      if (searchQuery) {
        saveRecent(searchQuery);
        setRecent(readRecent());
      }
      setOpen(false);
      setQuery("");
      navigate(href);
    },
    [navigate],
  );

  const handleSuggestedQuery = useCallback((q: string) => {
    setQuery(q);
  }, []);

  useEffect(() => {
    if (open) setRecent(readRecent());
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const grouped = groupResults(results ?? []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="portal-focus-ring portal-interactive hidden items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white/45 hover:border-white/20 hover:bg-white/[0.07] hover:text-white/70 sm:flex"
      >
        <Search className="h-3.5 w-3.5" aria-hidden />
        <span>Search…</span>
        <kbd className="ml-2 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-white/35">
          ⌘K
        </kbd>
      </button>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="portal-focus-ring portal-interactive rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white sm:hidden"
        aria-label="Search portal"
      >
        <Search className="h-4 w-4" />
      </button>

      <PortalCommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder={portalCopy.search.placeholder}
          value={query}
          onValueChange={setQuery}
          className="border-white/10 text-white placeholder:text-white/35"
        />
        <CommandList className="max-h-[360px]">
          {query.length < 2 ? (
            <div className="px-4 py-6">
              <p className="text-center text-sm text-white/40">{portalCopy.search.emptyHint}</p>
              {recent.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-white/35">
                    <Clock className="h-3 w-3" />
                    {portalCopy.search.recentTitle}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleSuggestedQuery(r)}
                        className="portal-focus-ring portal-interactive rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60 hover:border-emerald-400/30 hover:text-emerald-300"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/35">
                  {portalCopy.search.suggestedTitle}
                </p>
                <div className="flex flex-wrap gap-2">
                  {portalCopy.search.suggestedQueries.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleSuggestedQuery(q)}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60 transition hover:border-emerald-400/30 hover:text-emerald-300"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <div className="px-4 py-8 text-center text-sm text-white/40">Searching…</div>
          ) : !results?.length ? (
            <CommandEmpty className="text-white/40">No results found.</CommandEmpty>
          ) : (
            Object.entries(grouped).map(([type, items]) => {
              const Icon = TYPE_ICONS[type as SearchResult["type"]] ?? Search;
              return (
                <CommandGroup
                  key={type}
                  heading={TYPE_LABELS[type as SearchResult["type"]]}
                  className="text-white/50 [&_[cmdk-group-heading]]:text-white/40"
                >
                  {items?.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.title}
                      onSelect={() => {
                        saveRecent(query);
                        handleSelect(item.href, query);
                      }}
                      className="cursor-pointer text-white/80 aria-selected:bg-emerald-500/15 aria-selected:text-emerald-200"
                    >
                      <Icon className="mr-2 h-4 w-4 shrink-0 text-white/40" />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{item.title}</p>
                        {item.subtitle && (
                          <p className="truncate text-xs text-white/40">{item.subtitle}</p>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })
          )}
        </CommandList>
      </PortalCommandDialog>
    </>
  );
}
