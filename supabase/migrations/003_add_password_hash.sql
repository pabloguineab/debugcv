-- Add password_hash column to user_identities table
ALTER TABLE user_identities 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add index for password-based login
CREATE INDEX IF NOT EXISTS idx_user_identities_email_password 
ON user_identities(user_email) WHERE password_hash IS NOT NULL;
