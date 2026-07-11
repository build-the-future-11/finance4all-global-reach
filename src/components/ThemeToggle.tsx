import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const dark = mounted && resolvedTheme === "dark";

  const toggle = () => setTheme(dark ? "light" : "dark");

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "portal-focus-ring relative flex items-center justify-center rounded-full p-3",
        "glass-card-liquid shadow-lg transition-transform duration-300 hover:scale-110 active:scale-95",
      )}
    >
      <span className="pointer-events-none absolute inset-0 rounded-full bg-white/10 opacity-100 backdrop-blur-md transition-opacity duration-500" />

      <Sun
        className={cn(
          "absolute h-5 w-5 text-yellow-400 transition-all duration-500",
          dark ? "scale-75 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100",
        )}
        aria-hidden
      />
      <Moon
        className={cn(
          "absolute h-5 w-5 text-indigo-400 transition-all duration-500",
          dark ? "scale-100 rotate-0 opacity-100" : "scale-75 -rotate-90 opacity-0",
        )}
        aria-hidden
      />
    </button>
  );
}
