# Semester Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build full semester CRUD on `/admin/semesters` with standardized year/term-based form rules, `isActive` management, and sidebar switcher refresh behavior.

**Architecture:** Keep `[page.tsx](/D:/project/NEXT/czedu/app/admin/(auth)/semesters/page.tsx)` as a Server Component that reads through `[semester.ts](/D:/project/NEXT/czedu/app/actions/semester.ts)`. Put all year/term/date derivation into a shared semester helper module so server actions, dialog defaults, page status badges, and the sidebar switcher all use the same rules. Keep mutations inside focused client components: one reusable form dialog, one enable/disable button, and the existing delete button.

**Tech Stack:** Next.js 16 App Router, React 19, Prisma 7, React Hook Form, Zod, date-fns, Radix/shadcn UI, Vitest 4, Testing Library

---

## File Structure

- Create: `D:/project/NEXT/czedu/lib/semester.ts`
  - Shared semester name, date window, status, and fallback-selection helpers.
- Modify: `D:/project/NEXT/czedu/lib/validations/semester.ts`
  - Split UI form validation from persisted Prisma payload validation.
- Modify: `D:/project/NEXT/czedu/app/actions/semester.ts`
  - Add update and active-toggle actions, normalize error handling, centralize revalidation.
- Create: `D:/project/NEXT/czedu/components/admin/semester/semester-form-dialog.tsx`
  - Shared create/edit dialog using React Hook Form without the missing `@/components/ui/form` wrapper.
- Modify: `D:/project/NEXT/czedu/components/admin/semester/create-dialog.tsx`
  - Convert into a thin wrapper around the shared dialog.
- Modify: `D:/project/NEXT/czedu/components/admin/semester/delete-button.tsx`
  - Normalize returned action state handling.
- Create: `D:/project/NEXT/czedu/components/admin/semester/toggle-active-button.tsx`
  - Confirm-and-toggle `isActive`.
- Modify: `D:/project/NEXT/czedu/app/admin/(auth)/semesters/page.tsx`
  - Read via actions, render full table, wire edit/toggle/delete controls.
- Modify: `D:/project/NEXT/czedu/components/admin/semester-switcher.tsx`
  - Re-sync selected semester when the semester list changes and surface disabled state.
- Create: `D:/project/NEXT/czedu/tests/admin/semester-utils.test.ts`
- Create: `D:/project/NEXT/czedu/tests/admin/semester-actions.test.ts`
- Create: `D:/project/NEXT/czedu/tests/admin/semester-form-dialog.test.tsx`
- Create: `D:/project/NEXT/czedu/tests/admin/semester-page.test.tsx`
- Create: `D:/project/NEXT/czedu/tests/admin/semester-switcher.test.tsx`

## Implementation Assumptions

- New dialog default selection uses the current environment date to derive the initial term.
- With the current workspace date `2026-04-07`, the default create state is `2026年秋季`, `2026-03-01` to `2026-09-01`, and `isActive = true`.
- Spring means `previous year 09-01` through `current year 03-01`; autumn means `current year 03-01` through `current year 09-01`.
- `name` is always computed from `year` and `term`; the UI never exposes a free-text name field.

### Task 1: Add Shared Semester Rules

**Files:**
- Create: `D:/project/NEXT/czedu/lib/semester.ts`
- Test: `D:/project/NEXT/czedu/tests/admin/semester-utils.test.ts`

- [ ] **Step 1: Write the failing helper tests**

