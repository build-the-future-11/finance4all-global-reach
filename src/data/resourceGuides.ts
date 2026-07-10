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
    summary: "Step-by-step playbook for faculty-supported clubs — used in outreach from Mumbai to London.",
    checklist: [
      "Find a faculty advisor willing to sponsor meetings",
      "Recruit 5+ founding members with defined roles (president, treasurer, outreach)",
      "Open a dedicated club bank account with dual sign-off",
      "Run one Catalyst budgeting workshop in month one",
      "Submit your chapter to Finance4All for the member directory",
    ],
    body: `## Month 1: Foundation

Hold an interest meeting. Present the Catalyst budgeting module (Education hub → Financial literacy foundations). Collect emails for the member portal — every officer should have an account.

## Month 2: First event

Run a **Markets 101** session using Debriefed explainers. Pair a beginner explainer (What is an IPO?) with a current news article. Leave 20 minutes for Q&A.

## Month 3: Research path

Identify 2–3 members interested in Meta Labs. Host an application workshop: how to write a motivation statement, what lead researchers look for.

## Sponsorship & Jane Street–style activities

Quant firms often support math and finance clubs with puzzle nights and trading games. Document attendance and learning outcomes — sponsors need impact data.

## Reporting

Treasurer submits quarterly: income, expenses, event count, students reached. This mirrors how Finance4All reports to partners globally.`,
  },
  "catalyst-curriculum": {
    id: "catalyst-curriculum",
    title: "Catalyst CFEI facilitator guide",
    summary: "How volunteers teach the same curriculum used in underserved schools across 15+ countries.",
    body: `## Session format (90 minutes)

1. **Hook (10 min)** — local news story or student expense example  
2. **Concept (25 min)** — one Education hub lesson, read together  
3. **Exercise (20 min)** — pairs complete the lesson exercise  
4. **Discussion (20 min)** — what differs in your community?  
5. **Portal onboarding (15 min)** — help students create free accounts

## Adaptation notes

- **India outreach:** use ₹ examples, UPI, and post office savings context  
- **UK/US chapters:** use direct deposit, student loans, and credit score basics in banking lesson  
- **First-gen students:** avoid assuming parents discuss investing at home; define every term

## Materials

All lesson text lives in the Education hub. Print the exercise section or share links to \`/portal/education\` on phones.`,
  },
  "economics-journal": {
    id: "economics-journal",
    title: "Economics Journal — submission standards",
    summary: "What the editorial team looks for before promoting work externally.",
    body: `## Eligible formats

- **Market commentary** (800–1,200 words) — timely, thesis-driven  
- **Policy analysis** — clear mechanism, cited data  
- **Student perspective** — unique angle on a macro or company story

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

Engage with comments. Upvote thoughtful peer work. Revision requests are normal — publication-quality work rarely ships in one draft.`,
  },
};
