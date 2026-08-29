import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Camera, Download, Lock, Shield, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useChapters } from "@/hooks/portal/useEvents";
import { useUpdateMyProfile } from "@/hooks/portal/useNetwork";
import { computeProfileCompleteness, useMyMemberStats } from "@/hooks/portal/useMemberStats";
import { useAvatarUpload } from "@/hooks/portal/useAvatarUpload";
import { computeMemberBadges } from "@/lib/badges";
import { portalRoutes } from "@/routes/portal";
import MembershipCard from "@/components/portal/MembershipCard";
import MemberBadges from "@/components/portal/MemberBadges";
import { replayPortalTour } from "@/lib/portalTour";
import {
  PortalCard,
  PortalPageHeader,
  PortalInput,
  PortalLabel,
  PortalTextarea,
  PortalToggleRow,
  PortalInterestPill,
  PortalProgressBar,
  PortalSelectContent,
  PortalSelectItem,
  PortalSectionHeading,
  portalButtonDanger,
  portalButtonOutline,
  portalButtonPrimary,
  portalInputClass,
  portalLinkClass,
} from "@/components/portal/PortalUI";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { sanitizeBio, sanitizeDisplayName, isPasswordAcceptable, assessPassword } from "@/lib/security";
import PasswordStrengthMeter from "@/components/portal/PasswordStrengthMeter";
import { useDigestPreferences, useUpdateDigestPreferences } from "@/hooks/portal/useDebriefed";
import { portalCopy } from "@/lib/portalCopy";
import PortalAnimatedSection from "@/components/portal/PortalAnimatedSection";
import InterestPillBar from "@/components/portal/InterestPillBar";
import { buildAccountExport, deleteAccount, downloadAccountExport } from "@/lib/accountData";
import { supabase } from "@/lib/supabase";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const SUGGESTED_INTERESTS = ["macro", "equities", "fintech", "credit", "startups", "research"];

