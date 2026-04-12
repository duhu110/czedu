import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { applicationTestRecordIds } from "@/lib/application-test-records";
import {
  createApprovedApplication,
  createEditingApplication,
  createPendingApplication,
  createRejectedApplication,
  createSupplementApplication,
} from "@/tests/fixtures/application-factory";

const {
  getApplicationByIdMock,
  getSchoolByNameMock,
  getSystemTextByTypeMock,
  redirectMock,
  readApplicationAccessCookieMock,
  verifyEditTokenMock,
} = vi.hoisted(() => ({
  getApplicationByIdMock: vi.fn(),
  getSchoolByNameMock: vi.fn(),
  getSystemTextByTypeMock: vi.fn(),
  redirectMock: vi.fn(),
  readApplicationAccessCookieMock: vi.fn(),
  verifyEditTokenMock: vi.fn(),
}));

vi.mock("@/app/actions/application", () => ({
  getApplicationById: getApplicationByIdMock,
}));

vi.mock("@/app/actions/system-text", () => ({
  getSystemTextByType: getSystemTextByTypeMock,
}));

vi.mock("@/app/actions/school", () => ({
  getSchoolByName: getSchoolByNameMock,
}));

const { getApplicationAccessPreviewsMock } = vi.hoisted(() => ({
  getApplicationAccessPreviewsMock: vi.fn(),
}));

vi.mock("@/app/actions/application-access", () => ({
  getApplicationAccessPreviews: getApplicationAccessPreviewsMock,
}));

vi.mock("@/lib/application-access", () => ({
  readApplicationAccessCookie: readApplicationAccessCookieMock,
}));

vi.mock("@/lib/qrcode-token", () => ({
  verifyEditToken: verifyEditTokenMock,
}));

vi.mock("@/app/application/_components/application-access-guard", () => ({
  ApplicationAccessGuard: ({
    applicationId,
    phonePreviews,
  }: {
    applicationId: string;
    phonePreviews?: Array<{ prefix: string; suffix: string }>;
  }) => (
    <div data-testid="application-access-guard">
      <h1>申请信息验证</h1>
      <p>applicationId={applicationId}</p>
      <p>phonePreviews={phonePreviews?.length ?? 0}</p>
    </div>
  ),
}));

vi.mock("./edit/[id]/_components/edit-application-form", () => ({
  EditApplicationForm: ({
    application,
  }: {
    application: { id: string };
  }) => <div>edit-form:{application.id}</div>,
}));

vi.mock("./supplement/[id]/_components/supplement-form", () => ({
  SupplementForm: ({
    applicationId,
  }: {
    applicationId: string;
  }) => <div>supplement-form:{applicationId}</div>,
}));

