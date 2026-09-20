import { Link } from "react-router-dom";
import { BookOpenText, Briefcase, FlaskConical } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import Brand from "@/components/Brand";
import ThemeToggle from "@/components/ThemeToggle";
import { BoxReveal, NeuralBackground } from "@/components/experience/Interactions";
import "@/styles/landing.css";
import "@/styles/auth-refresh.css";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="auth-shell">
      <aside className="auth-story">
        <NeuralBackground />
        <Link to="/" className="auth-back"><Brand /></Link>
        <div className="auth-story-copy">
          <p>Finance for All · Member space</p>
          <h2><BoxReveal>Your curiosity.</BoxReveal><br /><em><BoxReveal delay={150}>A world of<br />possibility.</BoxReveal></em></h2>
          <span>Finance is for everyone. Find clear explanations, meaningful research, and people who share your questions.</span>
          <div className="auth-reach">
            <strong>100,000+</strong>
            <span>students reached · six continents</span>
            <small>Organisation-reported as of September 2026; not independently audited.</small>
          </div>
        </div>
        <div className="auth-story-grid">
          <div><BookOpenText className="h-4 w-4" /><span>Learn</span><small>Lessons and debriefs</small></div>
          <div><FlaskConical className="h-4 w-4" /><span>Research</span><small>FinanceMeta Labs</small></div>
          <div><Briefcase className="h-4 w-4" /><span>Build</span><small>Projects and roles</small></div>
        </div>
      </aside>

      <main className="auth-form-panel">
        <div className="auth-theme"><ThemeToggle /></div>
        <div className="auth-form-wrap">
          <Link to="/" className="auth-mobile-brand"><Brand /></Link>
          <div className="auth-form-heading"><p>Member access</p><h1>{title}</h1><span>{subtitle}</span></div>

          {!isSupabaseConfigured && (
            <div className="auth-configuration-note">
              <strong>Member access is not connected in this environment.</strong>
              <span>Use a configured deployment to sign in or create an account.</span>
            </div>
          )}

          <div className="auth-form-body">{children}</div>
          <div className="auth-form-footer">{footer}</div>
        </div>
      </main>
    </div>
  );
}
