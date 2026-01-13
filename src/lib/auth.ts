// @ts-nocheck
import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import LinkedInProvider from "next-auth/providers/linkedin";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Admin Login",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "info@debugcv.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const adminEmail = "info@debugcv.com";
                const adminPassword = process.env.ADMIN_PASSWORD || "AdminDebugCV2025!";

                if (credentials?.email === adminEmail && credentials?.password === adminPassword) {
                    return {
                        id: "admin-user",
                        name: "Admin DebugCV",
                        email: adminEmail,
                        image: null,
                    };
                }
                return null;
            }
        }),
        CredentialsProvider({
            id: "otp",
            name: "OTP Login",
            credentials: {
                email: { label: "Email", type: "email" },
                code: { label: "Code", type: "text" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.code) return null;

                // Emulate validation logic (replace with real DB check in production)
                // In a real app, you would check if the code matches what was sent to the email
                // and if it hasn't expired.
                const isValid = true;

                if (isValid) {
                    return {
                        id: credentials.email,
                        name: credentials.email, // Use email as name initially, until Onboarding updates it
                        email: credentials.email,
                        image: null,
                    };
                }
                return null;
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            authorization: {
                params: {
                    scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly",
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_ID || "",
            clientSecret: process.env.GITHUB_SECRET || "",
        }),
        LinkedInProvider({
            clientId: process.env.LINKEDIN_CLIENT_ID || "",
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
            issuer: "https://www.linkedin.com/oauth",
            wellKnown: "https://www.linkedin.com/oauth/.well-known/openid-configuration",
            authorization: {
                params: {
                    scope: "openid profile email"
                },
            },
            profile(profile) {
                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture,
                };
            },
        }),
    ],
    pages: {
        signIn: "/auth/signin",
    },
    callbacks: {
        async jwt({ token, account, profile, user }) {
            // When account exists, it means this is a sign-in event
            if (account && user?.email) {
                try {
                    const { getUserIdentity, saveUserIdentity } = await import('@/lib/supabase');

                    // Try to load existing identity from Supabase
                    const savedIdentity = await getUserIdentity(user.email);

                    if (!savedIdentity) {
                        // FIRST LOGIN: Save to Supabase
                        console.log('[JWT] First login - saving to Supabase. Provider:', account.provider);

                        await saveUserIdentity({
                            user_email: user.email,
                            provider: account.provider,
                            name: user.name || null,
                            email: user.email || null,
                            image: user.image || null,
                        });

                        // Also save in token
                        token.provider = account.provider;
                        token.accessToken = account.access_token;
                        token.identityName = user.name;
                        token.identityEmail = user.email;
                        token.identityPicture = user.image;

                        if (account.provider === 'linkedin') {
                            token.linkedInId = profile?.sub;
                        }
                    } else {
                        // EXISTING USER: Load from Supabase
                        console.log('[JWT] Existing user. Original provider:', savedIdentity.provider, 'Current login:', account.provider);

                        // Checks if we should update the profile (e.g. if the image URL expired/changed)
                        // We only update if the current provider matches the saved one (or we want to allow overwriting)
                        // For LinkedIn, we definitely want to refresh the picture if we have a new one.
                        let refreshedImage = savedIdentity.image;
                        let refreshedName = savedIdentity.name;

                        if (account.provider === savedIdentity.provider) {
                            console.log('[JWT] Same provider - checking for profile updates');

                            // If we have a fresh image from the provider, and it's different (or just to be safe for expiring URLs), update it.
                            if (user.image && user.image !== savedIdentity.image) {
                                console.log('[JWT] Updating expired/changed image');
                                await saveUserIdentity({
                                    user_email: user.email,
                                    provider: savedIdentity.provider,
                                    name: user.name || savedIdentity.name,
                                    email: user.email || savedIdentity.email,
                                    image: user.image
                                });
                                refreshedImage = user.image;
                                refreshedName = user.name || savedIdentity.name;
                            }
                        }

                        // Restore identity (using potentially refreshed data)
                        token.provider = savedIdentity.provider;
                        token.identityName = refreshedName;
                        token.identityEmail = savedIdentity.email;
                        token.identityPicture = refreshedImage;

                        // Handle tokens
                        if (account.provider === savedIdentity.provider) {
                            console.log('[JWT] Same provider - updating access token');
                            token.accessToken = account.access_token;
                        } else if (account.provider === 'google') {
                            console.log('[JWT] Linking Google -  saving access token');
                            token.googleAccessToken = account.access_token;
                        }

                        // Update LinkedIn ID if available
                        if (account.provider === 'linkedin' && profile?.sub) {
                            token.linkedInId = profile.sub;
                        }
                    }
                } catch (error) {
                    console.error('[JWT] Supabase error, falling back to token-only:', error);
                    // Fallback to token-only logic
                    if (!token.identityName) {
                        token.provider = account.provider;
                        token.accessToken = account.access_token;
                        token.identityName = user.name;
                        token.identityEmail = user.email;
                        token.identityPicture = user.image;

                        if (account.provider === 'linkedin') {
                            token.linkedInId = profile?.sub;
                        }
                    }
                }
            }

            // CRITICAL: Always restore the original identity
            if (token.identityName) {
                token.name = token.identityName;
                token.email = token.identityEmail;
                token.picture = token.identityPicture;
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (session.user as any).id = token.sub || "";
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (session.user as any).provider = token.provider;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (session.user as any).linkedInId = token.linkedInId;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (session.user as any).accessToken = token.accessToken;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (session.user as any).googleAccessToken = token.googleAccessToken;

                // CRITICAL: Load original identity from token
                // Always prefer the preserved identity over current token values
                const originalName = token.identityName;
                const originalEmail = token.identityEmail;
                const originalPicture = token.identityPicture;

                // If we have identity in token, use it
                if (originalName) {
                    session.user.name = originalName;
                    session.user.email = originalEmail;
                    session.user.image = originalPicture;
                } else {
                    // Fallback to current token values if identity not set yet
                    // This shouldn't happen but just in case
                    if (token.name) session.user.name = token.name;
                    if (token.email) session.user.email = token.email;
                    if (token.picture) session.user.image = token.picture;
                }
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: true,
};
