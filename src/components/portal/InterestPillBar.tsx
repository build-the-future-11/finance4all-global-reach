import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { portalRoutes } from "@/routes/portal";
import { portalCopy } from "@/lib/portalCopy";
import { sharedInterests } from "@/lib/personalization";

interface InterestPillBarProps {
  /** When viewing another member's profile, pass their interests for comparison. */
  profileInterests?: string[];
}

export default function InterestPillBar({ profileInterests }: InterestPillBarProps) {
  const { profile } = useAuth();
  const viewerInterests = profile?.interests ?? [];

  if (profileInterests) {
    const mutual = sharedInterests(viewerInterests, profileInterests);
    if (!profileInterests.length) return null;

    return (
      <div className="space-y-3">
        {mutual.length > 0 && (
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wider text-emerald-400/90">
              {portalCopy.memberProfile.sharedInterestsTitle}
            </p>
            <p className="mt-1 text-xs text-white/45">{portalCopy.memberProfile.sharedInterestsHint}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {mutual.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-xs text-emerald-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-white/40">
            Their focus
          </span>
          {profileInterests.map((tag) => (
            <span
              key={tag}
              className={`rounded-full px-3 py-1 text-xs ${
                mutual.includes(tag)
                  ? "border border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                  : "bg-white/5 text-white/55"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
        {viewerInterests.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-white/40">
              Your focus
            </span>
            {viewerInterests.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!viewerInterests.length) {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-3 text-sm text-white/45">
        <Sparkles className="h-4 w-4 text-emerald-400/60" />
        <span>
          Personalize your feed —{" "}
          <Link to={portalRoutes.settings} className="text-emerald-400 hover:underline">
            add your interests
          </Link>
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium uppercase tracking-wider text-white/40">Your focus</span>
      {viewerInterests.map((tag) => (
        <span
          key={tag}
          className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
