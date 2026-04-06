import { describe, expect, it } from "vitest";

import {
  getTransferApplicationById,
  getTransferDashboardSummary,
  transferApplications,
} from "@/lib/admin/mock-transfer-applications";

describe("transfer application mocks", () => {
  it("provides enough records for pagination", () => {
    expect(transferApplications.length).toBeGreaterThan(10);
  });

  it("computes dashboard summary from statuses", () => {
    expect(getTransferDashboardSummary()).toMatchObject({
      total: transferApplications.length,
      pending: expect.any(Number),
      supplementRequired: expect.any(Number),
      approved: expect.any(Number),
    });
  });

  it("finds a record by id", () => {
    expect(getTransferApplicationById("TA-2026-001")?.studentName).toBe("张晨曦");
  });
});
