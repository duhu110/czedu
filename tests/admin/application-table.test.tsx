import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ApplicationTable } from "@/components/admin/application-table";
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

describe("ApplicationTable", () => {
  it("renders status labels and pagination text", () => {
    render(<ApplicationTable data={transferApplications} />);

    expect(
      screen.getAllByText(/申请中|已审核|审核通过|待补充资料|已驳回/).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText(/第 1 页/)).toBeInTheDocument();
  });
});
