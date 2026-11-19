import React from "react";
import { createRoot } from "react-dom/client";
import CollaborationInvitationForm from "@/components/portal/CollaborationInvitationForm";

type Mode = "success" | "failure" | "deferred-failure";
type Harness = {
  attempts: string[];
  mode: Mode;
  releaseFailure: () => void;
};

declare global {
  interface Window { invitationHarness: Harness }
}

const harness: Harness = { attempts: [], mode: "success", releaseFailure: () => undefined };
window.invitationHarness = harness;

async function invite(memberId: string) {
  harness.attempts.push(memberId);
  if (harness.mode === "failure") throw new Error("Invitation service unavailable.");
  if (harness.mode === "deferred-failure") {
    await new Promise<never>((_, reject) => {
      harness.releaseFailure = () => reject(new Error("Invitation service unavailable."));
    });
  }
}

createRoot(document.getElementById("root")!).render(<CollaborationInvitationForm onInvite={invite} pending={false} />);
