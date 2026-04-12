# School Data Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a database-backed school catalog, seed it from `lib/data/school_list.json`, and migrate the admin approval flow plus confirmation page to use the new data source.

**Architecture:** Keep `Application.targetSchool` as a string for now, add a separate `School` model with JSON-backed `districtRange`, and fetch schools in server components/actions. The admin detail page computes recommendations from DB-loaded school rules, while the confirmation page resolves the selected school by name and renders address/notice content.

**Tech Stack:** Next.js App Router, Prisma + SQLite/libsql, Vitest, React Testing Library

---

### Task 1: Lock the new behavior with tests

**Files:**
- Modify: `app/admin/(auth)/applications/[id]/page.test.tsx`
- Modify: `app/application/application-mock-pages.test.tsx`
- Create: `app/actions/school.test.ts`

- [ ] **Step 1: Write failing admin page and confirmation page expectations**

```tsx
expect(getSchoolsMock).toHaveBeenCalled()
expect(approvalPanelPropsMock).toMatchObject({
  recommendedSchool: "西关街小学",
  schoolNames: ["西关街小学", "水井巷小学"],
})

expect(getSchoolByNameMock).toHaveBeenCalledWith("城中区第一小学")
expect(screen.getByText("学校地址")).toBeInTheDocument()
expect(screen.getByText("请按通知时间到校报到")).toBeInTheDocument()
```

- [ ] **Step 2: Write failing school action parsing test**

```ts
expect(result.data?.[0]).toMatchObject({
  name: "西关街小学",
  districtRange: ["南关街（单号：21-最大号；双号：18-最大号）"],
  address: "",
  notice: "",
})
```

- [ ] **Step 3: Run focused tests and confirm they fail for the right reason**

Run: `npm test -- app/actions/school.test.ts "app/admin/(auth)/applications/[id]/page.test.tsx" app/application/application-mock-pages.test.tsx`

Expected: failures about missing `@/app/actions/school` exports and missing school info rendering.

### Task 2: Add the school catalog and database access

**Files:**
- Create: `prisma/schema/school.prisma`
- Modify: `prisma/schema/semester.prisma`
- Create: `prisma/migrations/<timestamp>_add_school_model/migration.sql`
- Create: `app/actions/school.ts`

- [ ] **Step 1: Add the Prisma `School` model**

```prisma
model School {
  id            String   @id @default(uuid())
  name          String   @unique
  districtRange String   @default("[]")
  address       String   @default("")
  notice        String   @default("")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

- [ ] **Step 2: Seed initial rows from `lib/data/school_list.json` in the migration**

```sql
INSERT INTO "School" ("id", "name", "districtRange", "address", "notice", "createdAt", "updatedAt")
VALUES (...);
```

- [ ] **Step 3: Implement school query actions**

```ts
export async function getSchools() { ... }
export async function getSchoolByName(name: string) { ... }
```

- [ ] **Step 4: Run focused tests**

Run: `npm test -- app/actions/school.test.ts`

Expected: PASS

### Task 3: Migrate admin approval and confirmation page to the DB source

**Files:**
- Modify: `lib/school-matching.ts`
- Modify: `app/admin/(auth)/applications/[id]/page.tsx`
- Modify: `app/admin/(auth)/applications/_components/approval-panel.tsx`
- Modify: `app/admin/(auth)/applications/_components/school-combobox.tsx`
- Modify: `app/application/confirmation/[id]/page.tsx`

- [ ] **Step 1: Make school matching accept injected school rules**

```ts
export function getRecommendedSchool(..., list: SchoolEntry[] = schoolList)
export function getSchoolNames(list: SchoolEntry[] = schoolList)
```

- [ ] **Step 2: Fetch school rows in the admin detail page and pass them into `ApprovalPanel`**

```tsx
const schoolsResult = await getSchools()
const recommendedSchool = getRecommendedSchool(..., schoolsResult.data ?? [])
```

- [ ] **Step 3: Update `ApprovalPanel` and `SchoolCombobox` props to use DB-provided school names**

```tsx
<SchoolCombobox schools={schoolNames} ... />
```

- [ ] **Step 4: Replace the confirmation page body with the pending-page layout and school detail card**

```tsx
const schoolResult = application.targetSchool
  ? await getSchoolByName(application.targetSchool)
  : { data: null }
```

- [ ] **Step 5: Run focused page tests**

Run: `npm test -- "app/admin/(auth)/applications/[id]/page.test.tsx" app/application/application-mock-pages.test.tsx`

Expected: PASS

### Task 4: Regenerate Prisma artifacts and verify the whole slice

**Files:**
- Modify: `dev.db`
- Modify: generated Prisma client files (via `prisma generate`)

- [ ] **Step 1: Apply the migration locally**

Run: `npx prisma migrate dev --name add_school_model`

Expected: migration created and `dev.db` updated

- [ ] **Step 2: Regenerate Prisma client**

Run: `npx prisma generate`

Expected: Prisma Client generated successfully

- [ ] **Step 3: Run the final verification set**

Run: `npm test -- app/actions/school.test.ts app/actions/application.test.ts "app/admin/(auth)/applications/[id]/page.test.tsx" "app/admin/(auth)/applications/_components/approval-panel.test.tsx" app/application/application-mock-pages.test.tsx lib/school-matching.test.ts`

Expected: PASS
