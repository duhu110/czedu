import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Page from "./page";

describe("transfer application home page", () => {
  it("keeps the home template while replacing content with Chinese transfer copy", () => {
    render(<Page />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /转学申请，一站式更稳妥/,
      }),
    ).toBeDefined();

    expect(screen.getAllByRole("link", { name: "申请流程" }).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "预约咨询" })).toBeDefined();
    expect(screen.getByRole("heading", { level: 1, name: "转学案例库" })).toBeDefined();
    expect(screen.getByText("2026 秋季申请趋势")).toBeDefined();
  });

  it("keeps the footer width aligned with the main content container", () => {
    render(<Page />);

    const footer = screen.getAllByRole("contentinfo")[0];

    expect(footer.className).toContain("w-full");
    expect(footer.className).toContain("max-w-5xl");
  });

  it("routes the header entry buttons to user and admin", () => {
    render(<Page />);

    const userLinks = screen.getAllByRole("link", { name: "学生登录" });
    const adminLinks = screen.getAllByRole("link", { name: "管理后台" });

    expect(userLinks.some((link) => link.getAttribute("href") === "/user")).toBe(true);
    expect(adminLinks.some((link) => link.getAttribute("href") === "/admin")).toBe(true);
  });
});
