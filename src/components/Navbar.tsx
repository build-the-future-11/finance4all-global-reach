import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const links = [
  { label: "About", href: "/#about" },
  { label: "Discover", href: "/discover" },
  { label: "Member experience", href: "/#experience" },
  { label: "Membership", href: "/#membership" },
  { label: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#071412]/95 backdrop-blur">
      <nav className="mx-auto flex min-h-16 max-w-6xl items-center justify-between px-4" aria-label="Primary navigation">
        <a href="/" className="rounded-sm text-lg font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300">
          Finance4All
        </a>
        <div className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="rounded-sm text-sm font-medium text-slate-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300">
              {link.label}
            </a>
          ))}
          <Link to="/login" className="rounded-md border border-emerald-300/70 px-3 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-300 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300">
            Sign in
          </Link>
        </div>
        <button
          type="button"
          className="rounded-md p-2 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
      </nav>
      {open && (
        <div id="mobile-navigation" className="border-t border-white/10 bg-[#071412] px-4 pb-4 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col pt-2">
            {links.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-md px-3 py-3 text-sm font-medium text-slate-200 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300">
                {link.label}
              </a>
            ))}
            <Link to="/login" onClick={() => setOpen(false)} className="mt-2 rounded-md bg-emerald-300 px-3 py-3 text-center text-sm font-semibold text-slate-950">
              Sign in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
