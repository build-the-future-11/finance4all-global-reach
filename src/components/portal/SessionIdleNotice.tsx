import { useEffect, useRef, useState } from "react";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { portalCopy } from "@/lib/portalCopy";
import { Button } from "@/components/ui/button";
import { portalButtonOutline } from "@/components/portal/PortalUI";

const IDLE_MS = 25 * 60 * 1000;
const GRACE_MS = 5 * 60 * 1000;

export default function SessionIdleNotice() {
  const { signOut } = useAuth();
  const [show, setShow] = useState(false);
  const resetRef = useRef<() => void>(() => {});

  useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout>;
    let graceTimer: ReturnType<typeof setTimeout>;

    const clearTimers = () => {
      clearTimeout(idleTimer);
      clearTimeout(graceTimer);
    };

    const reset = () => {
      setShow(false);
      clearTimers();
      idleTimer = setTimeout(() => {
        setShow(true);
        graceTimer = setTimeout(() => {
          void signOut();
        }, GRACE_MS);
      }, IDLE_MS);
    };

    resetRef.current = reset;
    const events = ["mousedown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();

    return () => {
      clearTimers();
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [signOut]);

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md animate-in slide-in-from-bottom-4 duration-300 lg:bottom-6 lg:left-auto lg:right-6">
      <div className="portal-glass flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 shadow-xl">
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-amber-100">Still there?</p>
          <p className="mt-0.5 text-xs text-amber-100/70">{portalCopy.security.sessionWarning}</p>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className={cn("h-7 text-xs", portalButtonOutline)}
              onClick={() => {
                setShow(false);
                resetRef.current();
              }}
            >
              Continue session
            </Button>
            <Button
              size="sm"
              className="h-7 bg-amber-600 text-xs hover:bg-amber-500"
              onClick={() => signOut()}
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
