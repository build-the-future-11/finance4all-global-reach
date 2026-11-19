import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CollaborationInvitationForm from "@/components/portal/CollaborationInvitationForm";

afterEach(cleanup);

describe("collaboration invitation form validation", () => {
  it("rejects a malformed 36-character member ID before invoking the mutation", async () => {
    const onInvite = vi.fn();
    render(<CollaborationInvitationForm onInvite={onInvite} pending={false} />);
    const input = screen.getByLabelText("Member account ID");
    fireEvent.change(input, { target: { value: "------------------------------------" } });
    fireEvent.submit(screen.getByRole("button", { name: "Create invitation" }).closest("form")!);

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("valid member account ID"));
    expect(onInvite).not.toHaveBeenCalled();
    expect(input).toHaveValue("------------------------------------");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveFocus();
    expect(input).toHaveAccessibleDescription("Choose a valid member account ID from the member’s profile URL.");
  });

  it("keeps a newer member draft and identifies the earlier failed invitation", async () => {
    let rejectInvitation: (error: Error) => void = () => undefined;
    const onInvite = vi.fn(() => new Promise((_, reject) => { rejectInvitation = reject; }));
    render(<CollaborationInvitationForm onInvite={onInvite} pending={false} />);
    const input = screen.getByLabelText("Member account ID");
    const button = screen.getByRole("button", { name: "Create invitation" });
    const firstMember = "10000000-0000-4000-8000-000000000092";
    const nextMember = "10000000-0000-4000-8000-000000000093";

    fireEvent.change(input, { target: { value: firstMember } });
    fireEvent.submit(button.closest("form")!);
    await waitFor(() => expect(onInvite).toHaveBeenCalledWith(firstMember));
    fireEvent.change(input, { target: { value: nextMember } });
    await act(async () => rejectInvitation(new Error("Invitation service unavailable.")));

    expect(input).toHaveValue(nextMember);
    expect(screen.getByRole("alert")).toHaveTextContent(firstMember);
    expect(screen.getByRole("alert")).toHaveTextContent("newer edits have not been submitted");
  });
});
