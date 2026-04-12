import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  persistSelectedSemesterId: vi.fn(),
  refresh: vi.fn(),
}));

import { SemesterSwitcher } from "@/components/admin/semester-switcher";
import { SemesterProvider } from "@/lib/semester-context";
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
    refresh: mocks.refresh,
  }),
}));

vi.mock("@/app/actions/semester-selection", () => ({
  persistSelectedSemesterId: mocks.persistSelectedSemesterId,
}));

function renderSemesterSwitcher(
  semesters: Array<{
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
  }>,
) {
  return render(
    <TooltipProvider>
      <SidebarProvider>
        <SemesterProvider semesters={semesters}>
          <SemesterSwitcher />
        </SemesterProvider>
      </SidebarProvider>
    </TooltipProvider>,
  );
}

function openSwitcherMenu(buttonName: RegExp | string) {
  const trigger = screen.getByRole("button", { name: buttonName });
  fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false });
}

describe("SemesterSwitcher", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-07T08:00:00.000Z"));
    vi.clearAllMocks();
    mocks.persistSelectedSemesterId.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("falls back to the current-date semester when the selected one disappears", () => {
    const spring2027 = {
      id: "spring-2027",
      name: "2027年春季",
      startDate: new Date("2026-09-01T00:00:00.000Z"),
      endDate: new Date("2027-03-01T00:00:00.000Z"),
      isActive: false,
    };
    const autumn2026 = {
      id: "autumn-2026",
      name: "2026年秋季",
      startDate: new Date("2026-03-01T00:00:00.000Z"),
      endDate: new Date("2026-09-01T00:00:00.000Z"),
      isActive: true,
    };

    const { rerender } = renderSemesterSwitcher([spring2027, autumn2026]);

    openSwitcherMenu(/2026年秋季/i);
    fireEvent.click(screen.getByRole("menuitem", { name: /2027年春季/i }));

    expect(screen.getByText("2027年春季")).toBeInTheDocument();
    expect(screen.getByText("业务学期 · 已停用")).toBeInTheDocument();

    rerender(
      <TooltipProvider>
        <SidebarProvider>
          <SemesterProvider semesters={[autumn2026]}>
            <SemesterSwitcher />
          </SemesterProvider>
        </SidebarProvider>
      </TooltipProvider>,
    );

    expect(screen.getByText("2026年秋季")).toBeInTheDocument();
    expect(screen.getByText("业务学期 · 已启用")).toBeInTheDocument();
  });

  it("falls back to the first semester when no current-date match exists and keeps inactive items selectable", () => {
    const spring2027 = {
      id: "spring-2027",
      name: "2027年春季",
      startDate: new Date("2026-09-01T00:00:00.000Z"),
      endDate: new Date("2027-03-01T00:00:00.000Z"),
      isActive: false,
    };
    const autumn2027 = {
      id: "autumn-2027",
      name: "2027年秋季",
      startDate: new Date("2027-03-01T00:00:00.000Z"),
      endDate: new Date("2027-09-01T00:00:00.000Z"),
      isActive: true,
    };

    renderSemesterSwitcher([spring2027, autumn2027]);

    openSwitcherMenu(/2027年春季/i);

    expect(screen.getByRole("menuitem", { name: /2027年春季.*已停用/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "管理学期列表..." })).toHaveAttribute(
      "href",
      "/admin/semesters",
    );
  });

  it("persists the selected semester and refreshes the current route", async () => {
    const spring2027 = {
      id: "spring-2027",
      name: "2027年春季",
      startDate: new Date("2026-09-01T00:00:00.000Z"),
      endDate: new Date("2027-03-01T00:00:00.000Z"),
      isActive: false,
    };
    const autumn2026 = {
      id: "autumn-2026",
      name: "2026年秋季",
      startDate: new Date("2026-03-01T00:00:00.000Z"),
      endDate: new Date("2026-09-01T00:00:00.000Z"),
      isActive: true,
    };

    renderSemesterSwitcher([spring2027, autumn2026]);

    openSwitcherMenu(/2026年秋季/i);
    fireEvent.click(screen.getByRole("menuitem", { name: /2027年春季/i }));

    await Promise.resolve();
    await Promise.resolve();

    expect(mocks.persistSelectedSemesterId).toHaveBeenCalledWith("spring-2027");
    expect(mocks.refresh).toHaveBeenCalledTimes(1);
  });
});
