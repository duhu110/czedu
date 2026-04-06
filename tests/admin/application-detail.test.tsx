import { render, screen } from "@testing-library/react";
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
      screen.getByText(transferApplications[0].studentName),
    ).toBeInTheDocument();
  });
});
