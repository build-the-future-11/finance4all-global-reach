import assert from "node:assert/strict";
import test from "node:test";
import { validateDatabaseTarget } from "../scripts/validate-database-target.mjs";

test("accepts canonical direct and pooler identities", () => {
  assert.equal(validateDatabaseTarget("postgresql://postgres:test@db.pnemeegkwyaicsbnbnmg.supabase.co:5432/postgres?sslmode=require"), true);
  assert.equal(validateDatabaseTarget("postgres://postgres.pnemeegkwyaicsbnbnmg:test@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"), true);
});
test("rejects project text hidden in foreign connections and TLS bypasses", () => {
  for (const url of [
    "postgres://postgres:pnemeegkwyaicsbnbnmg@evil.example/postgres",
    "postgres://postgres:test@db.pnemeegkwyaicsbnbnmg.supabase.co.evil.example/postgres",
    "postgres://postgres.foreign:test@aws-0-ap-south-1.pooler.supabase.com/postgres",
    "postgres://postgres:test@db.pnemeegkwyaicsbnbnmg.supabase.co/postgres?host=evil.example",
    "postgres://postgres:test@db.pnemeegkwyaicsbnbnmg.supabase.co/postgres?sslmode=disable",
  ]) assert.throws(() => validateDatabaseTarget(url));
});
