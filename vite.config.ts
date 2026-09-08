import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
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
          if (!id.includes("/node_modules/")) return undefined;
          if (/\/node_modules\/(react|react-dom|react-router|react-router-dom)\//.test(id)) {
            return "react-vendor";
          }
          if (id.includes("/node_modules/@supabase/")) return "supabase-vendor";
          if (/\/node_modules\/(cmdk|next-themes|sonner)\//.test(id)) return "ui-vendor";
          return undefined;
        },
      },
    },
  },
});
