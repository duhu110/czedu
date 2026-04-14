import { type ApplicationStatus, type ResidencyType } from "@prisma/client";

import { formatBeijingDate } from "@/lib/china-time";

export const applicationStatusImportExportLabels: Record<
  ApplicationStatus,
  string
> = {
  PENDING: "待审核",
  APPROVED: "已通过",
  REJECTED: "已驳回",
  SUPPLEMENT: "待补学籍信息卡",
  EDITING: "待修改",
};

const importStatusByLabel = Object.fromEntries(
  Object.entries(applicationStatusImportExportLabels).map(([status, label]) => [
    label,
    status,
  ]),
) as Record<string, ApplicationStatus>;

export const APPLICATION_XLSX_HEADERS = [
  "工单编号",
  "学生姓名",
  "身份证号",
  "当前学校",
  "当前年级",
  "申请转入年级",
  "目标学校",
  "户籍类型",
  "提交时间",
  "状态",
  "审核备注",
] as const;

type ApplicationXlsxHeader = (typeof APPLICATION_XLSX_HEADERS)[number];

export type ApplicationExportRecord = {
  id: string;
  name: string;
  idCard: string;
  currentSchool: string;
  currentGrade: string;
  targetGrade: string;
  targetSchool: string | null;
  residencyType: ResidencyType;
  createdAt: Date;
  status: ApplicationStatus;
  adminRemark: string | null;
};

export type ApplicationExportRow = Record<ApplicationXlsxHeader, string>;

export type ApplicationImportRow = {
  id: string;
  targetSchool: string | null;
  status?: ApplicationStatus;
  adminRemark: string | null;
};

type ParseImportResult =
  | {
      success: true;
      error: null;
      data: ApplicationImportRow[];
    }
  | {
      success: false;
      error: string;
      data: [];
    };

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : String(value ?? "").trim();
}

function normalizeNullableText(value: unknown) {
  const normalized = normalizeText(value);
  return normalized ? normalized : null;
}

function isHeaderRowValid(headers: string[]) {
  return (
    headers.length === APPLICATION_XLSX_HEADERS.length &&
    APPLICATION_XLSX_HEADERS.every((header, index) => headers[index] === header)
  );
}

function isImportRowEmpty(row: Record<string, unknown>) {
  return Object.values(row).every((value) => normalizeText(value) === "");
}

function formatResidencyType(residencyType: ResidencyType) {
  return residencyType === "LOCAL" ? "城中区户籍" : "非城中区户籍";
}

export function buildApplicationExportRows(
  applications: ApplicationExportRecord[],
): ApplicationExportRow[] {
  return applications.map((application) => ({
    工单编号: application.id,
    学生姓名: application.name,
    身份证号: application.idCard,
    当前学校: application.currentSchool,
    当前年级: application.currentGrade,
    申请转入年级: application.targetGrade,
    目标学校: application.targetSchool ?? "",
    户籍类型: formatResidencyType(application.residencyType),
    提交时间: formatBeijingDate(application.createdAt),
    状态: applicationStatusImportExportLabels[application.status],
    审核备注: application.adminRemark ?? "",
  }));
}

export function parseApplicationImportRows(
  headers: readonly string[],
  rows: Array<Record<string, unknown>>,
): ParseImportResult {
  const normalizedHeaders = headers.map((header) => normalizeText(header));
  if (!isHeaderRowValid(normalizedHeaders)) {
    return {
      success: false,
      error: "导入模板表头不正确，仅支持中文列名的 XLSX 文件",
      data: [],
    };
  }

  const parsedRows: ApplicationImportRow[] = [];

  for (const [index, row] of rows.entries()) {
    if (isImportRowEmpty(row)) {
      continue;
    }

    const id = normalizeText(row["工单编号"]);
    if (!id) {
      return {
        success: false,
        error: `第 ${index + 2} 行缺少工单编号`,
        data: [],
      };
    }

    const statusLabel = normalizeText(row["状态"]);
    if (statusLabel && !importStatusByLabel[statusLabel]) {
      return {
        success: false,
        error: `第 ${index + 2} 行的状态无效，仅支持中文状态名称`,
        data: [],
      };
    }

    parsedRows.push({
      id,
      targetSchool: normalizeNullableText(row["目标学校"]),
      status: statusLabel ? importStatusByLabel[statusLabel] : undefined,
      adminRemark: normalizeNullableText(row["审核备注"]),
    });
  }

  return {
    success: true,
    error: null,
    data: parsedRows,
  };
}
