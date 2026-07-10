-- Seed data for Finance4All Portal (run after migration)
-- Safe to re-run: uses ON CONFLICT where applicable

INSERT INTO chapters (id, name, city, country, latitude, longitude, member_count) VALUES
  ('70000000-0000-4000-8000-000000000001', 'Mumbai', 'Mumbai', 'India', 19.076, 72.8777, 42),
  ('70000000-0000-4000-8000-000000000002', 'London', 'London', 'United Kingdom', 51.5074, -0.1278, 28),
  ('70000000-0000-4000-8000-000000000003', 'New York', 'New York', 'United States', 40.7128, -74.006, 35)
ON CONFLICT (id) DO NOTHING;

INSERT INTO news_articles (title, summary, category, tags) VALUES
  ('Fed signals patience on rate cuts amid sticky inflation', 'Central bankers emphasize data dependence as markets price in fewer 2026 cuts.', 'macro', ARRAY['fed', 'rates']),
  ('Tech IPO pipeline heats up for Q3', 'Several late-stage fintech and AI companies file confidentially with regulators.', 'ipo', ARRAY['ipo', 'fintech']),
  ('S&P 500 hits new high as megacap earnings beat', 'Index gains led by AI infrastructure names; breadth improves week-over-week.', 'markets', ARRAY['equities', 'earnings']),
  ('NVIDIA supplier raises guidance on data center demand', 'Company spotlight: key semiconductor player benefits from capex cycle.', 'company', ARRAY['semiconductors', 'ai'])
ON CONFLICT DO NOTHING;

INSERT INTO explainer_cards (slug, title, summary, body, difficulty, related_terms) VALUES
  (
    'what-is-an-ipo',
    'What is an IPO?',
    'How private companies go public and why it matters for markets.',
    E'An initial public offering (IPO) is when a private company sells shares to the public for the first time.\n\n**Why companies IPO:** Raise capital, provide liquidity for early investors, increase brand visibility, and use stock as currency for acquisitions.\n\n**Key steps:** Hire underwriters → file S-1 with regulators → roadshow → set price → list on exchange.\n\n**For investors:** IPOs can offer growth but carry valuation risk and lock-up dynamics.',
    'beginner',
    ARRAY['S-1', 'underwriter', 'listing']
  ),
  (
    'rate-cuts-explained',
    'Why do rate cuts matter?',
    'How central bank policy flows through borrowing costs, valuations, and sectors.',
    E'When a central bank cuts its policy rate, borrowing becomes cheaper across the economy.\n\n**Transmission channels:** Lower mortgage and corporate loan rates → higher spending and investment → supportive for asset prices (lower discount rates boost DCF valuations).\n\n**Sector effects:** Rate-sensitive sectors (real estate, utilities, growth tech) often outperform early in easing cycles.',
    'beginner',
    ARRAY['fed funds', 'yield curve', 'discount rate']
  ),
  (
    'sector-rotation',
    'What is sector rotation?',
    'How money moves between industries as the economic cycle evolves.',
    E'Sector rotation describes capital shifting from one part of the market to another based on macro conditions.\n\n**Early cycle:** Financials, industrials tend to lead.\n**Mid cycle:** Technology, consumer discretionary.\n**Late cycle:** Energy, materials.\n**Recession:** Defensives like healthcare and staples.',
    'intermediate',
    ARRAY['business cycle', 'factor investing']
  )
ON CONFLICT (slug) DO NOTHING;

INSERT INTO opportunities (title, organization, type, description, tags) VALUES
  ('Summer Markets Analyst Internship', 'Global Asset Partners', 'internship', 'Equity research internship focused on consumer and TMT coverage.', ARRAY['internship', 'research']),
  ('Finance4All Case Competition', 'Finance4All', 'challenge', 'Team-based valuation challenge with mentorship from industry judges.', ARRAY['competition', 'valuation']),
  ('YC-style Fintech Fellowship', 'Axiom Labs', 'program', '12-week program building payments infrastructure with weekly mentor sessions.', ARRAY['fintech', 'fellowship']),
  ('Research Assistant — EM Credit', 'University Research Group', 'project_role', 'Part-time role supporting sovereign credit analysis across LATAM.', ARRAY['credit', 'research'])
