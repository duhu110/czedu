import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PrintApplicationButton } from "./print-application-button";

describe("PrintApplicationButton", () => {
  const printMock = vi.fn();

  beforeEach(() => {
    printMock.mockReset();
    vi.stubGlobal("print", printMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("calls window.print when clicked", () => {
    render(<PrintApplicationButton />);

    fireEvent.click(screen.getByRole("button", { name: "打印申请单" }));

    expect(printMock).toHaveBeenCalledTimes(1);
  });
});
