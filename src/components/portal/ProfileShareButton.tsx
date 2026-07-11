import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { portalRoutes } from "@/routes/portal";
import { isUuid } from "@/lib/security";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ProfileShareButtonProps {
  profileId: string;
}

export default function ProfileShareButton({ profileId }: ProfileShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!isUuid(profileId)) {
      toast.error("Invalid profile");
      return;
    }
    const url = `${window.location.origin}${portalRoutes.networkProfile}/${profileId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Profile link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  };

  return (
    <Button
      variant="outline"
      className="border-white/20 text-white"
      onClick={handleCopy}
      type="button"
    >
      {copied ? <Check className="mr-2 h-4 w-4" /> : <Link2 className="mr-2 h-4 w-4" />}
      {copied ? "Copied!" : "Copy profile link"}
    </Button>
  );
}
