import { describe, expect, it } from "vitest";
import { createAccountExportDocument } from "@/lib/accountData";

describe("account export", () => {
  it("creates a versioned, timestamped export document", () => {
    const document = createAccountExportDocument(
      "7e2188a1-2d61-4a6c-91ac-fc4ac2b17f34",
      { savedDebriefs: [{ article_id: "article-1" }] },
      "2026-07-13T10:00:00.000Z",
    );

    expect(document).toEqual({
      format: "finance4all-account-export",
      version: 1,
      exportedAt: "2026-07-13T10:00:00.000Z",
      accountId: "7e2188a1-2d61-4a6c-91ac-fc4ac2b17f34",
      data: { savedDebriefs: [{ article_id: "article-1" }] },
    });
  });
});
