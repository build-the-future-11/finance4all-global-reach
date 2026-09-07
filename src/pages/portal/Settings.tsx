import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import { useChapters } from "@/hooks/portal/useEvents";
import { useUpdateMyProfile } from "@/hooks/portal/useNetwork";
import { portalRoutes } from "@/routes/portal";
import {
  PortalCard,
  PortalPageHeader,
  portalInputClass,
  portalButtonOutline,
} from "@/components/portal/PortalUI";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const SUGGESTED_INTERESTS = ["macro", "equities", "fintech", "credit", "startups", "research"];

export default function Settings() {
  const { profile, user, signOut } = useAuth();
  const { data: chapters } = useChapters();
  const updateProfile = useUpdateMyProfile();

  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [interests, setInterests] = useState<string[]>(profile?.interests ?? []);
  const [openToCollaborate, setOpenToCollaborate] = useState(profile?.openToCollaborate ?? false);
  const [chapterId, setChapterId] = useState(profile?.chapterId ?? "");

  const toggleInterest = (tag: string) => {
    setInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const { error } = await updateProfile.mutateAsync({
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
        interests,
        openToCollaborate,
        chapterId: chapterId || undefined,
      });
      if (error) throw new Error(error);
      toast.success("Profile updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    }
  };

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div>
      <PortalPageHeader
        eyebrow="Account"
        title="Settings"
        description="Manage your profile and portal preferences."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <PortalCard className="p-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-20 w-20 border border-white/15">
              <AvatarImage src={profile?.avatarUrl} />
              <AvatarFallback className="bg-emerald-500/20 text-lg text-emerald-300">
                {initials || "?"}
              </AvatarFallback>
            </Avatar>
            <h2 className="mt-4 text-lg font-semibold text-white">{profile?.displayName}</h2>
            <p className="text-sm text-white/50">{user?.email}</p>
            <p className="mt-1 text-xs capitalize text-white/40">
              {profile?.role?.replace("_", " ")}
            </p>
            <Link to={portalRoutes.network} className="mt-4 text-sm text-emerald-400 hover:underline">
              View network →
            </Link>
          </div>
        </PortalCard>

        <PortalCard className="p-6 lg:col-span-2">
          <form className="space-y-5" onSubmit={handleSave}>
            <div>
              <Label htmlFor="settings-display-name" className="text-white/70">
                Display name
              </Label>
              <Input
                id="settings-display-name"
                name="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={portalInputClass}
              />
            </div>
            <div>
              <Label htmlFor="settings-bio" className="text-white/70">
                Bio
              </Label>
              <Textarea
                id="settings-bio"
                name="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className={portalInputClass}
              />
            </div>
            <fieldset>
              <legend className="text-sm font-medium text-white/70">Interests</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {SUGGESTED_INTERESTS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    aria-pressed={interests.includes(tag)}
                    onClick={() => toggleInterest(tag)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      interests.includes(tag)
                        ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30"
                        : "bg-white/[0.05] text-white/55 ring-1 ring-white/10 hover:bg-white/10"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </fieldset>
            {chapters && chapters.length > 0 && (
              <div>
                <Label htmlFor="settings-chapter" className="text-white/70">
                  Chapter
                </Label>
                <Select value={chapterId} onValueChange={setChapterId}>
                  <SelectTrigger id="settings-chapter" className={portalInputClass}>
                    <SelectValue placeholder="Select a chapter" />
                  </SelectTrigger>
                  <SelectContent>
                    {chapters.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}, {c.country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div>
                <Label htmlFor="settings-open-to-collaborate" className="text-sm font-medium text-white">
                  Open to collaborate
                </Label>
                <p id="settings-open-to-collaborate-description" className="text-xs text-white/45">
                  Shown on your public profile
                </p>
              </div>
              <Switch
                id="settings-open-to-collaborate"
                checked={openToCollaborate}
                onCheckedChange={setOpenToCollaborate}
                aria-describedby="settings-open-to-collaborate-description"
              />
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                type="submit"
                disabled={updateProfile.isPending}
                className="bg-emerald-500 hover:bg-emerald-400"
              >
                {updateProfile.isPending ? "Saving…" : "Save changes"}
              </Button>
              <Button type="button" variant="outline" className={portalButtonOutline} onClick={() => signOut()}>
                Sign out
              </Button>
            </div>
          </form>
        </PortalCard>
      </div>
    </div>
  );
}
