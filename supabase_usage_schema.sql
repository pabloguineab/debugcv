
-- Table to track monthly usage of limited features for Free Plan users
CREATE TABLE IF NOT EXISTS user_usage (
  user_email TEXT PRIMARY KEY,
  resume_downloads INTEGER DEFAULT 0,
  cover_letter_downloads INTEGER DEFAULT 0,
  ats_scans INTEGER DEFAULT 0,
  period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure resumes table exists (referenced by actions/resumes.ts)
CREATE TABLE IF NOT EXISTS resumes (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  name TEXT NOT NULL,
  target_job TEXT,
  target_company TEXT,
  job_description TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure cover_letters table exists (referenced by actions/cover-letters.ts)
CREATE TABLE IF NOT EXISTS cover_letters (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  job_description TEXT,
  resume_id TEXT, -- Relation to resume if needed
  target_job TEXT,
  target_company TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own usage" ON user_usage FOR SELECT TO authenticated USING (auth.jwt() ->> 'email' = user_email);

ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own resumes" ON resumes FOR SELECT TO authenticated USING (auth.jwt() ->> 'email' = user_email);
CREATE POLICY "Users can insert own resumes" ON resumes FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'email' = user_email);
CREATE POLICY "Users can update own resumes" ON resumes FOR UPDATE TO authenticated USING (auth.jwt() ->> 'email' = user_email);
CREATE POLICY "Users can delete own resumes" ON resumes FOR DELETE TO authenticated USING (auth.jwt() ->> 'email' = user_email);

ALTER TABLE cover_letters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own cover letters" ON cover_letters FOR SELECT TO authenticated USING (auth.jwt() ->> 'email' = user_email);
CREATE POLICY "Users can insert own cover letters" ON cover_letters FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'email' = user_email);
CREATE POLICY "Users can update own cover letters" ON cover_letters FOR UPDATE TO authenticated USING (auth.jwt() ->> 'email' = user_email);
CREATE POLICY "Users can delete own cover letters" ON cover_letters FOR DELETE TO authenticated USING (auth.jwt() ->> 'email' = user_email);
