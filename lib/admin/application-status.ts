export const applicationStatuses = [
  "申请中",
  "已审核",
  "审核通过",
  "待补充资料",
  "已驳回",
] as const;

export type ApplicationStatus = (typeof applicationStatuses)[number];

export const applicationStatusMeta: Record<
  ApplicationStatus,
  { label: ApplicationStatus; className: string }
> = {
  申请中: {
    label: "申请中",
    className: "border-amber-200 bg-amber-500/10 text-amber-700",
  },
  已审核: {
    label: "已审核",
    className: "border-sky-200 bg-sky-500/10 text-sky-700",
  },
  审核通过: {
    label: "审核通过",
    className: "border-emerald-200 bg-emerald-500/10 text-emerald-700",
  },
  待补充资料: {
    label: "待补充资料",
    className: "border-orange-200 bg-orange-500/10 text-orange-700",
  },
  已驳回: {
    label: "已驳回",
    className: "border-rose-200 bg-rose-500/10 text-rose-700",
  },
};
