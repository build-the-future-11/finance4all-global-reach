import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useChapters } from "@/hooks/portal/useEvents";
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
  const { profile, updateProfile } = useAuth();
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060a12] px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-white/[0.04] p-8 backdrop-blur-xl">
        <h1 className="text-2xl font-bold text-white">Complete your profile</h1>
        <p className="mt-2 text-sm text-white/60">
          Tell the community a bit about yourself to unlock the full portal.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <Label className="text-white/80">Display name</Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="mt-1 border-white/20 bg-white/5 text-white"
            />
          </div>
          <div>
            <Label className="text-white/80">Bio</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="What are you working on or interested in?"
              className="mt-1 border-white/20 bg-white/5 text-white"
            />
          </div>
          <div>
            <Label className="text-white/80">Interests</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {SUGGESTED_INTERESTS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleInterest(tag)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    interests.includes(tag)
                      ? "bg-emerald-400/20 text-emerald-300 ring-1 ring-emerald-400/40"
                      : "bg-white/5 text-white/60 ring-1 ring-white/15 hover:bg-white/10"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          {chapters && chapters.length > 0 && (
            <div>
              <Label className="text-white/80">Chapter (optional)</Label>
              <Select value={chapterId} onValueChange={setChapterId}>
                <SelectTrigger className="mt-1 border-white/20 bg-white/5 text-white">
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
          <div className="flex items-center justify-between rounded-xl border border-white/10 p-4">
            <div>
              <p className="text-sm font-medium text-white">Open to collaborate</p>
              <p className="text-xs text-white/50">Show on your profile for others to find you</p>
            </div>
            <Switch checked={openToCollaborate} onCheckedChange={setOpenToCollaborate} />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Saving…" : "Enter portal"}
          </Button>
        </form>
      </div>
    </div>
  );
}
