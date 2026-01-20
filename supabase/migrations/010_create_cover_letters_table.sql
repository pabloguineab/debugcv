-- Create cover_letters table for storing generated cover letters
CREATE TABLE IF NOT EXISTS cover_letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
    name TEXT NOT NULL DEFAULT 'Cover Letter',
    target_job TEXT,
    target_company TEXT,
    content TEXT NOT NULL DEFAULT '',
    job_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster user queries
CREATE INDEX IF NOT EXISTS idx_cover_letters_user_email ON cover_letters(user_email);
CREATE INDEX IF NOT EXISTS idx_cover_letters_resume_id ON cover_letters(resume_id);

-- Enable RLS
ALTER TABLE cover_letters ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own cover letters
CREATE POLICY "Users can manage their own cover letters"
ON cover_letters
FOR ALL
USING (user_email = current_setting('request.jwt.claims', true)::json->>'email')
WITH CHECK (user_email = current_setting('request.jwt.claims', true)::json->>'email');
