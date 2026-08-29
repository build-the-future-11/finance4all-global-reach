import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";
import AboutSection from "@/components/AboutSection";
import MembershipSection from "@/components/MembershipSection";
import ProgramsSection from "@/components/ProgramsSection";
import EcosystemBento from "@/components/landing/EcosystemBento";
import ImpactOutcomesSection from "@/components/landing/ImpactOutcomesSection";
import LandingBackground from "@/components/landing/LandingBackground";
import LandingCTA from "@/components/landing/LandingCTA";
import OriginStorySection from "@/components/landing/OriginStorySection";
import ResourcesPreviewSection from "@/components/landing/ResourcesPreviewSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "FinanceMeta",
  description:
    "Student financial education, research, opportunities, chapters, and member portal.",
  url: "https://finance4all-global-reach.vercel.app",
  sameAs: [],
};

export default function Index() {
  useDocumentTitle("Financial education, research and opportunities");

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#071412] text-white">
      <LandingBackground />
      <a
        href="#main"
        className="sr-only fixed left-4 top-4 z-[100] rounded-md bg-emerald-300 px-4 py-2 text-slate-950 focus:not-sr-only"
      >
        Skip to content
      </a>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navbar />
      <main id="main">
        <HeroSection />
        <AboutSection />
        <OriginStorySection />
        <EcosystemBento />
        <ProgramsSection />
        <MembershipSection />
        <ImpactOutcomesSection />
        <ResourcesPreviewSection />
        <TestimonialsSection />
        <LandingCTA />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
