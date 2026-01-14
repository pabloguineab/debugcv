-- Create the 'resumes' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the 'resumes' bucket
-- Allow authenticated users to upload their own resumes
CREATE POLICY " authenticated users can upload resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resumes' AND auth.uid() = owner);

-- Allow authenticated users to view resumes (since it's public based on current logic, but let's restrict if needed. The request had public=true)
-- Actually, for now let's allow public read if the bucket is public, but let's be explicit
CREATE POLICY "Public Access to Resumes"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'resumes');

-- Allow users to update/delete their own
CREATE POLICY "Users can update own resumes"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'resumes' AND auth.uid() = owner);

CREATE POLICY "Users can delete own resumes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'resumes' AND auth.uid() = owner);
