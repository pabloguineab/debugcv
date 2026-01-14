import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const email = formData.get("email") as string | null;

        if (!file || !email) {
            return NextResponse.json(
                { error: "Missing file or email" },
                { status: 400 }
            );
        }

        // Validate file type
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type. Only PDF and DOCX are allowed." },
                { status: 400 }
            );
        }

        // Generate a unique filename
        const timestamp = Date.now();
        const extension = file.name.split('.').pop();
        const filename = `${email.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.${extension}`;
        const filePath = `${filename}`;

        // Convert File to Buffer/ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);

        // Upload to Supabase Storage
        // Using 'resumes' bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('resumes')
            .upload(filePath, fileBuffer, {
                contentType: file.type,
                upsert: true
            });

        if (uploadError) {
            console.error("Supabase Storage Upload Error:", uploadError);
            return NextResponse.json(
                { error: `Failed to upload to storage: ${uploadError.message}` },
                { status: 500 }
            );
        }

        // Get public URL (optional, if we want to share it) or just store the path
        // For private documents like CVs, usually we generate signed URLs on demand,
        // but for simplicity here we might assume public or just store the path.
        // Let's store the full public URL so it's easy to access if the bucket is public.
        // If the bucket is private, we should store the path and use createSignedUrl when fetching.
        // For now, let's store the path relative to the bucket.
        // Actually, let's store the full path/URL if possible.
        // Supabase getPublicUrl returns a URL even if the bucket is private (it just won't be accessible without token).

        const { data: { publicUrl } } = supabase.storage.from('resumes').getPublicUrl(filePath);

        // Update profile
        const { error: dbError } = await supabase
            .from('profiles')
            .upsert({
                user_email: email,
                resume_url: publicUrl
            })
            .eq('user_email', email);

        if (dbError) {
            console.error("Database Update Error:", dbError);
            // We uploaded the file but failed to update DB... 
            // Ideally we should delete the file, but let's just return error.
            return NextResponse.json(
                { error: "Failed to update profile with resume" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, url: publicUrl });

    } catch (error) {
        console.error("Upload handler error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
