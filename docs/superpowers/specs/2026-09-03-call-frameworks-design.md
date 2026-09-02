# Design Specification: Call Frameworks

- **Feature**: Call Frameworks Directory & Visual Editor
- **Date**: 2026-09-03
- **Status**: Approved by User
- **Phase**: MVP Core Feature

---

## 1. Overview & Objectives

Allow sales managers to view, create, edit, duplicate, and deactivate reusable multi-stage call frameworks (such as the Cold Calling Framework) containing weighted stages and actionable requirements as specified in `docs/MVP.MD` and `docs/UI_DESIGN.md`.

---

## 2. Technical Architecture & Components

### 2.1 Server Actions (`app/actions/frameworks.ts`)
- `getFrameworksAction()`: Queries Supabase `call_frameworks` ordered by `created_at DESC`.
- `getFrameworkByIdAction(id)`: Queries specific framework by UUID.
- `createFrameworkAction({ name, description, stages })`: Validates name, validates that stages have requirements, and writes JSONB `stages` array to Supabase.
- `updateFrameworkAction(id, { name, description, stages })`: Updates existing record in `call_frameworks`.
- `duplicateFrameworkAction(id)`: Reads existing framework and creates a duplicate with name formatted as `${name} (Copy)`.
- `toggleFrameworkStatusAction(id, currentActive)`: Toggles active boolean.

### 2.2 UI Views & Editor
- `app/frameworks/page.tsx`: Framework directory page displaying KPIs (Total, Active, Avg Stages), and grid of framework cards.
- `components/frameworks/framework-card.tsx`: Card component displaying framework name, description, active badge, stage chips with percentage weights, and action buttons (Edit, Duplicate, Deactivate/Activate).
- `components/frameworks/framework-editor.tsx`: Comprehensive client editor allowing managers to:
  - Edit name & description
  - View live total weight validation (warning if != 100%)
  - Reorder, add, and remove stages
  - Add, edit, and remove requirements within each stage
- `app/frameworks/new/page.tsx`: Page wrapping editor in create mode.
- `app/frameworks/[id]/page.tsx`: Page wrapping editor in edit mode, pre-loading data from Supabase.

---

## 3. Verification Plan
- Create, update, duplicate, and toggle frameworks via automated test script.
- Verify `tsc --noEmit`, `npm run lint`, and `npm run build` pass cleanly.
- Verify both `/frameworks`, `/frameworks/new`, and `/frameworks/[id]` render correctly in the browser.
