import Stripe from 'stripe';

// Prevent crash if env var is missing during build or initial setup, but warn
const apiKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";

if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(apiKey, {
    apiVersion: '2025-01-27.acacia' as any, // Using 'latest' or a valid version string compatible with types
    typescript: true,
});
