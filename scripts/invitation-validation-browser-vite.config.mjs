import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: resolve("browser-fixtures"),
  plugins: [react()],
  resolve: { alias: { "@": resolve("src") } },
});
