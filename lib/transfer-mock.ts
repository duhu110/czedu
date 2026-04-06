import type { BasicInfo, SupplementInfo } from "@/lib/transfer-context";

const createMockImage = (label: string, color: string) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480" fill="none">
      <rect width="640" height="480" rx="32" fill="${color}"/>
      <rect x="32" y="32" width="576" height="416" rx="24" fill="white" fill-opacity="0.14"/>
      <text x="50%" y="46%" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="32" font-weight="700">${label}</text>
      <text x="50%" y="58%" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="18">MOCK DOCUMENT PREVIEW</text>
    </svg>`,
  )}`;

export const mockApplicationId = "ZX20260406001";

export const mockBasicInfo: BasicInfo = {
  studentName: "张三",
  studentId: "G2024001234",
  currentSchool: "朝阳区实验小学",
  currentGrade: "六年级",
  targetSchool: "市第一中学",
  targetGrade: "初一",
  phone: "13800138000",
  email: "parent@example.com",
  reason: "因家庭搬迁至目标学校学区内，申请办理转学入读。",
};

export const mockSupplementInfo: SupplementInfo = {
  idCardFront: createMockImage("ID CARD FRONT", "#2563eb"),
  idCardBack: createMockImage("ID CARD BACK", "#0f766e"),
  transcript: createMockImage("TRANSCRIPT", "#7c3aed"),
  transferLetter: createMockImage("TRANSFER LETTER", "#ea580c"),
  additionalDocs: [
    createMockImage("HOUSEHOLD REGISTER", "#db2777"),
    createMockImage("HEALTH REPORT", "#16a34a"),
  ],
};

export const mockConfirmedNotices: string[] = [];

