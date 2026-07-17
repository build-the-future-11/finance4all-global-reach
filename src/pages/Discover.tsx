import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import LandingBackground from "@/components/landing/LandingBackground";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { signupWithNext } from "@/lib/memberEntry";
import { portalRoutes } from "@/routes/portal";

const TRACKS = [
  {
    title: "Programs & learning",
    body: "Catalyst lessons, chapter workshops, and facilitator guides. Progress saves to your member account.",
    next: portalRoutes.education,
    cta: "Start learning after signup",
  },
  {
    title: "Research (Meta Labs)",
    body: "Bounded projects with scope, lead, and deadline. Apply with a short motivation statement; leads review submissions.",
    next: portalRoutes.labs,
    cta: "Browse research after signup",
  },
  {
    title: "Opportunities & fellowships",
    body: "Internships, programs, challenges, and project roles. Save listings and track interest from your dashboard.",
    next: portalRoutes.pathwaysOpportunities,
    cta: "Open opportunity board after signup",
  },
    {
      title: "Competitions",
      body: "Open competitions appear under Events & Chapters with status and external registration links when provided. See the public overview first.",
      next: portalRoutes.events,
      cta: "View competitions after signup",
      publicHref: "/competitions",
      publicCta: "Read competitions overview",
    },
  {
    title: "Chapters & workshops",
    body: "Find chapters on the map, RSVP to events, and export calendar invites. Workshops are published as chapter events.",
    next: portalRoutes.events,
    cta: "Explore chapters after signup",
  },
  {
    title: "Finance Debrief",
    body: "Educational macro summaries with source attribution — not investment advice. Editors control what publishes.",
    next: portalRoutes.debriefed,
    cta: "Read Debrief after signup",
  },
];

export default function Discover() {
  useDocumentTitle("Discover programs and opportunities");

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#071412] text-white">
      <LandingBackground />
      <Navbar />
      <main id="main" className="mx-auto max-w-6xl px-4 pb-24 pt-28">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/80">Discover</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Find a program, then join the portal to apply, register, or save it
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/55">
          Finance4All (FinanceMeta member platform) is for students who want structured finance
          learning, research projects, opportunities, chapters, and competitions. Listings below
          open in the authenticated portal after you create an account — there are no fabricated
          placement rates or member counts on this page.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {TRACKS.map((track) => (
            <article
              key={track.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <h2 className="text-lg font-semibold text-white">{track.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{track.body}</p>
              <Link
                to={signupWithNext(track.next)}
                className="mt-5 inline-flex text-sm font-medium text-emerald-300 hover:text-emerald-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300"
              >
                {track.cta} →
              </Link>
              {"publicHref" in track && track.publicHref ? (
                <Link
                  to={track.publicHref}
                  className="mt-2 block text-sm text-white/50 hover:text-white/70"
                >
                  {track.publicCta} →
                </Link>
              ) : null}
            </article>
          ))}
        </div>

        <p className="mt-10 text-sm text-white/45">
          Already a member?{" "}
          <Link to="/login" className="text-emerald-300 hover:underline">
            Sign in
          </Link>{" "}
          to continue from your dashboard.
        </p>
      </main>
      <Footer />
    </div>
  );
}
