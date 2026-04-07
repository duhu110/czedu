# Application Supplement Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the user-side transfer application flow so missing `fileStudentCard` creates a `SUPPLEMENT` application, supplement upload moves it to `PENDING`, result pages are data-driven, and stable seeded test records drive the entry page links.

**Architecture:** Keep Prisma and `app/actions/application.ts` as the single source of truth for application state. Replace the mock application pages with server-rendered data pages plus small client-only form surfaces where upload interaction is needed. Use stable seeded application IDs shared between the seed script and the entry page so test/demo links remain deterministic.

**Tech Stack:** Next.js 16 App Router, React 19, Prisma 7, Zod, React Hook Form, Vitest 4, Testing Library

---

## File Structure

- Create: `D:/project/NEXT/czedu/lib/application-test-records.ts`
- Modify: `D:/project/NEXT/czedu/prisma/schema/application.prisma`
- Modify: `D:/project/NEXT/czedu/lib/validations/application.ts`
- Modify: `D:/project/NEXT/czedu/app/actions/application.ts`
- Modify: `D:/project/NEXT/czedu/app/actions/application.test.ts`
- Modify: `D:/project/NEXT/czedu/app/application/new/_components/application-form.tsx`
- Modify: `D:/project/NEXT/czedu/app/application/new/success/page.tsx`
- Modify: `D:/project/NEXT/czedu/app/application/page.tsx`
- Modify: `D:/project/NEXT/czedu/app/application/pending/[id]/page.tsx`
- Modify: `D:/project/NEXT/czedu/app/application/confirmation/[id]/page.tsx`
- Modify: `D:/project/NEXT/czedu/app/application/supplement/[id]/page.tsx`
- Modify: `D:/project/NEXT/czedu/app/application/application-mock-pages.test.tsx`
- Create: `D:/project/NEXT/czedu/scripts/create-test-applications.ts`

## Task 1: Add failing tests for action status flow

**Files:**
- Modify: `D:/project/NEXT/czedu/app/actions/application.test.ts`

- [ ] Write tests that expect `createApplication()` to persist `SUPPLEMENT` when `fileStudentCard` is empty.
- [ ] Write tests that expect `createApplication()` to persist `PENDING` when `fileStudentCard` is present.
- [ ] Write tests that expect a new supplement action to reject non-`SUPPLEMENT` records and promote a `SUPPLEMENT` record to `PENDING`.
- [ ] Run `npx vitest run app/actions/application.test.ts` and confirm failure for the missing behavior.

## Task 2: Implement schema and action support

**Files:**
- Create: `D:/project/NEXT/czedu/lib/application-test-records.ts`
- Modify: `D:/project/NEXT/czedu/prisma/schema/application.prisma`
- Modify: `D:/project/NEXT/czedu/lib/validations/application.ts`
- Modify: `D:/project/NEXT/czedu/app/actions/application.ts`

- [ ] Change `fileStudentCard` in Prisma to an optional string field and keep deserialization fallback to `[]`.
- [ ] Relax the create schema so `fileStudentCard` is optional, then add a dedicated supplement-upload schema requiring at least one image.
- [ ] Update `createApplication()` to write `SUPPLEMENT` or `PENDING` based on `fileStudentCard.length`.
- [ ] Add `submitApplicationSupplement()` that updates only `fileStudentCard`, clears/retains remarks as appropriate, and sets status to `PENDING`.
- [ ] Re-run `npx vitest run app/actions/application.test.ts` and confirm green.

## Task 3: Replace entry links and success-page copy

**Files:**
- Create: `D:/project/NEXT/czedu/lib/application-test-records.ts`
- Modify: `D:/project/NEXT/czedu/app/application/page.tsx`
- Modify: `D:/project/NEXT/czedu/app/application/new/_components/application-form.tsx`
- Modify: `D:/project/NEXT/czedu/app/application/new/success/page.tsx`

- [ ] Add stable IDs for `pending`, `supplement`, `approved`, and `rejected` seeded applications.
- [ ] Update the entry page cards to point directly at `/application/pending/[id]`, `/application/supplement/[id]`, and two `/application/confirmation/[id]` variants.
- [ ] Keep new-application submit behavior on the success page, with copy that no longer assumes only immediate review.
- [ ] Verify by running the application page test red/green cycle.

## Task 4: Replace mock detail pages with data-driven pages

**Files:**
- Modify: `D:/project/NEXT/czedu/app/application/pending/[id]/page.tsx`
- Modify: `D:/project/NEXT/czedu/app/application/confirmation/[id]/page.tsx`
- Modify: `D:/project/NEXT/czedu/app/application/supplement/[id]/page.tsx`

- [ ] Rebuild `pending/[id]` as a server component that loads the application by ID and branches on status.
- [ ] Rebuild `confirmation/[id]` as a server component that redirects non-result states back to `pending/[id]` and renders distinct approved/rejected content.
- [ ] Rebuild `supplement/[id]` as a server component plus client upload form that shows read-only data and only edits `fileStudentCard`.
- [ ] Use Next.js `redirect()` for state guards, outside `try/catch`, consistent with local Next 16 docs.

## Task 5: Update page tests for real routing behavior

**Files:**
- Modify: `D:/project/NEXT/czedu/app/application/application-mock-pages.test.tsx`

- [ ] Replace old mock assertions with tests against the new real page behavior and stable seeded IDs.
- [ ] Mock `getApplicationById()` and route redirects where necessary.
- [ ] Run `npx vitest run app/application/application-mock-pages.test.tsx` and confirm green.

## Task 6: Add deterministic test-data seed script

**Files:**
- Create: `D:/project/NEXT/czedu/scripts/create-test-applications.ts`

- [ ] Implement a script that finds the active semester or latest semester and `upsert`s four applications with stable IDs.
- [ ] Ensure each record matches the required business state: `PENDING`, `SUPPLEMENT`, `APPROVED`, `REJECTED`.
- [ ] Run the script locally and capture the resulting IDs in the stable constants module rather than runtime output.

## Task 7: Verify the full change

**Files:**
- Modify/verify all files above

- [ ] Run `npx vitest run app/actions/application.test.ts app/application/application-mock-pages.test.tsx`.
- [ ] Run `npx eslint app/actions/application.ts app/application/page.tsx app/application/new/_components/application-form.tsx app/application/new/success/page.tsx "app/application/pending/[id]/page.tsx" "app/application/confirmation/[id]/page.tsx" "app/application/supplement/[id]/page.tsx" lib/validations/application.ts lib/application-test-records.ts scripts/create-test-applications.ts app/application/application-mock-pages.test.tsx app/actions/application.test.ts`.
- [ ] Run the new seed script against the local database and verify the entry page links correspond to the seeded IDs.

## Self-Review Notes

- Spec coverage: data-model change, user pages, seed script, and entry-point links are each mapped to explicit tasks.
- Placeholder scan: no TODO-style placeholders remain.
- Type consistency: plan consistently uses `SUPPLEMENT`, `PENDING`, `APPROVED`, `REJECTED`, `fileStudentCard`, and `submitApplicationSupplement`.
