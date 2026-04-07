# Admin Application Print Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a print-application flow to the admin application detail page that triggers `window.print()` in-place and renders a separate A4 print sheet containing summary fields, a pending-page QR code, and signature fields.

**Architecture:** Keep `app/admin/(auth)/applications/[id]/page.tsx` as a Server Component that fetches the application once and mounts two new units: a tiny Client Component for the print button and a print-only sheet component for the paper layout. Isolate browser-only concerns into a small QR/print helper module so the sheet remains testable and the page can hide all non-print content with `print:` classes.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind print variants, Vitest, Testing Library, `qrcode`.

---

## File Map

- Modify: `app/admin/(auth)/applications/[id]/page.tsx`
  - Keep server-side data loading.
  - Add screen-only wrapper classes around the current detail UI.
  - Mount the print button and print sheet with the already loaded application data.

- Create: `app/admin/(auth)/applications/_components/print-application-button.tsx`
  - Client-only print trigger with `window.print()`.

- Create: `app/admin/(auth)/applications/_components/application-print-sheet.tsx`
  - Pure print layout receiving the application record and derived print props.

- Create: `app/admin/(auth)/applications/_components/application-print-utils.ts`
  - Small pure helpers for Chinese labels, fallback values, print time formatting, and pending-page URL generation.

- Create: `app/admin/(auth)/applications/_components/application-print-sheet.test.tsx`
  - Verifies print-sheet content, fallback values, and query-link output.

- Create: `app/admin/(auth)/applications/_components/print-application-button.test.tsx`
  - Verifies the button exists and calls `window.print()`.

- Create: `app/admin/(auth)/applications/[id]/page.test.tsx`
  - Verifies page integration renders the new print entry point with fetched data.

## Task 1: Add failing tests for the print button

**Files:**
- Create: `app/admin/(auth)/applications/_components/print-application-button.test.tsx`
- Test: `app/admin/(auth)/applications/_components/print-application-button.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PrintApplicationButton } from "./print-application-button";

describe("PrintApplicationButton", () => {
  const printMock = vi.fn();

  beforeEach(() => {
    printMock.mockReset();
    vi.stubGlobal("print", printMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("calls window.print when clicked", () => {
    render(<PrintApplicationButton />);

    fireEvent.click(screen.getByRole("button", { name: "打印申请单" }));

    expect(printMock).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- "app/admin/(auth)/applications/_components/print-application-button.test.tsx"`

Expected: FAIL because `./print-application-button` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```tsx
"use client";

import { Button } from "@/components/ui/button";

export function PrintApplicationButton() {
  return (
    <Button
      type="button"
      onClick={() => window.print()}
      className="print:hidden"
    >
      打印申请单
    </Button>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- "app/admin/(auth)/applications/_components/print-application-button.test.tsx"`

Expected: PASS with one test.

- [ ] **Step 5: Commit**

```bash
git add app/admin/\(auth\)/applications/_components/print-application-button.tsx app/admin/\(auth\)/applications/_components/print-application-button.test.tsx
git commit -m "feat: add admin application print trigger"
```

## Task 2: Add failing tests for print-sheet helpers and content

**Files:**
- Create: `app/admin/(auth)/applications/_components/application-print-sheet.test.tsx`
- Create: `app/admin/(auth)/applications/_components/application-print-utils.ts`
- Create: `app/admin/(auth)/applications/_components/application-print-sheet.tsx`
- Test: `app/admin/(auth)/applications/_components/application-print-sheet.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ApplicationPrintSheet } from "./application-print-sheet";

const application = {
  id: "app-pending-001",
  name: "张三",
  gender: "MALE",
  idCard: "450123201501010011",
  studentId: "XJ2026001",
  residencyType: "LOCAL",
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
} as const;

describe("ApplicationPrintSheet", () => {
  it("renders the print-only sections and fallback values", () => {
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
    expect(screen.getByText("无")).toBeInTheDocument();
    expect(screen.getByText("尚未分配")).toBeInTheDocument();
  });

  it("prints the pending-page query path text", () => {
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- "app/admin/(auth)/applications/_components/application-print-sheet.test.tsx"`

Expected: FAIL because the sheet module does not exist yet.

