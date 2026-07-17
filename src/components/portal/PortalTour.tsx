import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { portalRoutes } from "@/routes/portal";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  PortalDialogContent,
  portalButtonOutline,
  portalButtonPrimary,
} from "@/components/portal/PortalUI";
import { portalCopy } from "@/lib/portalCopy";
import { PORTAL_TOUR_STORAGE_KEY } from "@/lib/portalTour";

const { tour } = portalCopy;

const STEPS = [
  {
    title: tour.step1Title,
    body: tour.step1Body,
  },
  {
    title: tour.step2Title,
    body: tour.step2Body,
  },
  {
    title: tour.step3Title,
    body: tour.step3Body,
    cta: { label: tour.step3Cta, path: portalRoutes.settings },
  },
  {
    title: tour.step4Title,
    body: tour.step4Body,
    cta: { label: tour.step4Cta, path: portalRoutes.debriefed },
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
      <PortalDialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">{current.title}</DialogTitle>
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
            <Button variant="outline" className={portalButtonOutline} onClick={() => setStep(step - 1)}>
              {tour.back}
            </Button>
          )}
          {current.cta && (
            <Link to={current.cta.path} onClick={finish}>
              <Button variant="outline" className={portalButtonOutline}>
                {current.cta.label}
              </Button>
            </Link>
          )}
          <Button
            className={cn("ml-auto", portalButtonPrimary)}
            onClick={() => (isLast ? finish() : setStep(step + 1))}
          >
            {isLast ? tour.finish : tour.next}
          </Button>
        </div>
      </PortalDialogContent>
    </Dialog>
  );
}
