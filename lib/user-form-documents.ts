export const documentGroupConfigs = [
  {
    key: "householdRegister",
    label: "户口本",
    description: "请上传户口本相关页，可多文件。",
    required: true,
  },
  {
    key: "propertyCertificate",
    label: "房产证",
    description: "请上传房产证相关页，可多文件。",
    required: true,
  },
] as const;

export type DocumentGroupKey = (typeof documentGroupConfigs)[number]["key"];

export type DocumentUploads = Record<DocumentGroupKey, File[]>;

export type DocumentUploadErrors = Partial<Record<DocumentGroupKey, string>>;

export const createInitialDocumentUploads = (): DocumentUploads => ({
  householdRegister: [],
  propertyCertificate: [],
});

export const validateRequiredDocumentUploads = (
  uploads: DocumentUploads,
): DocumentUploadErrors => {
  const errors: DocumentUploadErrors = {};

  for (const group of documentGroupConfigs) {
    if (group.required && uploads[group.key].length === 0) {
      errors[group.key] = `请上传${group.label}材料`;
    }
  }

  return errors;
};
