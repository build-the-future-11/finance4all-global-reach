import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Briefcase,
  Calendar,
  FlaskConical,
  GraduationCap,
  Library,
  Newspaper,
  Search,
  Users,
} from "lucide-react";
import { usePortalSearch, type SearchResult } from "@/hooks/portal/usePortalSearch";
import {
  CommandDialog,
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
  const navigate = useNavigate();
  const { data: results, isLoading } = usePortalSearch(query);

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
        className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white/45 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white/70 sm:flex"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search…</span>
        <kbd className="ml-2 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-white/35">
          ⌘K
        </kbd>
      </button>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white sm:hidden"
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search news, labs, opportunities, events, members…"
          value={query}
          onValueChange={setQuery}
          className="border-white/10 text-white placeholder:text-white/35"
        />
        <CommandList className="max-h-[360px]">
          {query.length < 2 ? (
            <div className="px-4 py-8 text-center text-sm text-white/40">
              Type at least 2 characters to search
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
                      onSelect={() => handleSelect(item.href)}
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
      </CommandDialog>
    </>
  );
}
