-- ============================================
-- SUPABASE MIGRATION: Add company_url to experiences
-- ============================================

-- Add company_url column to experiences table
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS company_url TEXT;

-- Comment explaining the column
COMMENT ON COLUMN experiences.company_url IS 'URL to the company website for logo fetching';
