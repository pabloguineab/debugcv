-- Add job_description column to resumes table
-- This stores the job description used for tailoring the resume
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS job_description TEXT;

-- Create index for potential future queries by job description
CREATE INDEX IF NOT EXISTS idx_resumes_target_company ON resumes(target_company);
