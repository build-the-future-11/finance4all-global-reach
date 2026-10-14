import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import "@/styles/iyerj.css";

const categories = [
  ["quantitative-finance-econometrics", "Quantitative Finance & Econometrics", "Asset pricing, portfolio methods, financial data and the tools used to test economic relationships."],
  ["macroeconomics-public-policy", "Macroeconomics & Public Policy", "Inflation, growth, monetary and fiscal policy, institutions and the evaluation of policy choices."],
  ["development-financial-inclusion", "Development Economics & Financial Inclusion", "Access to finance, inequality, education, labor markets and evidence on economic opportunity."],
  ["behavioral-decision-science", "Behavioral Economics & Decision Science", "Judgment, incentives, financial behavior and the design of decision-making experiments."],
] as const;

export default function Iyerj() {
  useDocumentTitle("IYERJ — Journal & Research Forum");
  return (
    <div className="iyerj-page">
      <a className="iyerj-skip" href="#iyerj-main">Skip to content</a>
      <div className="iyerj-banner">In preparation · Manuscript submissions and forum posting are not open.</div>
      <div className="iyerj-wrap">
        <header>
          <a className="iyerj-brand" href="/">IYERJ<small>FINANCEMETA / FINANCE4ALL</small><span>Back to Finance for All</span></a>
          <nav aria-label="IYERJ navigation"><a href="#journal">Journal</a><a href="#forum">Forum</a><a href="#programs">Programs</a><a href="#standards">Standards</a></nav>
        </header>
        <main id="iyerj-main" tabIndex={-1}>
          <div className="iyerj-hero">
            <div><p className="iyerj-eyebrow">A place to ask better questions</p><h1>Economics and finance.<br />Built on evidence.</h1><p>A journal for developed research. A separate forum for work in progress. A community that takes the question, the method and the limitations seriously.</p><div className="iyerj-actions"><a className="iyerj-button" href="#journal">Explore the first issue</a><a href="#forum">Browse forum categories</a></div></div>
            <aside className="iyerj-issue" aria-label="Planned first issue"><span>IYERJ · First edition</span><time dateTime="2026-12-01">01 December<strong>2026</strong></time><p>Planned publication date. Article selection and editorial review are not yet complete.</p></aside>
          </div>
          <section id="journal" aria-labelledby="journal-heading"><p className="iyerj-eyebrow">01 / One flagship journal</p><h2 id="journal-heading">From a good question<br />to a defensible paper.</h2><div className="iyerj-grid"><div><p>The first edition is planned for 1 December 2026. IYERJ covers economics and finance within one journal, with room for original research, replication studies, evidence reviews and research notes.</p><p><strong>First edition in preparation.</strong> Published articles and the confirmed editorial roster will appear here when ready.</p><p>Submission instructions and an operational intake route will be announced separately. This page does not accept manuscripts.</p><a href="mailto:financeforalledu@gmail.com?subject=IYERJ%20editorial%20question">Ask an editorial question</a></div><ol className="iyerj-steps"><li><strong>Define the contribution.</strong> Explain the question, relevant work and what your study adds.</li><li><strong>Make the method inspectable.</strong> Document data, assumptions, comparisons and limitations.</li><li><strong>Review before publication.</strong> Screening, review, revision and final author approval remain distinct steps.</li></ol></div></section>
          <section id="forum" aria-labelledby="forum-heading"><p className="iyerj-eyebrow">02 / The research forum</p><h2 id="forum-heading">Four ways into the conversation.</h2><p>A separate home for preprints, working papers and discussion. Forum posting is not journal acceptance and must not be presented as peer review.</p><div className="iyerj-grid">{categories.map(([id, title, description], index) => <article className="iyerj-card" id={id} key={id}><span className="iyerj-eyebrow">0{index + 1}</span><h3>{title}</h3><p>{description}</p><span className="iyerj-status">Posting not yet open</span></article>)}</div><p className="iyerj-notice">No papers have been published through this page. Live posting will open only after the submission, moderation and privacy arrangements are ready.</p></section>
          <section id="programs" aria-labelledby="programs-heading"><p className="iyerj-eyebrow">03 / Research programs</p><h2 id="programs-heading">More ways to take part.</h2><div className="iyerj-grid"><article className="iyerj-card"><span className="iyerj-status">Applications coming soon</span><h3>IYER Research Fellowship</h3><p>Project scope, application details, contribution terms and review arrangements will be announced separately. No placement or mentorship is guaranteed.</p></article><article className="iyerj-card"><span className="iyerj-status">In planning</span><h3>Global Research Challenge</h3><p>The challenge brief, timing, eligibility and confirmed collaborators will be announced after agreement.</p></article></div></section>
          <section id="standards" aria-labelledby="standards-heading"><p className="iyerj-eyebrow">04 / Clear standards</p><h2 id="standards-heading">Know what you are reading.</h2><details><summary>Is a forum preprint peer-reviewed?</summary><p>No. Moderation can check suitability and obvious problems, but it is not a substitute for substantive research review.</p></details><details><summary>Does submitting guarantee publication?</summary><p>No. Submission, screening, review and acceptance are separate. A review submission is not blanket permission to publish an author's work.</p></details><details><summary>What about negative or inconclusive findings?</summary><p>The proposed author guidelines welcome careful negative, null and replication findings. Claims must match the evidence and limitations must remain visible.</p></details><details><summary>What should authors disclose?</summary><p>Data sources and availability, conflicts of interest, relevant permissions, contributor roles and material use of AI tools. Authors remain responsible for checking their work.</p></details></section>
        </main>
        <footer><p><strong>IYERJ · FinanceMeta / Finance4All</strong><br />Journal and research forum in preparation. This page adds no upload form or publication service.</p><a href="#iyerj-main">Back to top ↑</a></footer>
      </div>
    </div>
  );
}
