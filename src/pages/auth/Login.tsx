import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function Login() {
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? "/portal";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to={from} replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error: err } = await signIn(email, password);
    setSubmitting(false);
    if (err) setError(err);
    else navigate(from);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060a12] px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white/[0.04] p-8 backdrop-blur-xl">
        <Link to="/" className="text-sm text-white/50 hover:text-white/80">← Back to site</Link>
        <h1 className="mt-4 text-2xl font-bold text-white">Sign in to Portal</h1>
        <p className="mt-2 text-sm text-white/60">Access Finance Debriefed, Labs, Pathways, and more.</p>

        {!isSupabaseConfigured && (
          <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
            Add your Supabase credentials to <code className="text-amber-100">.env</code> (see{" "}
            <code className="text-amber-100">.env.example</code>).
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email" className="text-white/80">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 border-white/20 bg-white/5 text-white"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-white/80">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 border-white/20 bg-white/5 text-white"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-white/50">
          No account?{" "}
          <Link to="/signup" className="text-emerald-300 hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}