- [ ] **Step 3: Write minimal helper and sheet implementation**

```ts
export function getResidencyTypeLabel(value: "LOCAL" | "NON_LOCAL") {
  return value === "LOCAL" ? "城中区户籍" : "非城中区户籍";
}

export function getGenderLabel(value: "MALE" | "FEMALE") {
  return value === "MALE" ? "男" : "女";
}

export function getFallbackText(value: string | null | undefined, fallback: string) {
  return value && value.trim() ? value : fallback;
}
```

```tsx
import {
  getFallbackText,
  getGenderLabel,
  getResidencyTypeLabel,
} from "./application-print-utils";

type ApplicationPrintSheetProps = {
  application: {
    id: string;
    name: string;
    gender: "MALE" | "FEMALE";
    idCard: string;
    studentId: string;
    residencyType: "LOCAL" | "NON_LOCAL";
    guardian1Name: string;
    guardian1Phone: string;
    guardian2Name: string | null;
    guardian2Phone: string | null;
    currentSchool: string;
    currentGrade: string;
    targetGrade: string;
    targetSchool: string | null;
    hukouAddress: string;
    livingAddress: string;
    semester: { name: string };
  };
  printTimeLabel: string;
  pendingLookupUrl: string;
};

export function ApplicationPrintSheet({
  application,
  printTimeLabel,
  pendingLookupUrl,
}: ApplicationPrintSheetProps) {
  return (
    <section className="hidden print:block">
      <h1>转学申请单</h1>
      <p>{application.semester.name}</p>
      <p>申请编号：{application.id}</p>
      <p>打印时间：{printTimeLabel}</p>

      <h2>基本信息</h2>
      <p>学生姓名：{application.name}</p>
      <p>性别：{getGenderLabel(application.gender)}</p>
      <p>身份证号：{application.idCard}</p>
      <p>学籍号：{application.studentId}</p>
      <p>户籍类型：{getResidencyTypeLabel(application.residencyType)}</p>

      <h2>监护人信息</h2>
      <p>监护人1：{application.guardian1Name}</p>
      <p>监护人1电话：{application.guardian1Phone}</p>
      <p>监护人2：{getFallbackText(application.guardian2Name, "无")}</p>
      <p>监护人2电话：{getFallbackText(application.guardian2Phone, "无")}</p>

      <h2>学校与地址</h2>
      <p>当前学校：{application.currentSchool}</p>
      <p>当前年级：{application.currentGrade}</p>
      <p>目标年级：{application.targetGrade}</p>
      <p>分配学校：{getFallbackText(application.targetSchool, "尚未分配")}</p>
      <p>户籍地址：{application.hukouAddress}</p>
      <p>居住地址：{application.livingAddress}</p>

      <h2>查询结果二维码</h2>
      <p>扫码查看申请处理进度</p>
      <p>{pendingLookupUrl}</p>

      <h2>签字栏</h2>
      <p>监护人签字</p>
      <p>审核人签字</p>
      <p>备注</p>
      <p>日期</p>
    </section>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- "app/admin/(auth)/applications/_components/application-print-sheet.test.tsx"`

Expected: PASS with both tests green.

- [ ] **Step 5: Commit**

```bash
git add app/admin/\(auth\)/applications/_components/application-print-utils.ts app/admin/\(auth\)/applications/_components/application-print-sheet.tsx app/admin/\(auth\)/applications/_components/application-print-sheet.test.tsx
git commit -m "feat: add admin application print sheet"
```

## Task 3: Add failing tests for page integration

**Files:**
- Create: `app/admin/(auth)/applications/[id]/page.test.tsx`
- Modify: `app/admin/(auth)/applications/[id]/page.tsx`
- Test: `app/admin/(auth)/applications/[id]/page.test.tsx`

- [ ] **Step 1: Write the failing integration test**

