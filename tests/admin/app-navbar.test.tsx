import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AppNavbar } from "@/components/admin/app-navbar";

const setTheme = vi.fn();

vi.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: "light",
    setTheme,
  }),
}));

vi.mock("@/components/admin/custom-sidebar-trigger", () => ({
  CustomSidebarTrigger: () => <button type="button">Toggle Sidebar</button>,
}));

vi.mock("@/components/admin/nav-user", () => ({
  NavUser: () => <div>NavUser</div>,
}));

describe("AppNavbar", () => {
  it("renders a theme switch button before the user menu", () => {
    render(
      <AppNavbar
        user={{
          username: "admin",
          name: "超级管理员",
        }}
      />,
    );

    const themeButton = screen.getByRole("switch", { name: "切换深色模式" });
    fireEvent.click(themeButton);

    expect(setTheme).toHaveBeenCalledWith("dark");
    expect(screen.getByText("NavUser")).toBeInTheDocument();
  });
});
