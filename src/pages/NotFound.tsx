import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#060a12] px-4 text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/3 top-1/4 h-72 w-72 rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>
      <p className="text-8xl font-bold text-white/10">404</p>
      <h1 className="mt-2 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 max-w-sm text-center text-sm text-white/50">
        <code className="text-white/70">{location.pathname}</code> doesn't exist.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Link>
        </Button>
        <Button asChild className="bg-emerald-500 hover:bg-emerald-400">
          <Link to="/portal">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Portal
          </Link>
        </Button>
      </div>
    </div>
  );
}
