import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

function fail(message) {
  errors.push(message);
}

function walk(dir, files = []) {
  const absolute = path.join(root, dir);
  if (!fs.existsSync(absolute)) return files;
  for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", "dist", "coverage", "test-results"].includes(entry.name)) continue;
      walk(rel, files);
    } else {
      files.push(rel);
    }
  }
  return files;
}

const requiredFiles = [
  "FINAL_COMPLETION_REPORT.md",
  "SECURITY_AUDIT.md",
  "DATABASE_SETUP.md",
  "TEST_REPORT.md",
  "REMAINING_EXTERNAL_ACTIONS.md",
  "supabase/FINAL_SETUP.sql",
  "supabase/VERIFY_SETUP.sql",
];

for (const file of requiredFiles) {
  if (!exists(file)) fail(`Missing required release artifact: ${file}`);
}

const envExample = read(".env.example");
for (const key of ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY", "VITE_APP_URL"]) {
  if (!new RegExp(`^${key}=$`, "m").test(envExample)) {
    fail(`.env.example must declare ${key}= without a sample value`);
  }
}
if (/service_role|SUPABASE_SERVICE_ROLE_KEY/i.test(envExample)) {
  fail(".env.example must not include service-role or secret-key variables");
}

const migrationFiles = fs
  .readdirSync(path.join(root, "supabase/migrations"))
  .filter((file) => file.endsWith(".sql"))
  .sort();

const expectedSetup = [
  "-- FinanceMeta / Finance4All final consolidated Supabase setup.",
  "-- Generated from supabase/migrations/*.sql in filename order.",
  "-- Apply to a new Supabase project in SQL Editor, then run supabase/VERIFY_SETUP.sql.",
  "",
];

for (const file of migrationFiles) {
  expectedSetup.push("-- ============================================================");
  expectedSetup.push(`-- ${file}`);
  expectedSetup.push("-- ============================================================");
  expectedSetup.push(read(`supabase/migrations/${file}`).trim());
  expectedSetup.push("");
}

const finalSetup = read("supabase/FINAL_SETUP.sql");
if (finalSetup !== expectedSetup.join("\n")) {
  fail("supabase/FINAL_SETUP.sql is not synchronized with supabase/migrations/*.sql");
}

const verifySetup = read("supabase/VERIFY_SETUP.sql");
for (const requiredSnippet of [
  "expected_columns",
  "expected_indexes",
  "expected_triggers",
  "function_grant_checks",
  "storage-policy:avatars >= 4",
  "policy-count:public >= 55",
]) {
  if (!verifySetup.includes(requiredSnippet)) {
    fail(`supabase/VERIFY_SETUP.sql is missing check: ${requiredSnippet}`);
  }
}

const releaseDocs = [
  "README.md",
  "DEPLOYMENT.md",
  "DATABASE_SETUP.md",
  "SECURITY_AUDIT.md",
  "TEST_REPORT.md",
  "FINAL_COMPLETION_REPORT.md",
  "REMAINING_EXTERNAL_ACTIONS.md",
  ...walk("docs"),
  ...walk("supabase").filter((file) => file !== "supabase/FINAL_SETUP.sql"),
];

for (const file of releaseDocs) {
  const text = read(file);
  if (/010_public_claims|verify_migration_status|weekly_digest_sends/.test(text)) {
    fail(`Stale database reference in ${file}`);
  }
}

const productFiles = [...walk("src"), ...walk("public")].filter(
  (file) => !/\.(test|spec)\.(ts|tsx)$/.test(file),
);
const bannedProductClaims = [
  /25,000/,
  /500\+/,
  /Jane Street/i,
  /EconScholars/i,
  /IYERN/i,
  /S\.I\.S\.T\.E\.R/i,
  /Atlas Economics Lab/i,
  /href="#"/,
  /onClick=\{\(\) => \{\}\}/,
  /TODO|FIXME|NotImplemented|lorem ipsum/i,
];

for (const file of productFiles) {
  const text = read(file);
  for (const pattern of bannedProductClaims) {
    if (pattern.test(text)) {
      fail(`Release scan matched ${pattern} in ${file}`);
    }
  }
}

if (errors.length) {
  console.error("Final readiness failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Final readiness checks passed.");

