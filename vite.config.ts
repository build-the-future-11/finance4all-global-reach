import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/node_modules/react/") || id.includes("/node_modules/react-dom/") || id.includes("/node_modules/react-router-dom/")) {
            return "react-vendor";
          }
          if (id.includes("/node_modules/@supabase/")) {
            return "supabase-vendor";
          }
          if (id.includes("/node_modules/cmdk/") || id.includes("/node_modules/next-themes/") || id.includes("/node_modules/sonner/")) {
            return "ui-vendor";
          }
        },
      },
    },
  },
}));
