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
  pushMock,
  updateApplicationStatusMock,
  deleteApplicationMock,
  toastErrorMock,
  toastSuccessMock,
  triggerPrintMock,
} = vi.hoisted(() => ({
  refreshMock: vi.fn(),
  pushMock: vi.fn(),
  updateApplicationStatusMock: vi.fn(),
  deleteApplicationMock: vi.fn(),
  toastErrorMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  triggerPrintMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock,
    push: pushMock,
  }),
}));

vi.mock("@/app/actions/application", () => ({
  updateApplicationStatus: updateApplicationStatusMock,
  deleteApplication: deleteApplicationMock,
}));

vi.mock("sonner", () => ({
  toast: {
    error: toastErrorMock,
    success: toastSuccessMock,
  },
}));

vi.mock("./print-context", () => ({
  usePrintContext: () => ({
    maskPhone: false,
    triggerPrint: triggerPrintMock,
  }),
}));

vi.mock("./reject-edit-dialog", () => ({
  RejectEditDialog: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("./edit-qrcode-dialog", () => ({
  EditQrcodeDialog: () => null,
}));

vi.mock("@/lib/school-matching", () => ({
  getRecommendedSchool: () => null,
  getSchoolNames: () => ["西关街小学", "水井巷小学", "南山路小学"],
}));

const baseProps = {
  applicationId: "app-1",
  currentRemark: null as string | null,
  currentTargetSchool: null as string | null,
  residencyType: "LOCAL" as const,
  updatedAt: new Date("2026-04-08T10:00:00+08:00"),
  hukouAddress: "城中区南关街25号",
  livingAddress: "城中区南关街25号",
};

describe("ApprovalPanel", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    refreshMock.mockReset();
    pushMock.mockReset();
    updateApplicationStatusMock.mockReset();
    deleteApplicationMock.mockReset();
    toastErrorMock.mockReset();
    toastSuccessMock.mockReset();
    triggerPrintMock.mockReset();
  });

  // ============ PENDING 状态 ============

  it("disables approval button when targetSchool is empty", () => {
    render(
      <ApprovalPanel {...baseProps} currentStatus="PENDING" />,
    );

    const approveBtn = screen.getByRole("button", { name: "通过申请" });
    expect(approveBtn).toBeDisabled();
    expect(updateApplicationStatusMock).not.toHaveBeenCalled();
  });

  it("renders PENDING status with all action buttons", () => {
    render(
      <ApprovalPanel {...baseProps} currentStatus="PENDING" />,
    );

    expect(screen.getByRole("button", { name: "通过申请" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "打回补充" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "驳回修改" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "驳回申请" })).toBeInTheDocument();
  });

  it("renders school combobox for PENDING status", () => {
    render(
      <ApprovalPanel {...baseProps} currentStatus="PENDING" />,
    );

    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("blocks rejection when remark is empty", () => {
    render(
      <ApprovalPanel {...baseProps} currentStatus="PENDING" />,
    );

    fireEvent.click(screen.getByRole("button", { name: "驳回申请" }));

    expect(toastErrorMock).toHaveBeenCalledWith("请填写审核备注告知家长原因");
    expect(updateApplicationStatusMock).not.toHaveBeenCalled();
  });

  it("submits approval with selected school", async () => {
    updateApplicationStatusMock.mockResolvedValue({
      success: true,
      error: null,
    });

    render(
      <ApprovalPanel
        {...baseProps}
        currentStatus="PENDING"
        currentTargetSchool="西关街小学"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "通过申请" }));

    await waitFor(() => {
      expect(updateApplicationStatusMock).toHaveBeenCalledWith(
        "app-1",
        "APPROVED",
        "",
        "西关街小学",
      );
    });
    expect(toastSuccessMock).toHaveBeenCalledWith("审核状态已更新");
    expect(refreshMock).toHaveBeenCalled();
  });

  // ============ APPROVED 状态 ============

  it("renders APPROVED status with pass time and remark", () => {
    render(
      <ApprovalPanel
        {...baseProps}
        currentStatus="APPROVED"
        currentTargetSchool="西关街小学"
        currentRemark="审核通过"
      />,
    );

    expect(screen.getByText("通过时间")).toBeInTheDocument();
    expect(screen.getByText("审核通过")).toBeInTheDocument();
    expect(screen.getByText("西关街小学")).toBeInTheDocument();
  });

  it("hides action buttons for APPROVED status", () => {
    render(
      <ApprovalPanel
        {...baseProps}
        currentStatus="APPROVED"
        currentTargetSchool="西关街小学"
      />,
    );

    expect(screen.queryByRole("button", { name: "通过申请" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "驳回申请" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("审核备注")).not.toBeInTheDocument();
  });

  // ============ REJECTED 状态 ============

  it("renders REJECTED status with rejection time", () => {
    render(
      <ApprovalPanel
        {...baseProps}
        currentStatus="REJECTED"
        currentRemark="材料不符"
      />,
    );

    expect(screen.getByText("拒绝时间")).toBeInTheDocument();
    expect(screen.getByText("材料不符")).toBeInTheDocument();
  });

  // ============ SUPPLEMENT 状态 ============

  it("renders SUPPLEMENT status with warning", () => {
    render(
      <ApprovalPanel
        {...baseProps}
        currentStatus="SUPPLEMENT"
        currentRemark="请补充学籍信息卡"
      />,
    );

    expect(screen.getByText("请提醒家长尽快补传学籍信息卡")).toBeInTheDocument();
    expect(screen.getByDisplayValue("请补充学籍信息卡")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "驳回申请" })).toBeInTheDocument();
    expect(screen.getByLabelText("审核备注")).toBeInTheDocument();
  });

  it("submits rejection from SUPPLEMENT status when remark is filled", async () => {
    updateApplicationStatusMock.mockResolvedValue({
      success: true,
      error: null,
    });

    render(
      <ApprovalPanel
        {...baseProps}
        currentStatus="SUPPLEMENT"
        currentRemark="请补充学籍信息卡"
      />,
    );

    fireEvent.change(screen.getByLabelText("审核备注"), {
      target: { value: "逾期未补齐资料，驳回申请" },
    });
    fireEvent.click(screen.getByRole("button", { name: "驳回申请" }));

    await waitFor(() => {
      expect(updateApplicationStatusMock).toHaveBeenCalledWith(
        "app-1",
        "REJECTED",
        "逾期未补齐资料，驳回申请",
        "",
      );
    });
  });

  // ============ EDITING 状态 ============

  it("renders EDITING status with rejection input, qrcode action, and disabled print buttons", () => {
    render(
      <ApprovalPanel
        {...baseProps}
        currentStatus="EDITING"
        currentRemark="请修改姓名"
      />,
    );

    expect(screen.queryByRole("button", { name: "驳回修改" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "驳回申请" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "重新生成二维码" })).toBeInTheDocument();
    expect(screen.getByLabelText("审核备注")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "留底页打印" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "家长页打印" })).toBeDisabled();
  });

  // ============ 打印按钮 ============

  it("renders print buttons for EDITING status too", () => {
    render(
      <ApprovalPanel {...baseProps} currentStatus="EDITING" currentRemark="请修改姓名" />,
    );

    expect(screen.getByRole("button", { name: "留底页打印" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "家长页打印" })).toBeInTheDocument();
  });

  it("triggers archive print for PENDING status", () => {
    render(
      <ApprovalPanel {...baseProps} currentStatus="PENDING" currentTargetSchool="西关街小学" />,
    );

    fireEvent.click(screen.getByRole("button", { name: "留底页打印" }));
    expect(triggerPrintMock).toHaveBeenCalledWith("archive");
  });

  it("disables print buttons for APPROVED status", () => {
    render(
      <ApprovalPanel {...baseProps} currentStatus="APPROVED" currentTargetSchool="西关街小学" />,
    );

    expect(screen.getByRole("button", { name: "留底页打印" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "家长页打印" })).toBeDisabled();
    expect(triggerPrintMock).not.toHaveBeenCalled();
  });

  // ============ 删除功能 ============

  it("renders delete button for all statuses", () => {
    render(
      <ApprovalPanel {...baseProps} currentStatus="PENDING" />,
    );

    expect(screen.getByRole("button", { name: "删除申请" })).toBeInTheDocument();
  });

  it("shows confirmation dialog on delete", () => {
    render(
      <ApprovalPanel {...baseProps} currentStatus="PENDING" />,
    );

    fireEvent.click(screen.getByRole("button", { name: "删除申请" }));

    expect(screen.getByText("确认删除？")).toBeInTheDocument();
    expect(
      screen.getByText("此操作不可恢复，将永久删除该学生的转学申请记录。"),
    ).toBeInTheDocument();
  });

  it("calls deleteApplication on confirm delete", async () => {
    deleteApplicationMock.mockResolvedValue({ success: true, error: null });

    render(
      <ApprovalPanel {...baseProps} currentStatus="PENDING" />,
    );

    fireEvent.click(screen.getByRole("button", { name: "删除申请" }));
    fireEvent.click(screen.getByRole("button", { name: "确认删除" }));

    await waitFor(() => {
      expect(deleteApplicationMock).toHaveBeenCalledWith("app-1");
    });
    expect(toastSuccessMock).toHaveBeenCalledWith("申请已删除");
    expect(pushMock).toHaveBeenCalledWith("/admin/applications");
  });

  // ============ SUPPLEMENT 打印确认弹窗 ============

  it("shows supplement print confirmation dialog", () => {
    render(
      <ApprovalPanel
        {...baseProps}
        currentStatus="SUPPLEMENT"
        currentRemark="请补充"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "留底页打印" }));

    expect(screen.getByText("该申请尚缺学籍信息卡")).toBeInTheDocument();
    expect(
      screen.getByText("此申请尚缺学籍信息卡。请先提醒家长尽快补传后，再确认打印当前内容。"),
    ).toBeInTheDocument();
  });

  it("triggers print after supplement confirmation", async () => {
    render(
      <ApprovalPanel
        {...baseProps}
        currentStatus="SUPPLEMENT"
        currentRemark="请补充"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "留底页打印" }));
    fireEvent.click(screen.getByRole("button", { name: "确认打印" }));

    await waitFor(() => {
      expect(triggerPrintMock).toHaveBeenCalledWith("archive");
    });
  });
});