```ts
import { describe, expect, it, vi } from "vitest";

import {
  buildSemesterName,
  getSemesterWindow,
  inferSemesterFormValues,
  getSemesterTimelineStatus,
  pickPreferredSemester,
} from "@/lib/semester";

describe("semester helpers", () => {
  it("builds the fixed Chinese semester name", () => {
    expect(buildSemesterName(2026, "春季")).toBe("2026年春季");
    expect(buildSemesterName(2026, "秋季")).toBe("2026年秋季");
  });

  it("returns the correct spring and autumn windows", () => {
    expect(getSemesterWindow(2026, "春季")).toEqual({
      start: new Date("2025-09-01T00:00:00.000Z"),
      end: new Date("2026-03-01T00:00:00.000Z"),
    });
    expect(getSemesterWindow(2026, "秋季")).toEqual({
      start: new Date("2026-03-01T00:00:00.000Z"),
      end: new Date("2026-09-01T00:00:00.000Z"),
    });
  });

  it("infers year and term from persisted dates", () => {
    expect(
      inferSemesterFormValues({
        id: "s1",
        name: "2026年春季",
        startDate: new Date("2025-09-10T00:00:00.000Z"),
        endDate: new Date("2026-02-20T00:00:00.000Z"),
        isActive: true,
      }),
    ).toMatchObject({
      year: 2026,
      term: "春季",
      isActive: true,
    });
  });

  it("falls back to the date-matching semester when the current selection disappears", () => {
    vi.setSystemTime(new Date("2026-04-07T08:00:00.000Z"));

    const picked = pickPreferredSemester(
      [
        {
          id: "spring",
          name: "2026年春季",
          startDate: new Date("2025-09-01T00:00:00.000Z"),
          endDate: new Date("2026-03-01T00:00:00.000Z"),
        },
        {
          id: "autumn",
          name: "2026年秋季",
          startDate: new Date("2026-03-01T00:00:00.000Z"),
          endDate: new Date("2026-09-01T00:00:00.000Z"),
        },
      ],
      "missing-id",
    );

    expect(picked?.id).toBe("autumn");
  });

  it("reports timeline state separately from active state", () => {
    vi.setSystemTime(new Date("2026-04-07T08:00:00.000Z"));

    expect(
      getSemesterTimelineStatus({
        startDate: new Date("2026-03-01T00:00:00.000Z"),
        endDate: new Date("2026-09-01T00:00:00.000Z"),
      }),
    ).toBe("进行中");
  });
});
```

- [ ] **Step 2: Run the helper tests to verify red**

Run: `npx vitest run tests/admin/semester-utils.test.ts`

Expected: FAIL because `@/lib/semester` does not exist yet.

- [ ] **Step 3: Write the minimal helper module**

```ts
export type SemesterTerm = "春季" | "秋季";
export type SemesterTimelineStatus = "未开始" | "进行中" | "已结束";

export function buildSemesterName(year: number, term: SemesterTerm) {
  return `${year}年${term}`;
}

export function getSemesterWindow(year: number, term: SemesterTerm) {
  if (term === "春季") {
    return {
      start: new Date(Date.UTC(year - 1, 8, 1)),
      end: new Date(Date.UTC(year, 2, 1)),
    };
  }

  return {
    start: new Date(Date.UTC(year, 2, 1)),
    end: new Date(Date.UTC(year, 8, 1)),
  };
}

export function getDefaultSemesterFormValues(now = new Date()) {
  const currentYear = now.getUTCFullYear();
  const springWindow = getSemesterWindow(currentYear, "春季");
  const term: SemesterTerm =
    now >= springWindow.start && now <= springWindow.end ? "春季" : "秋季";
  const { start, end } = getSemesterWindow(currentYear, term);

  return {
    year: currentYear,
    term,
    startDate: start,
    endDate: end,
    isActive: true,
  };
}

export function getYearOptions(currentYear = new Date().getUTCFullYear()) {
  return Array.from({ length: 11 }, (_, index) => currentYear - 5 + index);
}

export function inferSemesterFormValues(semester: {
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}) {
  const term: SemesterTerm =
    semester.startDate.getUTCFullYear() === semester.endDate.getUTCFullYear()
      ? "秋季"
      : "春季";
  const year =
    term === "春季"
      ? semester.endDate.getUTCFullYear()
      : semester.startDate.getUTCFullYear();

  return {
    year,
    term,
    startDate: semester.startDate,
    endDate: semester.endDate,
    isActive: semester.isActive,
  };
}

export function getSemesterTimelineStatus(semester: {
  startDate: Date;
  endDate: Date;
}, now = new Date()): SemesterTimelineStatus {
  if (now < semester.startDate) return "未开始";
  if (now > semester.endDate) return "已结束";
  return "进行中";
}

export function pickPreferredSemester<
  T extends { id: string; startDate: Date; endDate: Date }
>(semesters: T[], selectedId?: string | null, now = new Date()) {
  const selected = semesters.find((semester) => semester.id === selectedId);
  if (selected) return selected;

  return (
    semesters.find(
      (semester) => now >= semester.startDate && now <= semester.endDate,
    ) ?? semesters[0] ?? null
  );
}
```

