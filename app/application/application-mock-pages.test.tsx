import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { pushMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

import ApplicationConfirmationPage from "./confirmation/[id]/page";
import ApplicationPendingPage from "./pending/[id]/page";
import ApplicationSupplementPage from "./supplement/[id]/page";

describe("application mock pages", () => {
  beforeEach(() => {
    pushMock.mockReset();
  });

  it("renders pending page with embedded mock applicant info and application route", () => {
    render(<ApplicationPendingPage />);

    expect(screen.getByText("张三")).toBeDefined();
    expect(screen.getByText("G2024001234")).toBeDefined();
    expect(screen.getByText("ZX20260406001")).toBeDefined();
    expect(screen.getByRole("link", { name: /查看审核结果/ })).toHaveAttribute(
      "href",
      "/application/confirmation",
    );
  });

  it("routes confirmation page forward to supplement after all required notices are confirmed", async () => {
    render(<ApplicationConfirmationPage />);

    const readButtons = screen.getAllByRole("button", { name: "阅读全文" });

    for (const button of readButtons.slice(0, 3)) {
      fireEvent.click(button);
      fireEvent.click(screen.getByRole("button", { name: "我已阅读" }));
    }

    const checkboxes = screen.getAllByRole("checkbox");
    for (const checkbox of checkboxes.slice(0, 3)) {
      fireEvent.click(checkbox);
    }

    fireEvent.click(screen.getByRole("button", { name: /确认并补充材料/ }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/application/supplement");
    });
  });

  it("routes supplement page back to application routes", async () => {
    render(<ApplicationSupplementPage />);

    fireEvent.click(screen.getByRole("button", { name: "返回确认结果" }));

    expect(pushMock).toHaveBeenCalledWith("/application/confirmation");

    pushMock.mockReset();

    const fileInputs =
      document.querySelectorAll<HTMLInputElement>('input[type="file"]');

    for (const input of Array.from(fileInputs).slice(0, 4)) {
      fireEvent.change(input, {
        target: {
          files: [new File(["demo"], "demo.png", { type: "image/png" })],
        },
      });
    }

    fireEvent.click(screen.getByRole("button", { name: "提交材料" }));
    fireEvent.click(screen.getByRole("button", { name: "返回首页" }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/application");
    });
  });
});
