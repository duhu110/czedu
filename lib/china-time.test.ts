import { describe, expect, it, vi } from "vitest";

import {
  BEIJING_TIME_ZONE,
  formatBeijingDate,
  formatBeijingDateTime,
  formatBeijingTime,
  getBeijingNow,
  parseBeijingDateInputValue,
  toBeijingDateInputValue,
} from "./china-time";

describe("china time helpers", () => {
  it("sets the process default timezone to Beijing", () => {
    expect(BEIJING_TIME_ZONE).toBe("Asia/Shanghai");
    expect(process.env.TZ).toBe("Asia/Shanghai");
  });

  it("formats instants with the Beijing calendar date and time", () => {
    const date = new Date("2026-04-07T16:15:30.000Z");

    expect(formatBeijingDate(date)).toBe("2026-04-08");
    expect(formatBeijingTime(date)).toBe("00:15:30");
    expect(formatBeijingDateTime(date)).toBe("2026-04-08 00:15");
  });

  it("converts date input values as Beijing calendar days", () => {
    const date = parseBeijingDateInputValue("2026-09-01");

    expect(date?.toISOString()).toBe("2026-08-31T16:00:00.000Z");
    expect(toBeijingDateInputValue(date)).toBe("2026-09-01");
    expect(parseBeijingDateInputValue("")).toBeNull();
  });

  it("returns the current instant without changing elapsed-time semantics", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-07T16:15:30.000Z"));

    try {
      expect(getBeijingNow().toISOString()).toBe("2026-04-07T16:15:30.000Z");
    } finally {
      vi.useRealTimers();
    }
  });
});
