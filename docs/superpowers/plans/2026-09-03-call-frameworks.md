# Call Frameworks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans for inline execution.

**Goal:** Build the Call Frameworks system allowing managers to view, create, edit, duplicate, and deactivate multi-stage evaluation frameworks with live weight calculations and requirement builders.

**Architecture:** Server Actions for PostgreSQL JSONB mutations, React interactive editor component with live state management and validation, and Server Component pages for listing and editing.

**Tech Stack:** Next.js 15+ App Router, TypeScript, Tailwind CSS, Lucide icons, Supabase client.

**Spec:** `docs/superpowers/specs/2026-09-03-call-frameworks-design.md`

## Global Constraints
- Stage weights must sum to 100% (with visual indicator and validation).
- Every stage must have a non-empty name and at least one requirement before saving.
- Re-use `types/database.ts` types (`CallFramework`, `Stage`, `Requirement`).

---

### Task 1: Server Actions for Frameworks CRUD
- Create `app/actions/frameworks.ts` with `getFrameworksAction()`, `getFrameworkByIdAction()`, `createFrameworkAction()`, `updateFrameworkAction()`, `duplicateFrameworkAction()`, and `toggleFrameworkStatusAction()`.

### Task 2: Framework Editor Component
- Create `components/frameworks/framework-editor.tsx` with dynamic stage addition, requirement addition, re-ordering, weight calculation, and validation.

### Task 3: Framework Editor Routes (`/new` and `/[id]`)
- Create `app/frameworks/new/page.tsx` for creating new frameworks.
- Create `app/frameworks/[id]/page.tsx` for editing existing frameworks.

### Task 4: Frameworks Directory Page (`/frameworks`)
- Create `components/frameworks/framework-list.tsx` with search, filtering, and cards.
- Create `app/frameworks/page.tsx` with summary KPIs and `FrameworkList`.

### Task 5: Testing & Verification
- Create `scripts/verify-frameworks-crud.ts` to test create, update, duplicate, and toggle status.
- Run `npm run lint`, `npx tsc --noEmit`, and `npm run build`.
- Verify pages load cleanly locally.
