import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSemesters: vi.fn(),
  toggleSemesterActive: vi.fn(),
  deleteSemester: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("@/app/actions/semester", () => ({
  getSemesters: mocks.getSemesters,
  toggleSemesterActive: mocks.toggleSemesterActive,
  deleteSemester: mocks.deleteSemester,
}));

vi.mock("sonner", () => ({
  toast: {
    success: mocks.toastSuccess,
    error: mocks.toastError,
  },
}));

describe("SemesterPage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-07T08:00:00.000Z"));
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("shows the empty state and create entry when no semesters exist", async () => {
    mocks.getSemesters.mockResolvedValueOnce([]);

    const { default: SemesterPage } = await import("@/app/admin/(auth)/semesters/page");

    render(await SemesterPage());

    expect(mocks.getSemesters).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText("尚未创建任何学期，请点击右上角新增。"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "新增学期" })).toBeInTheDocument();
  });

  it("renders timeline status, active status, and row operations for all semesters", async () => {
    mocks.getSemesters.mockResolvedValueOnce([
      {
        id: "future-semester",
        name: "2027年春季",
        startDate: new Date("2026-09-01T00:00:00.000Z"),
        endDate: new Date("2027-03-01T00:00:00.000Z"),
        isActive: false,
      },
      {
        id: "current-semester",
        name: "2026年秋季",
        startDate: new Date("2026-03-01T00:00:00.000Z"),
        endDate: new Date("2026-09-01T00:00:00.000Z"),
        isActive: true,
      },
      {
        id: "past-semester",
        name: "2026年春季",
        startDate: new Date("2025-09-01T00:00:00.000Z"),
        endDate: new Date("2026-03-01T00:00:00.000Z"),
        isActive: true,
      },
    ]);

    const { default: SemesterPage } = await import("@/app/admin/(auth)/semesters/page");

    render(await SemesterPage());

    expect(screen.getByRole("columnheader", { name: "时间状态" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "启用状态" })).toBeInTheDocument();

    expect(screen.getByText("未开始")).toBeInTheDocument();
    expect(screen.getByText("进行中")).toBeInTheDocument();
    expect(screen.getByText("已结束")).toBeInTheDocument();

    expect(screen.getAllByText("已启用")).toHaveLength(2);
    expect(screen.getByText("已停用")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "编辑 2026年秋季" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "停用 2026年秋季" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "删除 2026年秋季" })).toBeInTheDocument();
  });
});

describe("ToggleActiveButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("confirms before disabling a semester and calls the toggle action", async () => {
    mocks.toggleSemesterActive.mockResolvedValueOnce({ success: true });

    const { ToggleActiveButton } = await import(
      "@/components/admin/semester/toggle-active-button"
    );

    render(
      <ToggleActiveButton
        id="current-semester"
        name="2026年秋季"
        isActive
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "停用 2026年秋季" }));

    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "停用后，该学期将不能接受新的报名申请。",
    );

    fireEvent.click(screen.getByRole("button", { name: "确认停用" }));

    await waitFor(() => {
      expect(mocks.toggleSemesterActive).toHaveBeenCalledWith("current-semester", false);
    });
  });
});
