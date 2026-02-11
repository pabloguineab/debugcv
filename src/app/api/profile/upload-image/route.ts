
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Check if bucket exists, create if not (only works with service role)
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketName = 'avatars';

        if (buckets && !buckets.find(b => b.name === bucketName)) {
            try {
                await supabase.storage.createBucket(bucketName, {
                    public: true,
                    fileSizeLimit: 5242880, // 5MB
                    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
                });
            } catch (err) {
                console.error("Failed to create bucket (likely permissions):", err);
                // Continue and hope it exists or error will be caught in upload
            }
        }

        const email = session.user.email;
        const timestamp = Date.now();
        const extension = file.name.split('.').pop() || 'jpg';
        const sanitizedEmail = email.replace(/[^a-zA-Z0-9]/g, '_');
        const filePath = `${sanitizedEmail}/avatar-${timestamp}.${extension}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: true
            });

        if (error) {
            console.error("Upload error:", error);
            return NextResponse.json({ error: "Failed to upload image. " + error.message }, { status: 500 });
        }

        const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        return NextResponse.json({ url: publicUrl });

    } catch (error: any) {
        console.error("Profile image upload error:", error);
        return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
    }
}
