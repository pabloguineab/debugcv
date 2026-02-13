-- ============================================
-- SUPABASE MIGRATION: Add Missing Policies
-- Fixes "RLS Enabled No Policy" warnings for 'scans' and 'user_profiles'
-- ============================================

DO $$
BEGIN
    -- 1. Fix 'scans' table
    -- Check if table exists and has user_email column
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'scans' AND column_name = 'user_email') THEN
        -- Add standard CRUD policies restricted to owner
        EXECUTE 'CREATE POLICY "Users can view own scans" ON scans FOR SELECT TO authenticated USING (auth.jwt() ->> ''email'' = user_email)';
        EXECUTE 'CREATE POLICY "Users can insert own scans" ON scans FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> ''email'' = user_email)';
        EXECUTE 'CREATE POLICY "Users can update own scans" ON scans FOR UPDATE TO authenticated USING (auth.jwt() ->> ''email'' = user_email)';
        EXECUTE 'CREATE POLICY "Users can delete own scans" ON scans FOR DELETE TO authenticated USING (auth.jwt() ->> ''email'' = user_email)';
    END IF;

    -- 2. Fix 'user_profiles' table
    -- Check if table exists and has user_email column
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'user_email') THEN
         -- Add standard CRUD policies restricted to owner
        EXECUTE 'CREATE POLICY "Users can view own user_profiles" ON user_profiles FOR SELECT TO authenticated USING (auth.jwt() ->> ''email'' = user_email)';
        EXECUTE 'CREATE POLICY "Users can insert own user_profiles" ON user_profiles FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> ''email'' = user_email)';
        EXECUTE 'CREATE POLICY "Users can update own user_profiles" ON user_profiles FOR UPDATE TO authenticated USING (auth.jwt() ->> ''email'' = user_email)';
         -- Note: Delete might be restricted, but we'll allow owner for now
        EXECUTE 'CREATE POLICY "Users can delete own user_profiles" ON user_profiles FOR DELETE TO authenticated USING (auth.jwt() ->> ''email'' = user_email)';
    END IF;
    
    -- 3. Fix 'cvs' table (just in case it was missed or needs explicit access)
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'cvs' AND column_name = 'user_email') THEN
        -- Only add if no policies exist to avoid duplicates/errors if you added one manually
        IF NOT EXISTS (SELECT FROM pg_policies WHERE schemaname = 'public' AND tablename = 'cvs') THEN
             EXECUTE 'CREATE POLICY "Users can view own cvs" ON cvs FOR SELECT TO authenticated USING (auth.jwt() ->> ''email'' = user_email)';
             EXECUTE 'CREATE POLICY "Users can insert own cvs" ON cvs FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> ''email'' = user_email)';
             EXECUTE 'CREATE POLICY "Users can update own cvs" ON cvs FOR UPDATE TO authenticated USING (auth.jwt() ->> ''email'' = user_email)';
             EXECUTE 'CREATE POLICY "Users can delete own cvs" ON cvs FOR DELETE TO authenticated USING (auth.jwt() ->> ''email'' = user_email)';
        END IF;
    END IF;

END $$;
