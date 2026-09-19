import { ArrowRight, BookOpenText, FlaskConical, LogIn, ShieldCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

function AppBrand() {
  return (
    <span className="app-gateway-brand">
      <span className="app-gateway-mark" aria-hidden="true"><i /><i /><i /></span>
      <span><strong>Finance for All</strong><small>Member space</small></span>
    </span>
  );
}

export default function Index() {
  useDocumentTitle();
  return (
    <main className="app-gateway">
      <header className="app-gateway-header">
        <AppBrand />
        <nav aria-label="Member app links">
          <Link to="/learn">Open learning</Link>
          <Link to="/evidence">Evidence</Link>
          <ThemeToggle />
        </nav>
      </header>

      <section className="app-gateway-hero">
        <div className="app-gateway-copy">
          <p><span /> The working layer</p>
          <h1>Your learning, projects, and people. <em>One member space.</em></h1>
          <p className="app-gateway-lede">Sign in to continue learning, track applications, contribute to FinanceMeta Labs, discover opportunities, and take part in events and clubs.</p>
          <div className="app-gateway-actions">
            <Link to="/login" className="gateway-button gateway-button-primary"><LogIn className="h-4 w-4" /> Sign in <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/signup" className="gateway-button gateway-button-secondary">Create an account</Link>
          </div>
          <div className="app-gateway-trust"><ShieldCheck className="h-4 w-4" /><span>Private onboarding data stays separate from the member directory.</span></div>
        </div>

        <div className="app-gateway-preview" aria-label="Portal preview">
          <div className="gateway-preview-head"><span>Inside your portal</span><span>⌘ K to search</span></div>
          <div className="gateway-preview-feature">
            <span><BookOpenText className="h-5 w-5" /></span>
            <div><small>Continue learning</small><strong>Five Foundations</strong><p>35-minute open lesson</p></div>
            <ArrowRight className="h-4 w-4" />
          </div>
          <div className="gateway-preview-grid">
            <div><FlaskConical className="h-4 w-4" /><strong>Research</strong><span>Projects and applications</span></div>
            <div><Users className="h-4 w-4" /><strong>Community</strong><span>People, clubs, and events</span></div>
          </div>
          <div className="gateway-preview-lines" aria-hidden="true"><i /><i /><i /></div>
        </div>
      </section>

      <section className="app-gateway-footer">
        <span>Finance for All is a Finance Meta initiative.</span>
        <div><Link to="/learn/five-foundations">Start with a free lesson</Link><a href="mailto:financeforalledu@gmail.com">Contact the team</a></div>
      </section>
    </main>
  );
}
