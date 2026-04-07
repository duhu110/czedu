import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ApplicationPrintSheet } from "./application-print-sheet";
import {
  formatPrintTimeLabel,
  getPendingLookupUrl,
} from "./application-print-utils";

const application = {
  id: "app-pending-001",
  name: "张三",
  gender: "MALE" as const,
  idCard: "450123201501010011",
  studentId: "XJ2026001",
  residencyType: "LOCAL" as const,
  guardian1Name: "张父",
  guardian1Phone: "13800000000",
  guardian2Name: null,
  guardian2Phone: null,
  currentSchool: "城中区第三小学",
  currentGrade: "四年级",
  targetGrade: "五年级",
  targetSchool: null,
  hukouAddress: "柳州市城中区户籍地址1号",
  livingAddress: "柳州市城中区居住地址2号",
  semester: { name: "2026年春季学期" },
};

describe("ApplicationPrintSheet", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the print sections and fallback values", () => {
    render(
      <ApplicationPrintSheet
        application={application}
        printTimeLabel="2026-04-07 20:15"
        pendingLookupUrl="https://czedu.local/application/pending/app-pending-001"
      />,
    );

    expect(screen.getByText("转学申请单")).toBeInTheDocument();
    expect(screen.getByText("基本信息")).toBeInTheDocument();
    expect(screen.getByText("监护人信息")).toBeInTheDocument();
    expect(screen.getByText("学校与地址")).toBeInTheDocument();
    expect(screen.getByText("扫码查看申请处理进度")).toBeInTheDocument();
    expect(screen.getByText("监护人签字")).toBeInTheDocument();
    expect(screen.getAllByText("无")).toHaveLength(2);
    expect(screen.getByText("尚未分配")).toBeInTheDocument();
  });

  it("prints the pending-page query url text", () => {
    render(
      <ApplicationPrintSheet
        application={application}
        printTimeLabel="2026-04-07 20:15"
        pendingLookupUrl="https://czedu.local/application/pending/app-pending-001"
      />,
    );

    expect(
      screen.getByText("https://czedu.local/application/pending/app-pending-001"),
    ).toBeInTheDocument();
  });
});

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
});
