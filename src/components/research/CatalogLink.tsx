import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

export default function CatalogLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  if (href.startsWith("/") && !href.startsWith("//")) return <Link to={href} className={className}>{children}</Link>;
  if (!href.startsWith("https://")) return <span>{children}</span>;
  return <a href={href} className={className} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={15} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>;
}
