/** In-depth resource guides shown at /portal/resources/:id */

export interface ResourceGuide {
  id: string;
  title: string;
  summary: string;
  body: string;
  checklist?: string[];
}

export const RESOURCE_GUIDES: Record<string, ResourceGuide> = {
  "club-toolkit": {
    id: "club-toolkit",
    title: "Start a Finance4All school chapter",
    summary: "Faculty-backed club playbook — from interest meeting to first Catalyst workshop to portal onboarding.",
    checklist: [
      "Find a faculty advisor willing to sponsor meetings",
      "Recruit 5+ founding members with defined roles (president, treasurer, outreach)",
      "Open a dedicated club bank account with dual sign-off",
      "Run one Catalyst budgeting workshop in month one",
      "Register your chapter in the member directory",
    ],
    body: `## Month 1: Foundation

Hold an interest meeting. Present the Catalyst budgeting module (Education hub → Financial literacy foundations). Collect emails for the member portal — every officer should have an account.

## Month 2: First event

Run a **Markets 101** session using Debriefed explainers. Pair a beginner explainer (What is an IPO?) with a current news article. Leave 20 minutes for Q&A.

## Month 3: Research path

Identify 2–3 members interested in lab work. Host an application workshop: how to write a motivation statement, what lead researchers look for, how to read a project listing.

## Sponsorship

Local firms and university departments sometimes support puzzle nights or trading games when chapters document attendance and learning outcomes. Keep a simple event log — sponsors need numbers, not adjectives.

## Reporting

Treasurer submits quarterly: income, expenses, event count, students reached. This mirrors how Finance4All reports outreach to partner organizations.`,
  },
  "catalyst-curriculum": {
    id: "catalyst-curriculum",
    title: "Catalyst facilitator guide",
    summary: "How volunteers run the same 90-minute sessions used in school outreach — adaptable by country.",
    body: `## Session format (90 minutes)

1. **Hook (10 min)** — local news story or student expense example  
2. **Concept (25 min)** — one Education hub lesson, read together  
3. **Exercise (20 min)** — pairs complete the lesson exercise  
4. **Discussion (20 min)** — what differs in your community?  
5. **Portal signup (15 min)** — help students create free accounts

## Adaptation notes

- **India outreach:** use ₹ examples, UPI, and post office savings context  
- **UK/US chapters:** use direct deposit, student loans, and credit score basics in banking lesson  
- **First-gen students:** do not assume parents discuss investing at home; define every term on first use

## Materials

All lesson text lives in the Education hub. Print the exercise section or share links to \`/portal/education\` on phones.`,
  },
  "economics-journal": {
    id: "economics-journal",
    title: "Economics Journal — submission standards",
    summary: "What editors check before promoting student writing externally.",
    body: `## Eligible formats

- **Market commentary** (800–1,200 words) — timely, thesis-driven  
- **Policy analysis** — clear mechanism, cited data  
- **Student perspective** — specific angle on a macro or company story

## Review criteria

| Criterion | Weight |
|-----------|--------|
| Clear thesis in first 150 words | High |
| Evidence and citations | High |
| Original insight | Medium |
| Writing clarity | Medium |

## Where to submit

Pathways → Essays. Tag your piece with relevant topics (macro, equities, policy). Editorial picks appear on the board and may be highlighted in Debriefed digests.

## After submission

Engage with comments. Upvote thoughtful peer work. Revision requests are normal — most strong pieces go through two or three drafts before promotion.`,
  },
};
