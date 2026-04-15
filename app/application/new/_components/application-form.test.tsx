import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ApplicationForm } from "./application-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/app/actions/application", () => ({
  createApplication: vi.fn(),
}));

vi.mock("@/components/ui/image-uploader", () => ({
  ImageUploader: () => <div data-testid="image-uploader" />,
}));

vi.mock("@/components/ui/single-image-uploader", () => ({
  SingleImageUploader: ({ label }: { label: string }) => <div>{label}</div>,
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("ApplicationForm", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders a remark field for parent notes", () => {
    render(<ApplicationForm semesterId="semester-1" />);

    expect(screen.getByLabelText("备注")).toBeInTheDocument();
  });

  it("renders separate guardian and student residence permit upload slots for non-local applicants", () => {
    render(<ApplicationForm semesterId="semester-1" />);

    fireEvent.click(screen.getByRole("radio", { name: "非城中区户籍" }));

    expect(screen.getByText("监护人居住证")).toBeInTheDocument();
    expect(screen.getByText("学生居住证")).toBeInTheDocument();
  });
});
