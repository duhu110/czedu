import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ApplicationPrintSheet } from "./application-print-sheet";
import {
  formatPrintTimeLabel,
  getPendingLookupUrl,
  maskPhoneNumber,
  getStatusPrintLabel,
} from "./application-print-utils";

const { mockMaskPhone } = vi.hoisted(() => ({
  mockMaskPhone: { value: false },
}));

vi.mock("./print-context", () => ({
  usePrintContext: () => ({
    maskPhone: mockMaskPhone.value,
    triggerPrint: vi.fn(),
  }),
}));

const application = {
  id: "app-pending-001",
  name: "张三",
  gender: "MALE" as const,
  ethnicity: "汉族",
  idCard: "630103201501010011",
  studentId: "G2026001001",
  residencyType: "LOCAL" as const,
  propertyType: "PURCHASE" as const,
  guardian1Name: "张父",
  guardian1Relation: "父亲",
  guardian1Phone: "13800001234",
  guardian2Name: "张母",
  guardian2Relation: "母亲",
  guardian2Phone: "13900005678",
  currentSchool: "城中区第三小学",
  currentGrade: "四年级",
  targetGrade: "五年级",
  targetSchool: null,
  hukouAddress: "城中区南关街25号",
  livingAddress: "城中区南关街25号",
  status: "PENDING" as const,
  adminRemark: null,
  semester: { name: "2026年春季学期" },
};

const baseProps = {
  application,
  printTimeLabel: "2026-04-07 20:15",
  qrCodeDataUrl: "data:image/png;base64,qr-code",
  transferNoticeContent: "转学须知内容示例",
  consentFormContent: "知情同意书内容示例",
  pendingTextContent: null,
};

describe("ApplicationPrintSheet", () => {
  afterEach(() => {
    cleanup();
    mockMaskPhone.value = false;
  });

  it("renders 4-row print layout structure", () => {
    render(<ApplicationPrintSheet {...baseProps} />);

    expect(screen.getByTestId("print-row-1")).toBeInTheDocument();
    expect(screen.getByTestId("print-row-2")).toBeInTheDocument();
    expect(screen.getByTestId("print-row-3")).toBeInTheDocument();
    expect(screen.getByTestId("print-row-4")).toBeInTheDocument();
  });

  it("renders header with title and semester", () => {
    render(<ApplicationPrintSheet {...baseProps} />);

    expect(screen.getByText("城中区教育局转学申请单")).toBeInTheDocument();
    expect(screen.getByText("2026年春季学期")).toBeInTheDocument();
  });

  it("renders student basic info in row 1", () => {
    render(<ApplicationPrintSheet {...baseProps} />);

    expect(screen.getByText("张三")).toBeInTheDocument();
    expect(screen.getByText("男")).toBeInTheDocument();
    expect(screen.getByText("汉族")).toBeInTheDocument();
    expect(screen.getByText("630103201501010011")).toBeInTheDocument();
    expect(screen.getByText("购房")).toBeInTheDocument();
  });

  it("renders transfer notice in row 2", () => {
    render(<ApplicationPrintSheet {...baseProps} />);

    expect(screen.getByText("转学须知")).toBeInTheDocument();
    expect(screen.getByText("转学须知内容示例")).toHaveClass("indent-[2em]");
  });

  it("shows fallback when transfer notice is empty", () => {
    render(
      <ApplicationPrintSheet
        {...baseProps}
        transferNoticeContent={null}
      />,
    );

    expect(screen.getByText("暂未设置转学须知")).toBeInTheDocument();
  });

  it("renders consent form in row 4", () => {
    render(<ApplicationPrintSheet {...baseProps} />);

    expect(screen.getByText("转学知情同意书")).toBeInTheDocument();
    expect(screen.getByText(/知情同意书内容示例/)).toHaveClass("indent-[2em]");
  });

  it("renders status info and QR code in row 3", () => {
    render(<ApplicationPrintSheet {...baseProps} />);

    expect(screen.getByText("审核处理中")).toBeInTheDocument();
    expect(screen.getByTestId("application-pending-qrcode")).toBeInTheDocument();
  });

  it("renders pending status text from system text content", () => {
    render(
      <ApplicationPrintSheet
        {...baseProps}
        pendingTextContent={"数据库待审核文案第一行\n数据库待审核文案第二行"}
      />,
    );

    expect(screen.getByText("数据库待审核文案第一行")).toBeInTheDocument();
    expect(screen.getByText("数据库待审核文案第二行")).toBeInTheDocument();
    expect(screen.queryByText("您的转学申请已提交，目前正在审核中。")).not.toBeInTheDocument();
  });

  it("renders SUPPLEMENT status with reminder in row 3", () => {
    render(
      <ApplicationPrintSheet
        {...baseProps}
        application={{
          ...application,
          status: "SUPPLEMENT",
          adminRemark: "请补充学籍信息卡",
        }}
      />,
    );

    expect(screen.getByText(/需要补充学籍信息卡/)).toBeInTheDocument();
    expect(screen.getByText(/请尽快补传学籍信息卡/)).toBeInTheDocument();
  });

  it("renders signature area in row 4", () => {
    render(<ApplicationPrintSheet {...baseProps} />);

    expect(screen.getByText("监护人签字：")).toBeInTheDocument();
    expect(screen.getByText("日期：")).toBeInTheDocument();
  });

  // ============ 手机号脱敏 ============

  it("shows full phone numbers when maskPhone is false (archive print)", () => {
    mockMaskPhone.value = false;
    render(<ApplicationPrintSheet {...baseProps} />);

    expect(screen.getByText(/13800001234/)).toBeInTheDocument();
    expect(screen.getByText(/13900005678/)).toBeInTheDocument();
  });

  it("masks phone numbers when maskPhone is true (parent print)", () => {
    mockMaskPhone.value = true;
    render(<ApplicationPrintSheet {...baseProps} />);

    expect(screen.getByText(/1380000\*\*\*\*/)).toBeInTheDocument();
    expect(screen.getByText(/1390000\*\*\*\*/)).toBeInTheDocument();
  });
});

// ============ 工具函数测试 ============

describe("application-print-utils", () => {
  it("builds a pending lookup url from an origin", () => {
    expect(getPendingLookupUrl("app-42", "https://czedu.local")).toBe(
      "https://czedu.local/application/pending/app-42",
    );
  });

  it("formats print time in zh-CN style", () => {
    expect(
      formatPrintTimeLabel(new Date("2026-04-07T20:15:00+08:00")),
    ).toMatch(/2026/);
  });

  it("masks phone number correctly", () => {
    expect(maskPhoneNumber("13800001234")).toBe("1380000****");
    expect(maskPhoneNumber("13900005678")).toBe("1390000****");
  });

  it("returns short phone unchanged", () => {
    expect(maskPhoneNumber("12345")).toBe("12345");
  });

  it("returns correct status labels", () => {
    expect(getStatusPrintLabel("APPROVED", null)).toBe("已通过审核");
    expect(getStatusPrintLabel("REJECTED", "不符合要求")).toContain(
      "申请已驳回",
    );
    expect(getStatusPrintLabel("SUPPLEMENT", null)).toContain(
      "补充学籍信息卡",
    );
    expect(getStatusPrintLabel("PENDING", null)).toBe("审核处理中");
  });
});
