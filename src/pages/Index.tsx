import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import LandingBackground from "@/components/landing/LandingBackground";
import SocialProofMarquee from "@/components/landing/SocialProofMarquee";
import EcosystemBento from "@/components/landing/EcosystemBento";
import OriginStorySection from "@/components/landing/OriginStorySection";
import ImpactOutcomesSection from "@/components/landing/ImpactOutcomesSection";
import InclusiveImpactSection from "@/components/landing/InclusiveImpactSection";
import ResourcesPreviewSection from "@/components/landing/ResourcesPreviewSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import LandingCTA from "@/components/landing/LandingCTA";
import AboutSection from "@/components/AboutSection";
import ProgramsSection from "@/components/ProgramsSection";
import ProjectsSection from "@/components/ProjectsSection";
import MembershipSection from "@/components/MembershipSection";
import FounderSection from "@/components/FounderSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useEffect } from "react";

const Index = () => {
  useDocumentTitle();

  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

  return (
    <div className="dark relative min-h-screen overflow-x-hidden text-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-emerald-500 focus:px-4 focus:py-2 focus:text-black"
      >
        Skip to content
      </a>
      <LandingBackground />
      <Navbar />
      <main id="main">
        <HeroSection />
        <SocialProofMarquee />
        <AboutSection />
        <OriginStorySection />
        <EcosystemBento />
        <ResourcesPreviewSection />
        <ImpactOutcomesSection />
        <TestimonialsSection />
        <ProgramsSection />
        <ProjectsSection />
        <InclusiveImpactSection />
        <MembershipSection />
        <LandingCTA />
        <FounderSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
