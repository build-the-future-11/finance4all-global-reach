import { sanitizeUserFacingError } from "@/lib/authErrors";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { checkServerRateLimit, recordServerRateLimit } from "@/lib/rateLimit";
import { trackEvent } from "@/lib/analytics";
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

      const serverAllowed = await checkServerRateLimit("contact_submit", email, 3, 3600);
      if (!serverAllowed) {
        throw new Error("Too many submissions. Try again in about an hour.");
      }

      const { error } = await supabase.from("contact_submissions").insert({
        name,
        email,
        subject,
        message,
      });

      if (error) {
        if (error.code === "42P01" || error.message?.includes("does not exist")) {
          throw new Error("Contact form is not available yet. Please email finance4alledu@gmail.com directly.");
        }
        throw new Error(sanitizeUserFacingError(error.message ?? "Submission failed."));
      }

      recordContactSubmission(email);
      await recordServerRateLimit("contact_submit", email);
      trackEvent("contact.submit", { source: "landing" });
      return { ok: true as const };
    },
  });
}
