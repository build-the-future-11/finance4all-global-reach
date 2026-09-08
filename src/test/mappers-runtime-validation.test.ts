import { describe, expect, it } from "vitest";
import { mapChapter, mapNewsArticle, mapProfile } from "@/lib/mappers";

const timestamp = "2026-09-08T12:00:00+00:00";

describe("database row runtime validation", () => {
  it("accepts Supabase offset timestamps and an empty pre-onboarding display name", () => {
    const profile = mapProfile({
      id: "00000000-0000-4000-8000-000000000001",
      display_name: "",
      role: "member",
      bio: null,
      avatar_url: null,
      interests: [],
      open_to_collaborate: false,
      chapter_id: null,
      created_at: timestamp,
      updated_at: timestamp,
    });

    expect(profile.displayName).toBe("");
    expect(profile.createdAt).toBe(timestamp);
  });

  it("rejects malformed database identifiers instead of trusting static types", () => {
    expect(() =>
      mapNewsArticle({
        id: "not-a-uuid",
        title: "Title",
        summary: "Summary",
        category: "markets",
        source_url: null,
        published_at: timestamp,
        tags: [],
        created_at: timestamp,
      }),
    ).toThrow();
  });

  it("rejects impossible numeric chapter data", () => {
    expect(() =>
      mapChapter({
        id: "00000000-0000-4000-8000-000000000002",
        name: "Chapter",
        city: "City",
        country: "Country",
        latitude: 91,
        longitude: 0,
        member_count: 0,
        created_at: timestamp,
      }),
    ).toThrow();
  });
});
