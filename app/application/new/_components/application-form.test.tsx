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

describe("ApplicationForm", () => {
  afterEach(() => {
    cleanup();
  });

  it("keeps housing certificate upload visible for non-local applicants", () => {
    render(<ApplicationForm semesterId="semester-1" />);

    fireEvent.click(screen.getByRole("radio", { name: "非城中区户籍" }));

    expect(screen.getByText("2. 住房证明 *")).toBeInTheDocument();
    expect(screen.getByText("不动产权证")).toBeInTheDocument();
    expect(screen.getByText("购房合同")).toBeInTheDocument();
    expect(screen.getByText("租赁备案证明")).toBeInTheDocument();
  });
});
