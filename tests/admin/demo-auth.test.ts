import { beforeEach, describe, expect, it } from "vitest";

import {
  clearAdminDemoAuth,
  getAdminDemoAuth,
  setAdminDemoAuth,
} from "@/lib/admin/demo-auth";

describe("demo admin auth", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("persists login state in localStorage", () => {
    expect(getAdminDemoAuth()).toBe(false);
    setAdminDemoAuth();
    expect(getAdminDemoAuth()).toBe(true);
    clearAdminDemoAuth();
    expect(getAdminDemoAuth()).toBe(false);
  });
});