- [ ] **Step 4: Run the helper tests to verify green**

Run: `npx vitest run tests/admin/semester-utils.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/semester.ts tests/admin/semester-utils.test.ts
git commit -m "feat: add semester helper rules"
```

### Task 2: Extend Validation and Server Actions

**Files:**
- Modify: `D:/project/NEXT/czedu/lib/validations/semester.ts`
- Modify: `D:/project/NEXT/czedu/app/actions/semester.ts`
- Test: `D:/project/NEXT/czedu/tests/admin/semester-actions.test.ts`

- [ ] **Step 1: Write the failing action tests**

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = {
  semester: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

const revalidatePath = vi.fn();

vi.mock("@/lib/prisma", () => ({ default: prismaMock }));
vi.mock("next/cache", () => ({ revalidatePath }));

import {
  createSemester,
  updateSemester,
  toggleSemesterActive,
  deleteSemester,
} from "@/app/actions/semester";

describe("semester actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a semester from year and term form values", async () => {
    prismaMock.semester.create.mockResolvedValue({ id: "autumn-2026" });

    const result = await createSemester({
      year: 2026,
      term: "秋季",
      startDate: new Date("2026-03-01T00:00:00.000Z"),
      endDate: new Date("2026-09-01T00:00:00.000Z"),
      isActive: true,
    });

    expect(prismaMock.semester.create).toHaveBeenCalledWith({
      data: {
        name: "2026年秋季",
        startDate: new Date("2026-03-01T00:00:00.000Z"),
        endDate: new Date("2026-09-01T00:00:00.000Z"),
        isActive: true,
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/semesters");
    expect(revalidatePath).toHaveBeenCalledWith("/admin");
    expect(result).toEqual({ success: true });
  });

  it("rejects dates outside the allowed seasonal window", async () => {
    const result = await createSemester({
      year: 2026,
      term: "春季",
      startDate: new Date("2025-08-31T00:00:00.000Z"),
      endDate: new Date("2026-03-01T00:00:00.000Z"),
      isActive: true,
    });

    expect(result).toEqual({ error: "开始日期必须在该学期允许范围内" });
    expect(prismaMock.semester.create).not.toHaveBeenCalled();
  });

  it("updates an existing semester", async () => {
    prismaMock.semester.update.mockResolvedValue({ id: "autumn-2026" });

    const result = await updateSemester("autumn-2026", {
      year: 2026,
      term: "秋季",
      startDate: new Date("2026-03-15T00:00:00.000Z"),
      endDate: new Date("2026-08-31T00:00:00.000Z"),
      isActive: false,
    });

    expect(prismaMock.semester.update).toHaveBeenCalledWith({
      where: { id: "autumn-2026" },
      data: {
        name: "2026年秋季",
        startDate: new Date("2026-03-15T00:00:00.000Z"),
        endDate: new Date("2026-08-31T00:00:00.000Z"),
        isActive: false,
      },
    });
    expect(result).toEqual({ success: true });
  });

  it("toggles only the active flag", async () => {
    prismaMock.semester.update.mockResolvedValue({ id: "spring-2026" });

    const result = await toggleSemesterActive("spring-2026", false);

    expect(prismaMock.semester.update).toHaveBeenCalledWith({
      where: { id: "spring-2026" },
      data: { isActive: false },
    });
    expect(result).toEqual({ success: true });
  });

  it("returns a friendly error when delete fails", async () => {
    prismaMock.semester.delete.mockRejectedValue(new Error("FOREIGN KEY"));

    const result = await deleteSemester("spring-2026");

    expect(result).toEqual({ error: "该学期存在关联数据，无法删除" });
  });
});
```

- [ ] **Step 2: Run the action tests to verify red**

Run: `npx vitest run tests/admin/semester-actions.test.ts`

Expected: FAIL because `createSemester` still expects the old payload shape and `updateSemester` / `toggleSemesterActive` do not exist yet.

- [ ] **Step 3: Implement the minimal validation and action layer**

```ts
import { z } from "zod";

import {
  buildSemesterName,
  getSemesterWindow,
  type SemesterTerm,
} from "@/lib/semester";

export const semesterFormSchema = z
  .object({
    year: z.number().int(),
    term: z.custom<SemesterTerm>((value) => value === "春季" || value === "秋季"),
    startDate: z.date(),
    endDate: z.date(),
    isActive: z.boolean().default(true),
  })
  .superRefine(({ year, term, startDate, endDate }, ctx) => {
    const window = getSemesterWindow(year, term);

    if (startDate < window.start || startDate > window.end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startDate"],
        message: "开始日期必须在该学期允许范围内",
      });
    }

    if (endDate < window.start || endDate > window.end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "结束日期必须在该学期允许范围内",
      });
    }

    if (endDate < startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "结束日期不能早于开始日期",
      });
    }
  });

