import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ApplicationDetail } from "@/components/admin/application-detail";
import { transferApplications } from "@/lib/admin/mock-transfer-applications";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

describe("ApplicationDetail", () => {
  it("renders the selected application fields in Chinese sections", () => {
    render(<ApplicationDetail application={transferApplications[0]} />);

    expect(screen.getByText("申请摘要")).toBeInTheDocument();
    expect(screen.getByText("学生信息")).toBeInTheDocument();
    expect(screen.getByText("学校信息")).toBeInTheDocument();
    expect(screen.getByText("转学原因")).toBeInTheDocument();
    expect(
      screen.getAllByText(transferApplications[0].studentName).length,
    ).toBeGreaterThan(0);
  });

  it("prints the current application sheet", () => {
    const printSpy = vi.fn();
    Object.defineProperty(window, "print", {
      configurable: true,
      value: printSpy,
    });

    render(<ApplicationDetail application={transferApplications[0]} />);

    fireEvent.click(screen.getAllByRole("button", { name: "打印申请单" })[0]);

    expect(printSpy).toHaveBeenCalled();
    expect(screen.getAllByText("学生转学申请单").length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(transferApplications[0].studentId).length,
    ).toBeGreaterThan(0);
  });
});
