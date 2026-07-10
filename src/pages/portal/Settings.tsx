import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Camera, Lock, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useChapters } from "@/hooks/portal/useEvents";
import { useUpdateMyProfile } from "@/hooks/portal/useNetwork";
import { computeProfileCompleteness, useMyMemberStats } from "@/hooks/portal/useMemberStats";
import { useAvatarUpload } from "@/hooks/portal/useAvatarUpload";
import { computeMemberBadges } from "@/lib/badges";
import { portalRoutes } from "@/routes/portal";
import MembershipCard from "@/components/portal/MembershipCard";
import MemberBadges from "@/components/portal/MemberBadges";
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
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { sanitizeBio, sanitizeDisplayName } from "@/lib/security";

const SUGGESTED_INTERESTS = ["macro", "equities", "fintech", "credit", "startups", "research"];

export default function Settings() {
  useDocumentTitle("Settings");
  const { profile, signOut, refreshProfile } = useAuth();
  const { data: chapters } = useChapters();
  const { data: stats } = useMyMemberStats();
  const updateProfile = useUpdateMyProfile();
  const uploadAvatar = useAvatarUpload();
  const fileRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [interests, setInterests] = useState<string[]>(profile?.interests ?? []);
  const [openToCollaborate, setOpenToCollaborate] = useState(profile?.openToCollaborate ?? false);
  const [chapterId, setChapterId] = useState(profile?.chapterId ?? "");

  const { percent, missing } = computeProfileCompleteness({
    displayName,
    bio,
    interests,
    chapterId: chapterId || undefined,
    openToCollaborate,
  });

  const chapterName = chapters?.find((c) => c.id === chapterId)?.name;
  const memberBadges = computeMemberBadges(profile, stats);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadAvatar.mutateAsync(file);
      await refreshProfile();
      toast.success("Avatar updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
    e.target.value = "";
  };

  const toggleInterest = (tag: string) => {
    setInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSave = async () => {
    try {
      const { error } = await updateProfile.mutateAsync({
        displayName: sanitizeDisplayName(displayName),
        bio: sanitizeBio(bio) || undefined,
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
        description="Manage your profile, membership, and security preferences."
      />

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {profile && <MembershipCard profile={profile} chapterName={chapterName} />}
        <PortalCard className="p-6">
          <div className="flex items-center gap-2 text-emerald-300">
            <Shield className="h-4 w-4" />
            <h3 className="font-semibold text-white">Profile strength</h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-white">{percent}%</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          {missing.length > 0 && (
            <p className="mt-3 text-sm text-white/50">
              Add: {missing.join(", ").toLowerCase()}
            </p>
          )}
          <Link to={portalRoutes.network} className="mt-4 inline-block text-sm text-emerald-400 hover:underline">
            View public profile →
          </Link>
        </PortalCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <PortalCard className="p-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <Avatar className="h-20 w-20 border border-white/15">
                <AvatarImage src={profile?.avatarUrl} />
                <AvatarFallback className="bg-emerald-500/20 text-lg text-emerald-300">
                  {initials || "?"}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploadAvatar.isPending}
                className="absolute -bottom-1 -right-1 rounded-full border border-white/20 bg-emerald-500 p-1.5 text-white shadow-lg transition hover:bg-emerald-400"
                aria-label="Upload avatar"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-white">{profile?.displayName}</h2>
            <p className="text-sm text-white/50">{profile?.email}</p>
            <p className="mt-1 text-xs capitalize text-white/40">
              {profile?.role?.replace("_", " ")}
            </p>
          </div>
        </PortalCard>

        <PortalCard className="p-6 lg:col-span-2">
          <div className="space-y-5">
            <div>
              <Label className="text-white/70">Display name</Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={80}
                className={portalInputClass}
              />
            </div>
            <div>
              <Label className="text-white/70">Bio</Label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={500}
                className={portalInputClass}
              />
              <p className="mt-1 text-xs text-white/35">{bio.length}/500</p>
            </div>
            <div>
              <Label className="text-white/70">Interests</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {SUGGESTED_INTERESTS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
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
            </div>
            {chapters && chapters.length > 0 && (
              <div>
                <Label className="text-white/70">Chapter</Label>
                <Select value={chapterId} onValueChange={setChapterId}>
                  <SelectTrigger className={portalInputClass}>
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
                <p className="text-sm font-medium text-white">Open to collaborate</p>
                <p className="text-xs text-white/45">Shown on your public profile</p>
              </div>
              <Switch checked={openToCollaborate} onCheckedChange={setOpenToCollaborate} />
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                onClick={handleSave}
                disabled={updateProfile.isPending}
                className="bg-emerald-500 hover:bg-emerald-400"
              >
                {updateProfile.isPending ? "Saving…" : "Save changes"}
              </Button>
              <Button variant="outline" className={portalButtonOutline} onClick={() => signOut()}>
                Sign out
              </Button>
            </div>
          </div>
        </PortalCard>
      </div>

      <PortalCard className="mt-6 p-6">
        <h3 className="mb-4 font-semibold text-white">Membership badges</h3>
        <MemberBadges badges={memberBadges} />
      </PortalCard>

      <PortalCard className="mt-6 p-6">
        <div className="flex items-start gap-3">
          <Lock className="mt-0.5 h-5 w-5 text-white/40" />
          <div>
            <h3 className="font-semibold text-white">Security</h3>
            <p className="mt-1 text-sm text-white/50">
              Password changes and two-factor authentication are managed through Supabase Auth.
              Use a strong unique password and enable Google sign-in for faster secure access.
            </p>
            <p className="mt-2 text-xs text-white/35">
              Never share your password or service-role keys. Report suspicious activity to your chapter lead.
            </p>
          </div>
        </div>
      </PortalCard>
    </div>
  );
}
