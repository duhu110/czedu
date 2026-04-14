import type { ApplicationStatus } from "@prisma/client";

export type PrintableApplication = {
  id: string;
  name: string;
  gender: "MALE" | "FEMALE";
  ethnicity: string;
  idCard: string;
  studentId: string;
  residencyType: "LOCAL" | "NON_LOCAL";
  guardian1Name: string;
  guardian1Relation: string;
  guardian1Phone: string;
  guardian2Name: string | null;
  guardian2Relation: string | null;
  guardian2Phone: string | null;
  currentSchool: string;
  currentGrade: string;
  targetGrade: string;
  targetSchool: string | null;
  hukouAddress: string;
  livingAddress: string;
  status: ApplicationStatus;
  adminRemark: string | null;
  semester: { name: string };
};

export function getResidencyTypeLabel(value: PrintableApplication["residencyType"]) {
  return value === "LOCAL" ? "城中区户籍" : "非城中区户籍";
}

export function getGenderLabel(value: PrintableApplication["gender"]) {
  return value === "MALE" ? "男" : "女";
}

export function getFallbackText(
  value: string | null | undefined,
  fallback: string,
) {
  return value && value.trim() ? value : fallback;
}

export function getPendingLookupUrl(id: string, origin: string) {
  return new URL(`/application/pending/${id}`, origin).toString();
}

export function formatPrintTimeLabel(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function maskPhoneNumber(phone: string): string {
  if (phone.length < 7) return phone;
  return phone.slice(0, -4) + "****";
}

export function getStatusPrintLabel(
  status: ApplicationStatus,
  adminRemark: string | null,
): string {
  switch (status) {
    case "APPROVED":
      return "已通过审核";
    case "REJECTED":
      return `申请已驳回${adminRemark ? `（${adminRemark}）` : ""}`;
    case "SUPPLEMENT":
      return "审核中，需要补充学籍信息卡";
    case "PENDING":
      return "审核处理中";
    case "EDITING":
      return "待修改";
    default:
      return "";
  }
}