export type SemesterFormValues = z.infer<typeof semesterFormSchema>;

export function toSemesterMutationInput(values: SemesterFormValues) {
  return {
    name: buildSemesterName(values.year, values.term),
    startDate: values.startDate,
    endDate: values.endDate,
    isActive: values.isActive,
  };
}
```

```ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  semesterFormSchema,
  toSemesterMutationInput,
  type SemesterFormValues,
} from "@/lib/validations/semester";

function getFirstError(error: unknown) {
  if (error instanceof Error && /unique/i.test(error.message)) {
    return "该学期已存在";
  }
  if (error instanceof Error && /foreign key/i.test(error.message)) {
    return "该学期存在关联数据，无法删除";
  }
  return null;
}

function revalidateSemesterRoutes() {
  revalidatePath("/admin/semesters");
  revalidatePath("/admin");
}

export async function getSemesters() {
  return prisma.semester.findMany({ orderBy: { startDate: "desc" } });
}

export async function createSemester(values: SemesterFormValues) {
  const parsed = semesterFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "输入数据非法" };
  }

  try {
    await prisma.semester.create({ data: toSemesterMutationInput(parsed.data) });
    revalidateSemesterRoutes();
    return { success: true };
  } catch (error) {
    return { error: getFirstError(error) ?? "创建失败，请稍后再试" };
  }
}

export async function updateSemester(id: string, values: SemesterFormValues) {
  const parsed = semesterFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "输入数据非法" };
  }

  try {
    await prisma.semester.update({
      where: { id },
      data: toSemesterMutationInput(parsed.data),
    });
    revalidateSemesterRoutes();
    return { success: true };
  } catch (error) {
    return { error: getFirstError(error) ?? "更新失败，请稍后再试" };
  }
}

export async function toggleSemesterActive(id: string, isActive: boolean) {
  try {
    await prisma.semester.update({ where: { id }, data: { isActive } });
    revalidateSemesterRoutes();
    return { success: true };
  } catch (error) {
    return { error: getFirstError(error) ?? "状态更新失败，请稍后再试" };
  }
}

export async function deleteSemester(id: string) {
  try {
    await prisma.semester.delete({ where: { id } });
    revalidateSemesterRoutes();
    return { success: true };
  } catch (error) {
    return { error: getFirstError(error) ?? "删除失败，请稍后再试" };
  }
}
```

- [ ] **Step 4: Run the action tests to verify green**

Run: `npx vitest run tests/admin/semester-actions.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/validations/semester.ts app/actions/semester.ts tests/admin/semester-actions.test.ts
git commit -m "feat: add semester CRUD actions"
```

### Task 3: Build the Shared Create/Edit Dialog

**Files:**
- Create: `D:/project/NEXT/czedu/components/admin/semester/semester-form-dialog.tsx`
- Modify: `D:/project/NEXT/czedu/components/admin/semester/create-dialog.tsx`
- Test: `D:/project/NEXT/czedu/tests/admin/semester-form-dialog.test.tsx`

- [ ] **Step 1: Write the failing dialog tests**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.setSystemTime(new Date("2026-04-07T08:00:00.000Z"));

vi.mock("@/app/actions/semester", () => ({
  createSemester: vi.fn(),
  updateSemester: vi.fn(),
}));

import { SemesterFormDialog } from "@/components/admin/semester/semester-form-dialog";

describe("SemesterFormDialog", () => {
  it("shows current-year autumn defaults in create mode", () => {
    render(<SemesterFormDialog mode="create" defaultOpen />);

    expect(screen.getByText("2026年秋季")).toBeInTheDocument();
    expect(screen.getByText("2026-03-01")).toBeInTheDocument();
    expect(screen.getByText("2026-09-01")).toBeInTheDocument();
  });

  it("prefills existing values in edit mode", () => {
    render(
      <SemesterFormDialog
        mode="edit"
        defaultOpen
        semester={{
          id: "spring-2026",
          name: "2026年春季",
          startDate: new Date("2025-09-10T00:00:00.000Z"),
          endDate: new Date("2026-02-28T00:00:00.000Z"),
          isActive: false,
        }}
      />,
    );

    expect(screen.getByText("2026年春季")).toBeInTheDocument();
    expect(screen.getByRole("switch")).toHaveAttribute("data-state", "unchecked");
  });
});
```

