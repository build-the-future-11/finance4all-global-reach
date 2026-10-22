import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, expect, it, vi } from "vitest";
import EditorialDraftImport from "@/components/portal/EditorialDraftImport";

const state = vi.hoisted(() => ({ role: "admin", sessionUser: "admin-a", insert: vi.fn(), headers: vi.fn(), response: {} as unknown }));
vi.mock("@/contexts/useAuth", () => ({ useAuth: () => ({ user: { id: "admin-a" }, profile: { role: state.role } }) }));
vi.mock("@/lib/supabase", () => ({ supabase: {
  auth: { getSession: async () => ({ data: { session: { user: { id: state.sessionUser }, access_token: "checked-admin-token" } }, error: null }) },
  from: () => ({ insert: (value: unknown) => { state.insert(value); return { select: () => ({ single: () => ({ setHeader: async (key: string, value: string) => { state.headers(key, value); return { data: state.response, error: null }; } }) }) }; } }),
} }));
const source = { title: "Private example", url: "https://docs.google.com/document/d/example/edit", modifiedAt: "2026-09-19T10:28:23.651Z", content: "Private review notes remain in the package." };
const draft = { format: "finance-debriefed-draft-v1", state: "editorial-draft", source, claimPack: source, article: { slug: "example-draft", title: "Example draft", summary: "An example educational draft awaiting editorial review.", body: "Draft text only. ".repeat(20), difficulty: "beginner", related_terms: [] }, requiredReviews: ["Research and rights review"] };
function mount() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(<QueryClientProvider client={client}><EditorialDraftImport /></QueryClientProvider>);
}
async function chooseDraft() {
  fireEvent.change(screen.getByLabelText(/Draft package/), { target: { files: [{ size: 2000, text: async () => JSON.stringify(draft) }] } });
  await waitFor(() => expect(screen.getByText("Example draft")).toBeInTheDocument());
}
beforeEach(() => {
  vi.clearAllMocks(); state.role = "admin"; state.sessionUser = "admin-a";
  state.response = { id: "new-draft", slug: "example-draft", publication_state: "draft", publication_revision: 0 };
});
it("is not exposed to ordinary members", () => {
  state.role = "member"; mount();
  expect(screen.queryByLabelText(/Draft package/)).not.toBeInTheDocument();
});
it("requires explicit import, writes only content fields and pins the checked admin token", async () => {
  mount(); await chooseDraft();
  expect(state.insert).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText("Import as unpublished draft"));
  await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Draft imported"));
  expect(state.insert).toHaveBeenCalledWith(draft.article);
  expect(state.headers).toHaveBeenCalledWith("Authorization", "Bearer checked-admin-token");
  expect(JSON.stringify(state.insert.mock.calls)).not.toContain(source.content);
});
it("refuses to report a published receipt as a safe draft import", async () => {
  state.response = { id: "bad", slug: "example-draft", publication_state: "published", publication_revision: 1 };
  mount(); await chooseDraft(); fireEvent.click(screen.getByText("Import as unpublished draft"));
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("could not be confirmed"));
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});
it("stops an account switch before insertion", async () => {
  state.sessionUser = "other-admin";
  mount(); await chooseDraft(); fireEvent.click(screen.getByText("Import as unpublished draft"));
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("account changed"));
  expect(state.insert).not.toHaveBeenCalled();
});