vi.mock("./confirmation/_components/approved-confirmation-panel", () => ({
  ApprovedConfirmationPanel: () => (
    <div>
      <h3>确认须知</h3>
      <button disabled>确认已阅读</button>
    </div>
  ),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

function mockSystemText(content: string) {
  getSystemTextByTypeMock.mockResolvedValue({
    success: true,
    error: null,
    data: {
      id: "system-text-1",
      semesterId: "semester-1",
      type: "PENDING_TEXT",
      content,
    },
  });
}

describe("application pages", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    getApplicationByIdMock.mockReset();
    getSchoolByNameMock.mockReset();
    redirectMock.mockReset();
    readApplicationAccessCookieMock.mockReset();
    getApplicationAccessPreviewsMock.mockReset();
    getSystemTextByTypeMock.mockReset();
    verifyEditTokenMock.mockReset();
    readApplicationAccessCookieMock.mockResolvedValue(true);
    getApplicationAccessPreviewsMock.mockResolvedValue([
      { prefix: "138", suffix: "1234" },
    ]);
    verifyEditTokenMock.mockReturnValue({ valid: true });
  });

  it("renders seeded application links on the application entry page", async () => {
    const Page = (await import("./page")).default;

    render(await Page());

    expect(screen.getByRole("link", { name: "需扫描二维码" })).toHaveAttribute(
      "href",
      "/application/new/outdate",
    );
    expect(screen.getByRole("link", { name: "查看审核中" })).toHaveAttribute(
      "href",
      `/application/pending/${applicationTestRecordIds.pending}`,
    );
    expect(screen.getByRole("link", { name: "查看通过结果" })).toHaveAttribute(
      "href",
      `/application/confirmation/${applicationTestRecordIds.approved}`,
    );
    expect(screen.getByRole("link", { name: "查看驳回结果" })).toHaveAttribute(
      "href",
      `/application/rejected/${applicationTestRecordIds.rejected}`,
    );
    expect(screen.getByRole("link", { name: "查看待补学籍信息卡" })).toHaveAttribute(
      "href",
      `/application/supplement/${applicationTestRecordIds.supplement}`,
    );
  });

  it("redirects approved pending pages to confirmation", async () => {
    getApplicationByIdMock.mockResolvedValue({
      success: true,
      error: null,
      data: createApprovedApplication({
        id: "app-approved",
      }),
    });

    const Page = (await import("./pending/[id]/page")).default;

    await Page({
      params: Promise.resolve({ id: "app-approved" }),
    });

    expect(redirectMock).toHaveBeenCalledWith(
      "/application/confirmation/app-approved",
    );
  });

  it("redirects rejected pending pages to rejected", async () => {
    getApplicationByIdMock.mockResolvedValue({
      success: true,
      error: null,
      data: createRejectedApplication({
        id: "app-rejected",
      }),
    });

    const Page = (await import("./pending/[id]/page")).default;

    await Page({
      params: Promise.resolve({ id: "app-rejected" }),
    });

    expect(redirectMock).toHaveBeenCalledWith(
      "/application/rejected/app-rejected",
    );
  });

  it("renders the shared access guard without loading application data when pending is unauthorized", async () => {
    readApplicationAccessCookieMock.mockResolvedValueOnce(false);

    const Page = (await import("./pending/[id]/page")).default;

    render(
      await Page({
        params: Promise.resolve({ id: "app-hidden" }),
      }),
    );

    expect(screen.getByTestId("application-access-guard")).toBeInTheDocument();
    expect(screen.getByText("applicationId=app-hidden")).toBeInTheDocument();
    expect(screen.getByText("phonePreviews=1")).toBeInTheDocument();
    expect(getApplicationByIdMock).not.toHaveBeenCalled();
  });

  it("renders the same shared access guard for confirmation when unauthorized", async () => {
    readApplicationAccessCookieMock.mockResolvedValueOnce(false);

    const Page = (await import("./confirmation/[id]/page")).default;

    render(
      await Page({
        params: Promise.resolve({ id: "app-hidden" }),
      }),
    );

    expect(screen.getAllByTestId("application-access-guard")).toHaveLength(1);
    expect(screen.queryByText("确认须知")).not.toBeInTheDocument();
    expect(getApplicationByIdMock).not.toHaveBeenCalled();
  });

  it("renders the shared access guard for rejected when unauthorized", async () => {
    readApplicationAccessCookieMock.mockResolvedValueOnce(false);

    const Page = (await import("./rejected/[id]/page")).default;

    render(
      await Page({
        params: Promise.resolve({ id: "app-hidden" }),
      }),
    );

    expect(screen.getAllByTestId("application-access-guard")).toHaveLength(1);
    expect(getApplicationByIdMock).not.toHaveBeenCalled();
  });

  it("renders pending copy from the database for pending applications", async () => {
    getApplicationByIdMock.mockResolvedValue({
      success: true,
      error: null,
      data: createPendingApplication(),
    });
    mockSystemText("数据库审核说明正文");

    const Page = (await import("./pending/[id]/page")).default;

    render(
      await Page({
        params: Promise.resolve({ id: "app-pending" }),
      }),
    );

    expect(getSystemTextByTypeMock).toHaveBeenCalledWith(
      "semester-1",
      "PENDING_TEXT",
    );
    expect(screen.getByText("数据库审核说明正文")).toBeInTheDocument();
  });

  it("renders supplement copy from the database for supplement applications", async () => {
    getApplicationByIdMock.mockResolvedValue({
      success: true,
      error: null,
      data: createSupplementApplication(),
    });

    const Page = (await import("./supplement/[id]/page")).default;

    render(
      await Page({
        params: Promise.resolve({ id: "app-supplement" }),
      }),
    );

    expect(getSystemTextByTypeMock).not.toHaveBeenCalled();
    expect(
      screen.getByText("该申请缺少学籍信息表，请补传后继续审核。"),
    ).toBeInTheDocument();
  });

  it("renders editing copy from the database for edit pages", async () => {
    getApplicationByIdMock.mockResolvedValue({
      success: true,
      error: null,
      data: createEditingApplication(),
    });

    const Page = (await import("./edit/[id]/page")).default;

    render(
      await Page({
        params: Promise.resolve({ id: "app-editing" }),
        searchParams: Promise.resolve({
          token: "EDIT-app-editing",
          sig: "signature",
        }),
      }),
    );

    expect(getSystemTextByTypeMock).not.toHaveBeenCalled();
    expect(screen.getByText("转学申请信息修改")).toBeInTheDocument();
  });

  it("redirects supplement confirmation pages back to pending", async () => {
    getApplicationByIdMock.mockResolvedValue({
      success: true,
      error: null,
      data: {
        id: "app-supplement",
        status: "SUPPLEMENT",
      },
    });

    const Page = (await import("./confirmation/[id]/page")).default;

    await Page({
      params: Promise.resolve({ id: "app-supplement" }),
    });

    expect(redirectMock).toHaveBeenCalledWith(
      "/application/pending/app-supplement",
    );
  });

  it("redirects rejected supplement pages to rejected", async () => {
    getApplicationByIdMock.mockResolvedValue({
      success: true,
      error: null,
      data: createRejectedApplication({
        id: "app-rejected",
      }),
    });

    const Page = (await import("./supplement/[id]/page")).default;

    await Page({
      params: Promise.resolve({ id: "app-rejected" }),
    });

    expect(redirectMock).toHaveBeenCalledWith(
      "/application/rejected/app-rejected",
    );
  });

  it("renders approved confirmation copy from the database", async () => {
    getApplicationByIdMock.mockResolvedValue({
      success: true,
      error: null,
      data: createApprovedApplication({
        id: "app-approved",
        name: "测试审核通过申请",
        targetSchool: "城中区第一小学",
      }),
    });
    getSchoolByNameMock.mockResolvedValue({
      success: true,
      error: null,
      data: {
        id: "school-1",
        name: "城中区第一小学",
        districtRange: ["南关街（单号：21-最大号；双号：18-最大号）"],
        address: "城中区南关街88号",
        notice: "请按通知时间到校报到",
      },
    });
    const Page = (await import("./confirmation/[id]/page")).default;

    render(
      await Page({
        params: Promise.resolve({ id: "app-approved" }),
      }),
    );

    expect(getSystemTextByTypeMock).not.toHaveBeenCalled();
    expect(getSchoolByNameMock).toHaveBeenCalledWith("城中区第一小学");
    expect(screen.getAllByText("审核通过")).toHaveLength(2);
    expect(screen.getByText("目标学校")).toBeInTheDocument();
    expect(screen.getByText("城中区第一小学")).toBeInTheDocument();
    expect(screen.getByText("学校地址")).toBeInTheDocument();
    expect(screen.getByText("城中区南关街88号")).toBeInTheDocument();
    expect(screen.getByText("学校须知")).toBeInTheDocument();
    expect(screen.getByText("请按通知时间到校报到")).toBeInTheDocument();
  });

  it("redirects rejected confirmation pages to the rejected route", async () => {
    getApplicationByIdMock.mockResolvedValue({
      success: true,
      error: null,
      data: createRejectedApplication({
        id: "app-rejected",
        adminRemark: "材料不完整",
      }),
    });
    const Page = (await import("./confirmation/[id]/page")).default;

    await Page({
      params: Promise.resolve({ id: "app-rejected" }),
    });

    expect(redirectMock).toHaveBeenCalledWith(
      "/application/rejected/app-rejected",
    );
  });

  it("renders rejected page copy with admin remark", async () => {
    getApplicationByIdMock.mockResolvedValue({
      success: true,
      error: null,
      data: createRejectedApplication({
        id: "app-rejected",
        adminRemark: "材料不完整，请补充后重新提交。",
      }),
    });
    const Page = (await import("./rejected/[id]/page")).default;

    render(
      await Page({
        params: Promise.resolve({ id: "app-rejected" }),
      }),
    );

    expect(getSystemTextByTypeMock).not.toHaveBeenCalled();
    expect(screen.getByText("材料不完整，请补充后重新提交。")).toBeInTheDocument();
    expect(screen.getByText("申请审核中")).toBeInTheDocument();
    expect(screen.getByText("审核中")).toBeInTheDocument();
  });
});
