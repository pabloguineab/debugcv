import { ResumeData } from "@/types/resume";

// Style configuration interface for dynamic styling
export interface StyleConfig {
    // Page/container
    pagePadding: number;
    pagePaddingTop: number;
    pagePaddingBottom: number;

    // Typography
    baseFontSize: number;
    nameFontSize: number;
    sectionTitleSize: number;
    entryTitleSize: number;
    detailFontSize: number;

    // Spacing
    sectionMarginTop: number;
    sectionMarginBottom: number;
    entryMarginBottom: number;
    bulletMarginBottom: number;
    lineHeight: number;

    // Content density tier (for debugging/logging)
    tier: 'very-dense' | 'dense' | 'medium' | 'light' | 'very-light';
    contentScore: number;
}

// Calculate content density score from resume data
export function calculateContentScore(data: ResumeData): number {
    const totalBullets = data.experience.reduce((sum, exp) => sum + (exp.bullets?.length || 0), 0);
    const totalDescriptionLength =
        data.projects.reduce((sum, p) => sum + (p.description?.length || 0), 0) +
        (data.summary?.length || 0);

    // Weight each content type by approximate space it takes on page
    // Reduced weights to spread scores across the 0-200 range more evenly
    const score =
        data.experience.length * 6 +          // Each experience entry ~6 units
        totalBullets * 2.5 +                  // Each bullet ~2.5 units
        data.education.length * 4 +           // Each education ~4 units
        data.projects.length * 5 +            // Each project ~5 units
        data.certifications.length * 2 +      // Each cert ~2 units
        (data.languages?.length || 0) * 1.5 + // Each language ~1.5 units
        Math.floor(data.skills.length / 5) +  // Skills (grouped) ~0.2 each
        Math.floor(totalDescriptionLength / 120); // Text length contribution

    return score;
}

// Linear interpolation helper
function lerp(min: number, max: number, t: number): number {
    return min + (max - min) * t;
}

// Calculate style config based on content density using continuous interpolation
// Target: Fill exactly 1 page (A4: ~842pt height, ~595pt width)
export function calculateStyleConfig(data: ResumeData): StyleConfig {
    const contentScore = calculateContentScore(data);

    // Define min/max bounds for scores
    // Score ~25 = very little content (needs max spacing)
    // Score ~200 = extremely dense (needs min spacing)
    const MIN_SCORE = 25;
    const MAX_SCORE = 200;

    // Clamp score and calculate interpolation factor (0 = sparse, 1 = dense)
    const clampedScore = Math.max(MIN_SCORE, Math.min(MAX_SCORE, contentScore));
    const t = (clampedScore - MIN_SCORE) / (MAX_SCORE - MIN_SCORE);

    // Determine tier for logging
    let tier: StyleConfig['tier'];
    if (t > 0.80) tier = 'very-dense';
    else if (t > 0.60) tier = 'dense';
    else if (t > 0.40) tier = 'medium';
    else if (t > 0.20) tier = 'light';
    else tier = 'very-light';

    // Interpolate all values between sparse (max) and dense (min)
    // Format: lerp(sparseValue, denseValue, t)
    // IMPORTANT: Sparse values are LARGER to fill the page with less content
    return {
        // Page padding: sparse=50pt, dense=18pt (reduced for very dense)
        pagePadding: lerp(50, 18, t),
        pagePaddingTop: lerp(44, 14, t),
        pagePaddingBottom: lerp(40, 12, t),

        // Typography: sparse=LARGE, dense=smaller to fit more content
        baseFontSize: lerp(12, 7.5, t),
        nameFontSize: lerp(28, 14, t),
        sectionTitleSize: lerp(14, 8, t),
        entryTitleSize: lerp(12, 7.5, t),
        detailFontSize: lerp(11, 7, t),

        // Spacing: sparse=GENEROUS, dense=very tight
        sectionMarginTop: lerp(16, 2, t),
        sectionMarginBottom: lerp(12, 1.5, t),
        entryMarginBottom: lerp(12, 2, t),
        bulletMarginBottom: lerp(4, 0.5, t),
        lineHeight: lerp(1.5, 1.15, t),

        tier,
        contentScore,
    };
}

// Convert style config to CSS custom properties for web preview
export function styleConfigToCSSVariables(config: StyleConfig): Record<string, string> {
    return {
        '--resume-padding': `${config.pagePadding * 1.2}px`,
        '--resume-padding-top': `${config.pagePaddingTop * 1.2}px`,
        '--resume-padding-bottom': `${config.pagePaddingBottom * 1.2}px`,
        '--resume-font-base': `${config.baseFontSize * 1.2}px`,
        '--resume-font-name': `${config.nameFontSize * 1.2}px`,
        '--resume-font-section': `${config.sectionTitleSize * 1.2}px`,
        '--resume-font-entry': `${config.entryTitleSize * 1.2}px`,
        '--resume-font-detail': `${config.detailFontSize * 1.2}px`,
        '--resume-margin-section-top': `${config.sectionMarginTop * 1.2}px`,
        '--resume-margin-section-bottom': `${config.sectionMarginBottom * 1.2}px`,
        '--resume-margin-entry': `${config.entryMarginBottom * 1.2}px`,
        '--resume-margin-bullet': `${config.bulletMarginBottom * 1.2}px`,
        '--resume-line-height': `${config.lineHeight}`,
    };
}
