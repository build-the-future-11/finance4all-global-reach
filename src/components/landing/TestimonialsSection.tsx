import { Quote } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const TESTIMONIALS = [
  {
    quote:
      "Finance4All Meta gave me a path from school outreach in India to publishing macro research with students from Stanford and MIT.",
    name: "Member, Mumbai chapter",
    role: "Atlas Economics Lab",
  },
  {
    quote:
      "The explainers and education hub made finance feel approachable for the first time — I had never taken an econ class before joining.",
    name: "High school member",
    role: "Catalyst CFEI",
  },
  {
    quote:
      "Meta Labs connected me with a lead researcher and a real project — not just another internship listing.",
    name: "Undergraduate researcher",
    role: "Finance Meta Labs",
  },
];

export default function TestimonialsSection() {
  const ref = useScrollReveal();

  return (
    <section className="relative px-4 py-24 sm:py-32">
      <div ref={ref} className="mx-auto max-w-6xl">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400/90">
          Community voices
        </p>
        <h2 className="mt-3 text-center text-3xl font-bold text-white sm:text-4xl">
          Trusted by students worldwide
        </h2>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <blockquote
              key={t.name}
              className="relative rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl"
            >
              <Quote className="h-8 w-8 text-emerald-400/30" />
              <p className="mt-4 text-sm leading-relaxed text-white/70">&ldquo;{t.quote}&rdquo;</p>
              <footer className="mt-6 border-t border-white/10 pt-4">
                <p className="font-medium text-white">{t.name}</p>
                <p className="text-xs text-emerald-300/80">{t.role}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