export default function Settings() {
  useDocumentTitle("Settings");
  const { profile, user, signOut, refreshProfile, updatePassword } = useAuth();
  const isAdmin = profile?.role === "admin";
  const { data: digestPrefs } = useDigestPreferences();
  const updateDigest = useUpdateDigestPreferences();
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
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.displayName ?? "");
    setBio(profile.bio ?? "");
    setInterests(profile.interests ?? []);
    setOpenToCollaborate(profile.openToCollaborate ?? false);
    setChapterId(profile.chapterId ?? "");
  }, [profile]);

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

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!isPasswordAcceptable(newPassword)) {
      toast.error("Password must be at least 8 characters with letters and numbers.");
      return;
    }
    setPasswordSaving(true);
    const { error } = await updatePassword(newPassword);
    setPasswordSaving(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Password updated");
    setNewPassword("");
    setConfirmPassword("");
  };

  const passwordAssessment = assessPassword(newPassword);

  const handleDigestToggle = async (value: boolean) => {
    try {
      await updateDigest.mutateAsync({ weeklyDigestEnabled: value });
      toast.success("Communication preferences saved");
    } catch {
      toast.error("Could not save preferences");
    }
  };

  const handleExport = async () => {
    if (!user) return;
    setExporting(true);
    try {
      downloadAccountExport(await buildAccountExport(user.id));
      toast.success("Account export downloaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not export your account data");
    } finally {
      setExporting(false);
    }
  };

  const requiredDeleteConfirmation = user?.email ? `DELETE ${user.email}` : "";
  const handleDeleteAccount = async () => {
    if (!requiredDeleteConfirmation || deleteConfirmation !== requiredDeleteConfirmation) return;
    setDeleting(true);
    try {
      await deleteAccount(deleteConfirmation);
      await supabase.auth.signOut({ scope: "local" });
      window.location.assign("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete your account");
      setDeleting(false);
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
      <PortalAnimatedSection>
        <PortalPageHeader
          eyebrow={portalCopy.settings.eyebrow}
          title={portalCopy.settings.title}
          description={portalCopy.settings.description}
        />
      </PortalAnimatedSection>

      <PortalAnimatedSection delay={40}>
        <InterestPillBar />
      </PortalAnimatedSection>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {profile && <MembershipCard profile={profile} chapterName={chapterName} />}
        <PortalCard className="p-6">
          <div className="flex items-center gap-2 text-emerald-300">
            <Shield className="h-4 w-4" />
            <h3 className="font-semibold text-white">Profile strength</h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-white">{percent}%</p>
          <div className="mt-3">
            <PortalProgressBar value={percent} label="Profile completeness" />
          </div>
          {missing.length > 0 && (
            <p className="mt-3 text-sm text-white/50">
              Add: {missing.join(", ").toLowerCase()}
            </p>
          )}
          <Link
            to={profile ? `${portalRoutes.networkProfile}/${profile.id}` : portalRoutes.network}
            className={cn(portalLinkClass, "mt-4 inline-block text-sm")}
          >
            View member profile →
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
                className="portal-focus-ring absolute -bottom-1 -right-1 rounded-full border border-white/20 bg-emerald-500 p-1.5 text-white shadow-lg transition duration-portal hover:bg-emerald-400 disabled:opacity-50"
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
              <PortalLabel>Display name</PortalLabel>
              <PortalInput
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={80}
              />
            </div>
            <div>
              <PortalLabel>Bio</PortalLabel>
              <PortalTextarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={500}
              />
              <p className="mt-1 text-xs text-white/35">{bio.length}/500</p>
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
                <PortalLabel>Chapter</PortalLabel>
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
              description="Controls whether other members can discover your profile in the directory and signals that you are open to collaboration."
            >
              <Switch checked={openToCollaborate} onCheckedChange={setOpenToCollaborate} />
            </PortalToggleRow>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                onClick={handleSave}
                disabled={updateProfile.isPending}
                className={portalButtonPrimary}
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
        <PortalSectionHeading title="Communications" description={portalCopy.settings.digestNote} className="mb-4" />
        <div className="space-y-4">
          <PortalToggleRow
            title="Weekly Debriefed digest"
            description="A weekly email containing newly published Finance Debrief updates in your selected categories"
          >
            <Switch
              checked={digestPrefs?.weeklyDigestEnabled ?? false}
              disabled={updateDigest.isPending}
              onCheckedChange={handleDigestToggle}
            />
          </PortalToggleRow>
        </div>
      </PortalCard>

      <PortalCard className="mt-6 p-6">
        <div className="flex items-start gap-3">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-white/40" aria-hidden />
          <div className="w-full max-w-md">
            <PortalSectionHeading
              title="Change password"
              description={portalCopy.security.passwordHints}
            />
            <div className="mt-4 space-y-3">
              <div>
                <PortalLabel>New password</PortalLabel>
                <PortalInput
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
                {newPassword && (
                  <PasswordStrengthMeter
                    strength={passwordAssessment.strength}
                    hints={passwordAssessment.hints}
                  />
                )}
              </div>
              <div>
                <PortalLabel>Confirm password</PortalLabel>
                <PortalInput
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <Button
                variant="outline"
                className={portalButtonOutline}
                disabled={passwordSaving || !newPassword}
                onClick={handlePasswordChange}
              >
                {passwordSaving ? "Updating…" : "Update password"}
              </Button>
            </div>
          </div>
        </div>
      </PortalCard>

      <PortalCard className="mt-6 p-6">
        <div className="flex items-start gap-3">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-white/40" aria-hidden />
          <div>
            <PortalSectionHeading title="Security" description={portalCopy.security.twoFactorNote} />
            <p className="mt-2 text-xs text-white/35">{portalCopy.security.neverShare}</p>
            {isAdmin && (
              <p className="mt-3 text-xs text-white/40">{portalCopy.settings.securityAdmin}</p>
            )}
            {!isAdmin && (
              <p className="mt-3 text-xs text-white/40">{portalCopy.settings.securityMember}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" className={portalButtonOutline} asChild>
                <Link to="/forgot-password">Reset via email</Link>
              </Button>
              <Button variant="outline" className={portalButtonOutline} onClick={replayPortalTour}>
                Replay portal tour
              </Button>
            </div>
          </div>
        </div>
      </PortalCard>

      <PortalCard className="mt-6 p-6">
        <PortalSectionHeading
          title="Your account data"
          description="Download a JSON record of your profile, saved content, applications, registrations, submissions, connections, notifications, lesson progress, and digest history."
        />
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            variant="outline"
            className={portalButtonOutline}
            disabled={!user || exporting}
            onClick={handleExport}
          >
            <Download className="mr-2 h-4 w-4" aria-hidden />
            {exporting ? "Preparing export…" : "Download my data"}
          </Button>
        </div>
      </PortalCard>

      <PortalCard className="mt-6 border-red-400/20 p-6">
        <div className="flex items-start gap-3">
          <Trash2 className="mt-0.5 h-5 w-5 shrink-0 text-red-300" aria-hidden />
          <div className="min-w-0 flex-1">
            <PortalSectionHeading
              title="Delete account"
              description="Permanently remove your sign-in, profile, avatar, saved content, applications, progress, submissions, registrations, and other member records. This cannot be undone."
            />
            <AlertDialog
              open={deleteOpen}
              onOpenChange={(open) => {
                if (deleting) return;
                setDeleteOpen(open);
                if (!open) setDeleteConfirmation("");
              }}
            >
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="mt-4 border-red-400/30 text-red-200 hover:bg-red-500/10 hover:text-red-100">
                  Delete my account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-white/15 bg-slate-950 text-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your FinanceMeta account?</AlertDialogTitle>
                  <AlertDialogDescription className="text-white/60">
                    Download your data first if you need a record. To confirm permanent deletion, type <strong className="break-all text-white">{requiredDeleteConfirmation}</strong>.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div>
                  <PortalLabel htmlFor="delete-account-confirmation">Confirmation</PortalLabel>
                  <PortalInput
                    id="delete-account-confirmation"
                    value={deleteConfirmation}
                    onChange={(event) => setDeleteConfirmation(event.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                  <Button
                    className={portalButtonDanger}
                    disabled={deleting || deleteConfirmation !== requiredDeleteConfirmation}
                    onClick={handleDeleteAccount}
                  >
                    {deleting ? "Deleting account…" : "Permanently delete account"}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </PortalCard>
    </div>
  );
}
