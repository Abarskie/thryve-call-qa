# Agent Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans for inline execution.

**Goal:** Implement the Agent Management page (`/agents`) with full CRUD operations backed by local Supabase.

**Architecture:** Shared sidebar layout, Next.js Server Actions with Supabase client for database mutation/queries, and clean React client components for table interaction and modal forms.

**Tech Stack:** Next.js 15+ App Router, TypeScript, Tailwind CSS, Lucide icons, Supabase client.

**Spec:** `docs/superpowers/specs/2026-09-03-agent-management-design.md`

## Global Constraints
- Strictly validate user input (name non-empty, email valid format).
- Use Tailwind CSS adhering to `docs/UI_DESIGN.md`.
- Strictly typed with `types/database.ts`.

---

### Task 1: Reusable Sidebar Navigation Component
- Create `components/layout/sidebar.tsx` with active route detection (`usePathname`).
- Update `app/page.tsx` to use `Sidebar`.

### Task 2: Server Actions for Agents CRUD
- Create `app/actions/agents.ts` implementing `getAgentsAction()`, `createAgentAction()`, `updateAgentAction()`, and `toggleAgentStatusAction()`.

### Task 3: Agent Modal Form Component
- Create `components/agents/agent-modal.tsx` supporting both "Create" and "Edit" modes with validation and loading states.

### Task 4: Agents Table & Page View
- Create `components/agents/agent-table.tsx` rendering agent rows, badges, and modal triggers.
- Create `app/agents/page.tsx` displaying header, KPI cards, and `AgentTable`.

### Task 5: Verification & Testing
- Run test script to verify create/update/toggle agent in Supabase.
- Run `npm run lint`, `npx tsc --noEmit`, and `npm run build`.
- Verify `http://localhost:3000/agents` renders live data.

