/** Full lesson bodies — written for FinanceMeta learning and Debrief content. */

export interface LessonContent {
  body: string;
  exercise: string;
  keyTerms: string[];
}

export const LESSON_CONTENT: Record<string, LessonContent> = {
  budgeting: {
    keyTerms: ["fixed costs", "discretionary spending", "emergency fund", "pay yourself first"],
    body: `## Why a budget matters

A budget is not a restriction — it is a plan for where your money goes before the month decides for you. Most people who feel "bad with money" have never written down what they actually earn and spend.

## The 50/30/20 starting point

A simple framework used in Catalyst outreach workshops:

- **50%** — needs (rent, food, transport, school fees)
- **30%** — wants (entertainment, dining out, subscriptions)
- **20%** — savings and debt repayment

Adjust ratios for your situation. One student might spend more on transport; another might spend more on rent or family support. The point is separating **needs from wants**.

## Building an emergency fund

An emergency fund is cash you can access in 1–3 days for:

- Medical costs
- Job or internship loss
- Family obligations

Start with **one month of essential expenses**, then work toward three to six months. Keep it in a separate savings account — not your daily checking account.

## Pay yourself first

When income arrives, move a fixed amount to savings **before** spending on wants. Even ₹500 or $20 per month compounds the habit.`,
    exercise: `**Try this:** List your last 7 days of spending. Mark each item N (need) or W (want). What percentage went to wants? Pick one want you could reduce next week and redirect that amount to savings.`,
  },
  banking: {
    keyTerms: ["APY", "checking account", "savings account", "overdraft"],
    body: `## Account types

**Checking (current) accounts** — for daily transactions: debit card, UPI, bill pay. Low or no interest.

**Savings accounts** — for money you do not need immediately. Banks pay **APY** (annual percentage yield) — the interest rate on your balance, compounded yearly.

## Reading APY

If a savings account offers 4% APY on ₹10,000 for one year, you earn roughly ₹400 before taxes. Compare APY across banks; fees can erase small rate differences.

## Fees to avoid

- Monthly maintenance fees (often waived with a minimum balance or student status)
- Overdraft fees — spending below zero can cost more than the purchase itself
- International transaction fees if you study abroad

## Choosing a bank

For members running school clubs: a dedicated club account with two signatories (treasurer + faculty advisor) creates accountability and clean records for sponsors.`,
    exercise: `**Try this:** Find your bank's APY and one fee in the schedule. If you do not have an account yet, compare two student accounts in your country on fees and minimum balance rules.`,
  },
  "investing-101": {
    keyTerms: ["equity", "bond", "diversification", "compound growth", "risk premium"],
    body: `## Asset classes in one page

**Equities (stocks)** — ownership in companies. Higher long-run return potential, higher short-run volatility.

**Bonds** — loans to governments or companies. Lower expected return, steadier income.

**Cash** — safest, lowest return. Loses purchasing power when inflation is high.

## Diversification

Do not bet everything on one stock, sector, or country. Index funds hold hundreds of companies in one product — a common starting point for beginners.

## Time horizon

Money needed within 2 years (tuition deposit, move abroad) usually should not be in volatile assets. Money for retirement decades away can absorb more equity risk.

## Risk vs return

Higher expected return always comes with higher uncertainty. If someone promises "guaranteed" high returns, that is a red flag — legitimate investments disclose risk.`,
    exercise: `**Try this:** Pick one company you follow. Write one reason its stock could rise and one reason it could fall. That is the core skill behind equity research.`,
  },
  "macro-pulse": {
    keyTerms: ["CPI", "GDP", "labor market", "policy rate", "real vs nominal"],
    body: `## The three prints Debriefed tracks weekly

**GDP growth** — Is the economy expanding or contracting? Revision trends matter as much as the headline.

**Inflation (CPI / PCE)** — Is purchasing power eroding? Central banks often target ~2% in developed economies.

**Employment** — Unemployment rate, payrolls, wage growth. Tight labor markets can feed inflation.

## How policy responds

When inflation is above target and growth is strong, central banks **raise rates** to cool demand. When growth weakens and inflation falls, they **cut rates** to stimulate borrowing.

## Reading a Fed or RBI statement

Look for: (1) what changed vs last meeting, (2) forward guidance language ("data dependent"), (3) dissents. Markets move on surprises relative to expectations — not the level alone.

## Connect to markets

Rate cuts lower discount rates → support equity valuations, especially long-duration growth stocks. Rate hikes do the opposite. Bond prices move inversely to yields.`,
    exercise: `**Try this:** Open Debriefed and find this week's macro headline. Identify which of the three indicators (growth, inflation, jobs) it relates to and one sector that might benefit or suffer.`,
  },
  "equity-markets": {
    keyTerms: ["index", "market cap", "sector", "earnings", "P/E ratio"],
    body: `## How a trade happens

Buyers and sellers meet on an exchange (NYSE, NSE, LSE). The **price** is the last agreed trade. **Volume** shows conviction — thin volume moves can reverse quickly.

## Indices vs single stocks

The S&P 500, Nifty 50, or FTSE 100 are baskets representing large parts of the market. "The market was up" usually means the index — not every stock.

## Sectors

Group companies by business: technology, financials, energy, healthcare, etc. **Sector rotation** shifts leadership as the cycle changes — see the explainers hub for detail.

## Earnings season

Public companies report quarterly revenue, profit, and guidance. Stocks often move most on **guidance** (future expectations) vs past results.

## Valuation shorthand

**P/E ratio** = price ÷ earnings per share. High P/E can mean growth expectations or overvaluation — context matters within sector peers.`,
    exercise: `**Try this:** Pick two stocks in the same sector from a Debriefed company spotlight. Compare P/E if available, or compare one qualitative difference in their business models.`,
  },
  hypothesis: {
    keyTerms: ["null hypothesis", "identification", "data source", "literature review"],
    body: `## From topic to question

Bad: "I want to study inflation."  
Good: "Did food price shocks in 2022–2024 predict rural wage growth in Indian states with higher agricultural employment?"

A strong question is **specific**, **testable**, and **bounded** in time and geography.

## Literature review

Before collecting data, read what exists: working papers, project notes, central bank releases, and public datasets. Your contribution should be clear — new geography, new method, or new mechanism.

## Data credibility

Primary sources beat aggregators. Examples: central bank statistical releases, World Bank WDI, company 10-K filings. Document download date and revision policy.

## Identification

How will you separate correlation from causation? Natural experiments, difference-in-differences, and instrumental variables are common research methods — start by stating what would falsify your claim.`,
    exercise: `**Draft:** Write one sentence describing a research question you could explore in a lab project. List two data sources and one prior paper you would read first.`,
  },
  writing: {
    keyTerms: ["abstract", "thesis statement", "chart discipline", "peer review"],
    body: `## Economics Journal structure

1. **Abstract** (150–250 words) — question, method, result, implication  
2. **Introduction** — why the reader should care; thesis in plain English  
3. **Evidence** — charts and data with sources  
4. **Discussion** — limitations and policy or market relevance  
5. **References** — consistent citation style

## Charts that work

One message per chart. Label axes, cite sources in the caption, avoid 3D effects. A good chart should be understandable without reading the full paper.

## Peer review at FinanceMeta

Submissions on Pathways → Essays receive community upvotes; editorial picks are selected for clarity, originality, and evidence. Respond to feedback — revision is part of publication.

## Common mistakes

- Burying the thesis in paragraph four  
- Claims without citations  
- Jargon without definitions (use Explainers for readers new to finance)`,
    exercise: `**Try this:** Write an abstract for a 500-word essay on any Debriefed article. Include the question, one data point, and one implication for students or investors.`,
  },
};
