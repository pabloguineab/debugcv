-- Create resumes table for storing user CVs
CREATE TABLE IF NOT EXISTS resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT 'New Resume',
    target_job TEXT,
    target_company TEXT,
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_resumes_user_email ON resumes(user_email);

-- Enable RLS (optional - we're using service_role key which bypasses RLS)
-- ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_resume_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_update_resume_updated_at ON resumes;
CREATE TRIGGER trigger_update_resume_updated_at
    BEFORE UPDATE ON resumes
    FOR EACH ROW
    EXECUTE FUNCTION update_resume_updated_at();
