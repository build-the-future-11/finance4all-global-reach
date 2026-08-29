import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#071412] px-4 py-10 text-sm text-slate-400">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="font-semibold text-white">FinanceMeta</p>
          <p className="mt-2 max-w-md leading-6">Financial education, research, opportunities, and community for students.</p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-3">
          <Link to="/discover" className="hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300">Discover</Link>
          <Link to="/competitions" className="hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300">Competitions</Link>
          <Link to="/signup" className="hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300">Join</Link>
          <Link to="/privacy" className="hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300">Privacy</Link>
          <Link to="/terms" className="hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300">Terms</Link>
          <a href="/#contact" className="hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300">Contact</a>
          <p>© {new Date().getFullYear()} FinanceMeta</p>
        </div>
      </div>
    </footer>
  );
}
