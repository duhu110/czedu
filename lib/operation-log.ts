import type { ApplicationStatus, OperationLogAction } from "@prisma/client";

type StatusChangeDetails = {
  fromStatus?: ApplicationStatus;
  toStatus?: ApplicationStatus;
  adminRemark?: string | null;
  targetSchool?: string | null;
  rejectedFields?: string[];
};

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  PENDING: "待审核",
  APPROVED: "已通过",
  REJECTED: "已驳回",
  SUPPLEMENT: "待补学籍信息卡",
  EDITING: "待修改",
};

export const operationActionLabels: Record<OperationLogAction, string> = {
  APPLICATION_STATUS_CHANGED: "申请单状态变更",
};

export function parseOperationLogDetails(details: string): StatusChangeDetails {
  try {
    const parsed = JSON.parse(details);
    return parsed && typeof parsed === "object"
      ? (parsed as StatusChangeDetails)
      : {};
  } catch {
    return {};
  }
}