ON CONFLICT DO NOTHING;

INSERT INTO events (chapter_id, title, description, status, starts_at, registration_url, program_links) VALUES
  (
    '70000000-0000-4000-8000-000000000001',
    'IIT Finance Case Night',
    'Live case walkthrough with alumni mentors and networking.',
    'upcoming',
    now() + interval '14 days',
    'https://finance4all.org/events/iit-case-night',
    '[{"label": "Competition Brief", "url": "https://finance4all.org"}]'::jsonb
  ),
  (
    '70000000-0000-4000-8000-000000000002',
    'London Markets 101 Workshop',
    'Beginner workshop covering equities, fixed income, and career paths.',
    'upcoming',
    now() + interval '21 days',
    NULL,
    '[]'::jsonb
  )
ON CONFLICT DO NOTHING;

-- Meta Labs (requires at least one admin or lead_researcher profile)
INSERT INTO research_projects (title, description, status, lead_researcher_id, tags)
SELECT
  'Atlas Economics Lab: EM Growth & Inflation',
  'Student-led quantitative macro research on emerging-market growth and inflation dynamics.',
  'open',
  p.id,
  ARRAY['macro', 'economics', 'atlas']
FROM profiles p
WHERE p.role IN ('admin', 'lead_researcher')
  AND NOT EXISTS (SELECT 1 FROM research_projects WHERE title LIKE 'Atlas Economics%')
ORDER BY p.created_at
LIMIT 1;

INSERT INTO research_projects (title, description, status, lead_researcher_id, tags)
SELECT
  'IYERN: Cross-border capital flows',
  'Analyze capital flow patterns and policy responses across G20 economies.',
  'open',
  p.id,
  ARRAY['macro', 'flows', 'research']
FROM profiles p
WHERE p.role IN ('admin', 'lead_researcher')
  AND NOT EXISTS (SELECT 1 FROM research_projects WHERE title LIKE 'IYERN%')
ORDER BY p.created_at
LIMIT 1;

INSERT INTO research_projects (title, description, status, lead_researcher_id, tags)
SELECT
  'Fintech credit underwriting study',
  'Meta Labs project on alternative credit signals in consumer fintech.',
  'open',
  p.id,
  ARRAY['fintech', 'credit']
FROM profiles p
WHERE p.role IN ('admin', 'lead_researcher')
  AND NOT EXISTS (SELECT 1 FROM research_projects WHERE title LIKE 'Fintech credit%')
ORDER BY p.created_at
LIMIT 1;

-- Meta Labs (requires at least one admin or lead_researcher profile)
INSERT INTO research_projects (title, description, status, lead_researcher_id, tags)
SELECT
  'Atlas Economics Lab: EM Growth & Inflation',
  'Student-led quantitative macro research on emerging-market growth and inflation dynamics.',
  'open',
  p.id,
  ARRAY['macro', 'economics', 'atlas']
FROM profiles p
WHERE p.role IN ('admin', 'lead_researcher')
  AND NOT EXISTS (SELECT 1 FROM research_projects WHERE title LIKE 'Atlas Economics%')
ORDER BY p.created_at
LIMIT 1;

INSERT INTO research_projects (title, description, status, lead_researcher_id, tags)
SELECT
  'IYERN: Cross-border capital flows',
  'Analyze capital flow patterns and policy responses across G20 economies.',
  'open',
  p.id,
  ARRAY['macro', 'flows', 'research']
FROM profiles p
WHERE p.role IN ('admin', 'lead_researcher')
  AND NOT EXISTS (SELECT 1 FROM research_projects WHERE title LIKE 'IYERN%')
ORDER BY p.created_at
LIMIT 1;

INSERT INTO research_projects (title, description, status, lead_researcher_id, tags)
SELECT
  'Fintech credit underwriting study',
  'Meta Labs project on alternative credit signals in consumer fintech.',
  'open',
  p.id,
  ARRAY['fintech', 'credit']
FROM profiles p
WHERE p.role IN ('admin', 'lead_researcher')
  AND NOT EXISTS (SELECT 1 FROM research_projects WHERE title LIKE 'Fintech credit%')
ORDER BY p.created_at
LIMIT 1;
