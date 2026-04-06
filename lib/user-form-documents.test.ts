import { describe, expect, it } from "vitest";

import {
  createInitialDocumentUploads,
  validateRequiredDocumentUploads,
} from "@/lib/user-form-documents";

describe("user form required document uploads", () => {
  it("marks both required groups missing when nothing is uploaded", () => {
    expect(validateRequiredDocumentUploads(createInitialDocumentUploads())).toEqual(
      {
        householdRegister: "请上传户口本材料",
        propertyCertificate: "请上传房产证材料",
      },
    );
  });

  it("keeps only the still-missing group when one side has files", () => {
    const uploads = createInitialDocumentUploads();
    uploads.householdRegister = [new File(["hukou"], "hukou.pdf")];

    expect(validateRequiredDocumentUploads(uploads)).toEqual({
      propertyCertificate: "请上传房产证材料",
    });
  });

  it("passes validation when both required groups have files", () => {
    const uploads = createInitialDocumentUploads();
    uploads.householdRegister = [new File(["hukou"], "hukou.pdf")];
    uploads.propertyCertificate = [new File(["property"], "property.pdf")];

    expect(validateRequiredDocumentUploads(uploads)).toEqual({});
  });
});
