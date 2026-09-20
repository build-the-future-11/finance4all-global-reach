-- Seed data for Finance4All Portal (run after migration)
-- Safe to re-run: uses ON CONFLICT where applicable

-- Chapters, news, events, and opportunities are intentionally not seeded.
-- Public records must describe verified, currently owned work rather than demo data.

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

-- Opportunities are intentionally not seeded. Only a verified administrator may
-- publish a real application or program record with a current canonical URL.
