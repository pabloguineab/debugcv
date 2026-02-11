
-- Table for storing temporary OTP codes for account actions (deletion, verification)
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups by email
CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email);

-- Optional: Function to clean up expired codes periodically or on insert
-- But simpler approach is to just check expiry on select.

-- Allow authenticated users to insert/select their own codes via API
-- (Since we use service_role key in API routes, RLS policies are bypassed there, 
-- but good to have if we ever use client-side)
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for authenticated users only" ON otp_codes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable select for users based on email" ON otp_codes FOR SELECT TO authenticated USING (auth.jwt() ->> 'email' = email);
