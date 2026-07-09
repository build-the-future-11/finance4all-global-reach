import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useChapters } from "@/hooks/portal/useEvents";
import AuthLayout from "@/components/portal/AuthLayout";
import { portalInputClass } from "@/components/portal/PortalUI";
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

const SUGGESTED_INTERESTS = ["macro", "equities", "fintech", "credit", "startups", "research"];

export default function Onboarding() {
  const { profile, user, updateProfile } = useAuth();
  const { data: chapters } = useChapters();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [interests, setInterests] = useState<string[]>(profile?.interests ?? []);
  const [openToCollaborate, setOpenToCollaborate] = useState(profile?.openToCollaborate ?? false);
  const [chapterId, setChapterId] = useState(profile?.chapterId ?? "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggleInterest = (tag: string) => {
    setInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError("Display name is required");
      return;
    }
    setSubmitting(true);
    const { error: err } = await updateProfile({
      displayName: displayName.trim(),
      bio: bio.trim() || undefined,
      interests,
      openToCollaborate,
      chapterId: chapterId || undefined,
    });
    setSubmitting(false);
    if (err) setError(err);
    else navigate("/portal");
  };

  const avatarUrl =
    profile?.avatarUrl ||
    (user?.user_metadata?.avatar_url as string) ||
    (user?.user_metadata?.picture as string);

  return (
    <AuthLayout
      title="Complete your profile"
      subtitle="A few details so the community can find and connect with you."
      footer={<span className="text-white/35">You can update this anytime in Network.</span>}
    >
      {avatarUrl && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <Avatar className="h-12 w-12 border border-white/15">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-emerald-500/20 text-emerald-300">
              {displayName.slice(0, 2).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-white">Signed in with Google</p>
            <p className="text-xs text-white/45">Your photo will appear on your profile</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label className="text-white/70">Display name</Label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className={portalInputClass}
          />
        </div>
        <div>
          <Label className="text-white/70">Bio</Label>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="What are you working on or interested in?"
            className={portalInputClass}
          />
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
            <Label className="text-white/70">Chapter (optional)</Label>
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
            <p className="text-xs text-white/45">Visible on your profile</p>
          </div>
          <Switch checked={openToCollaborate} onCheckedChange={setOpenToCollaborate} />
        </div>
        {error && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400" disabled={submitting}>
          {submitting ? "Saving…" : "Enter portal"}
        </Button>
      </form>
    </AuthLayout>
  );
}
