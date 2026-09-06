import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  const toggle = () => {
    setTheme(dark ? "light" : "dark");
  };

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={dark}
      className="relative flex items-center justify-center rounded-full p-3 transition-all duration-300 hover:scale-110 active:scale-95 glass-card-liquid shadow-lg"
    >
      <span className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md transition-opacity duration-500 pointer-events-none" />

      <Sun
        className={`absolute h-5 w-5 text-yellow-400 transition-all duration-500 ${
          dark ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"
        }`}
      />
      <Moon
        className={`absolute h-5 w-5 text-indigo-400 transition-all duration-500 ${
          dark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"
        }`}
      />
    </button>
  );
}
