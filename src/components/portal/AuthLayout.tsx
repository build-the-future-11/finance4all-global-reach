import { Link } from "react-router-dom";
import { isSupabaseConfigured } from "@/lib/supabase";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#060a12]">
      {/* Brand panel — desktop */}
      <div className="relative hidden w-[45%] overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-emerald-500/20 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-blue-500/15 blur-[100px]" />
        </div>
        <div className="relative">
          <Link to="/" className="text-sm text-white/50 transition hover:text-white/80">
            ← Back to site
          </Link>
          <h2 className="mt-8 text-4xl font-bold leading-tight text-white">
            Finance4All
            <span className="block text-emerald-400">Member Portal</span>
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/55">
            News, research labs, career pathways, events, and a global member network — all in one place.
          </p>
        </div>
        <div className="relative grid grid-cols-2 gap-3">
          {["Debriefed", "Meta Labs", "Pathways", "Network"].map((mod) => (
            <div
              key={mod}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white/70 backdrop-blur-sm"
            >
              {mod}
            </div>
          ))}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-6 inline-block text-sm text-white/50 hover:text-white/80 lg:hidden">
            ← Back to site
          </Link>

          <div className="rounded-2xl border border-white/[0.12] bg-white/[0.04] p-8 shadow-[0_24px_64px_rgba(0,0,0,0.4)] backdrop-blur-xl">
            <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
            <p className="mt-2 text-sm text-white/55">{subtitle}</p>

            {!isSupabaseConfigured && (
              <div className="mt-5 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-100/90">
                <p className="font-medium text-amber-200">Supabase not connected</p>
                <p className="mt-1 text-amber-100/70">
                  Create a <code className="rounded bg-black/20 px-1">.env</code> file with your
                  credentials. See setup guide below.
                </p>
              </div>
            )}

            <div className="mt-6">{children}</div>
            <div className="mt-6 border-t border-white/10 pt-6 text-center text-sm text-white/45">
              {footer}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
