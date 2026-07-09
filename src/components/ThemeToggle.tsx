import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  // Initialize theme based on localStorage or system preference
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (stored === "dark" || (!stored && prefersDark)) {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggle = () => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="relative flex items-center justify-center rounded-full p-3 transition-all duration-300 hover:scale-110 active:scale-95 glass-card-liquid shadow-lg"
    >
      {/* Animated background blur */}
      <span className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md transition-opacity duration-500 pointer-events-none" />

      {/* Icons with fade/rotate transition */}
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
