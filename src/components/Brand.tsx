export function BrandMark({ className = "" }: { className?: string }) {
  return <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true"><rect width="48" height="48" rx="14" fill="currentColor" /><path d="M13 34V14H34M13 24H29M23 34V24" stroke="var(--brand-ink, #d9ff8a)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="34" cy="34" r="3" fill="var(--brand-ink, #d9ff8a)" /></svg>;
}

export default function Brand() {
  return <span className="ffa-brand"><BrandMark /><span>Finance for All<small>Knowledge without barriers.</small></span></span>;
}
