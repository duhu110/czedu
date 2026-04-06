import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AppSidebar } from "@/components/admin/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
  }),
}));

describe("AppSidebar", () => {
  it("renders Chinese admin navigation links", () => {
    render(
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      </TooltipProvider>,
    );

    expect(screen.getByText("总览")).toBeInTheDocument();
    expect(screen.getByText("申请管理")).toBeInTheDocument();
    expect(screen.getByText("退出登录")).toBeInTheDocument();
  });
});
