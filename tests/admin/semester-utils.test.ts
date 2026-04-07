import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildSemesterName,
  getDefaultSemesterFormValues,
  getSemesterTimelineStatus,
  getSemesterWindow,
  inferSemesterFormValues,
  pickPreferredSemester,
} from "@/lib/semester";

describe("semester helpers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-07T08:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("builds the semester name from year and term", () => {
    expect(buildSemesterName(2026, "春季")).toBe("2026年春季");
    expect(buildSemesterName(2026, "秋季")).toBe("2026年秋季");
  });

  it("returns the correct semester window for spring and autumn", () => {
    expect(getSemesterWindow(2026, "春季")).toEqual({
      start: new Date("2025-09-01T00:00:00.000Z"),
      end: new Date("2026-03-01T00:00:00.000Z"),
    });

    expect(getSemesterWindow(2026, "秋季")).toEqual({
      start: new Date("2026-03-01T00:00:00.000Z"),
      end: new Date("2026-09-01T00:00:00.000Z"),
    });
  });

  it("infers semester form values from a cross-year semester", () => {
    expect(
      inferSemesterFormValues({
        id: "spring-2026",
        name: "2026年春季",
        startDate: new Date("2025-09-01T00:00:00.000Z"),
        endDate: new Date("2026-03-01T00:00:00.000Z"),
        isActive: true,
      }),
    ).toMatchObject({
      year: 2026,
      term: "春季",
      isActive: true,
    });
  });

  it("falls back to the current-date matching semester when the selected semester disappears", () => {
    expect(
      pickPreferredSemester(
        [
          {
            id: "spring-2026",
            name: "2026年春季",
            startDate: new Date("2025-09-01T00:00:00.000Z"),
            endDate: new Date("2026-03-01T00:00:00.000Z"),
          },
          {
            id: "autumn-2026",
            name: "2026年秋季",
            startDate: new Date("2026-03-01T00:00:00.000Z"),
            endDate: new Date("2026-09-01T00:00:00.000Z"),
          },
        ],
        "missing-id",
      )?.name,
    ).toBe("2026年秋季");
  });

  it("reports an in-progress semester at the current system time", () => {
    expect(
      getSemesterTimelineStatus({
        startDate: new Date("2026-03-01T00:00:00.000Z"),
        endDate: new Date("2026-09-01T00:00:00.000Z"),
      }),
    ).toBe("进行中");
  });

  it("uses the frozen baseline default on 2026-04-07", () => {
    expect(getDefaultSemesterFormValues()).toEqual({
      year: 2026,
      term: "秋季",
      startDate: new Date("2026-03-01T00:00:00.000Z"),
      endDate: new Date("2026-09-01T00:00:00.000Z"),
      isActive: true,
    });
  });

  it("resolves autumn dates to the next spring semester when building defaults", () => {
    const defaults = getDefaultSemesterFormValues(new Date("2026-10-01T00:00:00.000Z"));

    expect(defaults).toMatchObject({
      year: 2027,
      term: "春季",
      isActive: true,
    });
    expect(defaults.startDate).toEqual(new Date("2026-09-01T00:00:00.000Z"));
    expect(defaults.endDate).toEqual(new Date("2027-03-01T00:00:00.000Z"));
  });

  it("keeps the semester current at the exact end boundary when the selection falls back", () => {
    expect(
      pickPreferredSemester(
        [
          {
            id: "spring-2026",
            name: "2026年春季",
            startDate: new Date("2025-09-01T00:00:00.000Z"),
            endDate: new Date("2026-03-01T00:00:00.000Z"),
          },
          {
            id: "autumn-2026",
            name: "2026年秋季",
            startDate: new Date("2026-03-01T00:00:00.000Z"),
            endDate: new Date("2026-09-01T00:00:00.000Z"),
          },
        ],
        "missing-id",
        new Date("2026-09-01T00:00:00.000Z"),
      )?.name,
    ).toBe("2026年秋季");
  });
});
