import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getApplicationByIdMock } = vi.hoisted(() => ({
  getApplicationByIdMock: vi.fn(),
}));

vi.mock("@/app/actions/application", () => ({
  getApplicationById: getApplicationByIdMock,
}));

vi.mock("../_components/approval-panel", () => ({
  ApprovalPanel: () => <div>审批面板占位</div>,
}));

describe("Admin application detail page", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    getApplicationByIdMock.mockReset();
    getApplicationByIdMock.mockResolvedValue({
      success: true,
      error: null,
      data: {
        id: "app-pending-001",
        name: "张三",
        status: "PENDING",
        createdAt: new Date("2026-04-07T12:00:00+08:00"),
        semester: { name: "2026年春季学期" },
        residencyType: "LOCAL",
        idCard: "450123201501010011",
        studentId: "XJ2026001",
        gender: "MALE",
        guardian1Name: "张父",
        guardian1Phone: "13800000000",
        guardian2Name: null,
        guardian2Phone: null,
        currentSchool: "城中区第三小学",
        currentGrade: "四年级",
        targetGrade: "五年级",
        targetSchool: null,
        hukouAddress: "柳州市城中区户籍地址1号",
        livingAddress: "柳州市城中区居住地址2号",
        fileHukou: [],
        fileProperty: [],
        fileStudentCard: [],
        fileResidencePermit: [],
        adminRemark: null,
      },
    });
  });

  it("renders the print button and pending lookup path", async () => {
    const Page = (await import("./page")).default;

    render(
      await Page({
        params: Promise.resolve({ id: "app-pending-001" }),
      }),
    );

    expect(screen.getByRole("button", { name: "打印申请单" })).toBeInTheDocument();
    expect(
      screen.getByText(/\/application\/pending\/app-pending-001/),
    ).toBeInTheDocument();
  });

  it("keeps guardian, school, and approval sections out of the 3-column field grid", async () => {
    const Page = (await import("./page")).default;

    render(
      await Page({
        params: Promise.resolve({ id: "app-pending-001" }),
      }),
    );

    expect(screen.getByText("2. 监护人信息").closest(".grid.grid-cols-3")).toBeNull();
    expect(screen.getByText("3. 学校与地址").closest(".grid.grid-cols-3")).toBeNull();
    expect(screen.getByText("审批面板占位").closest(".grid.grid-cols-3")).toBeNull();
  });
});
