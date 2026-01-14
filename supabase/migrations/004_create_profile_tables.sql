-- ============================================
-- SUPABASE MIGRATION: Profile Tables
-- ============================================

-- 1. PROFILES TABLE (Extends user information)
CREATE TABLE IF NOT EXISTS profiles (
    user_email TEXT PRIMARY KEY REFERENCES user_identities(user_email) ON DELETE CASCADE,
    linkedin_user TEXT,
    github_user TEXT,
    portfolio_url TEXT,
    bio TEXT,
    location TEXT,
    tech_stack TEXT[], -- Array of tech IDs
    languages JSONB, -- Array of {language, level} objects
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- 2. EXPERIENCES TABLE
CREATE TABLE IF NOT EXISTS experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL REFERENCES user_identities(user_email) ON DELETE CASCADE,
    title TEXT NOT NULL,
    employment_type TEXT,
    company_name TEXT NOT NULL,
    country TEXT,
    location TEXT,
    start_month TEXT,
    start_year TEXT,
    end_month TEXT,
    end_year TEXT,
    is_current BOOLEAN DEFAULT FALSE,
    description TEXT,
    skills TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for experiences
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own experiences" ON experiences
    FOR SELECT USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can insert own experiences" ON experiences
    FOR INSERT WITH CHECK (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can update own experiences" ON experiences
    FOR UPDATE USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can delete own experiences" ON experiences
    FOR DELETE USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- 3. EDUCATIONS TABLE
CREATE TABLE IF NOT EXISTS educations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL REFERENCES user_identities(user_email) ON DELETE CASCADE,
    school TEXT NOT NULL,
    school_url TEXT,
    degree TEXT,
    field_of_study TEXT,
    grade TEXT,
    activities TEXT,
    description TEXT,
    start_year TEXT,
    end_year TEXT,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for educations
ALTER TABLE educations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own educations" ON educations
    FOR SELECT USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can insert own educations" ON educations
    FOR INSERT WITH CHECK (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can update own educations" ON educations
    FOR UPDATE USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can delete own educations" ON educations
    FOR DELETE USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');


-- 4. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL REFERENCES user_identities(user_email) ON DELETE CASCADE,
    name TEXT NOT NULL,
    project_url TEXT,
    description TEXT,
    technologies TEXT[],
    start_month TEXT,
    start_year TEXT,
    end_month TEXT,
    end_year TEXT,
    is_ongoing BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can insert own projects" ON projects
    FOR INSERT WITH CHECK (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can delete own projects" ON projects
    FOR DELETE USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');


-- 5. CERTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL REFERENCES user_identities(user_email) ON DELETE CASCADE,
    name TEXT NOT NULL,
    issuing_org TEXT NOT NULL,
    credential_id TEXT,
    credential_url TEXT,
    issue_month TEXT,
    issue_year TEXT,
    expiration_month TEXT,
    expiration_year TEXT,
    no_expiration BOOLEAN DEFAULT FALSE,
    skills TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for certifications
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own certifications" ON certifications
    FOR SELECT USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can insert own certifications" ON certifications
    FOR INSERT WITH CHECK (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can update own certifications" ON certifications
    FOR UPDATE USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can delete own certifications" ON certifications
    FOR DELETE USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Grant permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON experiences TO authenticated;
GRANT ALL ON educations TO authenticated;
GRANT ALL ON projects TO authenticated;
GRANT ALL ON certifications TO authenticated;

GRANT ALL ON profiles TO service_role;
GRANT ALL ON experiences TO service_role;
GRANT ALL ON educations TO service_role;
GRANT ALL ON projects TO service_role;
GRANT ALL ON certifications TO service_role;
