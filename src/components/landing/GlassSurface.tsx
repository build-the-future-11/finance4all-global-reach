import type { ReactNode } from "react";
import { useRef, type MouseEvent } from "react";

interface GlassSurfaceProps {
  children: ReactNode;
  className?: string;
  strong?: boolean;
  interactive?: boolean;
}

export default function GlassSurface({
  children,
  className = "",
  strong = false,
  interactive = true,
}: GlassSurfaceProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!interactive || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    ref.current.style.setProperty("--mx", `${x}%`);
    ref.current.style.setProperty("--my", `${y}%`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={`${strong ? "landing-glass-strong" : "landing-glass"} ${className}`}
    >
      {children}
    </div>
  );
}
