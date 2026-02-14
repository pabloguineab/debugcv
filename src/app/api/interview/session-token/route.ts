import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const LIVE_AVATAR_API_URL = "https://api.liveavatar.com/v1";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        let contextId: string | undefined;
        try {
            const body = await request.json();
            contextId = body?.contextId;
        } catch {
            // Body might be empty
        }

        const apiKey = process.env.LIVE_AVATAR_API_KEY?.trim();
        const avatarId = process.env.LIVE_AVATAR_ID?.trim();
        const defaultContextId = process.env.LIVE_AVATAR_CONTEXT_ID?.trim();

        console.log('Session token request:', {
            hasApiKey: !!apiKey,
            apiKeyLength: apiKey?.length,
            hasAvatarId: !!avatarId,
            hasContextId: !!defaultContextId,
            contextIdOverride: contextId
        });

        if (!apiKey || !avatarId) {
            console.error('Missing env vars:', { apiKey: !!apiKey, avatarId: !!avatarId });
            return NextResponse.json(
                { error: 'Configuration Error: LiveAvatar API key or ID missing in Vercel.' },
                { status: 500 }
            );
        }

        // 1. Create session token
        const tokenRes = await fetch(`${LIVE_AVATAR_API_URL}/sessions/token`, {
            method: 'POST',
            headers: {
                'X-API-KEY': apiKey,
                'accept': 'application/json',
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                mode: "FULL",
                avatar_id: avatarId,
                avatar_persona: {
                    context_id: contextId || defaultContextId,
                    language: "en",
                },
            }),
        });

        if (!tokenRes.ok) {
            const errorText = await tokenRes.text();
            console.error('Failed to create LiveAvatar session token:', tokenRes.status, errorText);
            return NextResponse.json(
                { error: 'Failed to create session token', details: errorText },
                { status: tokenRes.status }
            );
        }

        const tokenData = await tokenRes.json();
        const { session_id, session_token } = tokenData.data;

        console.log('LiveAvatar session token created:', session_id);

        return NextResponse.json({
            sessionId: session_id,
            sessionToken: session_token,
        });

    } catch (error) {
        console.error('Error creating LiveAvatar session token:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
