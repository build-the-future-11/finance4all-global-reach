import { useCallback, useEffect, useState } from "react";
import { Command, Keyboard } from "lucide-react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PortalDialogContent } from "@/components/portal/PortalUI";
import { portalCopy } from "@/lib/portalCopy";

function isTypingTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-white/15 bg-white/[0.06] px-2 py-0.5 font-mono text-xs text-white/70">
      {children}
    </kbd>
  );
}

export default function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (isTypingTarget(e.target)) return;

    if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
      e.preventDefault();
      setOpen((v) => !v);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <PortalDialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Keyboard className="h-5 w-5 text-emerald-400" />
            {portalCopy.shortcuts.title}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-white/50">{portalCopy.shortcuts.description}</p>
        <ul className="mt-4 space-y-3 text-sm">
          <li className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-white/75">
              <Command className="h-3.5 w-3.5 text-white/40" />
              {portalCopy.shortcuts.search}
            </span>
            <Kbd>⌘K</Kbd>
          </li>
          <li className="flex items-center justify-between gap-4">
            <span className="text-white/75">{portalCopy.shortcuts.help}</span>
            <div className="flex gap-1">
              <Kbd>?</Kbd>
              <span className="text-white/30">or</span>
              <Kbd>⇧ /</Kbd>
            </div>
          </li>
          <li className="flex items-center justify-between gap-4">
            <span className="text-white/75">{portalCopy.shortcuts.escape}</span>
            <Kbd>Esc</Kbd>
          </li>
        </ul>
        <p className="mt-4 border-t border-white/10 pt-4 text-xs text-white/40">
          {portalCopy.shortcuts.nav}
        </p>
      </PortalDialogContent>
    </Dialog>
  );
}
