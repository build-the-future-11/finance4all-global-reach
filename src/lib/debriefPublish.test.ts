import { describe, expect, it } from "vitest";
import {
  assertCanPublish,
  canTransitionToStatus,
  DEBRIEF_DISCLAIMER_VERSION,
} from "@/lib/debriefPublish";
import { prepareDebriefAiQueue, getDebriefAiAdapterStatus } from "@/lib/debriefAiAdapter";

describe("debrief publish guards", () => {
  it("rejects publish without approved source", () => {
    const result = canTransitionToStatus({
      status: "published",
      sourceId: null,
      aiAssisted: false,
    });
    expect(result.ok).toBe(false);
    expect(result.errors[0]).toMatch(/approved source/i);
  });

  it("rejects inactive approved source", () => {
    const result = canTransitionToStatus({
      status: "published",
      sourceId: "11111111-1111-1111-1111-111111111111",
      sourceIsActive: false,
      aiAssisted: false,
    });
    expect(result.ok).toBe(false);
  });

  it("allows publish with active source", () => {
    const result = canTransitionToStatus({
      status: "published",
      sourceId: "11111111-1111-1111-1111-111111111111",
      sourceIsActive: true,
      aiAssisted: false,
    });
    expect(result.ok).toBe(true);
  });

  it("rejects AI-assisted publish without generation log", () => {
    expect(() =>
      assertCanPublish({
        status: "published",
        sourceId: "11111111-1111-1111-1111-111111111111",
        sourceIsActive: true,
        aiAssisted: true,
        aiLogId: null,
      }),
    ).toThrow(/generation log/i);
  });

  it("allows AI-assisted publish with log marked for publish", () => {
    const result = canTransitionToStatus({
      status: "published",
      sourceId: "11111111-1111-1111-1111-111111111111",
      sourceIsActive: true,
      aiAssisted: true,
      aiLogId: "22222222-2222-2222-2222-222222222222",
      aiLogUsedInPublish: true,
    });
    expect(result.ok).toBe(true);
  });

  it("allows drafts without a source", () => {
    const result = canTransitionToStatus({
      status: "draft",
      sourceId: null,
      aiAssisted: false,
    });
    expect(result.ok).toBe(true);
  });

  it("exposes disclaimer version constant", () => {
    expect(DEBRIEF_DISCLAIMER_VERSION).toBe("edu-not-advice-v1");
  });
});

describe("debrief AI adapter", () => {
  it("reports unconfigured in the browser", () => {
    expect(getDebriefAiAdapterStatus()).toBe("unconfigured");
  });

  it("refuses queueing without sources", () => {
    expect(() => prepareDebriefAiQueue({ prompt: "Summarize", sourceIds: [] })).toThrow(/source/i);
  });

  it("hashes prompts for queueing when sources exist", () => {
    const prepared = prepareDebriefAiQueue({
      prompt: "Summarize the Fed decision",
      sourceIds: ["11111111-1111-1111-1111-111111111111"],
    });
    expect(prepared.status).toBe("unconfigured");
    expect(prepared.promptHash.startsWith("p")).toBe(true);
  });
});
