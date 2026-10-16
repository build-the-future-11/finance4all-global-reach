export function BrandMark({ className = "" }: { className?: string }) {
  return <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true"><rect width="48" height="48" rx="14" fill="currentColor" /><path d="M13 34V14H34M13 24H29M23 34V24" stroke="var(--brand-ink, #d9ff8a)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="34" cy="34" r="3" fill="var(--brand-ink, #d9ff8a)" /></svg>;
}

/** Existing temporary artwork. See docs/BRAND_ASSET_VERIFICATION.md. */
export function BrandIdentity({ compact = false, className = "ffa-brand", subtitle = "Knowledge without barriers." }: { compact?: boolean; className?: string; subtitle?: string }) {
  return <span className={className} aria-label={compact ? "Finance for All" : undefined}><BrandMark className={compact ? "h-10 w-10" : undefined} />{!compact && <span><strong>Finance for All</strong><small>{subtitle}</small></span>}</span>;
}

export default function Brand() { return <BrandIdentity />; }
