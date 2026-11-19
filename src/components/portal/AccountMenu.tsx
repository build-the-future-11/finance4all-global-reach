import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import { portalRoutes } from "@/routes/portal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function AccountMenu() {
  const { profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const initials = (profile?.displayName ?? "Member").split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase();
  return <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild><button type="button" className="shrink-0 rounded-full" aria-label="Open account menu"><Avatar className="h-9 w-9 border border-border"><AvatarImage src={profile?.avatarUrl} /><AvatarFallback className="bg-primary/10 text-xs text-primary">{initials}</AvatarFallback></Avatar></button></PopoverTrigger>
    <PopoverContent align="end" className="w-64" aria-label="Account actions">
      <p className="font-semibold">{profile?.displayName ?? "Member"}</p><p className="mb-3 mt-1 text-xs text-muted-foreground">Your private member account</p>
      <nav aria-label="Account" className="flex flex-col gap-1">
        <Link className="rounded px-2 py-3 text-sm hover:bg-muted" onClick={() => setOpen(false)} to={portalRoutes.settings}>Profile & settings</Link>
        <Link className="rounded px-2 py-3 text-sm hover:bg-muted" onClick={() => setOpen(false)} to={portalRoutes.saved}>Saved content</Link>
        <Link className="rounded px-2 py-3 text-sm hover:bg-muted" onClick={() => setOpen(false)} to="/">Explore public site</Link>
      </nav>
      <button type="button" className="mt-2 w-full rounded border px-2 py-3 text-left text-sm" onClick={() => { setOpen(false); void signOut(); }}>Sign out</button>
    </PopoverContent>
  </Popover>;
}
