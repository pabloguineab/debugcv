"use server";

import { getApplications as getApplicationsSupabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Application } from "@/types/application";

// Wrapper server action to get applications for current user
export async function getApplications(): Promise<Application[]> {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    if (!userEmail) return [];

    return getApplicationsSupabase(userEmail);
}
