import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SchoolManager } from "./school-manager";

const { createSchoolMock, deleteSchoolMock, refreshMock, toastErrorMock, toastSuccessMock, updateSchoolMock } =
  vi.hoisted(() => ({
    createSchoolMock: vi.fn(),
    deleteSchoolMock: vi.fn(),
    refreshMock: vi.fn(),
    toastErrorMock: vi.fn(),
    toastSuccessMock: vi.fn(),
    updateSchoolMock: vi.fn(),
  }));

vi.mock("@/app/actions/school", () => ({
  createSchool: createSchoolMock,
  deleteSchool: deleteSchoolMock,
  updateSchool: updateSchoolMock,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: toastErrorMock,
    success: toastSuccessMock,
  },
}));

describe("SchoolManager", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    createSchoolMock.mockReset();
    deleteSchoolMock.mockReset();
    refreshMock.mockReset();
    toastErrorMock.mockReset();
    toastSuccessMock.mockReset();
    updateSchoolMock.mockReset();
  });

  it("renders school rows and opens the create form", () => {
    render(
      <SchoolManager
        schools={[
          {
            id: "school-1",
            name: "西关街小学",
            districtRange: ["规则一", "规则二"],
            address: "城中区南关街1号",
            notice: "按时报到",
          },
        ]}
      />,
    );

    expect(screen.getByText("西关街小学")).toBeInTheDocument();
    expect(screen.getByText("城中区南关街1号")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "新增学校" }));

    const dialog = screen.getByRole("dialog");

    expect(dialog).toBeInTheDocument();
    expect(dialog.className).toContain("sm:max-w-3xl");
    expect(screen.getByLabelText("学校名称")).toBeInTheDocument();
    expect(screen.getByLabelText("分区依据").tagName).toBe("TEXTAREA");
    expect(screen.getByLabelText("学校地址").tagName).toBe("TEXTAREA");
    expect(screen.getByLabelText("学校须知").tagName).toBe("TEXTAREA");
    expect(screen.getByLabelText("分区依据").className).toContain("min-h-48");
    expect(screen.getByLabelText("学校地址").className).toContain("min-h-40");
    expect(screen.getByLabelText("学校须知").className).toContain("min-h-40");
  });

  it("submits the create form", async () => {
    createSchoolMock.mockResolvedValue({ success: true, error: null });

    render(<SchoolManager schools={[]} />);

    fireEvent.click(screen.getByRole("button", { name: "新增学校" }));
    fireEvent.change(screen.getByLabelText("学校名称"), {
      target: { value: "测试学校" },
    });
    fireEvent.change(screen.getByLabelText("分区依据"), {
      target: { value: "规则一\n规则二" },
    });
    fireEvent.change(screen.getByLabelText("学校地址"), {
      target: { value: "城中区测试路1号" },
    });
    fireEvent.change(screen.getByLabelText("学校须知"), {
      target: { value: "请带齐材料" },
    });

    fireEvent.click(screen.getByRole("button", { name: "创建学校" }));

    await waitFor(() => {
      expect(createSchoolMock).toHaveBeenCalledWith({
        name: "测试学校",
        districtRangeText: "规则一\n规则二",
        address: "城中区测试路1号",
        notice: "请带齐材料",
      });
    });
    expect(toastSuccessMock).toHaveBeenCalledWith("学校创建成功");
    expect(refreshMock).toHaveBeenCalled();
  });
});
