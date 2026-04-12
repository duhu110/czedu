import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { refreshMock, successMock, errorMock } = vi.hoisted(() => ({
  refreshMock: vi.fn(),
  successMock: vi.fn(),
  errorMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: successMock,
    error: errorMock,
  },
}));

describe("ApplicationImportExportToolbar", () => {
  beforeEach(() => {
    refreshMock.mockReset();
    successMock.mockReset();
    errorMock.mockReset();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders export and template download links with current filters", async () => {
    const { ApplicationImportExportToolbar } = await import(
      "./application-import-export-toolbar"
    );

    render(
      <ApplicationImportExportToolbar
        search="张三"
        status="PENDING"
        disabled={false}
      />,
    );

    expect(screen.getByRole("link", { name: "导出数据" })).toHaveAttribute(
      "href",
      "/admin/applications/export?search=%E5%BC%A0%E4%B8%89&status=PENDING",
    );
    expect(screen.getByRole("link", { name: "下载导入模板" })).toHaveAttribute(
      "href",
      "/admin/applications/template",
    );
    expect(screen.getByRole("button", { name: "导入数据" })).toBeInTheDocument();
  });

  it("uploads xlsx files and refreshes the page after a successful import", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        error: null,
        updatedCount: 2,
        skippedCount: 1,
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { ApplicationImportExportToolbar } = await import(
      "./application-import-export-toolbar"
    );

    render(<ApplicationImportExportToolbar disabled={false} />);

    const input = screen.getByLabelText("导入 XLSX 文件");
    const file = new File(["xlsx"], "applications.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/admin/applications/import", {
        method: "POST",
        body: expect.any(FormData),
      });
    });
    expect(successMock).toHaveBeenCalledWith("导入完成：更新 2 条，跳过 1 条");
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });
});
