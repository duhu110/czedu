import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { applicationTestRecordIds } from "@/lib/application-test-records";

const { getApplicationByIdMock, redirectMock } = vi.hoisted(() => ({
  getApplicationByIdMock: vi.fn(),
  redirectMock: vi.fn(),
}));

vi.mock("@/app/actions/application", () => ({
  getApplicationById: getApplicationByIdMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

describe("application pages", () => {
  beforeEach(() => {
    getApplicationByIdMock.mockReset();
    redirectMock.mockReset();
  });

  it("renders seeded application links on the application entry page", async () => {
    const Page = (await import("./page")).default;

    render(await Page());

    expect(screen.getByRole("link", { name: "发起申请" })).toHaveAttribute(
      "href",
      "/application/new",
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
      `/application/confirmation/${applicationTestRecordIds.rejected}`,
    );
    expect(screen.getByRole("link", { name: "查看待补充资料" })).toHaveAttribute(
      "href",
      `/application/supplement/${applicationTestRecordIds.supplement}`,
    );
  });

  it("redirects approved pending pages to confirmation", async () => {
    getApplicationByIdMock.mockResolvedValue({
      success: true,
      error: null,
      data: {
        id: "app-approved",
        status: "APPROVED",
      },
    });

    const Page = (await import("./pending/[id]/page")).default;

    await Page({
      params: Promise.resolve({ id: "app-approved" }),
    });

    expect(redirectMock).toHaveBeenCalledWith(
      "/application/confirmation/app-approved",
    );
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

  it("renders notice confirmation content for approved applications", async () => {
    getApplicationByIdMock.mockResolvedValue({
      success: true,
      error: null,
      data: {
        id: "app-approved",
        status: "APPROVED",
        name: "测试审核通过申请",
        currentSchool: "城中区第三小学",
        targetGrade: "五年级",
        targetSchool: "城中区第一小学",
      },
    });

    const Page = (await import("./confirmation/[id]/page")).default;

    render(
      await Page({
        params: Promise.resolve({ id: "app-approved" }),
      }),
    );

    expect(screen.getByText("确认须知")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "确认已阅读" })).toBeDisabled();
  });
});
