import { Quote } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import SectionHeader from "@/components/landing/SectionHeader";
import GlassSurface from "@/components/landing/GlassSurface";
import { portalCopy } from "@/lib/portalCopy";
import { useTestimonials } from "@/hooks/portal/useTestimonials";

export default function TestimonialsSection() {
  const ref = useScrollReveal();
  const { data: testimonials } = useTestimonials();
  const items = testimonials ?? [];

  if (items.length === 0) return null;

  return (
    <section className="relative px-4 py-24 sm:py-32">
      <div ref={ref} className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow={portalCopy.landing.testimonialsEyebrow}
          title={portalCopy.landing.testimonialsTitle}
          description="Quotes from chapter officers and members — roles described, names withheld for privacy."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {items.map((t) => (
            <GlassSurface key={t.id} className="flex flex-col p-6" strong>
              <Quote className="h-8 w-8 text-emerald-400/30" />
              <p className="mt-4 flex-1 text-sm leading-relaxed text-white/70">&ldquo;{t.quote}&rdquo;</p>
              <footer className="mt-6 border-t border-white/10 pt-4">
                <p className="font-medium text-white">{t.attribution}</p>
                <p className="text-xs text-emerald-300/80">{t.roleLabel}</p>
              </footer>
            </GlassSurface>
          ))}
        </div>
      </div>
    </section>
  );
}
