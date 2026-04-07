import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

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
    expect(screen.getByRole("combobox", { name: "学年" })).toHaveTextContent("2026");
    expect(screen.getByRole("combobox", { name: "学期" })).toHaveTextContent("秋季");
    expect(screen.getByLabelText("开始日期")).toHaveValue("2026-03-01");
    expect(screen.getByLabelText("结束日期")).toHaveValue("2026-09-01");
    expect(screen.getByRole("switch", { name: "设为当前学期" })).toBeChecked();
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
    expect(screen.getByLabelText("结束日期")).toHaveValue("2027-03-01");
    expect(screen.getByRole("switch", { name: "设为当前学期" })).not.toBeChecked();
  });
});
