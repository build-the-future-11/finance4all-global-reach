import { Link } from "react-router-dom";

/** Public claims reconciled against the operating plan and current intake, 2026-10-16. */
export default function NetworkStory() {
  return <div className="iy-story">
    <section className="story-section" id="network" aria-labelledby="network-heading">
      <div className="story-heading"><p className="story-kicker">01 / A network built around inquiry</p><h2 id="network-heading">Good questions travel.<br /><em>Research grows together.</em></h2></div>
      <div className="story-prose"><p>The International Youth Economics Research Network connects emerging researchers with working papers, methods and careful discussion. FinanceMeta reports an ecosystem of 500+ researchers across quantitative finance, economics, investment modeling and financial education; that organizer-reported figure is shown without an attached public roster.</p><p>Within FinanceMeta, Labs organizes research, Finance4All supports financial education, and IYERN provides a publication pathway. A member account, research application and published manuscript are distinct records.</p></div>
    </section>
    <section className="story-section" id="cohort" aria-labelledby="cohort-heading">
      <div className="story-heading"><p className="story-kicker">02 / Develop the researcher</p><h2 id="cohort-heading">From interest<br /><em>to a scoped question.</em></h2></div>
      <div className="story-prose"><p>Start with the literature: what is known, where do explanations disagree, and what would count as useful evidence? Then choose a method, document its assumptions and compare alternatives.</p><p>The future fellowship and cohort pathways are collecting interest. Dates, eligibility, mentoring capacity and project assignments require separate confirmation. A careful replication or negative result can be a valuable final artifact.</p><Link className="story-link" to="/programs/research-fellowship">Explore the fellowship pathway <span aria-hidden="true">→</span></Link></div>
      <ol className="story-steps"><li><span>01</span><h3>Frame a question</h3><p>Read the literature, define the contribution and make the scope realistic.</p></li><li><span>02</span><h3>Build the evidence</h3><p>Freeze evaluation, record source provenance and test the assumptions.</p></li><li><span>03</span><h3>Discuss and revise</h3><p>Use review to strengthen analysis, interpretation and writing.</p></li><li><span>04</span><h3>Seek publication</h3><p>Prepare permissions, a versioned manuscript and an explicit limitations statement.</p></li></ol>
    </section>
    <section className="story-section" id="labs" aria-labelledby="labs-heading">
      <div className="story-heading"><p className="story-kicker">03 / Sustain the inquiry</p><h2 id="labs-heading">FinanceMeta Labs.<br /><em>Shared questions. Inspectable work.</em></h2></div>
      <div className="story-prose"><p>Labs connects quantitative finance, economic reasoning, computation and the institutions shaping financial access. The operating plan records active research with staffing and protocol controls still to be resolved before broader activation.</p><p>Explore each project's question, methodology, source date and limitations. A public repository is evidence of available code, not proof of a successful experiment or profitable strategy.</p><Link className="story-link" to="/research">Explore the research directory <span aria-hidden="true">→</span></Link></div>
    </section>
    <section className="story-section story-connections" id="community" aria-labelledby="community-heading">
      <div className="story-heading"><p className="story-kicker">04 / Participation with purpose</p><h2 id="community-heading">A contribution,<br /><em>with clear expectations.</em></h2></div>
      <div className="story-prose"><p>Researchers, editors, reviewers, educators and local organizers contribute in different ways. European and Gulf Finance Research Networks are being developed to turn regional interest into scoped projects and accountable working teams.</p><p>Chapter or network activation requires local permission, named owners and verified activity. Institutional relationships are described only when their scope is documented; a contact, individual affiliation or interest form is not an endorsement.</p><Link className="story-link" to="/programs/regional-research-networks">Explore regional network development <span aria-hidden="true">→</span></Link></div>
    </section>
  </div>;
}
