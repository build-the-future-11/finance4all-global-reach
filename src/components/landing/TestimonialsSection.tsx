import { Quote } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import SectionHeader from "@/components/landing/SectionHeader";
import GlassSurface from "@/components/landing/GlassSurface";
import { portalCopy } from "@/lib/portalCopy";

const TESTIMONIALS = [
  {
    quote:
      "Our chapter ran the Catalyst budgeting module in three Mumbai schools last semester. Two students from that cohort applied to Atlas Lab six months later — one on FX pass-through, one on rural credit access. The portal kept the curriculum and the lab listings in one place.",
    name: "Chapter officer",
    role: "Mumbai · outreach & Meta Labs",
  },
  {
    quote:
      "I had never taken economics. The budgeting lesson took twenty minutes; the exercise asked me to track a week of spending. By the time I attended my first Markets 101 night, I could follow the Debriefed article the officer picked — I knew what CPI meant.",
    name: "First-year member",
    role: "Catalyst · no prior finance background",
  },
  {
    quote:
      "The lab listing said exactly what the deliverable was and who would review applications. I wrote three paragraphs on a macro methods course and a Python project. The lead replied in five days with a data collection task — not a generic 'we'll be in touch.'",
    name: "Lab applicant",
    role: "Meta Labs · macro track",
  },
];

export default function TestimonialsSection() {
  const ref = useScrollReveal();

  return (
    <section className="relative px-4 py-24 sm:py-32">
      <div ref={ref} className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow={portalCopy.landing.testimonialsEyebrow}
          title={portalCopy.landing.testimonialsTitle}
          description="Paraphrased from chapter officers and members — roles described, names withheld for privacy."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <GlassSurface key={t.role} className="flex flex-col p-6" strong>
              <Quote className="h-8 w-8 text-emerald-400/30" />
              <p className="mt-4 flex-1 text-sm leading-relaxed text-white/70">&ldquo;{t.quote}&rdquo;</p>
              <footer className="mt-6 border-t border-white/10 pt-4">
                <p className="font-medium text-white">{t.name}</p>
                <p className="text-xs text-emerald-300/80">{t.role}</p>
              </footer>
            </GlassSurface>
          ))}
        </div>
      </div>
    </section>
  );
}
