import type { ExplainerCard } from "@/types/domain";

export type EditorialExplainer = ExplainerCard & {
  readMinutes: number;
  dek: string;
  sourceLabel: string;
  reviewedAt: string;
  featured?: boolean;
};

const editorialDrafts: EditorialExplainer[] = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    slug: "ipo-from-private-company-to-public-market",
    title: "The complete guide to an IPO",
    summary: "What actually happens between a founder deciding to go public and the first day of trading — including pricing, dilution, lock-ups, and the risks headlines skip.",
    dek: "An IPO is not just a stock-market debut. It is a months-long transfer of information, ownership, and risk between a private company and public investors.",
    difficulty: "beginner",
    readMinutes: 12,
    reviewedAt: "2026-09-20",
    sourceLabel: "SEC investor and company-filing guidance",
    featured: true,
    relatedTerms: ["S-1", "underwriter", "bookbuilding", "lock-up", "greenshoe", "dilution"],
    body: `# The complete guide to an IPO

An **initial public offering**, or IPO, is the first sale of a private company's shares to public investors. That one-line definition is correct, but incomplete. An IPO is also a financing event, a price-discovery exercise, a regulatory disclosure process, a liquidity event for existing owners, and the beginning of a much more demanding reporting regime.

## Why a company chooses to go public

A company may sell newly issued shares to fund hiring, expansion, acquisitions, debt repayment, or product development. Existing shareholders may also sell some of their shares. Those are different flows: money from **primary shares** goes to the company; money from **secondary shares** goes to the selling shareholder.

Going public can give a company a visible market price, make equity compensation easier to value, and create a liquid currency for future acquisitions. It also has costs: recurring disclosure, audit and governance work; pressure from public-market expectations; underwriting and legal fees; and less freedom to keep sensitive information private.

## The route from private to public

1. **Preparation and advisers.** The company selects banks, lawyers, auditors, and other advisers. It cleans up financial statements, governance, capitalization records, material contracts, and risk disclosures.
2. **Registration filing.** In the United States, a typical domestic issuer files a Form S-1 with the Securities and Exchange Commission. The document describes the business, financial results, ownership, intended use of proceeds, and risks. A filing is disclosure, not an SEC endorsement.
3. **Review and revision.** Regulators comment on the filing. The company responds and amends it. Draft registration statements may initially be submitted confidentially, but the public filing and amendments become part of the research record investors can inspect.
4. **Marketing and bookbuilding.** Management presents the company to potential investors. Underwriters collect non-binding indications of demand across possible prices and allocation sizes. This “book” helps estimate where the deal can clear.
5. **Pricing and allocation.** The company and underwriters choose the offer price and allocate shares. The offer price is what allocated investors pay; the opening exchange price can be very different once public trading starts.
6. **Trading and stabilization.** Shares begin trading under a ticker. Underwriters may have an over-allotment option, often called a greenshoe, that can help manage excess demand and short-term price pressure within legal limits.
7. **Life as a public company.** The issuer enters a continuing cycle of periodic financial reports, current-event disclosures, earnings communication, governance obligations, and scrutiny from analysts and shareholders.

## Why the first-day “pop” is not free money

If a share is offered at 20 and closes its first day at 28, headlines call that a 40% pop. An investor who received shares at the offer price may have a gain on paper. But many retail investors can only buy after trading opens, possibly near 28. Their return starts from their own purchase price, not the offer price.

For the company, a large jump can also mean it sold shares for less than the public market was immediately willing to pay. That may be a deliberate trade-off to support demand and reduce execution risk, but it is not automatically a success for every stakeholder.

## Dilution, ownership, and the cap table

When a company issues new shares, the total share count rises. Existing holders may own a smaller percentage afterward even if the value of their stake rises. Investors should compare the expected post-offering share count, employee options and restricted stock, convertible securities, and any shares that may enter the market later.

The headline market capitalization — price multiplied by common shares — may not capture debt, cash, preferred securities, or options. Analysts often use **enterprise value** and a fully diluted share count to compare firms more carefully.

## The lock-up and the changing supply of shares

Insiders and early investors often agree not to sell for a defined period after the IPO. When a lock-up expires, more shares may become eligible for sale. That does not guarantee selling or a price decline, but it changes the possible supply. The prospectus explains the restrictions and the number of shares that may eventually become tradable.

## Follow the money: a worked example

Imagine a fictional business with 80 million existing shares. It issues 20 million new shares at 10 currency units each. Before fees, the company receives 200 million. There are now 100 million shares outstanding, so its equity market value at the offer price is 1 billion. An early investor who owned 8 million shares held 10% before the offering and holds 8% afterward. Their share count did not fall; the denominator increased.

Now suppose an existing shareholder also sells 5 million shares in the offering. That seller receives 50 million before fees, but those shares already existed. Their sale does not create another 5 million shares or send another 50 million to the company. This is why an offering headline cannot tell you how much fresh funding the business actually receives.

These simplified numbers exclude options, different share classes, and transaction costs. The exercise is not a valuation recommendation. It is a way to separate three questions that often get mixed together: who receives cash, how many claims on the business exist, and what price each claim commands.

## A practical research checklist

- Read the business and risk sections in the prospectus, not only the investor presentation.
- Separate revenue growth from profitability and cash generation.
- Reconcile adjusted metrics with audited financial statements.
- Check customer concentration, related-party transactions, voting control, and planned use of proceeds.
- Compare valuation with public peers using consistent definitions.
- Model dilution and post-offering ownership.
- Ask which assumption would make the investment thesis wrong.
- Treat the offer price, opening price, and your own purchase price as three different numbers.

## What an IPO does not prove

An IPO does not prove that a company is profitable, fairly valued, low risk, or endorsed by a regulator. It means the offering met the applicable process and disclosure requirements. Investors still have to judge the economics, governance, price, and uncertainty.

> The useful question is not “Is this a hot IPO?” It is “What am I buying, what assumptions are embedded in the price, and what evidence would change my mind?”

## Primary sources and next reading

- [SEC: What is a registration statement?](https://www.sec.gov/education/capitalraising/building-blocks/registration-statement)
- [SEC EDGAR company filings](https://www.sec.gov/edgar/search-and-access)
- [Investor.gov: Initial public offerings](https://www.investor.gov/introduction-investing/investing-basics/investment-products/stocks/initial-public-offerings)

This explainer is educational and is not a recommendation to buy or sell any security.`,
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    slug: "how-interest-rates-move-through-the-economy",
    title: "How interest rates move through the economy",
    summary: "A transmission map from a central-bank decision to loans, exchange rates, asset prices, demand, employment, and inflation — plus why the effect is never instant.",
    dek: "A policy-rate change is a starting signal. Banks, borrowers, investors, firms, and governments determine how far and how quickly it travels.",
    difficulty: "beginner",
    readMinutes: 10,
    reviewedAt: "2026-09-20",
    sourceLabel: "BIS, IMF, and RBI monetary-policy explainers",
    featured: true,
    relatedTerms: ["policy rate", "yield curve", "real rate", "transmission", "inflation expectations"],
    body: `# How interest rates move through the economy

When a central bank changes its policy rate, it does not directly set every mortgage, credit-card, bond, or savings rate. It changes the price of very short-term money in the financial system and communicates how it sees inflation and economic conditions. The rest of the economy transmits — or sometimes absorbs — that signal.

## The main transmission channels

**Money-market and bank rates.** A policy change influences overnight funding and deposit costs. Banks decide how much to pass through to borrowers and savers based on competition, balance-sheet strength, credit risk, and the structure of their funding.

**Market yields.** Bond yields reflect expected future short rates, inflation, term risk, and demand for safe assets. A central-bank cut can coincide with rising long-term yields if investors revise inflation or fiscal-risk expectations upward.

**Credit and cash flow.** Lower borrowing costs may make some projects viable and reduce payments for floating-rate borrowers. Higher rates can do the reverse. The impact depends on refinancing schedules: a fixed-rate borrower may not feel a change until much later.

**Asset prices and wealth.** Interest rates affect the discount rate used to value future cash flows. But price effects depend on what else changes. A rate cut prompted by a severe downturn may not be bullish if expected earnings fall faster.

**Exchange rates.** All else equal, a currency may become less attractive when its interest-rate advantage falls. “All else equal” rarely holds: growth, risk appetite, external balances, and expectations matter too.

**Expectations.** Guidance about the future can matter as much as the current decision. Households and firms change behaviour based on expected inflation, income, and financing conditions.

## Why policy works with lags

Contracts reset at different times. Firms take months to approve investment. Housing supply adjusts slowly. Banks may tighten lending standards even after market rates fall. Economists therefore study a distribution of lags rather than one universal timetable.

## Nominal versus real rates

The **nominal rate** is the quoted rate. A simplified real rate subtracts expected inflation. If a deposit pays 6% while prices are expected to rise 5%, its expected real return is roughly 1% before tax and other effects. Expectations are unobservable and can change, so the calculation is an estimate.

## A better way to read a rate decision

1. Identify what changed: the rate, liquidity operations, reserve settings, balance-sheet policy, or only guidance.
2. Compare the decision with market expectations. A widely expected cut may already be reflected in prices.
3. Read the inflation and growth assessment, not only the headline.
4. Look at the yield curve, credit spreads, currency, and bank pass-through after the decision.
5. Keep alternative explanations. A market move around the announcement is not automatically caused by one sentence.

## One announcement, three different experiences

Consider three fictional households facing the same rate rise. The first has a floating-rate loan whose contract resets next month. The second has a fixed-rate loan with several years remaining. The third has no debt and holds money in an interest-bearing deposit. There is no single immediate household effect. The first may face higher payments soon. The second may face no immediate contractual change. The third might receive more interest, depending on what their bank passes through.

Use a deliberately simple interest-only example to see the arithmetic. On an unchanged principal of 100,000, an annual rate rising from 5% to 6% increases annual interest from 5,000 to 6,000. That is 1,000 more per year, or about 83 per month. A real amortizing loan is different: scheduled principal repayments, reset rules, fees, and the remaining term affect the payment. Never treat this illustrative calculation as a lender's quote.

The household response is another step beyond the contract. Someone with ample savings may barely change spending. Someone already close to their monthly budget limit may cut purchases quickly. A retailer serving those customers might then see weaker demand even without borrowing money itself. The economy is a network of balance sheets and decisions, not a row of identical borrowers.

## Discounting a future payment

Suppose a hypothetical asset promises a single certain payment of 110 one year from now. Ignoring taxes and costs, its present value at a 10% discount rate is 100: divide 110 by 1.10. At a 5% discount rate, the same payment has a present value of about 104.76. A lower discount rate raises the value of that unchanged future payment.

The crucial word is **unchanged**. A company is not a certain payment. Its revenue, expenses, financing, and probability of survival can change at the same time as market rates. If expected future cash flow falls from 110 to 90, lowering the discount rate to 5% gives a value of about 85.71, below the original 100. This explains why “rates fell, therefore stocks must rise” is not a complete argument. The cash-flow assumption and the discount-rate assumption belong on the same page.

## The surprise matters more than the headline

Imagine that nearly everyone expects a central bank to cut by half a percentage point. It cuts by a quarter instead. Rates have fallen compared with yesterday, but the decision is tighter than the expected alternative. Prices can respond to that difference. This does not mean markets are irrational; it means today's price already contained a view about tomorrow.

A useful class exercise is to write three columns before reading the market reaction: the decision that was expected, the decision that occurred, and the new information about future decisions. Then add a fourth column for unrelated news. This prevents a familiar mistake: inventing a confident explanation after seeing which direction an asset moved.

## What to watch over the following months

Build a small dashboard rather than looking for one decisive indicator. Track new lending rates separately from rates on the stock of existing loans. Track borrowing quantities and lending standards as well as quoted prices. Compare household consumption, business investment, wage growth, and inflation measures over consistent periods. Record the publication date and any later revisions.

Finally, distinguish a slower rise in prices from a fall in the price level. Inflation dropping from 8% to 4% still means prices are rising at the measured annual rate. Monetary policy can influence demand and expectations, but it cannot directly manufacture missing energy, housing, or skilled workers. A careful explanation identifies both what the mechanism can do and what lies outside it.

## Primary sources and next reading

- [Bank for International Settlements: monetary policy](https://www.bis.org/topic/monetary_policy.htm)
- [IMF: Monetary policy and central banking](https://www.imf.org/en/Topics/monetary-policy-and-central-banking)
- [Reserve Bank of India: monetary policy](https://www.rbi.org.in/Scripts/MonetaryPolicy.aspx)
- [Bank of England: monetary policy transmission](https://www.bankofengland.co.uk/quarterly-bulletin/2024/2024/about-a-rate-of-general-interest-how-monetary-policy-transmits)

This explainer describes mechanisms, not a forecast or financial advice.`,
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    slug: "upi-payments-and-the-economics-of-a-network",
    title: "UPI and the economics of a payment network",
    summary: "How instant payments coordinate banks, apps, rules, and settlement — and the questions that matter for access, resilience, fraud, and sustainable economics.",
    dek: "The visible app is only the front door. A payment network is a layered institution built from standards, incentives, identity, dispute rules, and shared infrastructure.",
    difficulty: "intermediate",
    readMinutes: 11,
    reviewedAt: "2026-09-20",
    sourceLabel: "NPCI and RBI system documentation",
    featured: true,
    relatedTerms: ["UPI", "interoperability", "network effects", "settlement", "consumer protection"],
    body: `# UPI and the economics of a payment network

India's Unified Payments Interface enables participating accounts and apps to exchange payment instructions through a common system. For a user, the interaction can feel like one tap. Economically, that tap coordinates multiple institutions: a payer app, a payer's bank, the network switch, a payee's bank, identity and authentication controls, and rules for failures or disputes.

## Why interoperability matters

In a closed payment system, both sides may need the same provider. An interoperable system allows different regulated participants and interfaces to communicate through common standards. This can reduce fragmentation and let services compete on user experience while sharing core rails.

Interoperability also creates shared-risk questions. A weak participant, confusing interface, outage, or social-engineering attack can affect trust in the wider system. Governance and operational resilience are therefore part of the product, not background plumbing.

## Network effects without a single app monopoly

A payment network becomes more useful as more people and merchants can reach one another. Open participation can spread that network effect across multiple apps and banks. But concentration can still emerge at the interface layer, and measured transaction volume alone does not reveal service quality, fraud losses, rural access, or the economics of each participant.

## The hard economic questions

- Who pays for authentication, switching, customer support, fraud controls, and uptime?
- Which services are public infrastructure and which are commercial products?
- How do incentives change when end-user prices are very low or zero?
- Can small institutions meet reliability and security requirements?
- Do new users gain meaningful access, or only a new payment method?
- How quickly are mistaken or fraudulent transfers handled, and who bears the loss?

## A responsible research design

Transaction growth is not by itself proof of financial inclusion. A stronger study defines the population, outcome, and counterfactual. For example: did adoption reduce travel time or payment failure for a particular merchant group? Did it change formal saving or only replace cash for some purchases? Were people who left the sample systematically different?

Researchers should use aggregate or properly consented data, minimize collection of personal financial information, document missingness, and avoid interpreting correlation as causation.

## Follow one payment, then ask who did the work

Picture a fictional student buying lunch from a small merchant. The student scans a payment code, checks the intended recipient and amount, and authorizes the payment in an app. The visible journey is short. But several jobs have to be completed: identify the destination, validate the instruction, authenticate the payer, check available funds, communicate the outcome, and maintain records that can support reconciliation or a complaint.

This is a conceptual description, not a claim that every payment product has an identical technical sequence. Its purpose is to separate the **interface** from the underlying service. An attractive screen can simplify a complicated process without removing the institutions that make the process work. When a payment fails, knowing which layer reported which status is more useful than treating the entire system as one mysterious app.

The merchant also has work to do. They need a trustworthy way to confirm receipt, match the payment to the sale, and resolve discrepancies. A screenshot shown by a customer is not the same as a confirmed entry in the merchant's own account or approved payment system. Good product design reduces the gap between what each participant thinks happened and what the payment record actually shows.

## Low prices are not the same as zero costs

Imagine a hypothetical network serving one million payments a day. Even if each payment costs only a small fraction of a currency unit to process, the aggregate infrastructure bill can be meaningful. Add dispute handling, accessibility work, fraud monitoring, customer support, and the engineering needed for peak demand. These costs exist whether they are paid through transaction charges, subsidies, other products, or participating institutions' budgets.

This is not an estimate of UPI's actual cost structure. It is a framework for asking how a payment service remains sustainable. To evaluate a real proposal, identify the party paying each cost and the incentives that funding creates. For example, a provider funded through an adjacent product may prioritize cross-selling. A public subsidy may encourage access but require a transparent budget and evaluation. Neither observation alone proves a model is good or bad.

## Count people and experiences, not only transactions

Suppose a town records twice as many digital payments this year. That might reflect more users, more transactions by existing users, smaller average purchases, a shift away from another payment method, or some combination. A chart of transaction counts cannot distinguish these explanations by itself.

A hypothetical inclusion study could track whether first-time users can complete essential payments independently, whether merchants experience fewer failed transactions, and whether the time spent resolving problems changes. Define “active user” before collecting data. Someone making one transaction after a promotional event is different from someone relying on the service every week. Report the distinction rather than choosing whichever definition makes growth look largest.

Do not collect transaction screenshots, account identifiers, phone numbers, or personal financial histories merely because they might be interesting. Start with the least sensitive data that can answer the research question. A classroom project can use public aggregate series or fictional records while practicing measurement and analysis without exposing anyone's finances.

## A practical research brief

Start with a narrow question such as: “Which barriers do merchants report when reconciling digital payments?” Define the population, recruitment method, questionnaire, and analysis before looking at results. Record whether respondents were selected through convenience, random sampling, or a partner network. Those choices affect whom the findings can reasonably describe.

Then separate observations from interpretations. “Twelve of twenty interviewed merchants reported difficulty” is a description of that sample, not a city-wide prevalence estimate. “Better reconciliation tools would solve the problem” is a hypothesis requiring further testing. Negative findings are valuable too: if a proposed difficulty is uncommon, preserve that result and reconsider the question.

The central lesson is that payment innovation has to work for people, not only for dashboards. Access, understandable consent, reliability, support, and sustainable funding are connected design problems. High transaction volume is an important signal, but it is the beginning of an inquiry rather than the conclusion.

## Primary sources and next reading

- [NPCI: UPI product overview](https://www.npci.org.in/what-we-do/upi/product-overview)
- [Reserve Bank of India: payment and settlement systems](https://www.rbi.org.in/Scripts/PaymentSystems.aspx)
- [NPCI: UPI frequently asked questions and PIN safety](https://www.npci.org.in/what-we-do/upi/faqs)

This explainer is educational. Never approve an unexpected collect request or share a PIN, password, or one-time code.`,
  },
  {
    id: "10000000-0000-4000-8000-000000000004",
    slug: "reading-an-economic-claim-without-getting-fooled",
    title: "How to read an economic claim without getting fooled",
    summary: "A field guide to base rates, denominators, real versus nominal values, selection bias, causal claims, and charts that start at convenient dates.",
    dek: "Good economic reasoning starts by asking what was measured, compared with what, over which period, and what result would disprove the story.",
    difficulty: "beginner",
    readMinutes: 9,
    reviewedAt: "2026-09-20",
    sourceLabel: "Evidence-literacy editorial standard",
    relatedTerms: ["causality", "base rate", "selection bias", "real terms", "counterfactual"],
    body: `# How to read an economic claim without getting fooled

Economic claims often arrive compressed into a chart, percentage, or causal sentence. Before accepting the story, reconstruct the measurement.

## Seven questions to ask

1. **What is the denominator?** A 50% increase from two to three is real but may not be economically large.
2. **Is the value nominal or real?** Money values can rise while purchasing power falls.
3. **What is the comparison period?** A convenient start date can reverse the impression.
4. **Who is missing?** Survey non-response, business closures, and platform churn can change the sample.
5. **Is this correlation or a causal design?** Two variables moving together does not show which caused the other.
6. **How uncertain is the estimate?** Point estimates without intervals can imply false precision.
7. **What would falsify the interpretation?** If no possible observation could change the claim, it is not doing useful analytical work.

## Build the counterfactual

Policy evaluation asks what would have happened without the intervention. That outcome is not directly observed for the treated group. Researchers use comparison groups, timing variation, discontinuities, experiments, or structural assumptions to estimate it. Each method has failure modes that should be stated plainly.

## Prefer a source ledger to a confidence tone

A strong article links the original dataset or filing, defines transformations, marks estimates, separates analysis from reporting, and preserves corrections. Confidence in the writing is not evidence for the claim.

## Work through a headline with actual arithmetic

Consider this fictional headline: “Graduates of our finance workshop earn 20% more.” It sounds like evidence that the workshop raised earnings. But suppose workshop participants already earned 120 before joining, while the comparison group earned 100. A later difference of 20% may simply reproduce an existing gap. We need baseline measurements and a credible explanation of how people entered each group.

Now imagine earnings changed from 120 to 132 for participants and from 100 to 110 for the comparison group. Both groups grew by 10%. The final levels are still different, but the growth rates are the same. This does not establish that the workshop had no effect; the comparison group might be unsuitable. It does show why the original headline is insufficient to establish an effect. A persuasive story cannot substitute for specifying the comparison.

Ask another question: were earnings measured only among people who found jobs? If unsuccessful applicants disappeared from the sample, a reported average could rise while overall outcomes deteriorated. The outcome definition matters as much as the arithmetic. Employment probability, hours worked, wages, and total income answer different questions and should not be silently exchanged.

## Percentages, percentage points, and changing bases

If a hypothetical unemployment rate rises from 4% to 5%, it rises by **one percentage point**, not one percent. Relative to the starting rate, the increase is 25% because one divided by four is one quarter. Both descriptions can be mathematically correct, but they communicate different things. A clear report gives the starting and ending levels so readers can see the scale.

Similarly, a 50% fall followed by a 50% rise does not restore the original value. An index starting at 100 falls to 50, then rises to 75. The second percentage applies to a smaller base. To return from 50 to 100 requires a 100% increase. This simple exercise helps explain why adding percentage changes across time is often misleading.

For nominal and real comparisons, use an equally explicit calculation. If a fictional income rises by 5% while a relevant price index rises by 4%, purchasing power changes by 1.05 divided by 1.04, minus one: about 0.96%. Subtracting the two rates gives a useful approximation, not the exact answer. Which price index is relevant depends on the question and the spending being represented.

## Read a chart in a deliberate order

First read the axes and units. Is the vertical axis a level, growth rate, index, share, or cumulative total? Is the horizontal axis evenly spaced? Does a series measure calendar years, financial years, months, or rolling windows? Next read the source and notes. Seasonal adjustment and revisions may materially change comparisons even when the line looks simple.

Then inspect the time window. A rebound from an unusually weak month may look dramatic without taking the series back to its previous level. Conversely, a long-run improvement can coexist with a recent deterioration. Neither view should erase the other. Presenting both can be more informative than choosing the period that produces the strongest emotional reaction.

Finally, check whether the visual scale changes the impression. A truncated axis is not automatically dishonest; it can reveal small but important differences. The problem arises when the presentation invites a magnitude interpretation that the numbers do not support. State the actual values and explain why that scale was chosen.

## Uncertainty is information, not an apology

A small survey can produce a precise-looking decimal without producing a precise estimate. Sampling variation, missing responses, measurement error, and modelling choices all contribute to uncertainty. A confidence interval addresses a particular statistical framework; it does not automatically include every source of bias or every plausible alternative explanation.

One useful habit is to write an assumption ledger beside the result. What happens if missing respondents differ from observed ones? Does the conclusion survive a reasonable alternative definition? Was the method selected before the result was known? Robustness checks should investigate the claim, not provide endless opportunities to search for a preferred answer.

## Turn reading into a small research exercise

Choose one public economic claim and write a one-page audit. Include its exact wording, the original source, population, dates, units, calculation, and interpretation. Reproduce the simplest relevant number. Then state the strongest conclusion supported by the evidence and one conclusion that would go too far.

You do not need to reject every imperfect study. The goal is calibrated judgment: understand what the evidence can tell you, what remains uncertain, and what additional observation would be most useful. A careful reader can learn from limited evidence without pretending its limits have disappeared.

## Further reading

- [World Bank: Impact Evaluation in Practice](https://www.worldbank.org/en/programs/sief-trust-fund/publication/impact-evaluation-in-practice), a guide to evaluation design, counterfactuals, sampling, and research ethics.

> Replace “this chart proves” with “under these definitions and assumptions, the evidence is consistent with.”

This guide is a starting checklist, not a substitute for reviewing the underlying method and data.`,
  },
];

export const editorialExplainers = editorialDrafts.map(article => ({ ...article, readMinutes: Math.max(1, Math.ceil(article.body.split(/\s+/).length / 220)) }));
export const featuredExplainers = editorialExplainers.filter((article) => article.featured);

export function findEditorialExplainer(slug: string | undefined) {
  const aliases: Record<string, string> = { "what-is-an-ipo": "ipo-from-private-company-to-public-market", "rate-cuts-explained": "how-interest-rates-move-through-the-economy" };
  return editorialExplainers.find((article) => article.slug === (slug ? aliases[slug] ?? slug : slug));
}
