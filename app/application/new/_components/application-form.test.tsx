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
    expect(screen.getByText("4. 监护人及学生居住证")).toBeInTheDocument();
    expect(
      screen.getByText(
        "非城中区户籍学生可上传监护人及学生在辖区内的有效居住证，大通湟源湟中户籍学生可不上传，是否上传由人工审核。",
      ),
    ).toBeInTheDocument();
  });

  it("renders required property type choices in the property card", () => {
    render(<ApplicationForm semesterId="semester-1" />);

    expect(screen.getByText("2. 房产信息")).toBeInTheDocument();
    expect(screen.getByText("房产情况")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "购房" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "租房" })).toBeInTheDocument();
  });
});
