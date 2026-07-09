import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative z-10 px-6 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-50%] left-[-50%] h-[400px] w-[400px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-40%] right-[-40%] h-[500px] w-[500px] rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="mb-8 grid gap-8 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl sm:grid-cols-3">
          <div>
            <p className="font-semibold text-white">Finance4All Meta</p>
            <p className="mt-2 text-sm text-white/55">
              Global financial literacy outreach and member community.
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/40">Portal</p>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <Link to="/login" className="text-white/70 transition hover:text-emerald-300">
                Sign in
              </Link>
              <Link to="/signup" className="text-white/70 transition hover:text-emerald-300">
                Create account
              </Link>
              <Link to="/portal" className="text-white/70 transition hover:text-emerald-300">
                Dashboard
              </Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/40">Site</p>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <a href="#about" className="text-white/70 transition hover:text-white">About</a>
              <a href="#programs" className="text-white/70 transition hover:text-white">Programs</a>
              <a href="#contact" className="text-white/70 transition hover:text-white">Contact</a>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 text-sm text-white/45 sm:flex-row">
          <p>© {new Date().getFullYear()} Finance4All Meta. All rights reserved.</p>
          <p>Empowering global financial literacy.</p>
        </div>
      </div>
    </footer>
  );
}
