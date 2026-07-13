import { BookOpen, CalendarDays, FlaskConical, Newspaper, Route, Users } from "lucide-react";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const experiences = [
  { icon: Newspaper, title: "Finance Debrief", text: "Read editor-published articles and explainers, then save the items you want to revisit." },
  { icon: FlaskConical, title: "Research and opportunities", text: "Review open research roles, internships, projects, and challenges as they are published." },
  { icon: BookOpen, title: "Courses", text: "Start structured lessons, complete exercises, and keep course progress tied to your account." },
  { icon: CalendarDays, title: "Chapters and competitions", text: "See chapter activity and event registration details in one place when sessions are available." },
];

const membership = [
  { icon: BookOpen, title: "Learning", text: "Foundational finance and economics lessons, explainers, and a personal progress record." },
  { icon: Route, title: "Participation", text: "Published opportunities, research applications, course work, events, and chapter updates." },
  { icon: Users, title: "Your account", text: "A profile, saved content, notifications, and settings you can update and return to." },
];

export default function Index() {
  useDocumentTitle("Finance learning and member portal");

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#071412] text-white">
      <a href="#main" className="sr-only fixed left-4 top-4 z-[100] rounded-md bg-emerald-300 px-4 py-2 text-slate-950 focus:not-sr-only">Skip to content</a>
      <Navbar />
      <main id="main">
        <HeroSection />
        <section id="about" className="bg-[#f6f8f6] px-4 py-16 text-slate-900 sm:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-800">What Finance4All is</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">A practical home base for early finance learning.</h2>
            </div>
            <div className="max-w-2xl space-y-5 text-base leading-8 text-slate-700">
              <p>Finance4All brings reading, learning, applications, events, and member tools into one account. It is designed for students who are starting from different places and need clear next steps rather than gatekeeping.</p>
              <p>The portal does not replace formal financial advice, professional accreditation, or a promise of placement. It gives members a structured place to learn and participate in the opportunities administrators choose to publish.</p>
            </div>
          </div>
        </section>
        <section id="experience" className="border-y border-white/10 bg-[#0d211d] px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">Member experience</p>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight text-white sm:text-4xl">Four ways to make the portal useful in a normal week.</h2>
            <div className="mt-10 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2">
              {experiences.map(({ icon: Icon, title, text }) => (
                <article key={title} className="bg-[#0d211d] p-6 sm:p-8">
                  <Icon className="h-6 w-6 text-emerald-300" aria-hidden />
                  <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
                  <p className="mt-3 max-w-md leading-7 text-slate-300">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section id="membership" className="bg-[#f6f8f6] px-4 py-16 text-slate-900 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-800">Membership</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">One account, with your progress and saved work kept together.</h2>
            </div>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {membership.map(({ icon: Icon, title, text }) => (
                <article key={title}>
                  <Icon className="h-6 w-6 text-emerald-700" aria-hidden />
                  <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 leading-7 text-slate-700">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
