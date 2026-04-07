import { fireEvent, render, screen, within } from "@testing-library/react";
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

    const screenContent = screen.getAllByTestId("application-screen-content")[0];

    expect(within(screenContent).getByText("申请摘要")).toBeInTheDocument();
    expect(within(screenContent).getByText("学生信息")).toBeInTheDocument();
    expect(within(screenContent).getByText("学校信息")).toBeInTheDocument();
    expect(within(screenContent).getByText("转学原因")).toBeInTheDocument();
    expect(
      screen.getAllByText(transferApplications[0].studentName).length,
    ).toBeGreaterThan(0);
  });

  it("renders a dedicated print area separate from the current page", () => {
    const printSpy = vi.fn();
    Object.defineProperty(window, "print", {
      configurable: true,
      value: printSpy,
    });

    render(<ApplicationDetail application={transferApplications[0]} />);

    const screenContent = screen.getAllByTestId("application-screen-content")[0];
    const printContent = screen.getAllByTestId("application-print-content")[0];

    expect(within(screenContent).getByText("申请摘要")).toBeInTheDocument();
    expect(within(printContent).getByText("学生转学申请单")).toBeInTheDocument();
    expect(within(printContent).getByText(transferApplications[0].id)).toBeInTheDocument();
    expect(
      within(printContent).getByText("扫码查看办理结果"),
    ).toBeInTheDocument();
    expect(
      within(printContent).getByText((_, element) =>
        element?.textContent ===
        `结果查询链接：https://example.com/application-result/${transferApplications[0].id}`,
      ),
    ).toBeInTheDocument();
    expect(within(printContent).queryByText("审核信息")).not.toBeInTheDocument();
    expect(
      within(printContent).queryByText("结果说明："),
    ).not.toBeInTheDocument();
    expect(screenContent).not.toContainElement(printContent);

    fireEvent.click(screen.getAllByRole("button", { name: "打印申请单" })[0]);

    expect(printSpy).toHaveBeenCalled();
  });
});
