'use server';

import { CompanyResult } from '@/types/company';

export async function searchCompanies(query: string): Promise<CompanyResult[]> {
    if (!query || query.length < 2) {
        return [];
    }

    const apiKey = process.env.THE_COMPANIES_API_KEY;

    // Optional: Log warning if key missing but don't crash
    if (!apiKey) {
        // console.warn('THE_COMPANIES_API_KEY is not defined');
        return [];
    }

    try {
        // Use fetch instead of SDK to avoid client-side bundling issues/crashes
        const response = await fetch(`https://api.thecompaniesapi.com/v1/companies?name=${encodeURIComponent(query)}&size=5`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        if (!response.ok) {
            return [];
        }

        const data = await response.json();

        if (!data || !data.companies) {
            return [];
        }

        // Map the API response using the deep structure (same as SDK) to ensure consistent results with Playbook
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return data.companies.map((company: any) => ({
            // SDK maps company.about.name
            name: company.about?.name || company.name || company.domain?.domainName || 'Desconocido',
            // SDK maps company.domain.domain
            domain: company.domain?.domain || company.domain || '',
            // SDK maps company.assets.logoSquare.src
            logo: company.assets?.logoSquare?.src || company.logo || null
        })).filter((c: CompanyResult) => c.name && c.domain);

    } catch (error) {
        console.error('Error searching companies:', error);
        return [];
    }
}
