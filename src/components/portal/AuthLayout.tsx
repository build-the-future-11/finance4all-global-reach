import { Link } from "react-router-dom";
import { isSupabaseConfigured } from "@/lib/supabase";
import GlassSurface from "@/components/landing/GlassSurface";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

const MODULES = [
  { name: "Debriefed", desc: "Macro news & explainers" },
  { name: "Meta Labs", desc: "Mentor-led research" },
  { name: "Pathways", desc: "Opportunities & essays" },
  { name: "Network", desc: "Chapters & introductions" },
];

export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#020408]">
      <div className="relative hidden w-[45%] overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="landing-orb left-1/4 top-1/4 h-96 w-96 bg-emerald-500/18" />
          <div className="landing-orb landing-float-delay bottom-1/4 right-1/4 h-80 w-80 bg-indigo-500/12" />
        </div>
        <div className="relative">
          <Link to="/" className="text-sm text-white/50 transition hover:text-white/80">
            ← Back to site
          </Link>
          <h2 className="mt-8 text-4xl font-bold leading-tight text-white">
            Finance4All
            <span className="mt-1 block bg-gradient-to-r from-emerald-300 to-cyan-200 bg-clip-text text-transparent">
              Member Portal
            </span>
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/58">
            One login for Debriefed, Catalyst lessons, lab applications, chapter events, and the
            member network — free for every student.
          </p>
        </div>
        <div className="relative grid grid-cols-2 gap-3">
          {MODULES.map((mod) => (
            <GlassSurface key={mod.name} className="p-4" interactive={false}>
              <div className="landing-glass-inner">
                <p className="text-sm font-semibold text-white">{mod.name}</p>
                <p className="mt-1 text-xs text-white/45">{mod.desc}</p>
              </div>
            </GlassSurface>
          ))}
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-6 inline-block text-sm text-white/50 hover:text-white/80 lg:hidden">
            ← Back to site
          </Link>

          <GlassSurface strong className="p-8">
            <div className="landing-glass-inner">
              <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{subtitle}</p>

              {!isSupabaseConfigured && (
                <div className="mt-5 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-100/90">
                  <p className="font-medium text-amber-200">Supabase not connected</p>
                  <p className="mt-1 text-amber-100/70">
                    Copy <code className="rounded bg-black/20 px-1">.env.example</code> to{" "}
                    <code className="rounded bg-black/20 px-1">.env</code> and add your anon key.
                  </p>
                </div>
              )}

              <div className="mt-6">{children}</div>
              <div className="mt-6 border-t border-white/10 pt-6 text-center text-sm text-white/45">
                {footer}
              </div>
            </div>
          </GlassSurface>
        </div>
      </div>
    </div>
  );
}
