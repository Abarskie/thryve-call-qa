-- Callsy QA (CallCoach AI) - Initial Database Schema Migration
-- Migration: 20260903000001_initial_schema.sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. AGENTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 2. CALL FRAMEWORKS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS call_frameworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    stages JSONB NOT NULL DEFAULT '[]'::jsonb,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 3. CALLS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    framework_id UUID NOT NULL REFERENCES call_frameworks(id) ON DELETE RESTRICT,
    audio_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT,
    duration_seconds INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'transcribing', 'analyzing', 'completed', 'failed')),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 4. TRANSCRIPTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID NOT NULL UNIQUE REFERENCES calls(id) ON DELETE CASCADE,
    raw_text TEXT NOT NULL,
    segments JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 5. CALL ANALYSES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS call_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID NOT NULL UNIQUE REFERENCES calls(id) ON DELETE CASCADE,
    overall_score NUMERIC(5, 2) NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    stage_scores JSONB NOT NULL DEFAULT '[]'::jsonb,
    requirements_results JSONB NOT NULL DEFAULT '[]'::jsonb,
    strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
    improvements JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
    summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_calls_agent_id ON calls(agent_id);
CREATE INDEX IF NOT EXISTS idx_calls_framework_id ON calls(framework_id);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON calls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transcripts_call_id ON transcripts(call_id);
CREATE INDEX IF NOT EXISTS idx_call_analyses_call_id ON call_analyses(call_id);

-- ==========================================
-- AUTOMATIC TIMESTAMP TRIGGERS
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_agents_updated_at ON agents;
CREATE TRIGGER update_agents_updated_at
    BEFORE UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_call_frameworks_updated_at ON call_frameworks;
CREATE TRIGGER update_call_frameworks_updated_at
    BEFORE UPDATE ON call_frameworks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_calls_updated_at ON calls;
CREATE TRIGGER update_calls_updated_at
    BEFORE UPDATE ON calls
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_analyses ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'agents' AND policyname = 'Allow all access to agents'
    ) THEN
        CREATE POLICY "Allow all access to agents" ON agents FOR ALL USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'call_frameworks' AND policyname = 'Allow all access to call_frameworks'
    ) THEN
        CREATE POLICY "Allow all access to call_frameworks" ON call_frameworks FOR ALL USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'calls' AND policyname = 'Allow all access to calls'
    ) THEN
        CREATE POLICY "Allow all access to calls" ON calls FOR ALL USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'transcripts' AND policyname = 'Allow all access to transcripts'
    ) THEN
        CREATE POLICY "Allow all access to transcripts" ON transcripts FOR ALL USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'call_analyses' AND policyname = 'Allow all access to call_analyses'
    ) THEN
        CREATE POLICY "Allow all access to call_analyses" ON call_analyses FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- ==========================================
-- STORAGE BUCKET CONFIGURATION
-- ==========================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('call-recordings', 'call-recordings', false)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow public read access to call-recordings'
    ) THEN
        CREATE POLICY "Allow public read access to call-recordings" ON storage.objects FOR SELECT USING (bucket_id = 'call-recordings');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow public insert to call-recordings'
    ) THEN
        CREATE POLICY "Allow public insert to call-recordings" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'call-recordings');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow public update to call-recordings'
    ) THEN
        CREATE POLICY "Allow public update to call-recordings" ON storage.objects FOR UPDATE USING (bucket_id = 'call-recordings');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow public delete to call-recordings'
    ) THEN
        CREATE POLICY "Allow public delete to call-recordings" ON storage.objects FOR DELETE USING (bucket_id = 'call-recordings');
    END IF;
END $$;

-- ==========================================
-- SEED DATA
-- ==========================================

-- Seed Agents
INSERT INTO agents (id, name, email, active)
VALUES 
    ('a1000000-0000-0000-0000-000000000001', 'Sarah Connor', 'sarah@example.com', true),
    ('a2000000-0000-0000-0000-000000000002', 'John Miller', 'john@example.com', true),
    ('a3000000-0000-0000-0000-000000000003', 'Alex Rivera', 'alex@example.com', true),
    ('a4000000-0000-0000-0000-000000000004', 'Emily Watson', 'emily@example.com', true)
ON CONFLICT (id) DO NOTHING;

-- Seed Default Framework: Cold Calling Framework
INSERT INTO call_frameworks (id, name, description, stages, active)
VALUES (
    'f1000000-0000-0000-0000-000000000001',
    'Cold Calling Framework',
    'Standard outbound cold calling framework with 6 stages for qualification and discovery.',
    '[
        {
            "id": "opening",
            "name": "Opening",
            "weight": 10,
            "order": 1,
            "requirements": [
                {
                    "id": "req_opening_1",
                    "text": "Agent introduces themselves",
                    "order": 1
                },
                {
                    "id": "req_opening_2",
                    "text": "Agent mentions the company",
                    "order": 2
                },
                {
                    "id": "req_opening_3",
                    "text": "Agent explains the reason for calling",
                    "order": 3
                },
                {
                    "id": "req_opening_4",
                    "text": "Agent asks permission to continue",
                    "order": 4
                }
            ]
        },
        {
            "id": "discovery",
            "name": "Discovery",
            "weight": 25,
            "order": 2,
            "requirements": [
                {
                    "id": "req_discovery_1",
                    "text": "Agent asks about the prospect''s current situation",
                    "order": 1
                },
                {
                    "id": "req_discovery_2",
                    "text": "Agent identifies at least one pain point",
                    "order": 2
                },
                {
                    "id": "req_discovery_3",
                    "text": "Agent asks follow-up questions",
                    "order": 3
                }
            ]
        },
        {
            "id": "qualification",
            "name": "Qualification",
            "weight": 20,
            "order": 3,
            "requirements": [
                {
                    "id": "req_qualification_1",
                    "text": "Ask about timeline",
                    "order": 1
                },
                {
                    "id": "req_qualification_2",
                    "text": "Ask about budget",
                    "order": 2
                },
                {
                    "id": "req_qualification_3",
                    "text": "Determine decision-making authority",
                    "order": 3
                }
            ]
        },
        {
            "id": "offer",
            "name": "Offer",
            "weight": 15,
            "order": 4,
            "requirements": [
                {
                    "id": "req_offer_1",
                    "text": "Explain the solution",
                    "order": 1
                },
                {
                    "id": "req_offer_2",
                    "text": "Connect the solution to the prospect''s pain point",
                    "order": 2
                }
            ]
        },
        {
            "id": "objection_handling",
            "name": "Objection Handling",
            "weight": 15,
            "order": 5,
            "requirements": [
                {
                    "id": "req_objection_1",
                    "text": "Identify the objection",
                    "order": 1
                },
                {
                    "id": "req_objection_2",
                    "text": "Respond to the objection",
                    "order": 2
                },
                {
                    "id": "req_objection_3",
                    "text": "Attempt to continue the conversation",
                    "order": 3
                }
            ]
        },
        {
            "id": "close",
            "name": "Close",
            "weight": 15,
            "order": 6,
            "requirements": [
                {
                    "id": "req_close_1",
                    "text": "Ask for the next step",
                    "order": 1
                },
                {
                    "id": "req_close_2",
                    "text": "Confirm appointment/date/action",
                    "order": 2
                }
            ]
        }
    ]'::jsonb,
    true
)
ON CONFLICT (id) DO NOTHING;

