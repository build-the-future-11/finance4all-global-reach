import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface BookmarkButtonProps {
  saved: boolean;
  loading?: boolean;
  onToggle: () => void | Promise<void>;
  label?: string;
  className?: string;
}

export default function BookmarkButton({
  saved,
  loading,
  onToggle,
  label,
  className,
}: BookmarkButtonProps) {
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await onToggle();
      toast.success(saved ? "Removed from saved" : "Saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update bookmark");
    }
  };

  return (
    <Button
      type="button"
      size="sm"
      variant={saved ? "default" : "outline"}
      disabled={loading}
      className={cn(
        saved ? "bg-emerald-500 hover:bg-emerald-400" : "border-white/20 text-white hover:bg-white/10",
        className,
      )}
      onClick={handleClick}
      aria-label={saved ? "Remove bookmark" : "Save bookmark"}
    >
      <Bookmark className={cn("h-3.5 w-3.5", saved && "fill-current")} />
      {label && <span className="ml-1.5">{saved ? "Saved" : label}</span>}
    </Button>
  );
}
