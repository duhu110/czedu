import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getSchoolsMock, schoolManagerPropsMock } = vi.hoisted(() => ({
  getSchoolsMock: vi.fn(),
  schoolManagerPropsMock: vi.fn(),
}));

vi.mock("@/app/actions/school", () => ({
  getSchools: getSchoolsMock,
}));

vi.mock("./_components/school-manager", () => ({
  SchoolManager: (props: Record<string, unknown>) => {
    schoolManagerPropsMock(props);
    return <div>学校管理器占位</div>;
  },
}));

describe("Admin schools page", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    getSchoolsMock.mockReset();
    schoolManagerPropsMock.mockReset();
    getSchoolsMock.mockResolvedValue({
      success: true,
      error: null,
      data: [
        {
          id: "school-1",
          name: "西关街小学",
          districtRange: ["规则一"],
          address: "",
          notice: "",
        },
      ],
    });
  });

  it("renders the admin school management page with initial schools", async () => {
    const Page = (await import("./page")).default;

    render(await Page());

    expect(screen.getByText("学校管理")).toBeInTheDocument();
    expect(screen.getByText("学校管理器占位")).toBeInTheDocument();
    expect(getSchoolsMock).toHaveBeenCalledTimes(1);
    expect(schoolManagerPropsMock).toHaveBeenCalledWith({
      schools: [
        {
          id: "school-1",
          name: "西关街小学",
          districtRange: ["规则一"],
          address: "",
          notice: "",
        },
      ],
    });
  });
});
