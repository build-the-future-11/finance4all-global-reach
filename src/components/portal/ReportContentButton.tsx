import { Flag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PortalDialogContent,
  portalButtonOutline,
  portalButtonPrimary,
  portalInputClass,
} from "@/components/portal/PortalUI";
import {
  useSubmitContentReport,
  type ContentReportTarget,
} from "@/hooks/portal/useSafety";

const REASONS = [
  "Harassment or bullying",
  "Spam or scam",
  "Inappropriate for youth audiences",
  "Misinformation",
  "Other",
] as const;

interface ReportContentButtonProps {
  targetType: ContentReportTarget;
  targetId?: string;
  label?: string;
}

export default function ReportContentButton({
  targetType,
  targetId,
  label = "Report",
}: ReportContentButtonProps) {
  const submit = useSubmitContentReport();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>(REASONS[0]);
  const [details, setDetails] = useState("");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="ghost" className="text-white/45 hover:text-white">
          <Flag className="mr-1 h-3.5 w-3.5" />
          {label}
        </Button>
      </DialogTrigger>
      <PortalDialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report content</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-white/55">
          Reports are reviewed by administrators. Use this for safety, spam, or youth-protection
          concerns — not for disagreement with editorial views.
        </p>
        <div className="space-y-3 pt-2">
          <div>
            <Label className="text-white/70">Reason</Label>
            <select
              className={`${portalInputClass} w-full`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-white/70">Details (optional)</Label>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              className={portalInputClass}
              placeholder="What should reviewers know?"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              className={portalButtonOutline}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className={portalButtonPrimary}
              disabled={submit.isPending || reason.trim().length < 3}
              onClick={async () => {
                try {
                  await submit.mutateAsync({
                    targetType,
                    targetId,
                    reason,
                    details: details.trim() || undefined,
                  });
                  toast.success("Report submitted. Thank you.");
                  setOpen(false);
                  setDetails("");
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Could not submit report");
                }
              }}
            >
              Submit report
            </Button>
          </div>
        </div>
      </PortalDialogContent>
    </Dialog>
  );
}
