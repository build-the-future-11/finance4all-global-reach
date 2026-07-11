import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import AuthLayout from "@/components/portal/AuthLayout";
import {
  PortalAlert,
  PortalInput,
  PortalLabel,
  portalButtonPrimary,
  portalLinkClass,
} from "@/components/portal/PortalUI";
import { portalCopy } from "@/lib/portalCopy";
import { isValidEmail } from "@/lib/security";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Button } from "@/components/ui/button";

export default function ForgotPassword() {
  useDocumentTitle("Reset password");
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isValidEmail(email)) {
      setError(portalCopy.security.invalidEmail);
      return;
    }
    setSubmitting(true);
    const { error: err } = await resetPassword(email);
    setSubmitting(false);
    if (err) setError(err);
    else setSent(true);
  };

  return (
    <AuthLayout
      title={portalCopy.auth.forgotPasswordTitle}
      subtitle={portalCopy.auth.forgotPasswordSubtitle}
      footer={
        <Link to="/login" className={cn(portalLinkClass, "inline-flex items-center gap-1")}>
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> {portalCopy.auth.backToSignIn}
        </Link>
      }
    >
      {sent ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center" role="status">
          <Mail className="h-10 w-10 text-emerald-400" aria-hidden />
          <p className="text-sm text-white/70">
            {portalCopy.auth.forgotPasswordSent}{" "}
            <strong className="text-white">{email}</strong>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <PortalLabel htmlFor="email">Email</PortalLabel>
            <PortalInput
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          {error && <PortalAlert variant="error">{error}</PortalAlert>}
          <Button type="submit" className={cn("w-full", portalButtonPrimary)} disabled={submitting}>
            {submitting ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
