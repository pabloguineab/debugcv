-- ============================================
-- SUPABASE MIGRATION: Add company_url to experiences
-- ============================================

-- Add company_url column to experiences table
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS company_url TEXT;
