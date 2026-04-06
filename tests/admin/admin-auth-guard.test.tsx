import { act } from "react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminAuthGuard } from "@/components/admin/admin-auth-guard";

describe("admin auth guard", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("does not redirect back to login during hydration when already authenticated", async () => {
    window.localStorage.setItem("admin-demo-auth", "true");

    const replaceSpy = vi
      .spyOn(window.location, "replace")
      .mockImplementation(() => {});

    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <AdminAuthGuard>
        <div>管理控制台</div>
      </AdminAuthGuard>,
    );

    document.body.appendChild(container);

    let root: ReturnType<typeof hydrateRoot> | undefined;

    await act(async () => {
      root = hydrateRoot(
        container,
        <AdminAuthGuard>
          <div>管理控制台</div>
        </AdminAuthGuard>,
      );
    });

    expect(replaceSpy).not.toHaveBeenCalled();
    expect(container).toHaveTextContent("管理控制台");

    root?.unmount();
    container.remove();
    replaceSpy.mockRestore();
  });
});
