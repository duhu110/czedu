import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

function SmokeCard() {
  return <div>测试环境可用</div>;
}

describe("test setup", () => {
  it("renders a basic React component", () => {
    render(<SmokeCard />);
    expect(screen.getByText("测试环境可用")).toBeInTheDocument();
  });
});
