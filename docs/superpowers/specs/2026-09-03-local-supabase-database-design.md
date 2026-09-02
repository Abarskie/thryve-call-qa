# Design Specification: Local Supabase & Database Schema

- **Feature**: Local Supabase in Docker & Database Schema Setup
- **Date**: 2026-09-03
- **Status**: Approved by User
- **Phase**: MVP Foundation / Database Layer

---

## 1. Overview & Objectives

Establish a 100% local, Docker-backed Supabase environment for **Callsy QA (CallCoach AI)** with complete database schema, storage bucket, seed data, and Next.js client integration.

### Core Objectives
1. Run local Supabase via Docker CLI (`supabase start`), providing PostgreSQL, Supabase Studio (`http://127.0.0.1:54323`), Auth, and Storage locally without requiring cloud credentials.
2. Implement the relational and JSONB database schema for `agents`, `call_frameworks`, `calls`, `transcripts`, and `call_analyses`.
3. Provide initial seed data including the default **Cold Calling Framework** (as specified in `docs/CALL_ANALYSIS.md`) and initial sales agents.
4. Provide typed Supabase client helpers (`browser`, `server`, `admin`) in Next.js.
5. Document the complete schema in `docs/DATABASE.md`.
6. Ensure a 1:1 parity with online Supabase so switching to production only requires updating environment variables.

---

## 2. Architecture & Local Docker Setup

### 2.1 Supabase CLI & Services
- **CLI Initialization**: `npx supabase init` creates the `supabase/` configuration and migrations folder.
- **Docker Containers**: `npx supabase start` pulls and runs the official Supabase Docker containers:
  - **PostgreSQL Database**: Port `54322`
  - **API Gateway (PostgREST, Auth, Storage)**: Port `54321`
  - **Supabase Studio (Web UI)**: Port `54323`
  - **Inbucket (Email testing)**: Port `54324`

