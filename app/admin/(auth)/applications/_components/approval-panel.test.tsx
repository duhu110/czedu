import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApprovalPanel } from "./approval-panel";

const {
  refreshMock,
  updateApplicationStatusMock,
  toastErrorMock,
  toastSuccessMock,
} = vi.hoisted(() => ({
  refreshMock: vi.fn(),
  updateApplicationStatusMock: vi.fn(),
  toastErrorMock: vi.fn(),
  toastSuccessMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}));

vi.mock("@/app/actions/application", () => ({
  updateApplicationStatus: updateApplicationStatusMock,
}));

vi.mock("sonner", () => ({
  toast: {
    error: toastErrorMock,
    success: toastSuccessMock,
  },
}));

describe("ApprovalPanel", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    refreshMock.mockReset();
    updateApplicationStatusMock.mockReset();
    toastErrorMock.mockReset();
    toastSuccessMock.mockReset();
  });

  it("blocks approval when targetSchool is empty", () => {
    render(
      <ApprovalPanel
        applicationId="app-1"
        currentStatus="PENDING"
        currentRemark={null}
        currentTargetSchool={null}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "通过申请" }));

    expect(toastErrorMock).toHaveBeenCalledWith("通过申请时请填写目标学校");
    expect(updateApplicationStatusMock).not.toHaveBeenCalled();
  });

  it("submits targetSchool when approving", async () => {
    updateApplicationStatusMock.mockResolvedValue({
      success: true,
      error: null,
    });

    render(
      <ApprovalPanel
        applicationId="app-1"
        currentStatus="PENDING"
        currentRemark={null}
        currentTargetSchool={null}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("例如：城中区第一小学"), {
      target: { value: "城中区第一小学" },
    });
    fireEvent.click(screen.getByRole("button", { name: "通过申请" }));

    await waitFor(() => {
      expect(updateApplicationStatusMock).toHaveBeenCalledWith(
        "app-1",
        "APPROVED",
        "",
        "城中区第一小学",
      );
    });
    expect(toastSuccessMock).toHaveBeenCalledWith("审核状态已更新");
    expect(refreshMock).toHaveBeenCalled();
  });
});
