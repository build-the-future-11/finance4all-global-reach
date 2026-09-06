import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useChapters } from "@/hooks/portal/useEvents";
import { useUpdateMyProfile } from "@/hooks/portal/useNetwork";
import {
  useCancelAccountDeletion,
  useExportMyData,
  useMyAccountDeletionRequest,
  useRequestAccountDeletion,
} from "@/hooks/portal/useAccountLifecycle";
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
import { AlertTriangle, Download } from "lucide-react";

const SUGGESTED_INTERESTS = ["macro", "equities", "fintech", "credit", "startups", "research"];

export default function Settings() {
  const { profile, user, signOut } = useAuth();
  const { data: chapters } = useChapters();
  const updateProfile = useUpdateMyProfile();
  const { data: deletionRequest } = useMyAccountDeletionRequest(user?.id);
  const requestDeletion = useRequestAccountDeletion();
  const cancelDeletion = useCancelAccountDeletion();
  const exportMyData = useExportMyData();

  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [interests, setInterests] = useState<string[]>(profile?.interests ?? []);
  const [openToCollaborate, setOpenToCollaborate] = useState(profile?.openToCollaborate ?? false);
  const [chapterId, setChapterId] = useState(profile?.chapterId ?? "");
  const [deletionReason, setDeletionReason] = useState("");

  const toggleInterest = (tag: string) => {
    setInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSave = async () => {
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

  const handleExport = async () => {
    try {
      const data = await exportMyData.mutateAsync();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `financemeta-account-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Account data exported");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to export account data");
    }
  };

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
          <div className="space-y-5">
            <div>
              <Label className="text-white/70">Display name</Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={portalInputClass}
              />
            </div>
            <div>
              <Label className="text-white/70">Bio</Label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
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

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <PortalCard className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold text-white">Export account data</h2>
              <p className="mt-1 text-sm text-white/50">
                Download a JSON copy of profile, submissions, registrations, connections, and preferences tied to your account.
              </p>
            </div>
            <Download className="h-5 w-5 shrink-0 text-emerald-300" />
          </div>
          <Button
            variant="outline"
            className={`${portalButtonOutline} mt-5`}
            disabled={exportMyData.isPending}
            onClick={handleExport}
          >
            {exportMyData.isPending ? "Preparing…" : "Download my data"}
          </Button>
        </PortalCard>

        <PortalCard className="border-red-400/20 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-white">Delete account</h2>
              <p className="mt-1 text-sm text-white/50">
                Submit a reviewed deletion request. Export your data first; approved deletion permanently removes your sign-in and member data.
              </p>

              {deletionRequest && deletionRequest.status !== "cancelled" && deletionRequest.status !== "rejected" ? (
                <div className="mt-4 rounded-lg border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm text-amber-100/80">
                  Request status: <span className="font-semibold capitalize">{deletionRequest.status.replace("_", " ")}</span>
                  {deletionRequest.status === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className={`${portalButtonOutline} mt-3 block`}
                      disabled={cancelDeletion.isPending}
                      onClick={async () => {
                        try {
                          await cancelDeletion.mutateAsync();
                          toast.success("Deletion request cancelled");
                        } catch (e) {
                          toast.error(e instanceof Error ? e.message : "Failed to cancel request");
                        }
                      }}
                    >
                      {cancelDeletion.isPending ? "Cancelling…" : "Cancel request"}
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <Textarea
                    value={deletionReason}
                    onChange={(event) => setDeletionReason(event.target.value.slice(0, 1000))}
                    rows={3}
                    maxLength={1000}
                    placeholder="Reason (optional)"
                    className={`${portalInputClass} mt-4`}
                  />
                  <Button
                    variant="destructive"
                    className="mt-3"
                    disabled={requestDeletion.isPending}
                    onClick={async () => {
                      if (!window.confirm("Submit an account deletion request? This does not delete your account immediately.")) return;
                      try {
                        await requestDeletion.mutateAsync(deletionReason);
                        setDeletionReason("");
                        toast.success("Deletion request submitted");
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : "Failed to submit request");
                      }
                    }}
                  >
                    {requestDeletion.isPending ? "Submitting…" : "Request account deletion"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </PortalCard>
      </div>
    </div>
  );
}
