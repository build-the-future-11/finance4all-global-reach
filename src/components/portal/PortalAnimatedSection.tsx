import { useScrollReveal, type SpringOptions } from "@/hooks/useScrollReveal";
import { cn } from "@/lib/utils";

interface PortalAnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  options?: Omit<SpringOptions, "delay">;
}

export default function PortalAnimatedSection({
  children,
  className,
  delay = 0,
  options,
}: PortalAnimatedSectionProps) {
  const ref = useScrollReveal({ delay, distance: 20, ...options });

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
