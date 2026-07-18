import { sanitizeUserFacingError } from "@/lib/authErrors";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { trackEvent } from "@/lib/analytics";
import { PUBLIC_CONTACT_EMAIL } from "@/lib/publicContact";
import {
  isValidEmail,
  sanitizeDisplayName,
  sanitizeTextInput,
  checkContactRateLimit,
  recordContactSubmission,
} from "@/lib/security";

export interface ContactFormInput {
  name: string;
  email: string;
  subject: string;
  message: string;
  website?: string;
}

export function useContactSubmission() {
  return useMutation({
    mutationFn: async (input: ContactFormInput) => {
      if (input.website?.trim()) {
        return { ok: true as const };
      }

      const name = sanitizeDisplayName(input.name);
      const email = input.email.trim().toLowerCase();
      const subject = sanitizeTextInput(input.subject, 200);
      const message = sanitizeTextInput(input.message, 5000);

      if (!name) throw new Error("Enter your name.");
      if (!isValidEmail(email)) throw new Error("Enter a valid email address.");
      if (!subject) throw new Error("Enter a subject.");
      if (message.length < 10) throw new Error("Message must be at least 10 characters.");

      const limit = checkContactRateLimit(email);
      if (!limit.allowed) {
        const minutes = Math.ceil((limit.retryAfterSec ?? 300) / 60);
        throw new Error(`Too many submissions. Try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.`);
      }

      const { error } = await supabase.rpc("submit_contact_submission", {
        p_name: name,
        p_email: email,
        p_subject: subject,
        p_message: message,
      });

      if (error) {
        if (
          error.code === "42P01" ||
          error.code === "42883" ||
          error.message?.includes("does not exist")
        ) {
          throw new Error(
            `Could not send your message right now. Please try again or email ${PUBLIC_CONTACT_EMAIL}.`,
          );
        }
        throw new Error(sanitizeUserFacingError(error.message ?? "Submission failed."));
      }

      recordContactSubmission(email);
      trackEvent("contact.submit", { source: "landing" });
      return { ok: true as const };
    },
  });
}
