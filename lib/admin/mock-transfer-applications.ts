import { type ApplicationStatus } from "@/lib/admin/application-status";

export type TransferApplication = {
  id: string;
  studentName: string;
  studentId: string;
  currentSchool: string;
  currentGrade: string;
  targetSchool: string;
  targetGrade: string;
  phone: string;
  email: string;
  reason: string;
  status: ApplicationStatus;
  applyDate: string;
  reviewDate: string | null;
  reviewer: string;
  progress: number;
  resultSummary: string;
  missingDocuments: string[];
  notes: string;
};

const baseApplications: Omit<TransferApplication, "progress">[] = [
  {
    id: "TA-2026-001",
    studentName: "张晨曦",
    studentId: "GZ202401001",
    currentSchool: "城东实验小学",
    currentGrade: "六年级",
    targetSchool: "朝阳第一小学",
    targetGrade: "六年级",
    phone: "13812340001",
    email: "parent001@example.com",
    reason: "家庭搬迁至朝阳街道，需要就近入学。",
    status: "申请中",
    applyDate: "2026-03-21",
    reviewDate: null,
    reviewer: "李老师",
    resultSummary: "材料已提交，等待初审。",
    missingDocuments: [],
    notes: "户籍迁移证明已上传。",
  },
  {
    id: "TA-2026-002",
    studentName: "李沐阳",
    studentId: "GZ202401002",
    currentSchool: "城西第二小学",
    currentGrade: "五年级",
    targetSchool: "育才小学",
    targetGrade: "五年级",
    phone: "13812340002",
    email: "parent002@example.com",
    reason: "监护人工作调动，需随迁转学。",
    status: "待补充资料",
    applyDate: "2026-03-18",
    reviewDate: "2026-03-22",
    reviewer: "王老师",
    resultSummary: "需补充居住证和近三个月水电缴费证明。",
    missingDocuments: ["居住证", "近三个月水电缴费证明"],
    notes: "已短信通知家长补充材料。",
  },
  {
    id: "TA-2026-003",
    studentName: "王语桐",
    studentId: "GZ202401003",
    currentSchool: "附属实验中学",
    currentGrade: "初一",
    targetSchool: "市第三中学",
    targetGrade: "初一",
    phone: "13812340003",
    email: "parent003@example.com",
    reason: "原居住地址变更，通学距离过远。",
    status: "审核通过",
    applyDate: "2026-03-10",
    reviewDate: "2026-03-20",
    reviewer: "周老师",
    resultSummary: "审核通过，等待学校接收确认。",
    missingDocuments: [],
    notes: "已同步至学校端。",
  },
  {
    id: "TA-2026-004",
    studentName: "赵梓涵",
    studentId: "GZ202401004",
    currentSchool: "新区实验小学",
    currentGrade: "四年级",
    targetSchool: "明德小学",
    targetGrade: "四年级",
    phone: "13812340004",
    email: "parent004@example.com",
    reason: "家庭长期居住地址迁入目标学区。",
    status: "已审核",
    applyDate: "2026-03-12",
    reviewDate: "2026-03-24",
    reviewer: "陈老师",
    resultSummary: "区教育局审核完成，待学校确认学位。",
    missingDocuments: [],
    notes: "已进入学校确认阶段。",
  },
  {
    id: "TA-2026-005",
    studentName: "孙嘉宁",
    studentId: "GZ202401005",
    currentSchool: "湖滨小学",
    currentGrade: "三年级",
    targetSchool: "育新小学",
    targetGrade: "三年级",
    phone: "13812340005",
    email: "parent005@example.com",
    reason: "父母离异后监护关系调整。",
    status: "已驳回",
    applyDate: "2026-03-08",
    reviewDate: "2026-03-16",
    reviewer: "刘老师",
    resultSummary: "监护权证明材料不完整，申请未通过。",
    missingDocuments: [],
    notes: "建议补齐材料后重新提交。",
  },
  {
    id: "TA-2026-006",
    studentName: "周奕辰",
    studentId: "GZ202401006",
    currentSchool: "向阳小学",
    currentGrade: "二年级",
    targetSchool: "实验附小",
    targetGrade: "二年级",
    phone: "13812340006",
    email: "parent006@example.com",
    reason: "家长工作地点调整，接送困难。",
    status: "申请中",
    applyDate: "2026-03-25",
    reviewDate: null,
    reviewer: "李老师",
    resultSummary: "申请已进入受理队列。",
    missingDocuments: [],
    notes: "等待街道核验居住信息。",
  },
  {
    id: "TA-2026-007",
    studentName: "吴思源",
    studentId: "GZ202401007",
    currentSchool: "城南第一小学",
    currentGrade: "一年级",
    targetSchool: "启明小学",
    targetGrade: "一年级",
    phone: "13812340007",
    email: "parent007@example.com",
    reason: "随军家属安置，申请转入驻地学区。",
    status: "审核通过",
    applyDate: "2026-03-05",
    reviewDate: "2026-03-15",
    reviewer: "周老师",
    resultSummary: "学位确认完成，可按通知办理报到。",
    missingDocuments: [],
    notes: "已生成报到通知。",
  },
  {
    id: "TA-2026-008",
    studentName: "郑雨萌",
    studentId: "GZ202401008",
    currentSchool: "启航中学",
    currentGrade: "初二",
    targetSchool: "市第七中学",
    targetGrade: "初二",
    phone: "13812340008",
    email: "parent008@example.com",
    reason: "父母工作调动至新城区。",
    status: "待补充资料",
    applyDate: "2026-03-14",
    reviewDate: "2026-03-23",
    reviewer: "王老师",
    resultSummary: "需要补充学生综合素质档案。",
    missingDocuments: ["综合素质档案", "原校在读证明"],
    notes: "原学校已联系补传。",
  },
  {
    id: "TA-2026-009",
    studentName: "何铭轩",
    studentId: "GZ202401009",
    currentSchool: "东城中学",
    currentGrade: "初三",
    targetSchool: "实验中学",
    targetGrade: "初三",
    phone: "13812340009",
    email: "parent009@example.com",
    reason: "家庭实际居住地址迁入目标学区。",
    status: "已审核",
    applyDate: "2026-03-11",
    reviewDate: "2026-03-26",
    reviewer: "陈老师",
    resultSummary: "已完成审核，待学校反馈。",
    missingDocuments: [],
    notes: "涉及毕业年级，优先处理。",
  },
  {
    id: "TA-2026-010",
    studentName: "高若溪",
    studentId: "GZ202401010",
    currentSchool: "文汇小学",
    currentGrade: "五年级",
    targetSchool: "文博小学",
    targetGrade: "五年级",
    phone: "13812340010",
    email: "parent010@example.com",
    reason: "长期借住转正式居住，申请就近入学。",
    status: "申请中",
    applyDate: "2026-03-27",
    reviewDate: null,
    reviewer: "李老师",
    resultSummary: "等待学区办核查。",
    missingDocuments: [],
    notes: "已录入最新房产信息。",
  },
  {
    id: "TA-2026-011",
    studentName: "彭嘉懿",
    studentId: "GZ202401011",
    currentSchool: "青云小学",
    currentGrade: "四年级",
    targetSchool: "明德小学",
    targetGrade: "四年级",
    phone: "13812340011",
    email: "parent011@example.com",
    reason: "监护人变更，需迁入实际监护地。",
    status: "审核通过",
    applyDate: "2026-03-06",
    reviewDate: "2026-03-18",
    reviewer: "周老师",
    resultSummary: "监护关系材料审核无误。",
    missingDocuments: [],
    notes: "等待线下确认入学。",
  },
  {
    id: "TA-2026-012",
    studentName: "许安然",
    studentId: "GZ202401012",
    currentSchool: "晨曦小学",
    currentGrade: "六年级",
    targetSchool: "朝阳第一小学",
    targetGrade: "六年级",
    phone: "13812340012",
    email: "parent012@example.com",
    reason: "家长长期在目标学校周边工作生活。",
    status: "已驳回",
    applyDate: "2026-03-09",
    reviewDate: "2026-03-17",
    reviewer: "刘老师",
    resultSummary: "现有证明无法满足学区认定要求。",
    missingDocuments: [],
    notes: "建议改为跨区统筹申请。",
  },
];

function getProgress(status: ApplicationStatus) {
  switch (status) {
    case "审核通过":
    case "已驳回":
      return 100;
    case "已审核":
      return 80;
    case "待补充资料":
      return 55;
    case "申请中":
    default:
      return 35;
  }
}

export const transferApplications: TransferApplication[] = baseApplications.map(
  (application) => ({
    ...application,
    progress: getProgress(application.status),
  }),
);

export function getTransferApplicationById(id: string) {
  return transferApplications.find((application) => application.id === id);
}

export function getTransferDashboardSummary() {
  return {
    total: transferApplications.length,
    pending: transferApplications.filter(
      (application) => application.status === "申请中",
    ).length,
    supplementRequired: transferApplications.filter(
      (application) => application.status === "待补充资料",
    ).length,
    approved: transferApplications.filter(
      (application) => application.status === "审核通过",
    ).length,
  };
}
