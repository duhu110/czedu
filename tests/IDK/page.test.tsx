import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getApplicationsMock, getAdminSelectedSemesterMock } = vi.hoisted(
  () => ({
    getApplicationsMock: vi.fn(),
    getAdminSelectedSemesterMock: vi.fn(),
  }),
);

vi.mock("@/app/actions/application", () => ({
  getApplications: getApplicationsMock,
}));

vi.mock("@/lib/admin-selected-semester", () => ({
  getAdminSelectedSemester: getAdminSelectedSemesterMock,
}));

vi.mock("./_components/application-filters", () => ({
  ApplicationFilters: () => <div data-testid="application-filters" />,
}));

vi.mock("./_components/application-import-export-toolbar", () => ({
  ApplicationImportExportToolbar: () => <div data-testid="import-export" />,
}));

vi.mock("./_components/application-pagination", () => ({
  ApplicationPagination: () => <div data-testid="pagination" />,
}));

describe("AdminApplicationsPage", () => {
  beforeEach(() => {
    getApplicationsMock.mockReset();
    getAdminSelectedSemesterMock.mockReset();
    getAdminSelectedSemesterMock.mockResolvedValue({
      id: "semester-1",
      name: "2026年春季学期",
    });
    getApplicationsMock.mockResolvedValue({
      data: [
        {
          id: "app-1",
          name: "张三",
          idCard: "630103201501010011",
          currentSchool: "城中区第三小学",
          currentGrade: "四年级",
          targetGrade: "五年级",
          targetSchool: null,
          residencyType: "LOCAL",
          propertyType: "PURCHASE",
          createdAt: new Date("2026-04-07T12:00:00+08:00"),
          status: "PENDING",
        },
      ],
      meta: {
        total: 1,
        currentPage: 1,
        pageCount: 1,
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders property type in the applications table", async () => {
    const Page = (await import("./page")).default;

    render(
      await Page({
        searchParams: Promise.resolve({}),
      }),
    );

    expect(screen.getByText("房产情况")).toBeInTheDocument();
    expect(screen.getByText("购房")).toBeInTheDocument();
  });
});
