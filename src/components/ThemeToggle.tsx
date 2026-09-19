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
      className="portal-icon-button relative flex h-10 w-10 items-center justify-center rounded-full transition active:scale-95"
    >
      <Sun
        className={`absolute h-[18px] w-[18px] text-amber-500 transition-all duration-300 ${
          dark ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"
        }`}
      />
      <Moon
        className={`absolute h-[18px] w-[18px] text-blue-500 transition-all duration-300 ${
          dark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"
        }`}
      />
    </button>
  );
}
