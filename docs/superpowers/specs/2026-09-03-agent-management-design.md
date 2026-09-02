# Design Specification: Agent Management

- **Feature**: Agent Management Page & CRUD
- **Date**: 2026-09-03
- **Status**: Approved by User
- **Phase**: MVP Core Feature

---

## 1. Overview & Objectives

Allow sales managers to view, create, edit, and deactivate/activate sales agents for call evaluation as specified in `docs/MVP.MD` and `docs/UI_DESIGN.md`.

---

## 2. Component & Architecture Design

### 2.1 Reusable Layout
- `components/layout/sidebar.tsx`: Shared sidebar navigation with active path highlighting for `/` (Dashboard), `/calls`, `/agents`, `/frameworks`, and `/settings`.
- Update `app/page.tsx` to use the shared sidebar.

### 2.2 Server Actions (`app/actions/agents.ts`)
- `getAgentsAction()`: Queries Supabase `agents` table ordered by `created_at DESC`. Joins or aggregates call stats (call count, average score).
- `createAgentAction({ name, email })`: Validates name & email, inserts into `agents`, calls `revalidatePath('/agents')`.
- `updateAgentAction(id, { name, email })`: Updates record in `agents`, calls `revalidatePath('/agents')`.
- `toggleAgentStatusAction(id, active)`: Toggles active boolean in `agents`, calls `revalidatePath('/agents')`.

### 2.3 UI Views & Modals
- `app/agents/page.tsx`: Server Component rendering header, KPI summary stats, and table container.
- `components/agents/agent-table.tsx`: Client table component rendering agent rows, status badges, and action buttons.
- `components/agents/agent-modal.tsx`: Modal dialog for adding or editing an agent with client validation and pending submit states.

---

## 3. Verification Plan
- Unit/E2E check: create a new agent via Server Action, verify it appears in the database.
- Toggle active status and verify update.
- Ensure `tsc --noEmit`, `npm run lint`, and `npm run build` pass cleanly.
- Verify `http://localhost:3000/agents` renders correctly.