- [ ] **Step 2: Run the dialog tests to verify red**

Run: `npx vitest run tests/admin/semester-form-dialog.test.tsx`

Expected: FAIL because the shared dialog does not exist yet.

- [ ] **Step 3: Implement the shared dialog and wrapper**

```tsx
"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { toast } from "sonner";

import { createSemester, updateSemester } from "@/app/actions/semester";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  buildSemesterName,
  getDefaultSemesterFormValues,
  getSemesterWindow,
  getYearOptions,
  inferSemesterFormValues,
} from "@/lib/semester";
import {
  semesterFormSchema,
  type SemesterFormValues,
} from "@/lib/validations/semester";

type SemesterFormDialogProps = {
  mode: "create" | "edit";
  semester?: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
  };
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
};

export function SemesterFormDialog({
  mode,
  semester,
  trigger,
  defaultOpen = false,
}: SemesterFormDialogProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const defaults =
    mode === "edit" && semester
      ? inferSemesterFormValues(semester)
      : getDefaultSemesterFormValues();

  const form = useForm<SemesterFormValues>({
    resolver: zodResolver(semesterFormSchema),
    defaultValues: defaults,
  });

  const year = form.watch("year");
  const term = form.watch("term");
  const range = React.useMemo(() => getSemesterWindow(year, term), [year, term]);
  const generatedName = buildSemesterName(year, term);

  React.useEffect(() => {
    const current = form.getValues();
    if (current.startDate < range.start || current.startDate > range.end) {
      form.setValue("startDate", range.start);
    }
    if (current.endDate < range.start || current.endDate > range.end) {
      form.setValue("endDate", range.end);
    }
  }, [form, range]);

  async function onSubmit(values: SemesterFormValues) {
    const result =
      mode === "edit" && semester
        ? await updateSemester(semester.id, values)
        : await createSemester(values);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(mode === "edit" ? "学期已更新" : "学期已创建");
  }

  return (
    <Dialog open={trigger ? open : true} onOpenChange={trigger ? setOpen : undefined}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "编辑学期" : "新增学期"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Input value={generatedName} readOnly aria-label="学期名称" />
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="year"
              control={form.control}
              render={({ field }) => (
                <Select value={String(field.value)} onValueChange={(value) => field.onChange(Number(value))}>
                  <SelectTrigger><SelectValue placeholder="选择年度" /></SelectTrigger>
                  <SelectContent>
                    {getYearOptions().map((yearOption) => (
                      <SelectItem key={yearOption} value={String(yearOption)}>{yearOption}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <Controller
              name="term"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="选择学期" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="春季">春季</SelectItem>
                    <SelectItem value="秋季">秋季</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {(["startDate", "endDate"] as const).map((name) => (
              <Controller
                key={name}
                name={name}
                control={form.control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">{format(field.value, "yyyy-MM-dd", { locale: zhCN })}</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => date && field.onChange(date)}
                        disabled={(date) => date < range.start || date > range.end}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            ))}
          </div>
          <label className="flex items-center justify-between rounded-xl border p-3 text-sm">
            <span>启用学期</span>
            <Controller
              name="isActive"
              control={form.control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-label="启用学期"
                />
              )}
            />
          </label>
          <p className="text-xs text-muted-foreground">
            停用后，该学期将无法用于新增申请。
          </p>
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {mode === "edit" ? "保存修改" : "保存学期"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

```tsx
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SemesterFormDialog } from "@/components/admin/semester/semester-form-dialog";

