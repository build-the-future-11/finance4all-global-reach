import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import { useChapters } from "@/hooks/portal/useEvents";
import AuthLayout from "@/components/portal/AuthLayout";
import { portalInputClass } from "@/components/portal/PortalUI";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase";
import { withDeadline } from "@/lib/asyncDeadline";
import { AGE_BANDS, ONBOARDING_VERSION, validateEducation } from "@/lib/onboarding";
import { takePostAuthPath } from "@/lib/auth-navigation";
import { MultiStepLoader } from "@/components/experience/Interactions";
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
  const [step, setStep] = useState(0);
  const [saveStep, setSaveStep] = useState(0);
  const [school, setSchool] = useState(String(user?.user_metadata?.school ?? ""));
  const [ageBand, setAgeBand] = useState(String(user?.user_metadata?.age_band ?? ""));

  const toggleInterest = (tag: string) => {
    setInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (step === 0) {
      const educationError = validateEducation(school, ageBand);
      if (educationError) { setError(educationError); return; }
      setStep(1);
      return;
    }
    if (!displayName.trim()) {
      setError("Display name is required");
      return;
    }
    setSubmitting(true);
    setSaveStep(0);
    try {
      const { error: err } = await updateProfile({
      displayName: displayName.trim(),
      bio: bio.trim() || undefined,
      interests,
      openToCollaborate,
      chapterId: chapterId || undefined,
      });
      if (err) throw new Error(err);
      setSaveStep(1);
      // Keep education and age group in the member's private Auth metadata, not the directory.
      const { data, error: detailsError } = await withDeadline(() => supabase.auth.updateUser({ data: { school: school.trim(), age_band: ageBand, onboarding_version: ONBOARDING_VERSION } }), 15000, "Saving member details");
      if (detailsError) throw detailsError;
      if (data.user?.user_metadata?.onboarding_version !== ONBOARDING_VERSION) throw new Error("We could not confirm your details were saved. Please try again.");
      setSaveStep(2);
      navigate(takePostAuthPath(), { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn't save your profile. Please try again.");
    } finally { setSubmitting(false); }
  };

  const avatarUrl =
    profile?.avatarUrl ||
    (user?.user_metadata?.avatar_url as string) ||
    (user?.user_metadata?.picture as string);

  return (
    <AuthLayout
      title={step === 0 ? "A little about you" : "Make yourself at home"}
      subtitle={step === 0 ? "Where are you learning? Let's make this space feel like yours." : "Introduce yourself to the people you'll be learning and building with."}
      footer={<span className="text-white/35">Your public bio and interests can be edited in Network. Your school and age group stay private.</span>}
    >
      <div className="auth-step-nav" aria-label={`Profile setup, step ${step + 1} of 2`}><span data-active="true" /><span data-active={step === 1} /></div>
      {step === 1 && avatarUrl && (
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
        {step === 0 ? <>
          <p className="auth-private-note">Your school and age group help us understand our community. They are kept out of your public member profile. You do not need to share your date of birth.</p>
          <div><Label htmlFor="onboarding-school">School, university, or learning community</Label><Input id="onboarding-school" value={school} onChange={e => setSchool(e.target.value)} maxLength={160} required placeholder="Where do you study or learn?" className={portalInputClass} /><p className="mt-2 text-xs text-muted-foreground">Not in school? You can enter Independent learner or your current organization.</p></div>
          <div><Label htmlFor="onboarding-age">Age group</Label><select id="onboarding-age" className="auth-field-select" value={ageBand} onChange={e => setAgeBand(e.target.value)} required><option value="">Select an age group</option>{AGE_BANDS.map(age => <option key={age}>{age}</option>)}</select></div>
        </> : <>
        <div>
          <Label htmlFor="onboarding-display-name" className="text-white/70">
            Display name
          </Label>
          <Input
            id="onboarding-display-name"
            name="displayName"
            value={displayName}
            maxLength={80}
            autoComplete="name"
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className={portalInputClass}
          />
        </div>
        <div>
          <Label htmlFor="onboarding-bio" className="text-white/70">
            Bio
          </Label>
          <Textarea
            id="onboarding-bio"
            name="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={1200}
            placeholder="What are you working on or interested in?"
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
            <Label htmlFor="onboarding-chapter" className="text-white/70">
              Chapter (optional)
            </Label>
            <Select value={chapterId} onValueChange={setChapterId}>
              <SelectTrigger id="onboarding-chapter" className={portalInputClass}>
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
            <Label htmlFor="onboarding-open-to-collaborate" className="text-sm font-medium text-white">
              Open to collaborate
            </Label>
            <p id="onboarding-open-to-collaborate-description" className="text-xs text-white/45">
              Visible on your profile
            </p>
          </div>
          <Switch
            id="onboarding-open-to-collaborate"
            checked={openToCollaborate}
            onCheckedChange={setOpenToCollaborate}
            aria-describedby="onboarding-open-to-collaborate-description"
          />
        </div>
        </>}
        {error && (
          <p role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        {submitting && <MultiStepLoader steps={["Saving your public profile", "Saving your private member details", "Opening your member space"]} current={saveStep} />}
        <div className="auth-step-actions">{step === 1 && <Button type="button" variant="outline" onClick={() => { setStep(0); setError(""); }} disabled={submitting}>Back</Button>}<Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400" disabled={submitting}>{submitting ? "Saving…" : step === 0 ? "Continue" : "Enter portal"}</Button></div>
      </form>
    </AuthLayout>
  );
}
