import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

function validateProductionEnv(mode: string): Plugin {
  return {
    name: "validate-production-env",
    buildStart() {
      if (mode !== "production") return;

      const env = loadEnv(mode, process.cwd(), "");
      const missing: string[] = [];

      const supabaseUrl = env.VITE_SUPABASE_URL?.trim();
      if (!supabaseUrl?.startsWith("https://") || !supabaseUrl.includes("supabase.co")) {
        missing.push("VITE_SUPABASE_URL");
      }

      const anonKey = env.VITE_SUPABASE_ANON_KEY?.trim();
      if (!anonKey?.startsWith("eyJ")) {
        missing.push("VITE_SUPABASE_ANON_KEY");
      }

      const appUrl = env.VITE_APP_URL?.trim();
      if (!appUrl?.startsWith("https://")) {
        missing.push("VITE_APP_URL");
      }

      if (missing.length > 0) {
        throw new Error(
          `[Finance4All] Production build requires: ${missing.join(", ")}. See .env.example.`,
        );
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [validateProductionEnv(mode), react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          query: ["@tanstack/react-query"],
          supabase: ["@supabase/supabase-js"],
          radix: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
          ],
        },
      },
    },
  },
}));
