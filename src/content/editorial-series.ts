// FinanceDebriefed: original evergreen explainers. Examples are hypothetical.
import type { EditorialExplainer } from './editorial';

export const editorialSeries: EditorialExplainer[] = [
  {
    id: "10000000-0000-4000-8000-000000000005",
    slug: "lower-inflation-does-not-mean-lower-prices",
    title: "Why lower inflation does not mean lower prices",
    summary: "Separate the price level from its rate of change, calculate the effect on a household budget, and read an inflation headline without losing the baseline.",
    dek: "Inflation can fall while your weekly shop gets more expensive. The missing distinction is between how high prices are and how quickly they are rising.",
    difficulty: "beginner",
    readMinutes: 6,
    reviewedAt: "2026-10-11",
    sourceLabel: "Primary sources linked within the article; original hypothetical examples",
    relatedTerms: ["inflation", "disinflation", "deflation", "CPI", "purchasing power", "base effect"],
    lab: "macro-monetary-financial-economics",
    tags: ["Economics", "Inflation", "Explainers"],
    body: `# Why lower inflation does not mean lower prices

Imagine opening a news app after buying groceries. The headline says inflation has fallen. Your receipt is higher than last year. Neither observation has to be wrong. The headline describes a rate of change; the receipt records a price level. Understanding that distinction helps you read economic news without dismissing your own experience or asking one statistic to answer every question.

All numbers in the examples below are invented for teaching. They describe a simplified basket, not a particular country's inflation release or a forecast.

## Three changes that sound similar

**Inflation** means the general price level is rising. **Disinflation** means that rise is slowing. **Deflation** means the general price level is falling. If inflation drops from 8% to 3%, prices are still rising in the second period, just less quickly. One product becoming cheaper does not establish economy-wide deflation. The Bank of England explains this distinction between inflation and the cost of living in its [inflation guide](https://www.bankofengland.co.uk/explainers/what-is-inflation).

Try translating the headline into an ordinary sentence before interpreting it. “Prices rose 3% compared with a year earlier” says something much more precise than “inflation improved.” It specifies a direction, a magnitude and a comparison period. It still leaves open what happened to your income and which things you buy.

## Follow one basket through three years

Suppose an unchanged basket costs 1,000 currency units at the start. During the first year its price rises 8%, reaching 1,080. During the second year it rises another 3%, reaching 1,112.40. Inflation has slowed, yet the basket now costs 112.40 more than at the start.

The cumulative increase is **11.24%**, calculated as 1.08 multiplied by 1.03, minus one. Adding 8% and 3% gives 11%, which misses the second year's increase on the already higher price. Compounding matters whenever consecutive percentage changes use different starting values.

To return from 1,112.40 to 1,000, this basket would need to fall about **10.10%**. That is 112.40 divided by 1,112.40. The percentage required to reverse an increase is smaller than the original percentage increase because the denominator has changed. A return to 0% inflation would merely leave the basket at 1,112.40; it would not rewind the earlier increases.

This also explains why “inflation is back where it started” does not mean “the cost of living is back where it started.” Ask whether the speaker is comparing two rates or two levels. Writing down the units often exposes the confusion immediately.

## The basket is an average, not your receipt

A consumer price index combines many categories using expenditure weights. The US Bureau of Labor Statistics explains that its CPI represents an average and will not match every household's spending experience. It also distinguishes the all-items index from measures excluding food and energy. Those exclusions in a particular analytical measure do not remove food and energy from the headline index. See the [BLS CPI questions and answers](https://www.bls.gov/cpi/questions-and-answers.htm).

Consider a deliberately tiny basket: 50% housing, 30% food and 20% transport. If their prices rise 4%, 10% and 0%, respectively, a fixed-weight calculation gives 0.50 × 4% + 0.30 × 10% + 0.20 × 0% = **5%**. This is classroom arithmetic, not a reproduction of an official index's full methodology.

Now consider someone whose spending weights are 30%, 50% and 20%. The same category changes produce **6.2%**. There is no disagreement about the individual prices. The difference comes from exposure. A household spending heavily on the fastest-rising category can feel more pressure than the aggregate suggests.

For a personal comparison, keep quantity and quality consistent. Spending more because you bought more groceries is different from paying more for the same groceries. Neither makes the bill irrelevant; they answer different questions.

## Your income changes the purchasing-power question

Suppose monthly income rises from 2,000 to 2,080, a 4% increase, while the relevant basket rises 5%. Dividing 1.04 by 1.05 and subtracting one gives a purchasing-power change of approximately **minus 0.95%**. The larger number on the payslip buys slightly less of that basket.

If income instead rises 7% against the same 5% basket increase, the calculation becomes 1.07 divided by 1.05, minus one: approximately **plus 1.90%**. Subtracting the inflation rate from income growth is a useful small-change approximation, but the division gives the exact result under these assumptions.

This exercise does not establish a household's complete financial position. Taxes, debt payments, hours worked and changes in family size could all alter the budget. Write those separately rather than forcing the inflation number to represent them. A statistic becomes more useful when its job is clearly defined.

## Check the comparison window

An annual rate compares a price index with its level twelve months earlier. A monthly rate compares neighboring months. Seasonal adjustment can also change which figures are comparable; the BLS FAQ explains why analysts distinguish adjusted monthly movements from unadjusted annual comparisons.

Here is a hypothetical base effect. An index is 100 in March of year one, then jumps to 110 in April. It remains at 110 through April of year two. In March of year two, the annual increase is 10%. In April, the annual increase becomes 0%, even though the index has not fallen from 110. The earlier jump has moved into the comparison base.

Before concluding that a new policy caused an annual rate to fall, inspect what happened to both the current month and the year-earlier denominator. This example establishes an arithmetic possibility, not an explanation for any real release. A causal claim would require additional evidence.

## A better way to read the next headline

1. **Name the measure.** Is it a consumer index, a producer index, an all-items measure or a narrower series?
2. **Name the window.** Does the percentage describe a month, a year or an annualized shorter period?
3. **Keep rates and levels separate.** Record both the latest change and the cumulative change over the period you care about.
4. **Inspect the categories.** Which prices changed most, and how important are they in the basket?
5. **Connect income carefully.** Compare income growth with a relevant price measure while keeping other budget changes visible.

## Check your reasoning

A basket rises from 500 to 540, then to 550.80. What are the two inflation rates? Has the basket become cheaper? What would a 2% fall from the final price produce?

The rates are **8% and 2%**. The basket has not become cheaper; its cumulative increase is **10.16%**. A subsequent 2% fall would take it to **539.784**, or 539.78 rounded to two decimal places. That is still above the original 500. Explain these results aloud using “price level” and “rate of change” separately.

This guide teaches how to interpret a measure. It does not assess a current inflation release or predict interest rates. The next useful step is to apply the same questions to an official statistical release and read its definitions before comparing the headline with your own budget.`,
  },
  {
    id: "10000000-0000-4000-8000-000000000006",
    slug: "why-bond-prices-fall-when-yields-rise",
    title: "Why bond prices fall when yields rise",
    summary: "Price a simple fixed-rate bond, distinguish its coupon from its yield, and see why holding to maturity does not remove every risk.",
    dek: "A bond can keep paying exactly the same coupon while its market price falls. The changing price is how an old promise competes with new interest rates.",
    difficulty: "beginner",
    readMinutes: 5,
    reviewedAt: "2026-10-11",
    sourceLabel: "Primary sources linked within the article; original hypothetical examples",
    relatedTerms: ["bond", "coupon", "yield", "present value", "duration", "credit risk"],
    lab: "quantitative-finance-asset-pricing",
    tags: ["Markets", "Bonds", "Explainers"],
    body: `# Why bond prices fall when yields rise

You buy a bond promising fixed payments. The issuer makes no change to that promise, yet the price on your account statement falls. Where did the loss come from? A fixed payment becomes less attractive when buyers can demand a higher return elsewhere. The market price adjusts to make the remaining payments competitive.

That explanation needs a boundary: bonds differ. The examples here concern simple fixed-rate bonds with specified payment dates. They assume payments arrive as promised and ignore taxes, trading costs, accrued interest and embedded options. The figures are hypothetical, not executable market quotes.

## Start with the payment, not the label

Suppose a bond will repay 1,000 currency units in exactly one year and pay one final coupon of 50 at the same time. Its remaining promised payment is therefore **1,050**. The coupon rate is 50 divided by the face value of 1,000, or **5%**.

The coupon rate describes the contract. It does not tell you what return a new buyer receives at any possible price. If someone pays more than 1,000, that same 50 is a smaller fraction of the purchase price. If someone pays less, it is a larger fraction.

For the general relationship between market interest rates and fixed-rate bond prices, see the SEC's [investor bulletin on interest-rate risk](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-86). Its central point is conditional: holding other relevant factors constant, higher required yields mean lower prices for fixed promised payments.

## Price the one-year promise

If buyers require a 5% annual return, the price is 1,050 divided by 1.05, or **1,000**. Paying 1,000 now and receiving 1,050 after one year produces that return.

If the required return rises to 7%, the price becomes 1,050 divided by 1.07, or approximately **981.31**. A buyer paying that amount receives a gain from the difference between purchase price and repayment as well as the coupon. Together, those amounts deliver the required one-year return under the stated assumptions.

If the required return falls to 3%, the price rises to 1,050 divided by 1.03, or approximately **1,019.42**. The buyer receives the same final payment but starts from a higher outlay. The percentage return is therefore lower.

Nothing in this calculation changes the issuer's 1,050 promise. Price is the adjustment variable. Thinking in cash amounts first helps prevent the common mistake of assuming a higher quoted yield means the issuer has increased this bond's coupon.

## Follow the money over two years

Now consider a different bond with two years remaining. It pays 50 after year one and 1,050 after year two. With a flat required annual yield of 5%, its value is 50 divided by 1.05, plus 1,050 divided by 1.05 squared. The result is **1,000**.

At 7%, the same calculation gives approximately **963.84**. At 3%, it gives approximately **1,038.27**. Each future payment is converted into a present value before the pieces are added together. Money arriving later receives more discounting.

Compare the price declines when yields move from 5% to 7%. The one-year bond falls about **1.87%**; the two-year bond falls about **3.62%**. This particular comparison keeps face value, annual coupon and the yield change consistent. Changing several features at once would make the maturity comparison harder to interpret.

The SEC bulletin discusses why longer maturities and lower coupons generally increase interest-rate sensitivity, other things equal. Analysts use duration to summarize that sensitivity. Duration is an approximation tool, not a promise that every bond will respond identically to a large or uneven change in market rates.

## Coupon, current yield and realized return

For our one-year bond at 981.31, the annual coupon divided by price is approximately **5.10%**. This ratio is the current yield. It leaves out the gain from buying below the 1,000 face value. The full one-year return is 7% because the final 1,050 includes both repayment and coupon.

In this single-payment example, calculating the full return is straightforward. For a bond with several payments, a quoted yield to maturity summarizes the price and promised payment schedule using a discount rate. A realized investment return can differ when payments are reinvested at different rates, the bond is sold early or payments are missed.

For definitions and the distinction between yield measures and total return, use [FINRA's guide to bond yield and return](https://www.finra.org/investors/insights/bond-yield-return). Before comparing two quotes, check that they use the same yield convention and refer to the same settlement assumptions.

## Does holding to maturity solve the problem?

Return to the investor who originally paid 1,000 for the one-year bond. If they receive the promised 1,050 at maturity, the intervening market quote does not change their nominal cash receipts. But someone who must sell early is exposed to the price available at that time.

Even for the investor who can wait, this example has assumed away important uncertainties. The issuer may fail to pay; inflation may reduce what the money buys; and the investor may face an unexpected need for cash. A promised payment is different from cash already received. Holding an asset longer does not erase those distinctions.

A bond fund also needs its own analysis. A fund can hold many bonds and replace them over time. Do not transfer the repayment date of one bond onto a conventional ongoing fund as if the whole fund were a single promise to return a fixed amount on that date. Its documents explain the actual mandate and risks. See the [Investor.gov guide to bond funds](https://www.investor.gov/introduction-investing/investing-basics/glossary/bond-funds-and-income-funds) for the distinction.

## A price move can have several explanations

Our arithmetic changed only the required yield. In a real comparison, ask what changed underneath it. Was there a broad movement in rates? Did the market become more concerned about this issuer's ability to pay? Did trading become more difficult? The same observed price direction can be consistent with different mechanisms.

Write a small research note with three columns: the contractual payments, the observed market quote and the explanation being proposed. Evidence about one column is not automatically evidence about the others. A coupon notice verifies a scheduled payment; it does not establish why a market price moved that morning.

## Check your reasoning

A hypothetical bond has one year left and will pay 1,080 at maturity, including its coupon. What price corresponds to a 4% required return? What price corresponds to an 8% required return?

The answers are **1,038.46** and **1,000**, respectively. The promised payment is identical. The lower price gives the buyer the higher return. These are simplified valuations, not recommendations to buy a bond or forecasts of where yields will move.`,
  },
  {
    id: "10000000-0000-4000-8000-000000000007",
    slug: "how-a-profitable-company-runs-short-of-cash",
    title: "How a profitable company can run short of cash",
    summary: "Trace a credit sale through profit, receivables and the bank account, then separate operating cash from borrowing and investment.",
    dek: "Profit records economic activity under accounting rules. Cash determines whether the next payment can be made. A growing business can have one and run short of the other.",
    difficulty: "beginner",
    readMinutes: 6,
    reviewedAt: "2026-10-11",
    sourceLabel: "Primary sources linked within the article; original hypothetical examples",
    relatedTerms: ["profit", "cash flow", "receivables", "working capital", "capital expenditure", "liquidity"],
    lab: "corporate-finance-private-markets",
    tags: ["Companies", "Financial statements", "Explainers"],
    body: `# How a profitable company can run short of cash

A company announces a profit and then asks its lender for more money. That can look contradictory until you separate earning revenue from collecting payment. A customer may owe the company money while employees and suppliers need paying today. Growth can widen that timing gap.

The following fictional workshop is deliberately simple. Assume its revenue has been earned and meets the applicable recognition requirements. Ignore taxes, interest, depreciation and inventory changes in the first example. These assumptions let us isolate the difference between a recorded sale and a cash receipt without pretending to reproduce a complete set of financial statements.

## One month, two different results

The workshop begins the month with **20,000** currency units in cash. It completes and bills **100,000** of customer work. Customers pay **40,000** during the month and owe the remaining **60,000**. The workshop incurs **70,000** of operating expenses, all paid in cash during that month.

Under these simplified assumptions, its profit is 100,000 minus 70,000, or **30,000**. But its operating cash movement is 40,000 minus 70,000, or **minus 30,000**. Beginning cash of 20,000 is insufficient to cover that outflow. The business must collect more, arrange funding or change payment timing; it cannot simply spend its reported profit.

The gap is the unpaid customer balance. Revenue of 100,000 minus cash collections of 40,000 leaves 60,000 in receivables. Starting from profit of 30,000 and subtracting the 60,000 increase in receivables brings us to the same minus 30,000 operating cash movement.

This is why the [SEC's guide to financial statements](https://www.sec.gov/about/reports-publications/investorpubsbegfinstmtguide) treats the income statement, balance sheet and cash-flow statement as connected views. Profit over a period, balances at a date and cash movements over a period answer different questions.

## Make the funding gap explicit

Suppose the workshop borrows 15,000 in time to meet its payments. Cash at the end of the month is 20,000 plus 40,000, minus 70,000, plus 15,000: **5,000**. The bank account remains positive because financing covered the shortfall. The loan is not additional customer revenue and does not turn the operating cash outflow into an inflow.

Now imagine a headline saying, “The company ended the month with cash in the bank.” True, but incomplete. Another saying, “Operations generated cash,” would be false under these assumptions. Following the source of the money changes the interpretation without changing the ending balance.

In a second scenario, customers pay an additional 20,000 before month-end. Operating cash outflow shrinks to 10,000, so the original 20,000 cash balance is sufficient without that loan. Profit remains 30,000 because the work and expenses have not changed. Only the collection timing has changed.

## Read the three cash-flow sections

Cash-flow reporting distinguishes **operating**, **investing** and **financing** activities. IAS 7 describes operating activities as the principal revenue-producing activities and other activities outside the investing and financing categories. Investing includes acquiring or disposing of long-term assets; financing includes changes in contributed equity and borrowings. Non-cash investing and financing transactions are disclosed separately rather than counted as cash movements. See the [IFRS Foundation's IAS 7 overview](https://www.ifrs.org/issued-standards/list-of-standards/ias-7-statement-of-cash-flows/).

Apply that structure to a separate fictional period. Operations bring in 25,000 net. Buying equipment uses 40,000. A new loan supplies 20,000. Total cash increases by **5,000**. Operations are cash-positive, but they did not cover the equipment purchase on their own.

Reverse the pattern: operations use 10,000, selling an old machine brings in 12,000, and no financing occurs. Cash rises by **2,000**. That increase does not establish that the ordinary business generated cash. Asset sales may be sensible, but they are a different source of funding from repeat customer receipts.

## Growth can make the timing problem larger

Return to the workshop and double the first month's activity while keeping the same collection pattern. Sales become 200,000; current collections become 80,000; cash expenses become 140,000. Profit doubles to **60,000**, while operating cash outflow doubles to **60,000** too.

The bigger profit does not rescue the cash position because the unpaid customer balance has also grown. The example is not an argument against growth. It shows why a growth plan needs both a margin calculation and a funding schedule. A business can negotiate deposits or faster collections, but whether customers accept those terms is a commercial question, not an accounting certainty.

Make a weekly schedule before assuming month-end totals are enough. If payroll is due on Friday and a customer pays the following Monday, an eventual positive monthly balance does not establish that Friday's obligation can be met. Timing within the reporting period can matter as much as the period total.

## A cash-flow reconciliation is a starting point

Under an indirect presentation, reported profit is adjusted for non-cash items and relevant timing differences to reach operating cash flow. The IAS 7 overview explains this reconciliation approach. Read the company's stated accounting policies: classification and presentation details depend on the applicable standards and circumstances.

Avoid turning every adjustment into a judgment about management. A receivable increase could be consistent with rapid sales growth, a change in payment terms or slower collections. Those explanations have different implications, and the number alone does not choose among them. Look for customer concentration, overdue balances and management's discussion before forming a conclusion.

Likewise, a quarter with unusually strong collections can improve cash flow without permanently improving the business model. Ask whether the result reflects repeatable operations or the timing of a few large receipts. A multi-period comparison is more informative than an isolated ratio when the business is seasonal or project-based.

## Five questions for an annual report

1. **What period is being compared?** Use consistent periods and account for seasonal billing patterns before interpreting a change.
2. **Where did the cash come from?** Separate customer activity, asset sales, borrowing and owner contributions.
3. **What explains the profit-to-cash gap?** Read the reconciliation rather than stopping at the headline profit.
4. **When are obligations due?** Compare expected receipts with actual payment dates, not only annual totals.
5. **Which assumptions need evidence?** Record the collection expectations, funding availability and spending commitments that your interpretation depends on.

## Check your reasoning

A business reports 80,000 in earned revenue and 55,000 in expenses. It collects 50,000 from customers and pays all 55,000 of those expenses. It begins with 12,000 cash and receives a 10,000 loan. Assume no other transactions. Calculate profit, operating cash movement and closing cash.

Profit is **25,000**. Operating cash movement is **minus 5,000**. Closing cash is **17,000**, calculated as 12,000 minus 5,000 plus 10,000. If you called the loan revenue, revisit the distinction between doing business and financing it. This guide is an accounting exercise, not an assessment of any particular company's solvency.`,
  },
  {
    id: "10000000-0000-4000-8000-000000000008",
    slug: "what-a-weaker-currency-changes",
    title: "What a weaker currency changes",
    summary: "Translate exchange-rate headlines into import bills, export receipts and debt payments, then see why the quotation and currency exposure matter.",
    dek: "A weaker currency changes the price of crossing a border. Who benefits depends on what they buy, what they sell and which currency their contracts use.",
    difficulty: "beginner",
    readMinutes: 5,
    reviewedAt: "2026-10-11",
    sourceLabel: "Primary sources linked within the article; original hypothetical examples",
    relatedTerms: ["exchange rate", "depreciation", "appreciation", "currency exposure", "pass-through", "real exchange rate"],
    lab: "macro-monetary-financial-economics",
    tags: ["Economics", "Currencies", "Explainers"],
    body: `# What a weaker currency changes

“The currency weakened” sounds like a single verdict on an economy. For a household paying an overseas tuition bill, an exporter collecting foreign receipts and a business repaying foreign-currency debt, it can mean three different things. Start with the payments each person must make or receive, then translate them using a clearly stated exchange rate.

Every exchange rate in this article is hypothetical. We use currency L for local money and currency F for foreign money. There are no forecasts, live quotes, fees or taxes in the arithmetic.

## Read the quotation before reading the direction

Suppose **one F costs 80 L**. Later, one F costs 88 L. Foreign money now costs more in local units, so L has depreciated against F. The quoted price of F has risen by 10%, calculated as 88 divided by 80, minus one.

Turn the quotation around. Initially, one L buys 1/80 F, or 0.0125 F. Later, one L buys 1/88 F, or approximately 0.011364 F. In this quotation, L's value has fallen approximately **9.09%**. The two percentages differ because each uses a different starting denominator.

This is why a claim that a currency moved “10%” needs the currency pair and quotation convention. The direction of an upward line is not meaningful until the axis tells you which currency is being priced. The [Reserve Bank of Australia's exchange-rate explainer](https://www.rba.gov.au/education/resources/explainers/exchange-rates-and-the-australian-economy.html) describes appreciation, depreciation and the channels through which currency movements affect an economy.

## The importer has a larger local bill

A shop owes a foreign supplier 2,000 F for an unchanged shipment. At 80 L per F, the bill is **160,000 L**. At 88, it is **176,000 L**. The local-currency cost rises by 16,000 even though the supplier's price and the shipment's quantity have not changed.

What happens to the shelf price is a separate decision. If the shop keeps its local selling price unchanged, this additional cost reduces its margin under our assumptions. If it passes the whole increase to customers, the customers bear it. If it changes suppliers or the product mix, the comparison changes again.

The RBA notes that exchange-rate effects can take time to appear in consumer prices. Existing local-currency prices and firms' choices about passing through costs matter. A 10% change in one exchange-rate quote therefore does not imply a 10% change in the entire consumer price index. That index contains many prices with different exposures.

## The exporter may receive more, but inspect its costs

Now imagine a manufacturer receiving **10,000 F** for an export order. Converted at 80, the receipt is 800,000 L. At 88, it is 880,000 L. If its local costs are unchanged, that conversion helps its local-currency result.

But suppose it also buys imported components costing **6,000 F**. Those inputs cost 480,000 L at the first rate and 528,000 L at the second. Subtracting only these foreign-currency inputs from receipts leaves 320,000 L initially and 352,000 L later. The net improvement is **32,000 L**, not the 80,000 increase in gross receipts.

Assume another 250,000 L of unchanged local costs. The simplified surplus rises from **70,000 L to 102,000 L**. Now imagine those local costs rise by 40,000 L as well. The second surplus becomes **62,000 L**, below the first. This last change is an invented additional assumption, not an inevitable consequence of depreciation.

The exercise shows why “exporters benefit” is a starting hypothesis. The invoice currency, imported inputs, selling price, quantity and other costs determine what happens to a particular business. A category label is not a complete profit model.

## Debt creates another currency exposure

A company owes 50,000 F in principal. Translating that unchanged obligation at 80 produces **4 million L**; translating it at 88 produces **4.4 million L**. The foreign-currency principal has not grown, but the local money needed to buy it has.

If the company also receives dependable F-denominated income, those receipts may offset part of the exposure. If all its income arrives in L, the mismatch is different. Record the dates as well as the amounts: a receipt expected next year cannot automatically fund a payment due next week.

The RBA explains that depreciation changes the local-currency cost of servicing foreign-currency debt. Our example isolates that translation effect; it does not value a real borrower or a hedging contract. Actual contracts, payment schedules and any protection already in place would need separate inspection.

## A nominal move is not a complete competitiveness measure

The quoted exchange rate compares currencies. A **real exchange rate** also considers relative price levels. A real effective exchange-rate measure combines comparisons across trading partners rather than relying on one bilateral pair. The IMF explains these distinctions in [What Is the Real Exchange Rate?](https://www.imf.org/en/publications/fandd/issues/series/back-to-basics/real-exchange-rates).

Consider a local product priced at 800 L. At 80 L per F, it costs a foreign buyer 10 F. If the exchange rate moves to 88 but the local price remains 800, the converted price becomes about **9.09 F**. If the producer instead raises the local price to 880 L, the foreign price is back to **10 F**. The currency movement alone does not tell you which price customers actually face.

This example is a comparison of one product, not a full real-exchange-rate index. It also says nothing about product quality, delivery times or competitors' responses. Those omitted details may matter commercially even when the conversion arithmetic is correct.

## Build an exposure map

For a fictional business or a public company you are studying, write one line for each material cross-border payment. Record its amount, currency, expected date and whether the price is fixed. Convert receipts and payments separately, then calculate their net effect under the same assumed exchange rate.

Do not count a foreign sale twice by treating the full receipt as a gain and ignoring the associated foreign costs. Do not mix an average rate over a year with a single day's rate without explaining why. Keep the translation calculation separate from assumptions about how customers or suppliers will react.

## Check your reasoning

A student must pay 3,000 F in tuition. The rate moves from 80 to 84 L per F. The institution leaves the fee unchanged. What happens to the local-currency bill? Has the institution increased its price?

The bill rises from **240,000 L to 252,000 L**, an increase of **12,000 L or 5%**. The institution has not increased the F-denominated fee in this example. The student's cost changed through the exchange rate. That sentence identifies both the mechanism and whose perspective is being described.`,
  },
  {
    id: "10000000-0000-4000-8000-000000000009",
    slug: "a-stock-split-does-not-make-a-company-cheaper",
    title: "A stock split does not make a company cheaper",
    summary: "Track ownership, market capitalization and earnings per share through a split, and separate a lower share price from a lower valuation.",
    dek: "More shares at a lower price can represent exactly the same ownership. Follow the numerator and denominator before calling a stock split a bargain.",
    difficulty: "beginner",
    readMinutes: 6,
    reviewedAt: "2026-10-11",
    sourceLabel: "Primary sources linked within the article; original hypothetical examples",
    relatedTerms: ["stock split", "reverse split", "market capitalization", "earnings per share", "ownership", "valuation"],
    lab: "corporate-finance-private-markets",
    tags: ["Companies", "Markets", "Explainers"],
    body: `# A stock split does not make a company cheaper

A share trades at 120 currency units. After a three-for-one split, the reference price is 40. Has the company become two-thirds cheaper? Only if you ignore that each old share has become three new shares. The unit has changed; the ownership claim represented by the original holding has not automatically gained or lost value.

All companies and numbers below are fictional. The calculations isolate the split itself, holding business value and other information constant. Actual market prices can move as buyers and sellers respond to news, expectations and trading conditions.

## Follow one shareholder through the split

Imagine a company with **1 million shares** at **120** each. Its equity market capitalization is **120 million**. An investor holds 30 shares, worth 3,600 at that price. Their ownership fraction is 30 divided by 1 million, or **0.003%**.

In a three-for-one split, the company now has **3 million shares**. The investor has **90 shares**. The mechanical reference price is **40**. Multiplying 90 by 40 gives the same 3,600 holding value. Dividing 90 by 3 million gives the same 0.003% ownership.

Investor.gov explains that a stock split increases the number of shares without changing shareholders' proportional equity. It does not add money to the company simply by dividing ownership into more units. See its [stock-split definition](https://www.investor.gov/introduction-investing/investing-basics/glossary/stock-split).

Check all three quantities together: your share count, the total share count and the price per share. Looking at only one of them creates the illusion of a windfall or a collapse. The multiplication and division reconcile what happened.

## Earnings per share must use the same units

Suppose the company earns **6 million** over a simplified annual period, with no other changes to the share count. Before the split, dividing that profit by 1 million shares gives earnings per share of **6**. After expressing the same profit using 3 million shares, the figure is **2** per share.

At the mechanical prices above, the price-to-earnings ratio is 120 divided by 6, or **20**, before the split. Afterward, it is 40 divided by 2, also **20**. The lower share price has not produced a lower multiple of the same earnings.

This classroom example leaves out weighted-average share counts, potential dilution and detailed reporting rules. Its purpose is to keep the units consistent. When using real reports or a data provider, check how historical per-share figures have been adjusted before combining them with a current price.

For the relationship between income, earnings per share and valuation ratios, the [SEC's financial-statement guide](https://www.sec.gov/about/reports-publications/investorpubsbegfinstmtguide) provides a starting point. A ratio is only as interpretable as the numbers and period used to calculate it.

## A lower unit price is not the same as lower valuation

Compare two unrelated fictional companies. Company A has 10 million shares at 5, giving an equity market value of **50 million**. Company B has 100,000 shares at 100, giving an equity market value of **10 million**. A's individual shares cost less, but the market places a larger total value on its equity.

That does not establish that either company is overvalued. We have not supplied profits, assets, debt, cash or growth assumptions. It establishes only that the share price by itself cannot rank the value of entire businesses.

To make a meaningful comparison, first decide which question you are asking. “What does one tradable unit cost?” is different from “What price is the market assigning to all the equity?” Both can matter, but the first cannot substitute for the second. Write the full calculation beside a headline that calls a low-priced share cheap.

## What happens in a reverse split?

A reverse split combines shares into fewer units. Suppose an investor owns 200 shares at 2 each and a company carries out a one-for-ten reverse split. Ignoring fractional-share issues, the investor now has **20 shares** at a mechanical reference price of **20**. The holding is still worth **400** before other market changes.

FINRA describes forward and reverse splits as corporate actions and notes that a company may use a reverse split to meet a minimum listing-price requirement. The action changes units; it does not by itself establish that operating performance has improved. See [FINRA's corporate-actions guide](https://syndication.finra.org/content/corporate-actions-public-companies-what-you-should-know).

If the investor had 203 shares instead, dividing by ten would produce 20.3. The actual treatment of the fractional entitlement depends on the announced terms and the account's handling. Check the issuer and broker notices rather than assuming a particular cash payment or rounding rule.

## Separate a split from raising new capital

In our three-for-one example, every existing holder's share count scales by the same factor. Now compare a different transaction: a company with 1 million shares sells 250,000 additional shares to new investors. Someone holding 10,000 unchanged shares goes from **1% ownership to 0.8%**.

If those new shares are sold for 20 each, the company receives **5 million before fees**. That cash could affect business value, so the smaller ownership percentage does not by itself determine whether the original holder is better or worse off. The point is that new funding and a changed ownership fraction are different mechanics from a proportional split.

Label each transaction before calculating its effect. Ask whether new money entered the business, whether all holders received proportional shares and whether anyone sold existing shares. A large increase in share count can arise from very different events.

## Read an announcement without inventing a trading signal

1. **Find the ratio and effective terms.** Identify how many new units replace each old unit and how fractional entitlements are handled.
2. **Reconcile your holding.** Multiply the adjusted share count by a consistently adjusted price before interpreting a percentage change.
3. **Check the data basis.** A chart using adjusted historical prices is different from a record of the prices originally quoted on each day.
4. **Separate other news.** Earnings guidance, a dividend decision or a new financing announcement may arrive alongside the split.
5. **Explain any valuation claim.** Name the earnings, cash-flow or asset assumptions behind it instead of treating the split ratio as evidence.

## Check your reasoning

You own 24 shares at 150 each. A hypothetical five-for-one split occurs with no other change. How many shares do you own, what is the mechanical reference price and what is the holding worth?

You own **120 shares** at **30** each, worth **3,600**. If the next observed market price is 31, the holding is worth **3,720**. The extra 120 comes from the market price being above the split-adjusted reference, not from multiplying the number of shares alone. The distinction is arithmetic, not a forecast or a recommendation to trade around a split.`,
  },
  {
    id: "10000000-0000-4000-8000-000000000010",
    slug: "a-rising-stock-index-is-not-the-whole-economy",
    title: "Why a rising stock index is not the whole economy",
    summary: "Build a three-company index, compare weighting methods and distinguish a market return from a change in domestic production.",
    dek: "An index compresses selected market prices into one number. To understand what it says, inspect the companies, weights and return convention behind it.",
    difficulty: "beginner",
    readMinutes: 6,
    reviewedAt: "2026-10-11",
    sourceLabel: "Primary sources linked within the article; original hypothetical examples",
    relatedTerms: ["index", "market capitalization", "index weight", "GDP", "price return", "total return"],
    lab: "quantitative-finance-asset-pricing",
    tags: ["Markets", "Indices", "Explainers"],
    body: `# Why a rising stock index is not the whole economy

The stock market closes higher on a day when economic news looks weak. It is tempting to decide that one of the signals must be wrong. But a stock index and an economic statistic measure different things. Before explaining why they diverged, identify what each number actually contains.

An index follows a defined group of securities using specified calculation rules. It is a benchmark for the segment it represents, not a census of every business or household. Investor.gov's [market-indices guide](https://www.investor.gov/introduction-investing/investing-basics/glossary/market-indices) introduces that basic role.

## Build a market in three companies

Consider three fictional companies, A, B and C, with equity market capitalizations of **600 million, 300 million and 100 million**. Their total is 1 billion. In a simple full-market-capitalization-weighted index, their starting weights are **60%, 30% and 10%**.

Over one period, A's share price rises 10%, B is unchanged and C falls 20%. Assume no dividends, share-count changes, additions or removals. A adds 60 million in market value, B adds zero and C loses 20 million. The total becomes **1.04 billion**, a **4% increase**.

The same result comes from the starting weighted returns: 0.60 × 10% + 0.30 × 0% + 0.10 × minus 20% = 4%. If we set the initial index level to 1,000, the new level is **1,040**.

Only one of the three companies rose, yet the index rose. That is possible because the largest company had the greatest influence. “The index gained 4%” does not mean every constituent gained 4%, or even that most constituents rose.

## Change the weights, change the question

Give the same three companies equal starting weights instead. The one-period return is the average of 10%, 0% and minus 20%, which is approximately **minus 3.33%**. The underlying company returns are identical to the previous example. Only the weighting rule changed.

Neither calculation is a mathematical mistake. The first tracks the combined equity market value under our assumptions. The second gives each company the same initial influence regardless of size. If someone compares their results, they should explain that difference before treating the divergence as a mystery.

Real methodologies specify eligibility, weighting, maintenance and corporate-action treatment. Some capitalization-weighted indices adjust for shares available to public investors rather than using every outstanding share. S&P Dow Jones Indices explains why these design choices matter in [Methodology Matters](https://www.spglobal.com/spdji/en/research-insights/index-literacy/methodology-matters/).

Our three-company calculation omits those operational details. It is a teaching model for contribution arithmetic, not a reconstruction of a named index. A provider's published methodology is the appropriate starting point when studying an actual benchmark.

## A company's share price is not its weight in every index

Imagine one company with 1 million shares priced at 200 and another with 20 million shares priced at 20. The first has a higher unit price but an equity market value of **200 million**; the second has a value of **400 million**. In a simple capitalization-weighted two-company index, their weights are one-third and two-thirds.

Now split the first company's shares two-for-one. It has 2 million shares at a mechanical price of 100, still worth 200 million. Its capitalization weight stays the same in our model. A calculation that interpreted the halved unit price as a halving of company value would be mishandling the corporate action.

This is another reason to inspect methodology. A price-weighted index follows different rules from a capitalization-weighted one, and providers make specified adjustments for events such as splits. A familiar index name is not a substitute for knowing the calculation it represents.

## GDP measures production over a period

Gross domestic product measures the value of final goods and services produced within an economy during a specified period. The US Bureau of Economic Analysis describes the measure on its [GDP overview page](https://www.bea.gov/data/gdp/gross-domestic-product). It is a flow of domestic production, not the market price of a selected set of ownership claims.

Consider a fictional economy with a large unlisted restaurant sector and a small number of listed exporters. A share-price index containing the exporters could move strongly even if restaurant activity barely changes. The composition of the index and the composition of domestic production are different by construction.

Now suppose one exporter receives most of its sales abroad. A price change connected to those foreign prospects cannot automatically be read as a change in local household income. This is a hypothetical counterexample to a sweeping inference, not evidence about any actual country's market.

Even the time windows can differ. A daily index return compares two market observations; a quarterly GDP growth rate compares production across longer periods. Put the observation dates and units beside each number before drawing a causal connection between them.

## Price return and total return are different comparisons

In a one-share teaching example, start with a price of 100. End with a price of 103 and receive a cash dividend of 2 during the period. The price return is **3%**. The simple holding-period return including that cash is **5%**, before fees and taxes and without reinvesting the dividend.

A published total-return index applies its specified dividend-reinvestment convention. That makes it different from a price-only series. For a long comparison, check the series name and methodology rather than assuming that two lines called “market performance” include the same cash flows.

An index also differs from a fund tracking it. Fund fees, trading and tracking differences can affect the investor's result. Investor.gov explains the distinction in its [index-fund guide](https://www.investor.gov/introduction-investing/investing-basics/investment-products/mutual-funds-and-exchange-traded-4). A benchmark number is not a guaranteed account return.

## Turn a headline into a useful question

Ask which securities are included, which have the largest weights and which contributed most to the move. Then ask whether the story concerns a price return, a total return or an investor's return after costs. Keep a separate note for any claims about employment, output or household finances; those need evidence appropriate to those questions.

For our three-company example, a precise sentence is: “The capitalization-weighted index rose 4%, with A contributing six percentage points and C subtracting two.” That conveys more than “businesses did well.” It specifies what moved and how the parts add up.

## Check your reasoning

An index has two companies with starting weights of 80% and 20%. The larger falls 5%; the smaller rises 15%. There are no dividends or membership changes. What is the index return? What would an equal-weighted version return over that same period?

The capitalization-weighted result is **minus 1%**: minus four percentage points plus three. The equal-weighted result is **plus 5%**. The disagreement comes from weights, not conflicting company prices. Neither answer, on its own, tells you whether domestic production, wages or living standards rose.`,
  },
];
