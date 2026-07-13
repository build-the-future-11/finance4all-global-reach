import { ArrowRight, Bookmark, BookOpen, CalendarDays, FlaskConical, Newspaper } from "lucide-react";
import { Link } from "react-router-dom";

const portalItems = [
  { icon: Newspaper, title: "Finance Debrief", detail: "Read short market and economics explainers." },
  { icon: FlaskConical, title: "Research opportunities", detail: "Review project scopes and apply when a role is open." },
  { icon: BookOpen, title: "Courses", detail: "Work through lessons and keep your progress." },
  { icon: CalendarDays, title: "Chapters and events", detail: "Find updates and register for upcoming sessions." },
];

export default function HeroSection() {
  return (
    <section className="border-b border-emerald-100/10 bg-[#071412] px-4 pb-14 pt-32 sm:pb-20 sm:pt-40">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">Finance4All</p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Learn finance by reading, practicing, and taking part.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            Finance4All is a member portal for students who want a clearer way into finance and economics. Use it to study foundational concepts, follow Finance Debrief, explore opportunities, and stay connected to chapter activity.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/signup"
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
            >
              Create a member account
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <a
              href="#membership"
              className="inline-flex min-h-11 items-center rounded-md border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              See what membership includes
            </a>
          </div>
          <p className="mt-5 text-sm text-slate-400">No finance background is assumed. Content availability changes as editors and administrators publish it.</p>
        </div>

        <div className="border border-white/15 bg-[#0d211d] p-5 shadow-2xl shadow-black/20 sm:p-7">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-sm font-semibold text-white">Inside the member portal</p>
              <p className="mt-1 text-sm text-slate-400">A single place to return to your learning and activity.</p>
            </div>
            <Bookmark className="h-5 w-5 text-emerald-300" aria-hidden />
          </div>
          <ul className="divide-y divide-white/10">
            {portalItems.map(({ icon: Icon, title, detail }) => (
              <li key={title} className="flex gap-4 py-5">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" aria-hidden />
                <div>
                  <h2 className="font-medium text-white">{title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-400">{detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
