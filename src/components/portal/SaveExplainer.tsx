import { Bookmark, Check, LoaderCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useSavedExplainers } from "@/hooks/portal/useSavedExplainers";

export default function SaveExplainer({ slug }: { slug: string }) {
  const { user, slugs, toggle } = useSavedExplainers();
  const location = useLocation();
  const saved = slugs.includes(slug);
  const className = "inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground transition hover:bg-muted";
  if (!user) return <Link to="/login" state={{ from: location.pathname }} className={className}><Bookmark size={15} /> Sign in to save</Link>;
  return <button type="button" className={className} aria-pressed={saved} disabled={toggle.isPending} onClick={() => toggle.mutate(slug, {
    onSuccess: nowSaved => toast.success(nowSaved ? "Guide saved to your library" : "Guide removed from saved"),
    onError: error => toast.error(error.message),
  })}>{toggle.isPending ? <LoaderCircle className="animate-spin" size={15} /> : saved ? <Check size={15} /> : <Bookmark size={15} />}{saved ? "Saved to your library" : "Save guide"}</button>;
}
