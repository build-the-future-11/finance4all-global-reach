import WorldMap from "@/components/experience/WorldMap";
import type { Chapter } from "@/types/domain";

interface ChapterMapProps {
  chapters: Chapter[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  onReset?: () => void;
}
export default function ChapterMap({ chapters, selectedId, onSelect, onReset }: ChapterMapProps) {
  return <WorldMap
    label="Reviewed chapter directory"
    description="Choose a published directory record to filter events. Operating status requires separate activity evidence."
    locations={chapters.map(chapter => ({ id: chapter.id, city: chapter.name, country: `${chapter.city}, ${chapter.country}`, continent: "", latitude: chapter.latitude, longitude: chapter.longitude, description: chapter.status === "active_verified" ? "Reviewed operating record with an accepted owner, permissions and recent activity evidence." : "Published directory record. Active operating status is not certified here.", status: chapter.status ?? "unverified" }))}
    selectedId={selectedId}
    onSelect={id => id ? onSelect?.(id) : onReset?.()}
  />;
}