```tsx
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getApplicationByIdMock } = vi.hoisted(() => ({
  getApplicationByIdMock: vi.fn(),
}));

vi.mock("@/app/actions/application", () => ({
  getApplicationById: getApplicationByIdMock,
}));

vi.mock("../_components/approval-panel", () => ({
  ApprovalPanel: () => <div>审批面板占位</div>,
}));

describe("Admin application detail page", () => {
  beforeEach(() => {
    getApplicationByIdMock.mockReset();
    getApplicationByIdMock.mockResolvedValue({
      success: true,
      error: null,
      data: {
        id: "app-pending-001",
        name: "张三",
        status: "PENDING",
        createdAt: new Date("2026-04-07T12:00:00+08:00"),
        semester: { name: "2026年春季学期" },
        residencyType: "LOCAL",
        idCard: "450123201501010011",
        studentId: "XJ2026001",
        gender: "MALE",
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
        fileHukou: [],
        fileProperty: [],
        fileStudentCard: [],
        fileResidencePermit: [],
        adminRemark: null,
      },
    });
  });

  it("renders the print button and the pending lookup path", async () => {
    const Page = (await import("./page")).default;

    render(
      await Page({
        params: Promise.resolve({ id: "app-pending-001" }),
      }),
    );

    expect(screen.getByRole("button", { name: "打印申请单" })).toBeInTheDocument();
    expect(
      screen.getByText(/\/application\/pending\/app-pending-001/),
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- "app/admin/(auth)/applications/[id]/page.test.tsx"`

Expected: FAIL because the page does not yet render the new print components.

- [ ] **Step 3: Write minimal integration implementation**

```tsx
import { PrintApplicationButton } from "../_components/print-application-button";
import { ApplicationPrintSheet } from "../_components/application-print-sheet";
import { formatPrintTimeLabel, getPendingLookupUrl } from "../_components/application-print-utils";

const pendingLookupUrl = getPendingLookupUrl(id, "http://localhost:3000");
const printTimeLabel = formatPrintTimeLabel(new Date());

return (
  <div className="p-6 max-w-7xl mx-auto space-y-6">
    <div className="print:hidden">
      <PrintApplicationButton />
    </div>

    <div className="print:hidden">
      {/* existing detail page content */}
    </div>

    <ApplicationPrintSheet
      application={app}
      printTimeLabel={printTimeLabel}
      pendingLookupUrl={pendingLookupUrl}
    />
  </div>
);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- "app/admin/(auth)/applications/[id]/page.test.tsx"`

Expected: PASS and confirm existing page content still renders on screen.

- [ ] **Step 5: Commit**

```bash
git add app/admin/\(auth\)/applications/\[id\]/page.tsx app/admin/\(auth\)/applications/\[id\]/page.test.tsx
git commit -m "feat: integrate admin application print flow"
```

## Task 4: Refine print helpers for browser origin and print-time formatting

**Files:**
- Modify: `app/admin/(auth)/applications/_components/application-print-utils.ts`
- Modify: `app/admin/(auth)/applications/_components/application-print-sheet.tsx`
- Test: `app/admin/(auth)/applications/_components/application-print-sheet.test.tsx`

- [ ] **Step 1: Add the next failing test for helper behavior**

```tsx
import { describe, expect, it } from "vitest";

import {
  formatPrintTimeLabel,
  getPendingLookupUrl,
} from "./application-print-utils";

describe("application print utils", () => {
  it("builds a pending lookup url from a supplied origin", () => {
    expect(getPendingLookupUrl("app-42", "https://czedu.local")).toBe(
      "https://czedu.local/application/pending/app-42",
    );
  });

  it("formats print time in zh-CN style", () => {
    expect(formatPrintTimeLabel(new Date("2026-04-07T20:15:00+08:00"))).toMatch(
      /2026/,
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- "app/admin/(auth)/applications/_components/application-print-sheet.test.tsx"`

Expected: FAIL because `getPendingLookupUrl` and `formatPrintTimeLabel` are not implemented yet.

