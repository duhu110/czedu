import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  verifyApplicationAccess: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("@/app/actions/application-access", () => ({
  verifyApplicationAccess: mocks.verifyApplicationAccess,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mocks.refresh,
  }),
}));

describe("application access guard", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the guard dialog open by default", async () => {
    const { ApplicationAccessGuard } = await import(
      "@/app/application/_components/application-access-guard"
    );

    render(
      <ApplicationAccessGuard
        applicationId="app-1"
        phonePreviews={[{ prefix: "1380000", suffix: "" }]}
      />,
    );

    const dialog = screen.getByRole("dialog");

    expect(within(dialog).getByText("申请信息验证")).toBeInTheDocument();
    expect(
      within(dialog).getByText("请输入监护人手机号后四位后查看申请信息"),
    ).toBeInTheDocument();
    expect(within(dialog).getByText("1380000")).toBeInTheDocument();
    expect(within(dialog).getAllByRole("textbox")).toHaveLength(4);
    expect(
      within(dialog).getByLabelText("手机号后四位第 1 位"),
    ).toHaveAttribute("maxlength", "1");
  });

  it("switches between guardian phone previews when multiple numbers are available", async () => {
    const { ApplicationAccessGuard } = await import(
      "@/app/application/_components/application-access-guard"
    );

    render(
      <ApplicationAccessGuard
        applicationId="app-1"
        phonePreviews={[
          { prefix: "1380000", suffix: "" },
          { prefix: "1390000", suffix: "" },
        ]}
      />,
    );

    const dialog = within(screen.getByRole("dialog"));

    expect(dialog.getByText("1380000")).toBeInTheDocument();
    expect(dialog.queryByText("1390000")).not.toBeInTheDocument();

    fireEvent.click(
      dialog.getByRole("radio", {
        name: "监护人 2",
      }),
    );

    expect(dialog.getByText("1390000")).toBeInTheDocument();
    expect(dialog.queryByText("1380000")).not.toBeInTheDocument();
  });

  it("refreshes the route after successful verification", async () => {
    mocks.verifyApplicationAccess.mockResolvedValueOnce({
      success: true,
      error: null,
      remainingAttempts: 2,
      lockedUntil: null,
    });

    const { ApplicationAccessGuard } = await import(
      "@/app/application/_components/application-access-guard"
    );

    render(
      <ApplicationAccessGuard
        applicationId="app-2"
        phonePreviews={[{ prefix: "1380000", suffix: "" }]}
      />,
    );

    const dialog = within(screen.getByRole("dialog"));
    fireEvent.change(dialog.getByLabelText("手机号后四位第 1 位"), {
      target: { value: "1" },
    });
    fireEvent.change(dialog.getByLabelText("手机号后四位第 2 位"), {
      target: { value: "2" },
    });
    fireEvent.change(dialog.getByLabelText("手机号后四位第 3 位"), {
      target: { value: "3" },
    });
    fireEvent.change(dialog.getByLabelText("手机号后四位第 4 位"), {
      target: { value: "4" },
    });
    fireEvent.click(
      dialog.getByRole("button", {
        name: "验证并查看",
      }),
    );

    await waitFor(() => {
      expect(mocks.refresh).toHaveBeenCalledTimes(1);
    });
  });

  it("enters a locked state after the server reports lockout", async () => {
    mocks.verifyApplicationAccess.mockResolvedValueOnce({
      success: false,
      error: "当前申请暂时无法验证，请 1 小时后再试",
      remainingAttempts: 0,
      lockedUntil: new Date(Date.now() + 60 * 60 * 1000),
    });

    const { ApplicationAccessGuard } = await import(
      "@/app/application/_components/application-access-guard"
    );

    render(
      <ApplicationAccessGuard
        applicationId="app-3"
        phonePreviews={[{ prefix: "1380000", suffix: "" }]}
      />,
    );

    const dialog = within(screen.getByRole("dialog"));
    fireEvent.change(dialog.getByLabelText("手机号后四位第 1 位"), {
      target: { value: "0" },
    });
    fireEvent.change(dialog.getByLabelText("手机号后四位第 2 位"), {
      target: { value: "0" },
    });
    fireEvent.change(dialog.getByLabelText("手机号后四位第 3 位"), {
      target: { value: "0" },
    });
    fireEvent.change(dialog.getByLabelText("手机号后四位第 4 位"), {
      target: { value: "0" },
    });
    fireEvent.click(
      dialog.getByRole("button", {
        name: "验证并查看",
      }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("当前申请暂时无法验证，请 1 小时后再试"),
      ).toBeInTheDocument();
    });
    expect(
      dialog.getByRole("button", {
        name: "暂时不可验证",
      }),
    ).toBeDisabled();
  });
});
