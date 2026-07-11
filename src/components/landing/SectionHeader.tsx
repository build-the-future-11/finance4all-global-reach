import type { ReactNode } from "react";
import { landingEyebrowClass } from "@/components/portal/PortalUI";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  className = "",
}: SectionHeaderProps) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <header className={cn("max-w-3xl", alignClass, className)}>
      <p className={landingEyebrowClass}>
        {eyebrow}
      </p>
      <h2 className="mt-4 text-balance text-3xl font-bold leading-[1.12] tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-balance text-base leading-relaxed text-white/55 sm:text-lg">
          {description}
        </p>
      )}
    </header>
  );
}
