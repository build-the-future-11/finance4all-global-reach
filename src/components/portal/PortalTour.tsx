import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { portalRoutes } from "@/routes/portal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const PORTAL_TOUR_STORAGE_KEY = "f4a-portal-tour-v1";

export function replayPortalTour() {
  localStorage.removeItem(PORTAL_TOUR_STORAGE_KEY);
  window.location.reload();
}

const STEPS = [
  {
    title: "Welcome to your portal",
    body: "This is your home base — news, labs, pathways, events, and your global network.",
  },
  {
    title: "Search everything",
    body: "Press ⌘K (or Ctrl+K) to search news, labs, opportunities, events, and members.",
  },
  {
    title: "Build your profile",
    body: "Complete Settings to unlock badges, chapter visibility, and collaboration matching.",
    cta: { label: "Go to Settings", path: portalRoutes.settings },
  },
  {
    title: "You're all set",
    body: "Explore Debriefed for market news, Meta Labs for research, and Network to connect.",
    cta: { label: "Explore Debriefed", path: portalRoutes.debriefed },
  },
];

export default function PortalTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (localStorage.getItem(PORTAL_TOUR_STORAGE_KEY) !== "1") {
      setOpen(true);
    }
  }, []);

  const finish = () => {
    localStorage.setItem(PORTAL_TOUR_STORAGE_KEY, "1");
    setOpen(false);
  };

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && finish()}>
      <DialogContent className="border-white/15 bg-[#0c1220] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{current.title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm leading-relaxed text-white/60">{current.body}</p>
        <div className="flex gap-1 pt-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${i <= step ? "bg-emerald-400" : "bg-white/10"}`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          {step > 0 && (
            <Button variant="outline" className="border-white/20 text-white" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {current.cta && (
            <Link to={current.cta.path} onClick={finish}>
              <Button variant="outline" className="border-white/20 text-white">
                {current.cta.label}
              </Button>
            </Link>
          )}
          <Button
            className="ml-auto bg-emerald-500 hover:bg-emerald-400"
            onClick={() => (isLast ? finish() : setStep(step + 1))}
          >
            {isLast ? "Get started" : "Next"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
