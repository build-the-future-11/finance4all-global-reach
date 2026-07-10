import { cn } from "@/lib/utils";
import type { PasswordStrength } from "@/lib/security";

const COLORS: Record<PasswordStrength, string> = {
  weak: "bg-red-400",
  fair: "bg-amber-400",
  good: "bg-emerald-400",
  strong: "bg-emerald-300",
};

const LABELS: Record<PasswordStrength, string> = {
  weak: "Weak",
  fair: "Fair",
  good: "Good",
  strong: "Strong",
};

export default function PasswordStrengthMeter({
  strength,
  hints,
}: {
  strength: PasswordStrength;
  hints: string[];
}) {
  const segments = 4;
  const filled =
    strength === "weak" ? 1 : strength === "fair" ? 2 : strength === "good" ? 3 : 4;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i < filled ? COLORS[strength] : "bg-white/10",
            )}
          />
        ))}
      </div>
      <p className="text-xs text-white/45">
        Strength: <span className="text-white/70">{LABELS[strength]}</span>
        {hints.length > 0 && ` · ${hints[0]}`}
      </p>
    </div>
  );
}
