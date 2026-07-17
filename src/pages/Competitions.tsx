import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import LandingBackground from "@/components/landing/LandingBackground";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { signupWithNext } from "@/lib/memberEntry";
import { portalRoutes } from "@/routes/portal";

const CATALOG = [
  {
    title: "Economics & case competitions",
    body: "Team valuation challenges and olympiad-style prep resources. After signup, open listings appear under Events & Chapters when administrators publish them.",
    status: "Portal-managed",
  },
  {
    title: "Chapter workshops",
    body: "Markets 101 and facilitator-led literacy workshops are published as chapter events with RSVP windows.",
    status: "Events after signup",
  },
  {
    title: "Fellowships & programs",
    body: "Multi-week programs are listed on the Opportunities board (often tagged fellowship). Save interest from your dashboard.",
    status: "Pathways after signup",
  },
];

export default function Competitions() {
  useDocumentTitle("Competitions and fellowships");

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#071412] text-white">
      <LandingBackground />
      <Navbar />
      <main id="main" className="mx-auto max-w-6xl px-4 pb-24 pt-28">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/80">
          Competitions
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Competitions, workshops, and fellowships
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/55">
          Live registration calendars require a member account. This page explains what exists in the
          product — it does not invent open seats or past winners. Administrators publish real
          competitions in the portal; members RSVP or follow external registration links when
          provided.
        </p>

        <div className="mt-12 space-y-4">
          {CATALOG.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                <span className="rounded-full border border-white/15 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-white/45">
                  {item.status}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{item.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            to={signupWithNext(portalRoutes.events)}
            className="inline-flex rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-black hover:bg-emerald-400"
          >
            Create account to view live listings
          </Link>
          <Link
            to="/discover"
            className="inline-flex rounded-full border border-white/15 px-6 py-3 text-sm text-white/80 hover:bg-white/5"
          >
            Back to Discover
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
