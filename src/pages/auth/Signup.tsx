import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Signup() {
  const { signUp, user, loading } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/portal" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error: err } = await signUp(email, password, displayName);
    setSubmitting(false);
    if (err) setError(err);
    else {
      setSuccess(true);
      setTimeout(() => navigate("/onboarding"), 1500);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060a12] px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white/[0.04] p-8 backdrop-blur-xl">
        <Link to="/" className="text-sm text-white/50 hover:text-white/80">← Back to site</Link>
        <h1 className="mt-4 text-2xl font-bold text-white">Join Finance4All</h1>
        <p className="mt-2 text-sm text-white/60">Create your member account to access the portal.</p>

        {success ? (
          <p className="mt-6 text-sm text-emerald-300">Account created! Redirecting…</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="name" className="text-white/80">Display name</Label>
              <Input
                id="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="mt-1 border-white/20 bg-white/5 text-white"
              />
            </div>
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
                minLength={6}
                className="mt-1 border-white/20 bg-white/5 text-white"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Creating account…" : "Create account"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-white/50">
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-300 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
