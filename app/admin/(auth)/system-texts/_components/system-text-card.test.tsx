import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SystemTextCard } from "./system-text-card";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/app/actions/system-text", () => ({
  upsertSystemText: vi.fn(),
}));

describe("SystemTextCard", () => {
  it("applies first-line indentation to the content preview", () => {
    render(
      <SystemTextCard
        type="TRANSFER_NOTICE"
        label="转学须知"
        description="说明"
        content={"第一段内容\n第二段内容"}
        semesterId="semester-1"
        onSaved={() => {}}
      />,
    );

    const preview = screen.getByText(
      (_, element) =>
        element?.tagName === "P" &&
        element.textContent === "第一段内容\n第二段内容",
    );

    expect(preview).toHaveClass("indent-[2em]");
  });
});
