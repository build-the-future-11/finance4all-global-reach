import { pathToFileURL } from "node:url";

const PROJECT = "pnemeegkwyaicsbnbnmg";

export function validateDatabaseTarget(value) {
  let url;
  try { url = new URL(value); } catch { throw new Error("Invalid database connection URL"); }
  const direct = url.hostname === `db.${PROJECT}.supabase.co` && decodeURIComponent(url.username) === "postgres";
  const pooler = /^aws-[0-9]+-[a-z0-9-]+\.pooler\.supabase\.com$/.test(url.hostname)
    && decodeURIComponent(url.username) === `postgres.${PROJECT}`;
  if (!["postgres:", "postgresql:"].includes(url.protocol) || (!direct && !pooler)
    || url.pathname !== "/postgres" || url.hash || (url.port && !["5432", "6543"].includes(url.port))) {
    throw new Error("Database connection does not identify the canonical FinanceMeta project");
  }
  if ([...url.searchParams.keys()].some((key) => key !== "sslmode")
    || (url.searchParams.has("sslmode") && !["require", "verify-ca", "verify-full"].includes(url.searchParams.get("sslmode")))) {
    throw new Error("Database connection must use TLS without routing overrides");
  }
  return true;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  validateDatabaseTarget(process.env.FINANCEMETA_DATABASE_URL);
  console.log("Canonical database target verified");
}
