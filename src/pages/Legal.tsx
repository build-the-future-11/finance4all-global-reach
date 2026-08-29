import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { PUBLIC_CONTACT_EMAIL, PUBLIC_CONTACT_MAILTO } from "@/lib/publicContact";

type LegalKind = "privacy" | "terms";

const privacySections = [
  [
    "Information we collect",
    "When you create an account, FinanceMeta processes the details needed to run the portal: your email address, profile details, saved content, learning progress, applications, event registrations, and settings. Contact form submissions are processed so we can respond.",
  ],
  [
    "How we use it",
    "We use this information to authenticate you, show your account state, provide the member tools you request, administer published content and applications, protect the service, and respond to support or contact requests.",
  ],
  [
    "Visibility to other members",
    "Your account email is not included in the member directory. Other authenticated members can discover your member profile only when you enable the Open to collaborate setting; administrators may access member profiles when needed for moderation, safety, or support. Do not add sensitive personal information to profile fields, introductions, applications, or submissions unless a specific form clearly requires it.",
  ],
  [
    "Service providers and retention",
    "The portal uses authentication, database, hosting, and other service providers to operate. Information is retained only as long as it is needed to operate your account, meet legal obligations, resolve disputes, or protect the service. Operational analytics and client-error records use limited retention windows defined by the platform database.",
  ],
  [
    "Your choices",
    "You can update profile details, collaboration visibility, communication preferences, and security settings in the portal. You can download an account-data export and request permanent account deletion from Settings. Some requests may require identity verification before action is taken.",
  ],
];

const termsSections = [
  [
    "Using the portal",
    "Use FinanceMeta lawfully and only for its intended learning, research, opportunity, and community purposes. Keep your account credentials private, provide accurate information, and do not attempt to access another person's account or administrator tools.",
  ],
  [
    "Member contributions",
    "You remain responsible for material you submit, including applications, posts, essays, studio work, introductions, and messages. Do not submit unlawful, infringing, deceptive, abusive, or private material that you do not have permission to share.",
  ],
  [
    "Content and opportunities",
    "Learning content is educational and is not financial, investment, legal, or career advice. Published opportunities, events, competitions, research roles, and external links can change or close. FinanceMeta does not guarantee selection, placement, outcomes, availability, or accuracy of third-party material.",
  ],
  [
    "Account and moderation",
    "Access may be limited or removed when necessary to protect members, the service, or legal rights. Administrators may moderate, reject, unpublish, or remove content that violates these terms or platform standards.",
  ],
  [
    "Changes",
    "These terms may be updated as the service develops. Continued use after an update means you accept the revised terms. Questions can be sent to the contact address below.",
  ],
];

export default function Legal({ kind }: { kind: LegalKind }) {
  const isPrivacy = kind === "privacy";
  const title = isPrivacy ? "Privacy" : "Terms of use";
  const sections = isPrivacy ? privacySections : termsSections;
  useDocumentTitle(title);

  return (
    <main className="min-h-screen bg-[#f6f8f6] px-4 py-12 text-slate-900 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="text-sm font-semibold text-emerald-800 underline underline-offset-4">
          FinanceMeta home
        </Link>
        <p className="mt-10 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-800">
          FinanceMeta
        </p>
        <h1 className="mt-4 text-4xl font-semibold">{title}</h1>
        <p className="mt-5 leading-7 text-slate-700">
          This page explains how FinanceMeta handles {isPrivacy ? "personal information" : "use of the portal"}{" "}
          in plain language. Last updated August 2026.
        </p>
        <div className="mt-12 space-y-10">
          {sections.map(([heading, body]) => (
            <section key={heading}>
              <h2 className="text-xl font-semibold">{heading}</h2>
              <p className="mt-3 leading-7 text-slate-700">{body}</p>
            </section>
          ))}
        </div>
        <p className="mt-12 border-t border-slate-300 pt-6 text-sm text-slate-600">
          For privacy or terms questions,{" "}
          <a
            href={PUBLIC_CONTACT_MAILTO}
            className="font-medium text-emerald-800 underline underline-offset-4"
          >
            email {PUBLIC_CONTACT_EMAIL}
          </a>
          .
        </p>
      </div>
    </main>
  );
}
