import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Chapter } from "@/types/domain";

function project(lat: number, lon: number) {
  return {
    left: `${((lon + 180) / 360) * 100}%`,
    top: `${((90 - lat) / 180) * 100}%`,
  };
}

interface ChapterMapProps {
  chapters: Chapter[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  highlightedCountry?: string;
}

export default function ChapterMap({
  chapters,
  selectedId,
  onSelect,
  highlightedCountry,
}: ChapterMapProps) {
  const visible = useMemo(() => {
    if (!highlightedCountry || highlightedCountry === "all") return chapters;
    return chapters.filter((c) => c.country === highlightedCountry);
  }, [chapters, highlightedCountry]);

  const selected = chapters.find((c) => c.id === selectedId);

  return (
    <div className="space-y-3">
      <div
        className="relative aspect-[2/1] w-full overflow-hidden rounded-2xl border border-white/10 bg-landing-map-bg"
        role="img"
        aria-label={`Map of ${visible.length} Finance4All chapters`}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "10% 20%",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-blue-500/5" />

        {visible.map((chapter) => {
          const pos = project(chapter.latitude, chapter.longitude);
          const isSelected = selectedId === chapter.id;
          return (
            <button
              key={chapter.id}
              type="button"
              title={`${chapter.name}, ${chapter.city}, ${chapter.country}`}
              aria-pressed={isSelected}
              aria-label={`${chapter.name} in ${chapter.city}, ${chapter.country}`}
              onClick={() => onSelect?.(chapter.id)}
              className="portal-focus-ring group absolute z-10 -translate-x-1/2 -translate-y-1/2"
              style={{ left: pos.left, top: pos.top }}
            >
              <span
                className={cn(
                  "block h-3 w-3 rounded-full ring-2 transition-all",
                  isSelected
                    ? "scale-150 bg-emerald-400 ring-emerald-300/50"
                    : "bg-emerald-400/80 ring-white/30 group-hover:scale-125 group-hover:bg-emerald-300",
                )}
              />
              <span
                className={cn(
                  "pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-medium transition",
                  isSelected
                    ? "bg-emerald-500/20 text-emerald-200"
                    : "text-white/0 group-hover:bg-white/10 group-hover:text-white/80",
                )}
              >
                {chapter.name}
              </span>
            </button>
          );
        })}

        <div className="absolute bottom-3 left-3 rounded-lg bg-black/40 px-2 py-1 text-[10px] text-white/40 backdrop-blur-sm">
          {visible.length} chapter{visible.length === 1 ? "" : "s"} shown
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-lg bg-black/40 px-2 py-1 text-[10px] text-white/50 backdrop-blur-sm">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
          Chapter location
        </div>
      </div>

      {selected && (
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-white/80">
          <p className="font-medium text-white">{selected.name}</p>
          <p className="text-white/55">
            {selected.city}, {selected.country} · {selected.memberCount} members
          </p>
        </div>
      )}
    </div>
  );
}
