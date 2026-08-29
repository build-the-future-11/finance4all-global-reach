import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useChapters } from "@/hooks/portal/useEvents";
import AuthLayout from "@/components/portal/AuthLayout";
import {
  PortalAlert,
  PortalInput,
  PortalLabel,
  PortalTextarea,
  PortalToggleRow,
  PortalInterestPill,
  PortalSelectContent,
  PortalSelectItem,
  portalButtonPrimary,
  portalInputClass,
} from "@/components/portal/PortalUI";
import { portalCopy } from "@/lib/portalCopy";
import { safeInternalPath } from "@/lib/security";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";

const SUGGESTED_INTERESTS = ["macro", "equities", "fintech", "credit", "startups", "research"];

export default function Onboarding() {
  const { profile, user, completeOnboarding } = useAuth();
  const { data: chapters } = useChapters();
  const navigate = useNavigate();
  const location = useLocation();
  const afterOnboarding = safeInternalPath(
    (location.state as { from?: string })?.from,
    "/portal",
  );

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
    const { error: err } = await completeOnboarding({
      displayName: displayName.trim(),
      bio: bio.trim() || undefined,
      interests,
      openToCollaborate,
      chapterId: chapterId || undefined,
    });
    setSubmitting(false);
    if (err) setError(err);
    else navigate(afterOnboarding);
  };

  const avatarUrl =
    profile?.avatarUrl ||
    (user?.user_metadata?.avatar_url as string) ||
    (user?.user_metadata?.picture as string);

  return (
    <AuthLayout
      title={portalCopy.auth.onboardingTitle}
      subtitle={portalCopy.auth.onboardingSubtitle}
      footer={<span className="text-white/35">{portalCopy.auth.onboardingFooter}</span>}
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
            <p className="text-xs text-white/45">{portalCopy.auth.onboardingGoogleNote}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <PortalLabel>Display name</PortalLabel>
          <PortalInput value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
        </div>
        <div>
          <PortalLabel>Bio</PortalLabel>
          <PortalTextarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="e.g. macro research, chapter outreach, fintech, investing"
          />
        </div>
        <div>
          <PortalLabel>Interests</PortalLabel>
          <div className="mt-2 flex flex-wrap gap-2">
            {SUGGESTED_INTERESTS.map((tag) => (
              <PortalInterestPill
                key={tag}
                active={interests.includes(tag)}
                onClick={() => toggleInterest(tag)}
              >
                {tag}
              </PortalInterestPill>
            ))}
          </div>
        </div>
        {chapters && chapters.length > 0 && (
          <div>
            <PortalLabel>Chapter (optional)</PortalLabel>
            <Select value={chapterId} onValueChange={setChapterId}>
              <SelectTrigger className={portalInputClass}>
                <SelectValue placeholder="Select a chapter" />
              </SelectTrigger>
              <PortalSelectContent>
                {chapters.map((c) => (
                  <PortalSelectItem key={c.id} value={c.id}>
                    {c.name}, {c.country}
                  </PortalSelectItem>
                ))}
              </PortalSelectContent>
            </Select>
          </div>
        )}
        <PortalToggleRow
          title="Open to collaborate"
          description="Make your profile discoverable to other signed-in FinanceMeta members and signal that you are open to collaboration."
        >
          <Switch checked={openToCollaborate} onCheckedChange={setOpenToCollaborate} />
        </PortalToggleRow>
        {error && <PortalAlert variant="error">{error}</PortalAlert>}
        <Button type="submit" className={cn("w-full", portalButtonPrimary)} disabled={submitting}>
          {submitting ? "Saving…" : "Enter portal"}
        </Button>
      </form>
    </AuthLayout>
  );
}