export function CreateSemesterDialog() {
  return (
    <SemesterFormDialog
      mode="create"
      trigger={
        <Button size="sm">
          <PlusIcon className="mr-2 h-4 w-4" />
          新增学期
        </Button>
      }
    />
  );
}
```

- [ ] **Step 4: Run the dialog tests to verify green**

Run: `npx vitest run tests/admin/semester-form-dialog.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/admin/semester/semester-form-dialog.tsx components/admin/semester/create-dialog.tsx tests/admin/semester-form-dialog.test.tsx
git commit -m "feat: add shared semester form dialog"
```

### Task 4: Wire the Table Page and Action Buttons

**Files:**
- Create: `D:/project/NEXT/czedu/components/admin/semester/toggle-active-button.tsx`
- Modify: `D:/project/NEXT/czedu/components/admin/semester/delete-button.tsx`
- Modify: `D:/project/NEXT/czedu/app/admin/(auth)/semesters/page.tsx`
- Test: `D:/project/NEXT/czedu/tests/admin/semester-page.test.tsx`

- [ ] **Step 1: Write the failing page tests**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/actions/semester", () => ({
  getSemesters: vi.fn().mockResolvedValue([
    {
      id: "autumn-2026",
      name: "2026年秋季",
      startDate: new Date("2026-03-01T00:00:00.000Z"),
      endDate: new Date("2026-09-01T00:00:00.000Z"),
      isActive: true,
    },
    {
      id: "spring-2026",
      name: "2026年春季",
      startDate: new Date("2025-09-01T00:00:00.000Z"),
      endDate: new Date("2026-03-01T00:00:00.000Z"),
      isActive: false,
    },
  ]),
}));

describe("SemesterPage", () => {
  it("renders timeline and active states separately", async () => {
    const Page = (await import("@/app/admin/(auth)/semesters/page")).default;

    render(await Page());

    expect(screen.getByText("2026年秋季")).toBeInTheDocument();
    expect(screen.getByText("进行中")).toBeInTheDocument();
    expect(screen.getByText("已启用")).toBeInTheDocument();
    expect(screen.getByText("已停用")).toBeInTheDocument();
  });

  it("renders the empty state when there are no semesters", async () => {
    const { getSemesters } = await import("@/app/actions/semester");
    vi.mocked(getSemesters).mockResolvedValueOnce([]);

    const Page = (await import("@/app/admin/(auth)/semesters/page")).default;
    render(await Page());

    expect(screen.getByText("尚未创建任何学期，请点击右上角新增。")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the page tests to verify red**

Run: `npx vitest run tests/admin/semester-page.test.tsx`

Expected: FAIL because the page still imports Prisma directly and does not render active-state controls.

- [ ] **Step 3: Implement the table page and toggle button**

```tsx
"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { toggleSemesterActive } from "@/app/actions/semester";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function ToggleSemesterActiveButton({
  id,
  name,
  isActive,
}: {
  id: string;
  name: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = React.useTransition();
  const nextState = !isActive;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm">
          {isActive ? "停用" : "启用"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{isActive ? "确认停用学期？" : "确认启用学期？"}</AlertDialogTitle>
          <AlertDialogDescription>
            {isActive
              ? `关闭 ${name} 会导致当前学期无法新增任何申请。`
              : `启用 ${name} 后，该学期将重新可用于业务流程。`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={() =>
              startTransition(async () => {
                const result = await toggleSemesterActive(id, nextState);
                if (result.error) {
                  toast.error(result.error);
                  return;
                }
                toast.success(nextState ? "学期已启用" : "学期已停用");
              })
            }
            disabled={isPending}
          >
            {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            确认
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

```tsx
import { format } from "date-fns";

import { getSemesters } from "@/app/actions/semester";
import { CreateSemesterDialog } from "@/components/admin/semester/create-dialog";
import { DeleteSemesterButton } from "@/components/admin/semester/delete-button";
import { SemesterFormDialog } from "@/components/admin/semester/semester-form-dialog";
import { ToggleSemesterActiveButton } from "@/components/admin/semester/toggle-active-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSemesterTimelineStatus } from "@/lib/semester";

export default async function SemesterPage() {
  const semesters = await getSemesters();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">学期管理</h1>
          <p className="text-sm text-muted-foreground">配置和维护系统业务学期时间段。</p>
        </div>
        <CreateSemesterDialog />
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>学期名称</TableHead>
              <TableHead>起止日期</TableHead>
              <TableHead>时间状态</TableHead>
              <TableHead>启用状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {semesters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  尚未创建任何学期，请点击右上角新增。
                </TableCell>
              </TableRow>
            ) : (
              semesters.map((semester) => (
                <TableRow key={semester.id}>
                  <TableCell className="font-medium">{semester.name}</TableCell>
                  <TableCell>
                    {format(semester.startDate, "yyyy-MM-dd")} 至 {format(semester.endDate, "yyyy-MM-dd")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{getSemesterTimelineStatus(semester)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={semester.isActive ? "default" : "outline"}>
                      {semester.isActive ? "已启用" : "已停用"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <SemesterFormDialog
                        mode="edit"
                        semester={semester}
                        trigger={<Button variant="ghost" size="sm">编辑</Button>}
                      />
                      <ToggleSemesterActiveButton
                        id={semester.id}
                        name={semester.name}
                        isActive={semester.isActive}
                      />
                      <DeleteSemesterButton id={semester.id} name={semester.name} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run the page tests to verify green**

Run: `npx vitest run tests/admin/semester-page.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/admin/semester/toggle-active-button.tsx components/admin/semester/delete-button.tsx app/admin/'(auth)'/semesters/page.tsx tests/admin/semester-page.test.tsx
git commit -m "feat: finish semester management table"
```

### Task 5: Re-sync the Sidebar Semester Switcher

**Files:**
- Modify: `D:/project/NEXT/czedu/components/admin/semester-switcher.tsx`
- Test: `D:/project/NEXT/czedu/tests/admin/semester-switcher.test.tsx`

- [ ] **Step 1: Write the failing switcher test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import { SemesterSwitcher } from "@/components/admin/semester-switcher";

describe("SemesterSwitcher", () => {
  it("falls back to the current-date semester when the current selection disappears", () => {
    vi.setSystemTime(new Date("2026-04-07T08:00:00.000Z"));

    const { rerender } = render(
      <SemesterSwitcher
        semesters={[
          {
            id: "spring",
            name: "2026年春季",
            startDate: new Date("2025-09-01T00:00:00.000Z"),
            endDate: new Date("2026-03-01T00:00:00.000Z"),
            isActive: true,
          },
          {
            id: "autumn",
            name: "2026年秋季",
            startDate: new Date("2026-03-01T00:00:00.000Z"),
            endDate: new Date("2026-09-01T00:00:00.000Z"),
            isActive: false,
          },
        ]}
      />,
    );

    expect(screen.getByText("2026年秋季")).toBeInTheDocument();

    rerender(
      <SemesterSwitcher
        semesters={[
          {
            id: "spring",
            name: "2026年春季",
            startDate: new Date("2025-09-01T00:00:00.000Z"),
            endDate: new Date("2026-03-01T00:00:00.000Z"),
            isActive: true,
          },
        ]}
      />,
    );

    expect(screen.getByText("2026年春季")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the switcher test to verify red**

Run: `npx vitest run tests/admin/semester-switcher.test.tsx`

Expected: FAIL because the switcher keeps stale local state after the list changes.

- [ ] **Step 3: Implement the selection-sync logic**

```tsx
"use client";

import * as React from "react";
import { CalendarIcon, ChevronsUpDown } from "lucide-react";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { pickPreferredSemester } from "@/lib/semester";

export interface Semester {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive?: boolean;
}

export function SemesterSwitcher({ semesters }: { semesters: Semester[] }) {
  const preferred = React.useMemo(
    () => pickPreferredSemester(semesters),
    [semesters],
  );
  const [selectedId, setSelectedId] = React.useState<string | null>(
    preferred?.id ?? null,
  );

  React.useEffect(() => {
    const next = pickPreferredSemester(semesters, selectedId);
    setSelectedId(next?.id ?? null);
  }, [semesters, selectedId]);

  const selected =
    semesters.find((semester) => semester.id === selectedId) ?? preferred;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <CalendarIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {selected?.name ?? "暂无学期"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {selected?.isActive === false ? "业务学期 · 已停用" : "业务学期"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              切换当前学期
            </DropdownMenuLabel>
            {semesters.length === 0 ? (
              <div className="p-2 text-center text-xs text-muted-foreground">
                尚无学期数据
              </div>
            ) : (
              semesters.map((semester) => (
                <DropdownMenuItem
                  key={semester.id}
                  onClick={() => setSelectedId(semester.id)}
                  className="gap-2 p-2"
                >
                  <span>{semester.name}</span>
                  {semester.isActive === false ? (
                    <span className="text-xs text-muted-foreground">已停用</span>
                  ) : null}
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/semesters" className="cursor-pointer text-primary">
                管理学期列表...
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
```

- [ ] **Step 4: Run the switcher test to verify green**

Run: `npx vitest run tests/admin/semester-switcher.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/admin/semester-switcher.tsx tests/admin/semester-switcher.test.tsx
git commit -m "fix: resync semester switcher after list changes"
```

### Task 6: Run the Full Verification Sweep

**Files:**
- Test: `D:/project/NEXT/czedu/tests/admin/semester-utils.test.ts`
- Test: `D:/project/NEXT/czedu/tests/admin/semester-actions.test.ts`
- Test: `D:/project/NEXT/czedu/tests/admin/semester-form-dialog.test.tsx`
- Test: `D:/project/NEXT/czedu/tests/admin/semester-page.test.tsx`
- Test: `D:/project/NEXT/czedu/tests/admin/semester-switcher.test.tsx`

- [ ] **Step 1: Run the focused semester test suite**

```bash
npx vitest run tests/admin/semester-utils.test.ts tests/admin/semester-actions.test.ts tests/admin/semester-form-dialog.test.tsx tests/admin/semester-page.test.tsx tests/admin/semester-switcher.test.tsx
```

Expected: PASS

- [ ] **Step 2: Run the repository test command**

```bash
npm test
```

Expected: PASS

- [ ] **Step 3: Run lint on touched files**

```bash
npx eslint app/actions/semester.ts "app/admin/(auth)/semesters/page.tsx" components/admin/semester-switcher.tsx components/admin/semester/create-dialog.tsx components/admin/semester/delete-button.tsx components/admin/semester/semester-form-dialog.tsx components/admin/semester/toggle-active-button.tsx lib/semester.ts lib/validations/semester.ts tests/admin/semester-utils.test.ts tests/admin/semester-actions.test.ts tests/admin/semester-form-dialog.test.tsx tests/admin/semester-page.test.tsx tests/admin/semester-switcher.test.tsx
```

Expected: PASS

- [ ] **Step 4: Commit the verification-safe final state**

```bash
git status --short
git add app/actions/semester.ts "app/admin/(auth)/semesters/page.tsx" components/admin/semester-switcher.tsx components/admin/semester/create-dialog.tsx components/admin/semester/delete-button.tsx components/admin/semester/semester-form-dialog.tsx components/admin/semester/toggle-active-button.tsx lib/semester.ts lib/validations/semester.ts tests/admin/semester-utils.test.ts tests/admin/semester-actions.test.ts tests/admin/semester-form-dialog.test.tsx tests/admin/semester-page.test.tsx tests/admin/semester-switcher.test.tsx
git commit -m "feat: complete semester management workflow"
```

## Self-Review Notes

- Spec coverage:
  - CRUD, enable/disable, full list rendering, seasonal defaults, date windows, and switcher fallback all map to Tasks 1 through 5.
  - Verification and lint coverage map to Task 6.
- Placeholder scan:
  - No `TODO`, `TBD`, or “similar to above” shortcuts remain.
- Type consistency:
  - The plan consistently uses `SemesterFormValues`, `SemesterTerm`, `buildSemesterName`, `getSemesterWindow`, `updateSemester`, and `toggleSemesterActive`.
