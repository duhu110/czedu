import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BasicForm } from "@/components/user/basic-form";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe("BasicForm document upload requirements", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    pushMock.mockReset();
  });

  it("shows both required upload errors when submitting without files", () => {
    render(<BasicForm />);

    fireEvent.click(screen.getByRole("button", { name: "提交申请" }));

    expect(screen.getByText("请上传户口本材料")).toBeDefined();
    expect(screen.getByText("请上传房产证材料")).toBeDefined();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("submits after both required document groups receive files", () => {
    render(<BasicForm />);

    fireEvent.change(screen.getByTestId("upload-input-householdRegister"), {
      target: {
        files: [new File(["hukou"], "hukou.pdf", { type: "application/pdf" })],
      },
    });

    fireEvent.change(screen.getByTestId("upload-input-propertyCertificate"), {
      target: {
        files: [
          new File(["property"], "property.pdf", { type: "application/pdf" }),
        ],
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "提交申请" }));

    expect(pushMock).toHaveBeenCalledWith("/user/pending");
  });
});
