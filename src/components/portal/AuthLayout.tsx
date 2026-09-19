import { Link } from "react-router-dom";
import { BookOpenText, Briefcase, FlaskConical } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";

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
        <Link to="/" className="auth-back">← Back to member home</Link>
        <div className="auth-story-copy">
          <p>Finance for All · Member space</p>
          <h2>Keep learning.<br /><em>Make the work visible.</em></h2>
          <span>Courses, research, opportunities, events, and the people building alongside you.</span>
        </div>
        <div className="auth-story-grid">
          <div><BookOpenText className="h-4 w-4" /><span>Learn</span><small>Lessons and debriefs</small></div>
          <div><FlaskConical className="h-4 w-4" /><span>Research</span><small>FinanceMeta Labs</small></div>
          <div><Briefcase className="h-4 w-4" /><span>Build</span><small>Projects and roles</small></div>
        </div>
      </aside>

      <main className="auth-form-panel">
        <div className="auth-form-wrap">
          <Link to="/" className="auth-mobile-brand">Finance for All <span>Member space</span></Link>
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
