import { Mail, Send } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function ContactSection() {
  const ref = useScrollReveal();

  return (
    <section id="contact" className="px-4 py-24 sm:py-32">
      <div ref={ref} className="section-fade mx-auto max-w-3xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">Get in Touch</p>
        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to <span className="gradient-text">Connect</span>?
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-muted-foreground">
          Submit your project repositories, articles, or questions. We'd love to hear from you.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <a
            href="mailto:finance4alledu@gmail.com"
            className="glass-card-liquid group flex flex-col items-center gap-3 p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="rounded-xl bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary/15">
              <Send className="h-6 w-6" />
            </div>
            <p className="font-semibold">Submit Work & Inquiries</p>
            <p className="text-sm text-muted-foreground">finance4alledu@gmail.com</p>
          </a>

          <a
            href="mailto:ryangomez.hs@gmail.com"
            className="glass-card-liquid group flex flex-col items-center gap-3 p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="rounded-xl bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary/15">
              <Mail className="h-6 w-6" />
            </div>
            <p className="font-semibold">Reach One of Us</p>
            <p className="text-sm text-muted-foreground">ryangomez.hs@gmail.com</p>
          </a>
        </div>
      </div>
    </section>
  );
}
