import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Briefcase,
  Calendar,
  FlaskConical,
  Globe2,
  Newspaper,
  Search,
  Users,
} from "lucide-react";
import { usePortalSearch, type SearchResult } from "@/hooks/portal/usePortalSearch";
import { publicSearch, searchRank } from "@/lib/public-search";
import { useAuth } from "@/contexts/useAuth";
import { searchResultCommandValue } from "@/lib/search-result-command";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const TYPE_ICONS = {
  news: Newspaper,
  lab: FlaskConical,
  opportunity: Briefcase,
  event: Calendar,
  member: Users,
  explainer: BookOpen,
  program: Briefcase,
  chapter: Globe2,
  resource: BookOpen,
} as const;

const TYPE_LABELS = {
  news: "News",
  lab: "Research",
  opportunity: "Opportunities",
  event: "Events",
  member: "Members",
  explainer: "Explainers",
  program: "Programs",
  chapter: "Chapter locations",
  resource: "Learning resources",
} as const;

function groupResults(results: SearchResult[]) {
  const groups: Partial<Record<SearchResult["type"], SearchResult[]>> = {};
  for (const r of results) {
    (groups[r.type] ??= []).push(r);
  }
  return groups;
}

export default function PortalSearch() {
  const desktopTrigger = useRef<HTMLButtonElement>(null);
  const mobileTrigger = useRef<HTMLButtonElement>(null);
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(timer);
  }, [query]);
  const { data: memberResults, isLoading, error, refetch } = usePortalSearch(open ? debouncedQuery : "", user?.id);

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      navigate(href);
    },
    [navigate],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k" && [desktopTrigger.current, mobileTrigger.current].some(trigger => trigger && trigger.getClientRects().length > 0)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const q = debouncedQuery.trim().toLocaleLowerCase();
  const results = [...publicSearch(q), ...(memberResults ?? [])].sort((a, b) => searchRank(a, q) - searchRank(b, q) || a.title.localeCompare(b.title)).slice(0, 24);
  const grouped = groupResults(results);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        ref={desktopTrigger}
        className="portal-search-trigger hidden items-center gap-2 rounded-full border px-3 py-2 text-sm transition sm:flex"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search…</span>
        <kbd className="ml-2 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      <button
        type="button"
        onClick={() => setOpen(true)}
        ref={mobileTrigger}
        className="portal-icon-button portal-search-mobile-trigger rounded-full p-2 sm:hidden"
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </button>

      <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false} label="Search portal">
        <CommandInput
          placeholder="Search research, programs, articles, events, cities, members…"
          value={query}
          maxLength={128}
          aria-label="Search portal"
          onValueChange={setQuery}
          className="border-border text-foreground placeholder:text-muted-foreground"
        />
        <CommandList className="max-h-[360px]">
          {error && <div role="alert" className="border-b border-border p-4 text-sm">Member search is unavailable. Public catalog results remain available. <button type="button" className="underline" onClick={() => void refetch()}>Retry member search</button></div>}
          {query.length < 2 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Type at least 2 characters to search
            </div>
          ) : query !== debouncedQuery ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">Searching…</div>
          ) : !results.length && !isLoading ? (
            <CommandEmpty className="text-muted-foreground">No results found.</CommandEmpty>
          ) : (
            <>
            {isLoading && <div role="status" className="px-4 py-3 text-sm text-muted-foreground">Searching member records…</div>}
            {Object.entries(grouped).map(([type, items]) => {
              const Icon = TYPE_ICONS[type as SearchResult["type"]];
              return (
                <CommandGroup
                  key={type}
                  heading={TYPE_LABELS[type as SearchResult["type"]]}
                  className="text-muted-foreground **:[[cmdk-group-heading]]:text-muted-foreground"
                >
                  {items?.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={searchResultCommandValue(item)}
                      onSelect={() => handleSelect(item.href)}
                      className="cursor-pointer text-foreground aria-selected:bg-accent aria-selected:text-accent-foreground"
                    >
                      <Icon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{item.title}</p>
                        {item.subtitle && (
                          <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
