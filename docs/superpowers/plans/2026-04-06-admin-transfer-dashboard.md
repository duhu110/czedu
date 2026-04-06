# Admin Transfer Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Chinese-language admin demo for student transfer applications with mock dashboard data, paginated application list, detail page, sticky navbar, and demo login redirects.

**Architecture:** Replace the generic English admin demo with a transfer-specific shell driven by a single mock data source in `lib/admin`. Keep authentication intentionally lightweight by using a localStorage-based demo auth helper and a client-side guard in the admin layout. Prefer focused admin-specific components over mutating the existing generic drag-and-drop table so the resulting UI matches the transfer workflow cleanly.

**Tech Stack:** Next.js 16.2 App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui primitives, Vitest, Testing Library

---

### Task 1: Add Test Infrastructure For Admin Work

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`
- Create: `tests/smoke/render.test.tsx`

- [ ] **Step 1: Write the failing smoke test**

```tsx
// tests/smoke/render.test.tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

function SmokeCard() {
  return <div>测试环境可用</div>;
}

describe("test setup", () => {
  it("renders a basic React component", () => {
    render(<SmokeCard />);
    expect(screen.getByText("测试环境可用")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run tests/smoke/render.test.tsx`
Expected: FAIL with module resolution errors because Vitest / jsdom / jest-dom are not configured yet.

- [ ] **Step 3: Add test dependencies and configuration**

```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.2",
    "jsdom": "^26.1.0",
    "tailwindcss": "^4",
    "typescript": "^5",
    "vitest": "^3.2.4"
  }
}
```

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

```ts
// tests/setup.ts
import "@testing-library/jest-dom/vitest";
```

Run: `bun add -d vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom`

- [ ] **Step 4: Run test to verify it passes**

Run: `bunx vitest run tests/smoke/render.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json bun.lock vitest.config.ts tests/setup.ts tests/smoke/render.test.tsx
git commit -m "test: add vitest setup for admin demo"
```

### Task 2: Create Transfer Mock Data And Status Helpers

**Files:**
- Create: `lib/admin/application-status.ts`
- Create: `lib/admin/mock-transfer-applications.ts`
- Create: `tests/admin/mock-transfer-applications.test.ts`

- [ ] **Step 1: Write the failing data test**

```ts
// tests/admin/mock-transfer-applications.test.ts
import { describe, expect, it } from "vitest";
import {
  getTransferApplicationById,
  getTransferDashboardSummary,
  transferApplications,
} from "@/lib/admin/mock-transfer-applications";

describe("transfer application mocks", () => {
  it("provides enough records for pagination", () => {
    expect(transferApplications.length).toBeGreaterThan(10);
  });

  it("computes dashboard summary from statuses", () => {
    expect(getTransferDashboardSummary()).toMatchObject({
      total: transferApplications.length,
      pending: expect.any(Number),
      supplementRequired: expect.any(Number),
      approved: expect.any(Number),
    });
  });

  it("finds a record by id", () => {
    expect(getTransferApplicationById("TA-2026-001")?.studentName).toBe("张晨曦");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run tests/admin/mock-transfer-applications.test.ts`
Expected: FAIL with `Cannot find module '@/lib/admin/mock-transfer-applications'`.

- [ ] **Step 3: Write the minimal implementation**

```ts
// lib/admin/application-status.ts
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
  申请中: { label: "申请中", className: "bg-amber-500/10 text-amber-700 border-amber-200" },
  已审核: { label: "已审核", className: "bg-sky-500/10 text-sky-700 border-sky-200" },
  审核通过: { label: "审核通过", className: "bg-emerald-500/10 text-emerald-700 border-emerald-200" },
  待补充资料: { label: "待补充资料", className: "bg-orange-500/10 text-orange-700 border-orange-200" },
  已驳回: { label: "已驳回", className: "bg-rose-500/10 text-rose-700 border-rose-200" },
};
```

```ts
// lib/admin/mock-transfer-applications.ts
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

const seeds: Omit<TransferApplication, "progress">[] = [
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
];

export const transferApplications: TransferApplication[] = [
  ...seeds,
  ...Array.from({ length: 9 }, (_, index) => ({
    id: `TA-2026-01${index + 4}`,
    studentName: `演示学生${index + 4}`,
    studentId: `GZ2024010${index + 4}`,
    currentSchool: "演示学校",
    currentGrade: "五年级",
    targetSchool: "目标学校",
    targetGrade: "五年级",
    phone: `138123400${index + 4}`,
    email: `demo${index + 4}@example.com`,
    reason: "用于分页与状态展示的演示数据。",
    status: (["申请中", "已审核", "审核通过", "待补充资料", "已驳回"] as const)[index % 5],
    applyDate: "2026-03-28",
    reviewDate: index % 2 === 0 ? "2026-03-30" : null,
    reviewer: "演示审核员",
    progress: [35, 80, 100, 55, 100][index % 5],
    resultSummary: "演示申请处理结果说明。",
    missingDocuments: index % 5 === 3 ? ["户口簿复印件"] : [],
    notes: "演示备注。",
  })),
].map((item) => ({
  ...item,
  progress:
    "progress" in item && typeof item.progress === "number"
      ? item.progress
      : item.status === "审核通过"
        ? 100
        : item.status === "已审核"
          ? 80
          : item.status === "待补充资料"
            ? 55
            : item.status === "申请中"
              ? 35
              : 100,
}));

export function getTransferApplicationById(id: string) {
  return transferApplications.find((item) => item.id === id);
}

export function getTransferDashboardSummary() {
  return {
    total: transferApplications.length,
    pending: transferApplications.filter((item) => item.status === "申请中").length,
    supplementRequired: transferApplications.filter((item) => item.status === "待补充资料").length,
    approved: transferApplications.filter((item) => item.status === "审核通过").length,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bunx vitest run tests/admin/mock-transfer-applications.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/admin/application-status.ts lib/admin/mock-transfer-applications.ts tests/admin/mock-transfer-applications.test.ts
git commit -m "feat: add transfer application mock data"
```

### Task 3: Implement Demo Auth Flow And Admin Entry Redirects

**Files:**
- Create: `lib/admin/demo-auth.ts`
- Create: `components/admin/admin-auth-guard.tsx`
- Modify: `components/admin/login/auth.tsx`
- Modify: `components/home/header.tsx`
- Create: `tests/admin/demo-auth.test.ts`

- [ ] **Step 1: Write the failing auth test**

```ts
// tests/admin/demo-auth.test.ts
import { beforeEach, describe, expect, it } from "vitest";
import {
  clearAdminDemoAuth,
  getAdminDemoAuth,
  setAdminDemoAuth,
} from "@/lib/admin/demo-auth";

describe("demo admin auth", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("persists login state in localStorage", () => {
    expect(getAdminDemoAuth()).toBe(false);
    setAdminDemoAuth();
    expect(getAdminDemoAuth()).toBe(true);
    clearAdminDemoAuth();
    expect(getAdminDemoAuth()).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run tests/admin/demo-auth.test.ts`
Expected: FAIL with `Cannot find module '@/lib/admin/demo-auth'`.

- [ ] **Step 3: Write the minimal implementation**

```ts
// lib/admin/demo-auth.ts
const ADMIN_DEMO_AUTH_KEY = "admin-demo-auth";

export function getAdminDemoAuth() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ADMIN_DEMO_AUTH_KEY) === "true";
}

export function setAdminDemoAuth() {
  window.localStorage.setItem(ADMIN_DEMO_AUTH_KEY, "true");
}

export function clearAdminDemoAuth() {
  window.localStorage.removeItem(ADMIN_DEMO_AUTH_KEY);
}
```

```tsx
// components/admin/admin-auth-guard.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAdminDemoAuth } from "@/lib/admin/demo-auth";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const authenticated = getAdminDemoAuth();

    if (!authenticated && pathname !== "/admin/login") {
      router.replace("/admin/login");
      return;
    }

    if (authenticated && pathname === "/admin/login") {
      router.replace("/admin");
      return;
    }

    setReady(true);
  }, [pathname, router]);

  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">正在跳转...</div>;
  }

  return <>{children}</>;
}
```

```tsx
// components/admin/login/auth.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { HugeiconsIcon } from "@hugeicons/react";
import { AtIcon } from "@hugeicons/core-free-icons";
import { getAdminDemoAuth, setAdminDemoAuth } from "@/lib/admin/demo-auth";

export function AuthPage() {
  const router = useRouter();
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (getAdminDemoAuth()) {
      router.replace("/admin");
    }
  }, [router]);

  return (
    <form
      className="space-y-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (!account.trim() || !password.trim()) return;
        setAdminDemoAuth();
        router.replace("/admin");
      }}
    >
      <InputGroup>
        <InputGroupInput placeholder="请输入管理员账号" value={account} onChange={(event) => setAccount(event.target.value)} />
        <InputGroupAddon align="inline-start">
          <HugeiconsIcon icon={AtIcon} strokeWidth={2} />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="请输入登录密码" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        <InputGroupAddon align="inline-start">
          <HugeiconsIcon icon={AtIcon} strokeWidth={2} />
        </InputGroupAddon>
      </InputGroup>
      <Button className="w-full" type="submit">登录管理端</Button>
    </form>
  );
}
```

```tsx
// components/home/header.tsx
import Link from "next/link";

<Button asChild size="sm" variant="outline">
  <Link href="/admin/login">管理员登录</Link>
</Button>
<Button asChild size="sm">
  <Link href="/admin">进入管理端</Link>
</Button>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bunx vitest run tests/admin/demo-auth.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/admin/demo-auth.ts components/admin/admin-auth-guard.tsx components/admin/login/auth.tsx components/home/header.tsx tests/admin/demo-auth.test.ts
git commit -m "feat: add demo admin auth flow"
```

### Task 4: Rebuild Admin Shell Navigation In Chinese And Make Navbar Sticky

**Files:**
- Modify: `app/admin/(auth)/layout.tsx`
- Modify: `components/admin/app-navbar.tsx`
- Modify: `components/admin/app-sidebar.tsx`
- Create: `components/admin/admin-logout-button.tsx`
- Create: `tests/admin/app-sidebar.test.tsx`

- [ ] **Step 1: Write the failing shell navigation test**

```tsx
// tests/admin/app-sidebar.test.tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppSidebar } from "@/components/admin/app-sidebar";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

describe("AppSidebar", () => {
  it("renders Chinese admin navigation links", () => {
    render(<AppSidebar />);
    expect(screen.getByText("总览")).toBeInTheDocument();
    expect(screen.getByText("申请管理")).toBeInTheDocument();
    expect(screen.getByText("退出登录")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run tests/admin/app-sidebar.test.tsx`
Expected: FAIL because current sidebar still renders unrelated English demo navigation.

- [ ] **Step 3: Write the minimal implementation**

```tsx
// components/admin/admin-logout-button.tsx
"use client";

import { useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { clearAdminDemoAuth } from "@/lib/admin/demo-auth";

export function AdminLogoutButton() {
  const router = useRouter();

  return (
    <SidebarMenuButton
      onClick={() => {
        clearAdminDemoAuth();
        router.replace("/admin/login");
      }}
      className="text-muted-foreground"
      size="sm"
    >
      <LogOutIcon />
      <span>退出登录</span>
    </SidebarMenuButton>
  );
}
```

```tsx
// components/admin/app-sidebar.tsx
"use client";

import Link from "next/link";
import { LayoutGridIcon, FileTextIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LogoIcon } from "@/components/admin/logo";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";

const navItems = [
  { title: "总览", url: "/admin", icon: <LayoutGridIcon /> },
  { title: "申请管理", url: "/admin/users", icon: <FileTextIcon /> },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader className="h-14 justify-center">
        <SidebarMenuButton asChild>
          <Link href="/admin">
            <LogoIcon />
            <span className="font-medium">转学管理端</span>
          </Link>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>管理功能</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title}>
                  <Link href={item.url}>
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <AdminLogoutButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
```

```tsx
// components/admin/app-navbar.tsx
"use client";

import { cn } from "@/lib/utils";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { CustomSidebarTrigger } from "@/components/admin/custom-sidebar-trigger";
import { NavUser } from "@/components/admin/nav-user";

export function AppNavbar() {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 mb-6 flex items-center justify-between gap-2 rounded-xl border bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/80 md:px-3",
      )}
    >
      <div className="flex items-center gap-3">
        <CustomSidebarTrigger />
        <Separator className="mr-2 h-4" orientation="vertical" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>教育局转学管理</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <NavUser />
    </header>
  );
}
```

```tsx
// app/admin/(auth)/layout.tsx
import { AppNavbar } from "@/components/admin/app-navbar";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { AdminAuthGuard } from "@/components/admin/admin-auth-guard";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function AdminAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="h-screen overflow-hidden p-4 md:p-6">
          <div className="flex h-full flex-col overflow-hidden">
            <AppNavbar />
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AdminAuthGuard>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bunx vitest run tests/admin/app-sidebar.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/admin/(auth)/layout.tsx components/admin/app-navbar.tsx components/admin/app-sidebar.tsx components/admin/admin-logout-button.tsx tests/admin/app-sidebar.test.tsx
git commit -m "feat: localize admin shell navigation"
```

### Task 5: Build Dashboard Summary Cards And Trend Chart

**Files:**
- Create: `lib/admin/dashboard-trends.ts`
- Create: `components/admin/application-overview-cards.tsx`
- Create: `components/admin/application-trend-chart.tsx`
- Modify: `app/admin/(auth)/page.tsx`
- Create: `tests/admin/dashboard-summary.test.ts`

- [ ] **Step 1: Write the failing dashboard summary test**

```ts
// tests/admin/dashboard-summary.test.ts
import { describe, expect, it } from "vitest";
import { getDashboardTrendTotals } from "@/lib/admin/dashboard-trends";

describe("dashboard trends", () => {
  it("returns non-empty trend totals for each range", () => {
    expect(getDashboardTrendTotals("7d").length).toBeGreaterThan(0);
    expect(getDashboardTrendTotals("30d").length).toBeGreaterThan(0);
    expect(getDashboardTrendTotals("90d").length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run tests/admin/dashboard-summary.test.ts`
Expected: FAIL because the trend helper does not exist yet.

- [ ] **Step 3: Write the minimal implementation**

```ts
// lib/admin/dashboard-trends.ts
export type TrendRange = "7d" | "30d" | "90d";

const trendRows = [
  { date: "2026-01-10", applications: 4, completed: 2 },
  { date: "2026-01-20", applications: 6, completed: 3 },
  { date: "2026-02-01", applications: 5, completed: 4 },
  { date: "2026-02-12", applications: 8, completed: 5 },
  { date: "2026-02-25", applications: 7, completed: 4 },
  { date: "2026-03-05", applications: 9, completed: 6 },
  { date: "2026-03-12", applications: 11, completed: 7 },
  { date: "2026-03-19", applications: 10, completed: 8 },
  { date: "2026-03-26", applications: 12, completed: 9 },
  { date: "2026-04-01", applications: 7, completed: 5 },
  { date: "2026-04-03", applications: 6, completed: 4 },
  { date: "2026-04-05", applications: 8, completed: 6 },
];

export function getDashboardTrendTotals(range: TrendRange) {
  if (range === "7d") return trendRows.slice(-3);
  if (range === "30d") return trendRows.slice(-6);
  return trendRows;
}
```

```tsx
// components/admin/application-overview-cards.tsx
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getTransferDashboardSummary } from "@/lib/admin/mock-transfer-applications";

export function ApplicationOverviewCards() {
  const summary = getTransferDashboardSummary();

  const cards = [
    { title: "申请总数", value: summary.total, note: "当前系统内全部申请记录" },
    { title: "申请中", value: summary.pending, note: "等待教育局初审" },
    { title: "待补充资料", value: summary.supplementRequired, note: "需联系家长补齐材料" },
    { title: "审核通过", value: summary.approved, note: "已完成审核并通过" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader>
            <CardDescription>{card.title}</CardDescription>
            <CardTitle className="text-3xl">{card.value}</CardTitle>
          </CardHeader>
          <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{card.note}</span>
            <Badge variant="outline">实时 DEMO</Badge>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
```

```tsx
// components/admin/application-trend-chart.tsx
"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getDashboardTrendTotals, type TrendRange } from "@/lib/admin/dashboard-trends";

export function ApplicationTrendChart() {
  const [range, setRange] = React.useState<TrendRange>("30d");
  const data = getDashboardTrendTotals(range);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>申请趋势</CardTitle>
        <CardDescription>按时间查看申请量与办结量</CardDescription>
        <CardAction>
          <Select value={range} onValueChange={(value) => setRange(value as TrendRange)}>
            <SelectTrigger size="sm" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">近 7 天</SelectItem>
              <SelectItem value="30d">近 30 天</SelectItem>
              <SelectItem value="90d">近 90 天</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6">
        <ChartContainer
          config={{
            applications: { label: "申请量", color: "var(--primary)" },
            completed: { label: "办结量", color: "var(--chart-2)" },
          }}
          className="h-[260px] w-full"
        >
          <AreaChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            <Area dataKey="applications" type="monotone" fill="var(--color-applications)" stroke="var(--color-applications)" fillOpacity={0.2} />
            <Area dataKey="completed" type="monotone" fill="var(--color-completed)" stroke="var(--color-completed)" fillOpacity={0.18} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
```

```tsx
// app/admin/(auth)/page.tsx
import { ApplicationOverviewCards } from "@/components/admin/application-overview-cards";
import { ApplicationTrendChart } from "@/components/admin/application-trend-chart";

export default function AdminDashboardPage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <ApplicationOverviewCards />
      <div className="px-4 lg:px-6">
        <ApplicationTrendChart />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bunx vitest run tests/admin/dashboard-summary.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/admin/dashboard-trends.ts components/admin/application-overview-cards.tsx components/admin/application-trend-chart.tsx app/admin/(auth)/page.tsx tests/admin/dashboard-summary.test.ts
git commit -m "feat: add transfer dashboard overview"
```

### Task 6: Replace Generic Data Table With Paginated Application Table

**Files:**
- Create: `components/admin/application-status-badge.tsx`
- Create: `components/admin/application-table.tsx`
- Modify: `app/admin/(auth)/page.tsx`
- Modify: `app/admin/(auth)/users/page.tsx`
- Create: `tests/admin/application-table.test.tsx`

- [ ] **Step 1: Write the failing table test**

```tsx
// tests/admin/application-table.test.tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ApplicationTable } from "@/components/admin/application-table";
import { transferApplications } from "@/lib/admin/mock-transfer-applications";

describe("ApplicationTable", () => {
  it("renders status labels and pagination text", () => {
    render(<ApplicationTable data={transferApplications} />);
    expect(screen.getAllByText(/申请中|已审核|审核通过|待补充资料|已驳回/).length).toBeGreaterThan(0);
    expect(screen.getByText(/第 1 页/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run tests/admin/application-table.test.tsx`
Expected: FAIL because the table component does not exist yet.

- [ ] **Step 3: Write the minimal implementation**

```tsx
// components/admin/application-status-badge.tsx
import { Badge } from "@/components/ui/badge";
import { applicationStatusMeta, type ApplicationStatus } from "@/lib/admin/application-status";
import { cn } from "@/lib/utils";

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const meta = applicationStatusMeta[status];
  return (
    <Badge variant="outline" className={cn("font-medium", meta.className)}>
      {meta.label}
    </Badge>
  );
}
```

```tsx
// components/admin/application-table.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DownloadIcon, EyeIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ApplicationStatusBadge } from "@/components/admin/application-status-badge";
import { type TransferApplication } from "@/lib/admin/mock-transfer-applications";

const PAGE_SIZE = 10;

export function ApplicationTable({ data }: { data: TransferApplication[] }) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(data.length / PAGE_SIZE));

  const currentRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, page]);

  return (
    <Card className="mx-4 lg:mx-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>申请结果列表</CardTitle>
        <Button
          variant="outline"
          onClick={() => toast.success(`已模拟导出第 ${page} 页申请数据`)}
        >
          <DownloadIcon className="mr-2 size-4" />
          模拟导出
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>学生姓名</TableHead>
                <TableHead>学籍号</TableHead>
                <TableHead>当前学校</TableHead>
                <TableHead>目标学校</TableHead>
                <TableHead>申请日期</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>审核人</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentRows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.studentName}</TableCell>
                  <TableCell>{item.studentId}</TableCell>
                  <TableCell>{item.currentSchool}</TableCell>
                  <TableCell>{item.targetSchool}</TableCell>
                  <TableCell>{item.applyDate}</TableCell>
                  <TableCell><ApplicationStatusBadge status={item.status} /></TableCell>
                  <TableCell>{item.reviewer}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/admin/users/${item.id}`}>
                        <EyeIcon className="mr-2 size-4" />
                        查看详情
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>第 {page} 页，共 {pageCount} 页</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>
              上一页
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page === pageCount}>
              下一页
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

```tsx
// app/admin/(auth)/page.tsx
import { ApplicationOverviewCards } from "@/components/admin/application-overview-cards";
import { ApplicationTrendChart } from "@/components/admin/application-trend-chart";
import { ApplicationTable } from "@/components/admin/application-table";
import { transferApplications } from "@/lib/admin/mock-transfer-applications";

export default function AdminDashboardPage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <ApplicationOverviewCards />
      <div className="px-4 lg:px-6">
        <ApplicationTrendChart />
      </div>
      <ApplicationTable data={transferApplications.slice(0, 10)} />
    </div>
  );
}
```

```tsx
// app/admin/(auth)/users/page.tsx
import { ApplicationTable } from "@/components/admin/application-table";
import { transferApplications } from "@/lib/admin/mock-transfer-applications";

export default function AdminUsersPage() {
  return <ApplicationTable data={transferApplications} />;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bunx vitest run tests/admin/application-table.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/admin/application-status-badge.tsx components/admin/application-table.tsx app/admin/(auth)/page.tsx app/admin/(auth)/users/page.tsx tests/admin/application-table.test.tsx
git commit -m "feat: add paginated transfer application table"
```

### Task 7: Create Dynamic Detail Page And Final Chinese Copy Pass

**Files:**
- Delete: `app/admin/(auth)/users/(id)/page.tsx`
- Create: `app/admin/(auth)/users/[id]/page.tsx`
- Create: `components/admin/application-detail.tsx`
- Create: `tests/admin/application-detail.test.tsx`
- Modify: `components/admin/login/auth.tsx`
- Modify: `components/admin/nav-user.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Write the failing detail test**

```tsx
// tests/admin/application-detail.test.tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ApplicationDetail } from "@/components/admin/application-detail";
import { transferApplications } from "@/lib/admin/mock-transfer-applications";

describe("ApplicationDetail", () => {
  it("renders the selected application fields in Chinese sections", () => {
    render(<ApplicationDetail application={transferApplications[0]} />);
    expect(screen.getByText("申请摘要")).toBeInTheDocument();
    expect(screen.getByText("学生信息")).toBeInTheDocument();
    expect(screen.getByText("学校信息")).toBeInTheDocument();
    expect(screen.getByText("转学原因")).toBeInTheDocument();
    expect(screen.getByText(transferApplications[0].studentName)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run tests/admin/application-detail.test.tsx`
Expected: FAIL because the detail component does not exist yet.

- [ ] **Step 3: Write the minimal implementation**

```tsx
// components/admin/application-detail.tsx
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ApplicationStatusBadge } from "@/components/admin/application-status-badge";
import { type TransferApplication } from "@/lib/admin/mock-transfer-applications";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded-lg border p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export function ApplicationDetail({ application }: { application: TransferApplication }) {
  return (
    <div className="space-y-4 px-4 py-4 lg:px-6">
      <Button asChild variant="ghost" className="w-fit pl-0">
        <Link href="/admin/users">
          <ArrowLeftIcon className="mr-2 size-4" />
          返回申请列表
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>申请摘要</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <DetailRow label="申请编号" value={application.id} />
          <DetailRow label="申请日期" value={application.applyDate} />
          <DetailRow label="审核人" value={application.reviewer} />
          <div className="grid gap-1 rounded-lg border p-3">
            <span className="text-xs text-muted-foreground">当前状态</span>
            <ApplicationStatusBadge status={application.status} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>学生信息</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <DetailRow label="学生姓名" value={application.studentName} />
          <DetailRow label="学籍号" value={application.studentId} />
          <DetailRow label="当前年级" value={application.currentGrade} />
          <DetailRow label="目标年级" value={application.targetGrade} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>学校信息</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <DetailRow label="当前学校" value={application.currentSchool} />
          <DetailRow label="目标学校" value={application.targetSchool} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>联系方式</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <DetailRow label="联系电话" value={application.phone} />
          <DetailRow label="电子邮箱" value={application.email} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>转学原因</CardTitle></CardHeader>
        <CardContent className="text-sm leading-7">{application.reason}</CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>审核信息</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p><span className="font-medium">结果说明：</span>{application.resultSummary}</p>
          <p><span className="font-medium">备注：</span>{application.notes}</p>
          <div>
            <span className="font-medium">待补充资料：</span>
            {application.missingDocuments.length ? (
              <ul className="list-disc pl-5">
                {application.missingDocuments.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <span> 无</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

```tsx
// app/admin/(auth)/users/[id]/page.tsx
import { notFound } from "next/navigation";
import { ApplicationDetail } from "@/components/admin/application-detail";
import { getTransferApplicationById } from "@/lib/admin/mock-transfer-applications";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const application = getTransferApplicationById(id);

  if (!application) {
    notFound();
  }

  return <ApplicationDetail application={application} />;
}
```

```tsx
// app/layout.tsx
<html
  lang="zh-CN"
  className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
  suppressHydrationWarning
>
```

```tsx
// components/admin/login/auth.tsx
<h1 className="text-2xl font-bold tracking-wide">教育局管理端登录</h1>
<p className="text-base text-muted-foreground">使用演示账号进入学生转学申请管理后台。</p>
<p className="text-sm text-muted-foreground">本页面为 DEMO 登录流程，仅用于页面演示。</p>
```

```tsx
// components/admin/nav-user.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  UserIcon,
  BellIcon,
  CommandIcon,
  LifeBuoyIcon,
  BookOpenIcon,
  CreditCardIcon,
  LogOutIcon,
} from "lucide-react";

const user = {
  name: "教育局管理员",
  email: "admin@demo.local",
  avatar: "https://github.com/shabanhr.png",
};

export function NavUser() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-8">
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuItem className="flex items-center justify-start gap-2">
          <DropdownMenuLabel className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <span className="font-medium text-foreground">{user.name}</span>
              <br />
              <div className="max-w-full overflow-hidden overflow-ellipsis whitespace-nowrap text-xs text-muted-foreground">
                {user.email}
              </div>
              <div className="mt-0.5 text-[10px] text-muted-foreground">演示账号</div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <UserIcon />
            账号信息
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BellIcon />
            通知中心
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CommandIcon />
            快捷操作
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <LifeBuoyIcon />
            使用帮助
          </DropdownMenuItem>
          <DropdownMenuItem>
            <BookOpenIcon />
            审核指南
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <CreditCardIcon />
            系统说明
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="w-full cursor-pointer" variant="destructive">
            <LogOutIcon />
            退出登录
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

- [ ] **Step 4: Run tests and verification to ensure everything passes**

Run: `bunx vitest run tests/admin/application-detail.test.tsx`
Expected: PASS

Run: `bun run test`
Expected: PASS for all admin and smoke tests

Run: `bun run lint`
Expected: PASS with no ESLint errors

Run: `bun run build`
Expected: PASS and `/admin`, `/admin/login`, `/admin/users/[id]` routes compile successfully

- [ ] **Step 5: Commit**

```bash
git add app/admin/(auth)/users/[id]/page.tsx components/admin/application-detail.tsx components/admin/login/auth.tsx components/admin/nav-user.tsx app/layout.tsx tests/admin/application-detail.test.tsx
git rm -- app/admin/(auth)/users/(id)/page.tsx
git commit -m "feat: add transfer application detail page"
```

### Task 8: Final End-To-End Verification

**Files:**
- Modify: none

- [ ] **Step 1: Start the dev server**

Run: `bun run dev`
Expected: Next.js dev server starts on `http://localhost:3000`

- [ ] **Step 2: Verify unauthenticated redirect flow**

Run manually in browser:
1. Open `http://localhost:3000/admin`
2. Confirm redirect to `http://localhost:3000/admin/login`

Expected: login page displays Chinese copy and does not briefly show admin content.

- [ ] **Step 3: Verify login and navigation flow**

Run manually in browser:
1. Enter any non-empty account and password
2. Click `登录管理端`
3. Confirm redirect to `/admin`
4. Navigate to `/admin/users`
5. Click `查看详情`

Expected: dashboard, list, and detail pages all render with Chinese content and mock data.

- [ ] **Step 4: Verify sticky navbar and logout**

Run manually in browser:
1. Scroll dashboard and list pages
2. Confirm navbar remains fixed at top of the content area
3. Click `退出登录`
4. Revisit `/admin`

Expected: navbar stays sticky and logout returns the app to `/admin/login`.

- [ ] **Step 5: Commit verification note if repository convention requires it**

```bash
# No code changes expected in this task.
git status --short
```
