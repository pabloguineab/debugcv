-- ============================================
-- SUPABASE MIGRATION: Security Hardening
-- Fixes vulnerabilities reported by Supabase Security Advisor
-- ============================================

-- 1. Fix Function Search Path Mutable
-- (Prevents potential malicious code execution via search_path hijacking)
ALTER FUNCTION public.update_updated_at_column() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_resume_updated_at() SET search_path = public, pg_temp;

-- 2. Fix Permissive RLS Policies on 'applications'
-- The "Service role full access" policy was too permissive (USING true).
-- We drop it because service_role key bypasses RLS by default anyway.
DROP POLICY IF EXISTS "Service role full access" ON applications;

-- 3. Fix Permissive RLS Policies on 'otp_codes'
-- Restrict insert to authenticated users inserting their own email.
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON otp_codes;

CREATE POLICY "Users can insert own otp codes" ON otp_codes
    FOR INSERT TO authenticated
    WITH CHECK (auth.jwt() ->> 'email' = email);

-- 4. Fix Permissive RLS Policies on 'user_identities'
-- Restrict insert to users inserting their own identity.
DROP POLICY IF EXISTS "Allow insert for signup" ON user_identities;

CREATE POLICY "Users can insert own identity" ON user_identities
    FOR INSERT TO authenticated
    WITH CHECK (auth.jwt() ->> 'email' = user_email);

-- 5. Fix Permissive Policies on Potentially Legacy/Unknown Tables
-- The report mentioned 'cvs', 'scans', 'user_profiles' having "Allow all" policies.
-- Since these tables are not in the main migrations, they might be legacy or created manually.
-- We will safely DROP the permissive policies if the tables exist, establishing a "Default Deny" state.
-- If these tables are in use, you must add specific RLS policies for them.

DO $$
BEGIN
    -- Fix 'cvs' table if it exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cvs') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Service role has full access" ON cvs';
        -- Optional: Add a safe policy if we assume user_email column exists
        -- EXECUTE 'CREATE POLICY "Users can view own cvs" ON cvs FOR ALL TO authenticated USING (auth.jwt() ->> ''email'' = user_email)';
    END IF;

    -- Fix 'scans' table if it exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'scans') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Allow all operations on scans" ON scans';
    END IF;

    -- Fix 'user_profiles' table if it exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Allow all operations on user_profiles" ON user_profiles';
    END IF;
END $$;
