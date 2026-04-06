import { describe, expect, it } from "vitest";

import { getDashboardTrendTotals } from "@/lib/admin/dashboard-trends";

describe("dashboard trends", () => {
  it("returns non-empty trend totals for each range", () => {
    expect(getDashboardTrendTotals("7d").length).toBeGreaterThan(0);
    expect(getDashboardTrendTotals("30d").length).toBeGreaterThan(0);
    expect(getDashboardTrendTotals("90d").length).toBeGreaterThan(0);
  });
});
