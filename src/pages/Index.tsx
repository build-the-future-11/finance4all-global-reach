import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import LandingBackground from "@/components/landing/LandingBackground";
import SocialProofMarquee from "@/components/landing/SocialProofMarquee";
import EcosystemBento from "@/components/landing/EcosystemBento";
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
      <LandingBackground />
      <Navbar />
      <HeroSection />
      <SocialProofMarquee />
      <AboutSection />
      <EcosystemBento />
      <ProgramsSection />
      <ProjectsSection />
      <MembershipSection />
      <FounderSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
