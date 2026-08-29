import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useContactSubmission } from "@/hooks/useContactSubmission";
import { portalCopy } from "@/lib/portalCopy";
import { PUBLIC_CONTACT_EMAIL, PUBLIC_CONTACT_MAILTO } from "@/lib/publicContact";
import {
  PortalAlert,
  PortalInput,
  PortalLabel,
  PortalTextarea,
  landingEyebrowClass,
  portalButtonOutline,
  portalButtonPrimary,
} from "@/components/portal/PortalUI";
import { Button } from "@/components/ui/button";

export default function ContactSection() {
  const ref = useScrollReveal();
  const submit = useContactSubmission();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", website: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submit.mutateAsync(form);
      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "", website: "" });
      toast.success(portalCopy.landing.contactSuccess);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : portalCopy.landing.contactError);
    }
  };

  return (
    <section id="contact" className="relative px-4 py-24 sm:py-32">
      <div ref={ref} className="mx-auto max-w-3xl text-center">
        <p className={cn(landingEyebrowClass, "mb-3")}>Contact</p>
        <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Questions about FinanceMeta
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-pretty text-white/55">Use the form for an account, chapter, content, or general inquiry. Do not include passwords or sensitive financial information.</p>

        {sent ? (
          <div className="mx-auto max-w-md rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-8">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" aria-hidden />
            <p className="mt-4 font-semibold text-white">Message received</p>
            <p className="mt-2 text-sm text-white/50">Your message is now available to portal administrators.</p>
            <Button variant="outline" className={cn("mt-6", portalButtonOutline)} onClick={() => setSent(false)}>
              Send another message
            </Button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto max-w-lg space-y-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-left backdrop-blur-xl sm:p-8"
          >
            <input
              type="text"
              name="website"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
            />
            <div>
              <PortalLabel htmlFor="contact-name">Name</PortalLabel>
              <PortalInput
                id="contact-name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
              />
            </div>
            <div>
              <PortalLabel htmlFor="contact-email">Email</PortalLabel>
              <PortalInput
                id="contact-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@school.edu"
              />
            </div>
            <div>
              <PortalLabel htmlFor="contact-subject">Subject</PortalLabel>
              <PortalInput
                id="contact-subject"
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Account, chapter, or general inquiry"
              />
            </div>
            <div>
              <PortalLabel htmlFor="contact-message">Message</PortalLabel>
              <PortalTextarea
                id="contact-message"
                required
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="How can we help?"
              />
            </div>
            <Button type="submit" disabled={submit.isPending} className={cn("w-full", portalButtonPrimary)}>
              <Send className="mr-2 h-4 w-4" aria-hidden />
              {submit.isPending ? "Sending…" : portalCopy.landing.contactSend}
            </Button>
          </form>
        )}

        <div className="mt-10">
          <a
            href={PUBLIC_CONTACT_MAILTO}
            className="portal-focus-ring group mx-auto flex max-w-sm flex-col items-center gap-3 rounded-md border border-white/10 bg-white/[0.04] p-6 transition hover:border-emerald-400/30 hover:bg-white/[0.07]"
          >
            <div className="rounded-xl border border-white/10 bg-emerald-500/15 p-3 text-emerald-300">
              <Send className="h-5 w-5" aria-hidden />
            </div>
            <p className="font-semibold text-white">General inquiries</p>
            <p className="text-sm text-white/45">{PUBLIC_CONTACT_EMAIL}</p>
          </a>
        </div>
      </div>
    </section>
  );
}