### 2.2 Environment Configuration
- `.env.local` configured with local connection parameters:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<local-anon-key>
  SUPABASE_SERVICE_ROLE_KEY=<local-service-role-key>
  ```
- `.env.example` committed with placeholder values.

---

## 3. Database Schema Specification

### 3.1 Tables

#### 1. `agents`
Tracks sales and appointment-setting agents evaluated by the platform.
- `id` (UUID, PRIMARY KEY, `DEFAULT gen_random_uuid()`)
- `name` (TEXT, NOT NULL)
- `email` (TEXT, NOT NULL)
- `active` (BOOLEAN, NOT NULL DEFAULT true)
- `created_at` (TIMESTAMPTZ, NOT NULL DEFAULT now())
- `updated_at` (TIMESTAMPTZ, NOT NULL DEFAULT now())

#### 2. `call_frameworks`
Reusable call structures defining stages and evaluation criteria.
- `id` (UUID, PRIMARY KEY, `DEFAULT gen_random_uuid()`)
- `name` (TEXT, NOT NULL)
- `description` (TEXT)
- `stages` (JSONB, NOT NULL DEFAULT '[]'::jsonb)
- `active` (BOOLEAN, NOT NULL DEFAULT true)
- `created_at` (TIMESTAMPTZ, NOT NULL DEFAULT now())
- `updated_at` (TIMESTAMPTZ, NOT NULL DEFAULT now())

**JSONB Schema for `stages`**:
```typescript
interface Stage {
  id: string;
  name: string;
  weight: number; // percentage, e.g. 10, 25
  order: number;
  requirements: {
    id: string;
    text: string;
    order: number;
  }[];
}
```

#### 3. `calls`
Uploaded call recordings linked to an agent and framework.
- `id` (UUID, PRIMARY KEY, `DEFAULT gen_random_uuid()`)
- `agent_id` (UUID, NOT NULL REFERENCES agents(id) ON DELETE CASCADE)
- `framework_id` (UUID, NOT NULL REFERENCES call_frameworks(id) ON DELETE RESTRICT)
- `audio_url` (TEXT, NOT NULL)
- `file_name` (TEXT, NOT NULL)
- `file_size` (BIGINT)
- `duration_seconds` (INTEGER DEFAULT 0)
- `status` (TEXT, NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'transcribing', 'analyzing', 'completed', 'failed')))
- `error_message` (TEXT)
- `created_at` (TIMESTAMPTZ, NOT NULL DEFAULT now())
- `updated_at` (TIMESTAMPTZ, NOT NULL DEFAULT now())

#### 4. `transcripts`
Speech-to-text transcript linked 1-to-1 to a call.
- `id` (UUID, PRIMARY KEY, `DEFAULT gen_random_uuid()`)
- `call_id` (UUID, NOT NULL UNIQUE REFERENCES calls(id) ON DELETE CASCADE)
- `raw_text` (TEXT, NOT NULL)
- `segments` (JSONB, NOT NULL DEFAULT '[]'::jsonb)
- `created_at` (TIMESTAMPTZ, NOT NULL DEFAULT now())

**JSONB Schema for `segments`**:
```typescript
interface TranscriptSegment {
  speaker: string; // "Agent" | "Prospect"
  start_time: number; // in seconds, e.g. 12.4
  end_time: number;
  text: string;
}
```

#### 5. `call_analyses`
AI compliance scoring, evidence, and coaching recommendations.
- `id` (UUID, PRIMARY KEY, `DEFAULT gen_random_uuid()`)
- `call_id` (UUID, NOT NULL UNIQUE REFERENCES calls(id) ON DELETE CASCADE)
- `overall_score` (NUMERIC(5, 2) NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100))
- `stage_scores` (JSONB, NOT NULL DEFAULT '[]'::jsonb)
- `requirements_results` (JSONB, NOT NULL DEFAULT '[]'::jsonb)
- `strengths` (JSONB, NOT NULL DEFAULT '[]'::jsonb)
- `improvements` (JSONB, NOT NULL DEFAULT '[]'::jsonb)
- `recommendations` (JSONB, NOT NULL DEFAULT '[]'::jsonb)
- `summary` (TEXT)
- `created_at` (TIMESTAMPTZ, NOT NULL DEFAULT now())

**JSONB Schema for `requirements_results`**:
```typescript
interface RequirementResult {
  requirement_id: string;
  stage_id: string;
  requirement_text: string;
  status: "PASS" | "PARTIAL" | "FAIL" | "NOT_APPLICABLE";
  score: number;
  evidence: string; // Quote from transcript
  timestamp: string; // e.g. "01:23"
  explanation: string;
}
```

### 3.2 Storage Bucket
- Bucket name: `call-recordings`
- Public: `false` (authenticated/signed URL access)

### 3.3 Default Seed Data
- **Framework**: `Cold Calling Framework` with 6 stages:
  1. Opening (10%): Introduce yourself, Mention company, Explain reason, Ask permission.
  2. Discovery (25%): Current situation, Identify pain point, Follow-up questions.
  3. Qualification (20%): Timeline, Budget, Decision-making authority.
  4. Offer (15%): Explain solution, Connect solution to pain point.
  5. Objection Handling (15%): Identify objection, Respond to objection, Continue conversation.
  6. Close (15%): Ask for next step, Confirm appointment/action.
- **Agents**: 4 initial agents matching UI designs (Sarah Connor, John Miller, Alex Rivera, Emily Watson).

---

## 4. Next.js Integration Architecture

### 4.1 Dependency Packages
- `@supabase/supabase-js`: Official JavaScript client.
- `@supabase/ssr`: Official SSR package for Next.js App Router cookies handling.

### 4.2 Client Helpers (`lib/supabase/`)
- `client.ts`: `createBrowserClient` singleton for React Client Components.
- `server.ts`: `createServerClient` configured with async Next.js cookie store for Server Components, Server Actions, and Route Handlers.
- `admin.ts`: Service role client for privileged backend operations (bypassing RLS when executing background transcription/analysis jobs).

### 4.3 TypeScript Types (`types/database.ts`)
Complete TypeScript models matching both database rows and nested JSON structures.

---

## 5. Verification Plan

1. **Docker Service Verification**:
   - `npx supabase start` succeeds and reports running services.
   - Access `http://127.0.0.1:54323` (Supabase Studio) to verify web UI.
2. **Schema & Migration Verification**:
   - Migration `20260903000001_initial_schema.sql` runs cleanly with zero errors.
   - Seed data is inserted and visible in Studio.
3. **Programmatic Query Verification**:
   - Run a test script via `node` / TypeScript connecting to local Supabase using `lib/supabase/` to fetch agents and frameworks.
4. **Code Quality & Typechecks**:
   - `npx tsc --noEmit` passes with 0 errors.
   - `npm run lint` passes with 0 warnings/errors.

