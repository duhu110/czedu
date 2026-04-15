import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  notFound: vi.fn(),
  redirect: vi.fn(),
  getApplicationById: vi.fn(),
  getApplicationAccessPreviews: vi.fn(),
  readApplicationAccessCookie: vi.fn(),
  getSystemTextByType: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: mocks.notFound,
  redirect: mocks.redirect,
}));

vi.mock("@/app/actions/application", () => ({
  getApplicationById: mocks.getApplicationById,
}));

vi.mock("@/app/actions/application-access", () => ({
  getApplicationAccessPreviews: mocks.getApplicationAccessPreviews,
}));

vi.mock("@/app/actions/system-text", () => ({
  getSystemTextByType: mocks.getSystemTextByType,
}));

vi.mock("@/lib/application-access", () => ({
  readApplicationAccessCookie: mocks.readApplicationAccessCookie,
}));

vi.mock("@/app/application/_components/application-access-guard", () => ({
  ApplicationAccessGuard: () => <div>ApplicationAccessGuard</div>,
}));

vi.mock("./_components/supplement-form", () => ({
  SupplementForm: ({ applicationId }: { applicationId: string }) => (
    <div>SupplementForm:{applicationId}</div>
  ),
}));

describe("ApplicationSupplementPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.notFound.mockImplementation(() => {
      throw new Error("notFound");
    });
    mocks.redirect.mockImplementation(() => {
      throw new Error("redirect");
    });
    mocks.readApplicationAccessCookie.mockResolvedValue(true);
    mocks.getSystemTextByType.mockResolvedValue({
      success: true,
      data: { content: "请在3个工作日内补传学籍信息卡。" },
      error: null,
    });
    mocks.getApplicationById.mockResolvedValue({
      data: {
        id: "app-supplement-1",
        name: "张三",
        status: "SUPPLEMENT",
        updatedAt: new Date("2026-04-15T10:00:00+08:00"),
        currentSchool: "城中区实验小学",
        currentGrade: "三年级",
        targetGrade: "四年级",
        residencyType: "LOCAL",
        guardian1Name: "张父",
        guardian1Phone: "13800112233",
        guardian2Name: "",
        guardian2Phone: "",
        fileHukou: {
          frontPage: "/a.jpg",
          householderPage: "/b.jpg",
          guardianPage: "/c.jpg",
          studentPage: "/d.jpg",
          others: [],
        },
        fileProperty: {
          propertyDeed: "/p.jpg",
          purchaseContract: "",
          rentalCert: "",
          others: [],
        },
        fileResidencePermit: [],
        fileStudentCard: [],
      },
    });
  });

  it("renders supplement text from system text under the page title", async () => {
    const Page = (await import("@/app/application/supplement/[id]/page")).default;

    const ui = await Page({
      params: Promise.resolve({ id: "app-supplement-1" }),
    });

    render(ui);

    expect(screen.getByText("补传学籍信息卡")).toBeInTheDocument();
    expect(screen.getByText("请在3个工作日内补传学籍信息卡。")).toBeInTheDocument();
    expect(
      screen.queryByText("该申请缺少学籍信息表，请补传后继续审核。"),
    ).not.toBeInTheDocument();
  });
});