- [ ] **Step 3: Write minimal helper refinement**

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- "app/admin/(auth)/applications/_components/application-print-sheet.test.tsx"`

Expected: PASS and no regression on the sheet rendering tests.

- [ ] **Step 5: Commit**

```bash
git add app/admin/\(auth\)/applications/_components/application-print-utils.ts app/admin/\(auth\)/applications/_components/application-print-sheet.tsx app/admin/\(auth\)/applications/_components/application-print-sheet.test.tsx
git commit -m "refactor: stabilize admin application print helpers"
```

## Task 5: Add QR-code rendering and final print styling

**Files:**
- Modify: `app/admin/(auth)/applications/_components/application-print-sheet.tsx`
- Test: `app/admin/(auth)/applications/_components/application-print-sheet.test.tsx`

- [ ] **Step 1: Add the failing QR-container test**

```tsx
it("renders a qr container for the pending lookup url", () => {
  render(
    <ApplicationPrintSheet
      application={application}
      printTimeLabel="2026-04-07 20:15"
      pendingLookupUrl="https://czedu.local/application/pending/app-pending-001"
    />,
  );

  expect(screen.getByTestId("application-pending-qrcode")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- "app/admin/(auth)/applications/_components/application-print-sheet.test.tsx"`

Expected: FAIL because there is no QR container yet.

- [ ] **Step 3: Write minimal QR/styling implementation**

```tsx
import QRCode from "qrcode";
import { useEffect, useRef } from "react";

function PendingLookupQr({ value }: { value: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    void QRCode.toCanvas(canvasRef.current, value, {
      width: 132,
      margin: 1,
    });
  }, [value]);

  return (
    <div className="rounded border p-2" data-testid="application-pending-qrcode">
      <canvas ref={canvasRef} aria-label="申请查询二维码" />
    </div>
  );
}
```

```tsx
<section className="hidden print:block print:min-h-[277mm] print:px-6 print:py-5 text-black">
  <div className="border border-black p-6">
    {/* structured rows, qr panel, signature grid */}
  </div>
</section>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- "app/admin/(auth)/applications/_components/application-print-sheet.test.tsx"`

Expected: PASS with all sheet tests green.

- [ ] **Step 5: Commit**

```bash
git add app/admin/\(auth\)/applications/_components/application-print-sheet.tsx app/admin/\(auth\)/applications/_components/application-print-sheet.test.tsx
git commit -m "feat: render admin application print qrcode"
```

## Task 6: Run targeted verification and then full relevant test suite

**Files:**
- No code changes required unless failures are found.

- [ ] **Step 1: Run the focused tests**

Run:

```bash
npm test -- "app/admin/(auth)/applications/_components/print-application-button.test.tsx"
npm test -- "app/admin/(auth)/applications/_components/application-print-sheet.test.tsx"
npm test -- "app/admin/(auth)/applications/[id]/page.test.tsx"
```

Expected: PASS for all three files.

- [ ] **Step 2: Run the nearby regression tests**

Run:

```bash
npm test -- "app/admin/(auth)/applications/_components/approval-panel.test.tsx"
npm test -- "app/application/application-mock-pages.test.tsx"
```

Expected: PASS to confirm the new print flow did not regress approval or public application routes.

- [ ] **Step 3: If tests fail, fix with fresh failing coverage first**

```text
Do not patch production code blindly.
If a failure reveals missing behavior, add or adjust a failing test first, then implement the minimal fix, then rerun the same command.
```

- [ ] **Step 4: Commit the verified implementation**

```bash
git add app/admin/\(auth\)/applications/\[id\]/page.tsx app/admin/\(auth\)/applications/\[id\]/page.test.tsx app/admin/\(auth\)/applications/_components/print-application-button.tsx app/admin/\(auth\)/applications/_components/print-application-button.test.tsx app/admin/\(auth\)/applications/_components/application-print-sheet.tsx app/admin/\(auth\)/applications/_components/application-print-sheet.test.tsx app/admin/\(auth\)/applications/_components/application-print-utils.ts
git commit -m "feat: add printable admin application sheet"
```

## Self-Review Notes

- Spec coverage:
  - In-place print trigger: Task 1 and Task 3.
  - Independent print layout: Task 2 and Task 5.
  - Page header, QR, signature area, and fallback values: Task 2 and Task 5.
  - Pending-page QR target: Task 3 and Task 4.
  - Verification: Task 6.

- Placeholder scan:
  - No `TODO` or `TBD`.
  - Every implementation task includes concrete file paths, tests, commands, and starter code.

- Type consistency:
  - The plan keeps the application prop shape aligned with the existing server action fields used by the current detail page.
  - Helper names are consistent across the plan: `getPendingLookupUrl`, `formatPrintTimeLabel`, `ApplicationPrintSheet`, `PrintApplicationButton`.
