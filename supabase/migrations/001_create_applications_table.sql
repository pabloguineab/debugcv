-- ============================================
-- SUPABASE MIGRATION: Applications Table
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- Create the applications table
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    logo TEXT,
    job_url TEXT,
    location TEXT,
    work_mode TEXT CHECK (work_mode IN ('remote', 'hybrid', 'onsite')),
    expected_salary_min INTEGER,
    expected_salary_max INTEGER,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    status TEXT NOT NULL DEFAULT 'wishlist' CHECK (status IN ('wishlist', 'applied', 'interview', 'offer', 'rejected')),
    cover_letter TEXT,
    notes TEXT,
    job_description TEXT,
    match_analysis JSONB,
    contacts JSONB,
    history JSONB,
    applied_date TIMESTAMPTZ,
    interview_date TIMESTAMPTZ,
    offer_date TIMESTAMPTZ,
    rejected_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups by user
CREATE INDEX IF NOT EXISTS idx_applications_user_email ON applications(user_email);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(user_email, status);
CREATE INDEX IF NOT EXISTS idx_applications_company ON applications(user_email, company);

-- Enable Row Level Security (RLS)
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own applications
CREATE POLICY "Users can view own applications" ON applications
    FOR SELECT USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Policy: Users can insert their own applications
CREATE POLICY "Users can insert own applications" ON applications
    FOR INSERT WITH CHECK (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Policy: Users can update their own applications
CREATE POLICY "Users can update own applications" ON applications
    FOR UPDATE USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Policy: Users can delete their own applications
CREATE POLICY "Users can delete own applications" ON applications
    FOR DELETE USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- For service role access (API routes), we also need a simpler policy
-- This allows the API to access all applications when using service role key
CREATE POLICY "Service role full access" ON applications
    FOR ALL USING (true);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON applications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON applications TO anon;

-- ============================================
-- ALTERNATIVE: If RLS causes issues, you can disable it
-- and rely on API-level security instead:
-- ALTER TABLE applications DISABLE ROW LEVEL SECURITY;
-- ============================================

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
