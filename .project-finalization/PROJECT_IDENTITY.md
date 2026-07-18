# Project Identity

- **Product:** FinanceMeta (Finance4All)
- **Category:** Global finance/economics literacy, research, opportunity, and community member platform (nonprofit).
- **Classification confidence:** High. Confirmed via directory name, README, Supabase migrations (`research_projects`, `lab_applications`, `opportunities`, `chapters`, `member_certificates`), portal routes (`/portal/labs`, `/portal/education`, `/portal/debriefed`, `/portal/pathways`), and project-specific playbook (Section 16).
- **Primary audience:** Students and early-career members seeking finance/economics education, research (Meta Labs), opportunities, and chapter/community participation.
- **Stack:** Vite 5, React 18, TypeScript (strict), TailwindCSS + shadcn/ui, TanStack Query, React Router, Supabase (Postgres + RLS + RPC + Auth + Storage), Vitest, Playwright.
- **Deployment target:** Static SPA + Supabase. Production build enforces `VITE_APP_URL`, `VITE_SUPABASE_URL`, JWT-format `VITE_SUPABASE_ANON_KEY` via a build-time env validator.
- **Repository is single-product** (not a monorepo). Sibling folders under `~/Downloads` are separate repos and out of scope for this run.

## Golden journey (target)
Discover → Understand → Join → Onboard (goals/interests) → Discover program/project → Take first action (save/apply/learn) → Contribute → See progress & contribution history → Return for next opportunity.
