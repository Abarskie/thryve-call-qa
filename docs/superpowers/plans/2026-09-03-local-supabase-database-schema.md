# Local Supabase & Database Schema Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Initialize a local Docker-backed Supabase development environment, define the core PostgreSQL/JSONB database schema with seed data, configure typed Supabase clients in Next.js, and document the database architecture.

**Architecture:** We use the Supabase CLI in Docker to host PostgreSQL (port 54322), API Gateway (port 54321), and Supabase Studio (port 54323). Schema migrations establish relational tables with JSONB document embeddings for hierarchical structures. Next.js connects via `@supabase/ssr` and `@supabase/supabase-js` using standard App Router patterns.

**Tech Stack:** Docker, Supabase CLI, PostgreSQL 15+, Next.js 16 (App Router), TypeScript, `@supabase/supabase-js`, `@supabase/ssr`.

**Spec:** `docs/superpowers/specs/2026-09-03-local-supabase-database-design.md`

## Global Constraints

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to client-side code.
- Maintain 1:1 compatibility with online Supabase.
- All database types must be strictly typed in `types/database.ts`.
- No placeholders or omitted schema fields.

---

### Task 1: Supabase CLI Initialization & Environment Configuration

**Files:**
- Create: `supabase/config.toml` (generated via `npx supabase init`)
- Create: `.env.example`
- Create: `.env.local`

**Interfaces:**
- Produces: Local Supabase environment variables `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

- [ ] **Step 1: Initialize Supabase CLI config**
  Run: `npx supabase init`
  Verify `supabase/config.toml` is created.

- [ ] **Step 2: Create `.env.example`**
  ```env
  NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
  NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
  SUPABASE_SERVICE_ROLE_KEY=ey...
  ```

- [ ] **Step 3: Create `.env.local`**
  Populate with local Supabase default development keys.

- [ ] **Step 4: Verify environment file creation**
  Confirm `.env.local` exists and is ignored by git.

---

### Task 2: Database Migration, Seed Data & Documentation

**Files:**
- Create: `supabase/migrations/20260903000001_initial_schema.sql`
- Create/Modify: `docs/DATABASE.md`

**Interfaces:**
- Produces: Tables `agents`, `call_frameworks`, `calls`, `transcripts`, `call_analyses`, storage bucket `call-recordings`, and seed data.

- [ ] **Step 1: Write SQL migration file**
  Create `supabase/migrations/20260903000001_initial_schema.sql` containing:
  - Extensions: `pgcrypto` (or `uuid-ossp`)
  - Tables: `agents`, `call_frameworks`, `calls`, `transcripts`, `call_analyses`
  - Constraints & foreign keys with cascading rules
  - Storage bucket insert for `call-recordings`
  - Seed records: 4 agents and default Cold Calling Framework with all 6 stages.

- [ ] **Step 2: Populate `docs/DATABASE.md`**
  Write comprehensive documentation of all tables, fields, constraints, JSONB schemas, and relationships.

---

### Task 3: TypeScript Types Definition

**Files:**
- Create: `types/database.ts`

**Interfaces:**
- Produces: `Agent`, `CallFramework`, `Stage`, `Requirement`, `Call`, `Transcript`, `TranscriptSegment`, `CallAnalysis`, `RequirementResult`, `Database`.

- [ ] **Step 1: Write TypeScript interface definitions**
  Define strict TypeScript models for:
  - `Agent`
  - `Stage` and `Requirement`
  - `CallFramework`
  - `Call` and `CallStatus`
  - `Transcript` and `TranscriptSegment`
  - `RequirementResult` and `CallAnalysis`
  - Full Supabase `Database` mapping interface.

- [ ] **Step 2: Verify types compile without errors**
  Run `npx tsc --noEmit`.

---

### Task 4: Client Integration & Package Dependencies

**Files:**
- Modify: `package.json`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/admin.ts`

**Interfaces:**
- Consumes: `types/database.ts`, `.env.local`
- Produces: `createClient()` (browser), `createClient()` (server), `createAdminClient()` (admin).

- [ ] **Step 1: Install `@supabase/supabase-js` and `@supabase/ssr`**
  Run `npm install @supabase/supabase-js @supabase/ssr`.

- [ ] **Step 2: Create browser client helper `lib/supabase/client.ts`**
  ```typescript
  import { createBrowserClient } from "@supabase/ssr";
  import type { Database } from "@/types/database";

  export function createClient() {
    return createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  ```

- [ ] **Step 3: Create server client helper `lib/supabase/server.ts`**
  Configure with `next/headers` cookie store.

- [ ] **Step 4: Create admin client helper `lib/supabase/admin.ts`**
  Configure with `SUPABASE_SERVICE_ROLE_KEY`.

---

### Task 5: Docker Startup & Verification

**Files:**
- Create: `scripts/verify-db.ts`

**Interfaces:**
- Consumes: `lib/supabase/server.ts` or direct client.

- [ ] **Step 1: Start Supabase Docker stack**
  Run: `npx supabase start`
  Verify all containers are up and ports reported.

- [ ] **Step 2: Run DB verification script**
  Query agents and frameworks from local Supabase and log counts.

- [ ] **Step 3: Verify Supabase Studio Web UI**
  Check that `http://127.0.0.1:54323` responds.

- [ ] **Step 4: Run typechecks and linting**
  Run `npx tsc --noEmit` and `npm run lint`.

