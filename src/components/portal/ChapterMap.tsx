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
    label="Explore our chapters"
    description="Choose a chapter to see its location and filter events below."
    locations={chapters.map(chapter => ({ id: chapter.id, city: chapter.name, country: `${chapter.city}, ${chapter.country}`, continent: "", latitude: chapter.latitude, longitude: chapter.longitude, description: `${chapter.memberCount} directory members` }))}
    selectedId={selectedId}
    onSelect={id => id ? onSelect?.(id) : onReset?.()}
  />;
}
