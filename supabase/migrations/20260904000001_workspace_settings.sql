-- Callsy QA - Workspace Settings Migration
-- Migration: 20260904000001_workspace_settings.sql

CREATE TABLE IF NOT EXISTS workspace_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL DEFAULT 'Thryve Call QA',
    manager_email TEXT NOT NULL DEFAULT 'manager@thryve.qa',
    default_model TEXT NOT NULL DEFAULT 'gpt-4o-mini',
    passing_threshold NUMERIC(5, 2) NOT NULL DEFAULT 75,
    openai_api_key TEXT,
    gemini_api_key TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure updated_at trigger is set
DROP TRIGGER IF EXISTS update_workspace_settings_updated_at ON workspace_settings;
CREATE TRIGGER update_workspace_settings_updated_at
    BEFORE UPDATE ON workspace_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed initial default settings row if empty
INSERT INTO workspace_settings (id, company_name, manager_email, default_model, passing_threshold)
SELECT '00000000-0000-0000-0000-000000000001', 'Thryve Call QA', 'manager@thryve.qa', 'gpt-4o-mini', 75
WHERE NOT EXISTS (SELECT 1 FROM workspace_settings);
