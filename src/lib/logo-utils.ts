export function getCompanyDomain(company: string, website?: string): string {
    const lowerCompany = company.toLowerCase().trim();

    // Manual overrides for major companies
    const overrides: Record<string, string> = {
        'vercel': 'vercel.com',
        'stripe': 'stripe.com',
        'figma': 'figma.com',
        'linear': 'linear.app',
        'notion': 'notion.so',
        'google': 'google.com',
        'amazon': 'amazon.com',
        'microsoft': 'microsoft.com',
        'meta': 'meta.com',
        'facebook': 'meta.com',
        'apple': 'apple.com',
        'netflix': 'netflix.com',
        'uber': 'uber.com',
        'airbnb': 'airbnb.com',
        'twitter': 'twitter.com',
        'x': 'twitter.com',
        'tesla': 'tesla.com',
        'ibm': 'ibm.com',
        'oracle': 'oracle.com',
        'salesforce': 'salesforce.com',
        'adobe': 'adobe.com',
        'intel': 'intel.com',
        'nvidia': 'nvidia.com',
        'spotify': 'spotify.com',
        'slack': 'slack.com',
        'atlassian': 'atlassian.com',
        'dropbox': 'dropbox.com',
        'github': 'github.com',
        'gitlab': 'gitlab.com',
        'shopify': 'shopify.com',
        'zoom': 'zoom.us',
        'lyft': 'lyft.com',
        'pinterest': 'pinterest.com',
        'reddit': 'reddit.com',
        'tiktok': 'tiktok.com',
        'snap': 'snap.com',
        'snapchat': 'snap.com',
        'linkedin': 'linkedin.com',
        'indeed': 'indeed.com',
        'paypal': 'paypal.com',
        'square': 'squareup.com',
        'coinbase': 'coinbase.com',
        'robinhood': 'robinhood.com',
        'cloudflare': 'cloudflare.com',
        'mongodb': 'mongodb.com',
        'datadog': 'datadoghq.com',
        'twilio': 'twilio.com',
        'hubspot': 'hubspot.com',
        'asana': 'asana.com',
        'monday': 'monday.com',
        'jira': 'atlassian.com',
        'trello': 'trello.com',
    };

    if (overrides[lowerCompany]) return overrides[lowerCompany];

    if (website) {
        try {
            const url = new URL(website.startsWith('http') ? website : `https://${website}`);
            return url.hostname;
        } catch (e) {
            // invalid url, fall through
        }
    }

    // Fallback: clean company name and append .com
    const cleanName = lowerCompany
        .replace(/ inc\.?$/, '')
        .replace(/ corp\.?$/, '')
        .replace(/ corporation$/, '')
        .replace(/ llc$/, '')
        .replace(/ ltd\.?$/, '')
        .replace(/ limited$/, '')
        .trim()
        .replace(/\s+/g, '');

    return cleanName.includes('.') ? cleanName : `${cleanName}.com`;
}

export function getInstitutionDomain(name: string, website?: string): string {
    if (website) {
        try {
            const url = new URL(website.startsWith('http') ? website : `https://${website}`);
            return url.hostname.replace(/^www\./, '');
        } catch (e) {
            // invalid url, fall through
        }
    }

    // Manual overrides for common universities without standard domains
    const lowerName = name.toLowerCase().trim();
    const overrides: Record<string, string> = {
        'harvard': 'harvard.edu',
        'harvard university': 'harvard.edu',
        'mit': 'mit.edu',
        'massachusetts institute of technology': 'mit.edu',
        'stanford': 'stanford.edu',
        'stanford university': 'stanford.edu',
        'berkeley': 'berkeley.edu',
        'uc berkeley': 'berkeley.edu',
        'yale': 'yale.edu',
        'yale university': 'yale.edu',
        'princeton': 'princeton.edu',
        'princeton university': 'princeton.edu',
        'columbia': 'columbia.edu',
        'columbia university': 'columbia.edu',
        'oxford': 'ox.ac.uk',
        'university of oxford': 'ox.ac.uk',
        'cambridge': 'cam.ac.uk',
        'university of cambridge': 'cam.ac.uk',
        'caltech': 'caltech.edu',
    };

    if (overrides[lowerName]) return overrides[lowerName];

    // Try to guess domain from name
    const cleanName = lowerName
        .replace(/university of /g, '')
        .replace(/ university/g, '')
        .replace(/universidad de /g, '')
        .replace(/ de /g, '')
        .replace(/\s+/g, '')
        .trim();

    return cleanName.includes('.') ? cleanName : `${cleanName}.edu`;
}

// Preferred logo sources
export function getCompanyLogoUrl(company: string, website?: string): string {
    const domain = getCompanyDomain(company, website);
    // Prefer Clearbit for companies as it's often more reliable for icons
    return `https://logo.clearbit.com/${domain}`;
}

export function getInstitutionLogoUrl(name: string, website?: string): string {
    const domain = getInstitutionDomain(name, website);
    // Prefer Brandfetch for institutions/universities as they often have higher quality logos
    return `https://cdn.brandfetch.io/${domain}/w/400/h/400`;
}
