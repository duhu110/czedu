import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getApplicationByIdMock, getSystemTextByTypeMock } = vi.hoisted(() => ({
  getApplicationByIdMock: vi.fn(),
  getSystemTextByTypeMock: vi.fn(),
}));

vi.mock("@/app/actions/application", () => ({
  getApplicationById: getApplicationByIdMock,
}));

vi.mock("@/app/actions/system-text", () => ({
  getSystemTextByType: getSystemTextByTypeMock,
}));

vi.mock("../_components/approval-panel", () => ({
  ApprovalPanel: () => <div>审批面板占位</div>,
}));

vi.mock("../_components/print-context", () => ({
  PrintProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("../_components/application-print-sheet", () => ({
  ApplicationPrintSheet: () => <div data-testid="print-sheet">打印区占位</div>,
}));

describe("Admin application detail page", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    getApplicationByIdMock.mockReset();
    getSystemTextByTypeMock.mockReset();

    getApplicationByIdMock.mockResolvedValue({
      success: true,
      error: null,
      data: {
        id: "app-pending-001",
        name: "张三",
        status: "PENDING",
        createdAt: new Date("2026-04-07T12:00:00+08:00"),
        updatedAt: new Date("2026-04-07T12:00:00+08:00"),
        semesterId: "semester-1",
        semester: { name: "2026年春季学期" },
        residencyType: "LOCAL",
        idCard: "630103201501010011",
        studentId: "G2026001001",
        gender: "MALE",
        ethnicity: "汉族",
        guardian1Name: "张父",
        guardian1Relation: "父亲",
        guardian1Phone: "13800000000",
        guardian2Name: null,
        guardian2Relation: null,
        guardian2Phone: null,
        currentSchool: "城中区第三小学",
        currentGrade: "四年级",
        targetGrade: "五年级",
        targetSchool: null,
        hukouAddress: "城中区南关街25号",
        livingAddress: "城中区南关街25号",
        fileHukou: {
          frontPage: "",
          householderPage: "",
          guardianPage: "",
          studentPage: "",
          others: [],
        },
        fileProperty: {
          propertyDeed: "",
          purchaseContract: "",
          rentalCert: "",
          others: [],
        },
        fileStudentCard: [],
        fileResidencePermit: [],
        adminRemark: null,
        rejectedFields: [],
      },
    });

    getSystemTextByTypeMock.mockResolvedValue({
      success: true,
      data: null,
      error: null,
    });
  });

  it("renders page title and status badge", async () => {
    const Page = (await import("./page")).default;

    render(
      await Page({
        params: Promise.resolve({ id: "app-pending-001" }),
      }),
    );

    expect(screen.getByText(/张三 的转学申请/)).toBeInTheDocument();
    expect(screen.getByText("待审核")).toBeInTheDocument();
  });

  it("renders print sheet placeholder", async () => {
    const Page = (await import("./page")).default;

    render(
      await Page({
        params: Promise.resolve({ id: "app-pending-001" }),
      }),
    );

    expect(screen.getByTestId("print-sheet")).toBeInTheDocument();
  });

  it("renders approval panel placeholder", async () => {
    const Page = (await import("./page")).default;

    render(
      await Page({
        params: Promise.resolve({ id: "app-pending-001" }),
      }),
    );

    expect(screen.getByText("审批面板占位")).toBeInTheDocument();
  });

  it("fetches system texts for the semester", async () => {
    const Page = (await import("./page")).default;

    render(
      await Page({
        params: Promise.resolve({ id: "app-pending-001" }),
      }),
    );

    expect(getSystemTextByTypeMock).toHaveBeenCalledWith(
      "semester-1",
      "TRANSFER_NOTICE",
    );
    expect(getSystemTextByTypeMock).toHaveBeenCalledWith(
      "semester-1",
      "CONSENT_FORM",
    );
  });

  it("does not show target school in transfer info card (moved to panel)", async () => {
    const Page = (await import("./page")).default;

    render(
      await Page({
        params: Promise.resolve({ id: "app-pending-001" }),
      }),
    );

    // 转学信息卡片不再包含"分配学校"字段
    const transferCard = screen.getByText("4. 转学信息").closest("[data-slot='card']");
    expect(transferCard).not.toBeNull();
    // "分配学校"文本不应出现在卡片中
    expect(screen.queryByText("分配学校")).not.toBeInTheDocument();
  });
});
