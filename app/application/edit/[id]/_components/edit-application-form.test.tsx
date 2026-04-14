import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EditApplicationForm } from "./edit-application-form";
import type { DeserializedApplication } from "@/app/actions/application";
import { createEditingApplication } from "@/tests/fixtures/application-factory";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/app/actions/application", () => ({
  submitApplicationEdit: vi.fn(),
}));

vi.mock("@/components/ui/image-uploader", () => ({
  ImageUploader: () => <div data-testid="image-uploader" />,
}));

vi.mock("@/components/ui/single-image-uploader", () => ({
  SingleImageUploader: ({ label }: { label: string }) => <div>{label}</div>,
}));

describe("EditApplicationForm", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows optional guardian and student residence permit upload for non-local applicants", () => {
    const application = createEditingApplication({
      residencyType: "NON_LOCAL",
      fileResidencePermit: [],
    }) as unknown as DeserializedApplication;

    render(
      <EditApplicationForm application={application} rejectedFields={[]} />,
    );

    expect(screen.getByText("4. 监护人及学生居住证")).toBeInTheDocument();
    expect(screen.queryByText("4. 监护人或学生居住证 *")).not.toBeInTheDocument();
  });
});
