import { Mail, Send } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function ContactSection() {
  const ref = useScrollReveal();

  return (
    <section id="contact" className="relative px-4 py-24 sm:py-32">
      <div ref={ref} className="section-fade mx-auto max-w-3xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-emerald-400">
          Get in touch
        </p>
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ready to{" "}
          <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
            connect
          </span>
          ?
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-white/55">
          Submit your project repositories, articles, or questions. We would love to hear from you.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <a
            href="mailto:finance4alledu@gmail.com"
            className="group flex flex-col items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-white/[0.07]"
          >
            <div className="rounded-xl border border-white/10 bg-emerald-500/15 p-3 text-emerald-300">
              <Send className="h-6 w-6" />
            </div>
            <p className="font-semibold text-white">Submit work & inquiries</p>
            <p className="text-sm text-white/45">finance4alledu@gmail.com</p>
          </a>

          <a
            href="mailto:ryangomez.hs@gmail.com"
            className="group flex flex-col items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-white/[0.07]"
          >
            <div className="rounded-xl border border-white/10 bg-emerald-500/15 p-3 text-emerald-300">
              <Mail className="h-6 w-6" />
            </div>
            <p className="font-semibold text-white">Reach the founder</p>
            <p className="text-sm text-white/45">ryangomez.hs@gmail.com</p>
          </a>
        </div>
      </div>
    </section>
  );
}
