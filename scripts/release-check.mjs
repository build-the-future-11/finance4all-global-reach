import { spawnSync } from "node:child_process";

const npm = process.platform === "win32" ? "npm.cmd" : "npm";

const buildEnv = {
  ...process.env,
  VITE_APP_URL: process.env.VITE_APP_URL || "https://finance4all.test",
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || "https://finance4all-ci.supabase.co",
  VITE_SUPABASE_ANON_KEY:
    process.env.VITE_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpbmFuY2U0YWxsLWNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.finance4all-ci-build-only",
};

const steps = [
  ["run", "lint"],
  ["run", "typecheck"],
  ["test"],
  ["run", "build", buildEnv],
  ["run", "release:static"],
];

for (const step of steps) {
  const [first, second, env] = step;
  const args = second ? [first, second] : [first];
  const result = spawnSync(npm, args, {
    cwd: process.cwd(),
    env: env || process.env,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("Release check passed.");

