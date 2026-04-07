import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  createSemester: vi.fn(),
  updateSemester: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("@/app/actions/semester", () => ({
  createSemester: mocks.createSemester,
  updateSemester: mocks.updateSemester,
}));

vi.mock("sonner", () => ({
  toast: {
    success: mocks.toastSuccess,
    error: mocks.toastError,
  },
}));

import { SemesterFormDialog } from "@/components/admin/semester/semester-form-dialog";

describe("SemesterFormDialog", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-07T08:00:00.000Z"));
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("shows the current create defaults derived from the workspace date", () => {
    render(<SemesterFormDialog mode="create" defaultOpen />);

    expect(screen.getByRole("heading", { name: "创建学期" })).toBeInTheDocument();
    expect(screen.getByLabelText("学期名称")).toHaveValue("2026年秋季");
    expect(screen.getByLabelText("学期名称")).toHaveAttribute("readonly");
    expect(screen.getByRole("combobox", { name: "学年" })).toHaveTextContent("2026");
    expect(screen.getByRole("combobox", { name: "学期" })).toHaveTextContent("秋季");
    expect(screen.getByLabelText("开始日期")).toHaveValue("2026-03-01");
    expect(screen.getByLabelText("开始日期")).toHaveAttribute("min", "2026-03-01");
    expect(screen.getByLabelText("开始日期")).toHaveAttribute("max", "2026-09-01");
    expect(screen.getByLabelText("结束日期")).toHaveValue("2026-09-01");
    expect(screen.getByLabelText("结束日期")).toHaveAttribute("min", "2026-03-01");
    expect(screen.getByLabelText("结束日期")).toHaveAttribute("max", "2026-09-01");
    expect(screen.getByRole("switch", { name: "学期启用状态" })).toBeChecked();
    expect(
      screen.getByText("停用后，该学期将不能接受新的报名申请。"),
    ).toBeInTheDocument();
  });

  it("shows year options for the current year plus or minus five", () => {
    render(<SemesterFormDialog mode="create" defaultOpen />);

    fireEvent.click(screen.getByRole("combobox", { name: "学年" }));

    expect(screen.getByRole("option", { name: "2021" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "2026" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "2031" })).toBeInTheDocument();
  });

  it("prefills edit mode from the provided semester, including inactive state", () => {
    render(
      <SemesterFormDialog
        mode="edit"
        defaultOpen
        semester={{
          id: "semester-2027-spring",
          name: "2027年春季",
          startDate: new Date("2026-09-01T00:00:00.000Z"),
          endDate: new Date("2027-03-01T00:00:00.000Z"),
          isActive: false,
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "编辑学期" })).toBeInTheDocument();
    expect(screen.getByLabelText("学期名称")).toHaveValue("2027年春季");
    expect(screen.getByRole("combobox", { name: "学年" })).toHaveTextContent("2027");
    expect(screen.getByRole("combobox", { name: "学期" })).toHaveTextContent("春季");
    expect(screen.getByLabelText("开始日期")).toHaveValue("2026-09-01");
    expect(screen.getByLabelText("开始日期")).toHaveAttribute("min", "2026-09-01");
    expect(screen.getByLabelText("开始日期")).toHaveAttribute("max", "2027-03-01");
    expect(screen.getByLabelText("结束日期")).toHaveValue("2027-03-01");
    expect(screen.getByLabelText("结束日期")).toHaveAttribute("min", "2026-09-01");
    expect(screen.getByLabelText("结束日期")).toHaveAttribute("max", "2027-03-01");
    expect(screen.getByRole("switch", { name: "学期启用状态" })).not.toBeChecked();
  });

  it("fails safely when edit mode is wired without a semester", () => {
    expect(() =>
      render(<SemesterFormDialog mode="edit" defaultOpen semester={undefined as never} />),
    ).toThrow("SemesterFormDialog requires a semester in edit mode.");
  });

  it("recomputes the generated name and template dates when term or year changes", () => {
    render(<SemesterFormDialog mode="create" defaultOpen />);

    fireEvent.click(screen.getByRole("combobox", { name: "学期" }));
    fireEvent.click(screen.getByRole("option", { name: "春季" }));

    expect(screen.getByLabelText("学期名称")).toHaveValue("2026年春季");
    expect(screen.getByLabelText("开始日期")).toHaveValue("2025-09-01");
    expect(screen.getByLabelText("结束日期")).toHaveValue("2026-03-01");
    expect(screen.getByLabelText("开始日期")).toHaveAttribute("min", "2025-09-01");
    expect(screen.getByLabelText("开始日期")).toHaveAttribute("max", "2026-03-01");
    expect(screen.getByLabelText("结束日期")).toHaveAttribute("min", "2025-09-01");
    expect(screen.getByLabelText("结束日期")).toHaveAttribute("max", "2026-03-01");

    fireEvent.click(screen.getByRole("combobox", { name: "学年" }));
    fireEvent.click(screen.getByRole("option", { name: "2027" }));

    expect(screen.getByLabelText("学期名称")).toHaveValue("2027年春季");
    expect(screen.getByLabelText("开始日期")).toHaveValue("2026-09-01");
    expect(screen.getByLabelText("结束日期")).toHaveValue("2027-03-01");
    expect(screen.getByLabelText("开始日期")).toHaveAttribute("min", "2026-09-01");
    expect(screen.getByLabelText("开始日期")).toHaveAttribute("max", "2027-03-01");
    expect(screen.getByLabelText("结束日期")).toHaveAttribute("min", "2026-09-01");
    expect(screen.getByLabelText("结束日期")).toHaveAttribute("max", "2027-03-01");
  });

  it("recomputes create defaults each time the dialog opens", () => {
    render(
      <SemesterFormDialog
        mode="create"
        trigger={<button type="button">打开学期表单</button>}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "打开学期表单" }));

    expect(screen.getByLabelText("学期名称")).toHaveValue("2026年秋季");
    expect(screen.getByLabelText("开始日期")).toHaveValue("2026-03-01");
    expect(screen.getByLabelText("结束日期")).toHaveValue("2026-09-01");

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    vi.setSystemTime(new Date("2026-10-01T08:00:00.000Z"));
    fireEvent.click(screen.getByRole("button", { name: "打开学期表单" }));

    expect(screen.getByLabelText("学期名称")).toHaveValue("2027年春季");
    expect(screen.getByLabelText("开始日期")).toHaveValue("2026-09-01");
    expect(screen.getByLabelText("结束日期")).toHaveValue("2027-03-01");
  });

  it("keeps cleared native date inputs empty and exposes validation state accessibly", async () => {
    render(<SemesterFormDialog mode="create" defaultOpen />);

    const startDateInput = screen.getByLabelText("开始日期");
    const endDateInput = screen.getByLabelText("结束日期");
    const activeSwitch = screen.getByRole("switch", { name: "学期启用状态" });

    fireEvent.change(startDateInput, { target: { value: "" } });

    expect(startDateInput).toHaveValue("");
    expect(startDateInput).not.toHaveValue("NaN-NaN-NaN");
    expect(activeSwitch).toHaveAttribute("aria-describedby", "semester-active-help");

    fireEvent.click(screen.getByRole("button", { name: "创建学期" }));
    await vi.runAllTimersAsync();

    const startDateError = document.getElementById("semester-start-date-error");

    expect(startDateError).toBeInTheDocument();
    expect(startDateError?.textContent).not.toBe("");
    expect(startDateInput).toHaveAttribute("aria-invalid", "true");
    expect(startDateInput).toHaveAttribute(
      "aria-describedby",
      expect.stringContaining("semester-start-date-error"),
    );
    expect(endDateInput).toHaveAttribute("aria-invalid", "false");
  });

  it("keeps the create wrapper as the create-mode entry path", async () => {
    vi.resetModules();

    const capturedProps: unknown[] = [];

    vi.doMock("@/components/admin/semester/semester-form-dialog", () => ({
      CreateSemesterDialogTrigger: () => <button type="button">新增学期</button>,
      SemesterFormDialog: (props: unknown) => {
        capturedProps.push(props);
        return <div data-testid="shared-dialog" />;
      },
    }));

    const { CreateSemesterDialog } = await import("@/components/admin/semester/create-dialog");

    render(<CreateSemesterDialog />);

    expect(screen.getByTestId("shared-dialog")).toBeInTheDocument();
    expect(capturedProps[0]).toEqual(
      expect.objectContaining({
        mode: "create",
        trigger: expect.anything(),
      }),
    );

    vi.doUnmock("@/components/admin/semester/semester-form-dialog");
  });
});
