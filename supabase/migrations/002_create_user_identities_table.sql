-- Create user_identities table for storing user profiles
CREATE TABLE IF NOT EXISTS user_identities (
    user_email TEXT PRIMARY KEY,
    provider TEXT NOT NULL,
    name TEXT,
    email TEXT,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_identities_email ON user_identities(user_email);

-- Enable Row Level Security
ALTER TABLE user_identities ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own identity
CREATE POLICY "Users can read their own identity"
    ON user_identities
    FOR SELECT
    USING (auth.email() = user_email OR auth.role() = 'anon');

-- Policy: Users can update their own identity
CREATE POLICY "Users can update their own identity"
    ON user_identities
    FOR UPDATE
    USING (auth.email() = user_email);

-- Policy: Allow insert from service role or anon (for signup)
CREATE POLICY "Allow insert for signup"
    ON user_identities
    FOR INSERT
    WITH CHECK (true);
