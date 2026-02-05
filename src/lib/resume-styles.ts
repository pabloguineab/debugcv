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

    // Calculate average bullet length (longer bullets need more space)
    const allBullets = data.experience.flatMap(exp => exp.bullets || []);
    const avgBulletLength = allBullets.length > 0
        ? allBullets.reduce((sum, b) => sum + b.length, 0) / allBullets.length
        : 0;
    const bulletLengthFactor = avgBulletLength > 100 ? 1.5 : avgBulletLength > 60 ? 1.2 : 1;

    // Weight each content type by approximate space it takes on page
    // Increased weights for more accurate density detection
    const score =
        data.experience.length * 10 +                    // Each experience entry ~10 units
        totalBullets * 4 * bulletLengthFactor +          // Each bullet ~4 units (adjusted by length)
        data.education.length * 6 +                      // Each education ~6 units
        data.projects.length * 8 +                       // Each project ~8 units
        data.certifications.length * 4 +                 // Each cert ~4 units
        (data.languages?.length || 0) * 2 +              // Each language ~2 units
        Math.floor(data.skills.length / 3) +             // Skills (grouped) ~0.33 each
        Math.floor(totalDescriptionLength / 80);         // Text length contribution (more sensitive)

    return score;
}

// Linear interpolation helper with easing for more aggressive scaling
function lerp(min: number, max: number, t: number): number {
    return min + (max - min) * t;
}

// Eased lerp - more aggressive reduction as content increases
function easeOutLerp(sparseValue: number, denseValue: number, t: number): number {
    // Use quadratic easing for more aggressive reduction at higher densities
    const easedT = 1 - Math.pow(1 - t, 1.5);
    return sparseValue + (denseValue - sparseValue) * easedT;
}

// Calculate style config based on content density using continuous interpolation
// Target: Fill exactly 1 page (A4: ~842pt height, ~595pt width)
export function calculateStyleConfig(data: ResumeData): StyleConfig {
    const contentScore = calculateContentScore(data);

    // Define min/max bounds for scores
    // Score ~30 = very little content (needs max spacing)
    // Score ~150 = extremely dense (needs min spacing) - lowered threshold
    const MIN_SCORE = 30;
    const MAX_SCORE = 150;

    // Clamp score and calculate interpolation factor (0 = sparse, 1 = dense)
    const clampedScore = Math.max(MIN_SCORE, Math.min(MAX_SCORE, contentScore));
    const t = (clampedScore - MIN_SCORE) / (MAX_SCORE - MIN_SCORE);

    // Determine tier for logging
    let tier: StyleConfig['tier'];
    if (t > 0.75) tier = 'very-dense';
    else if (t > 0.55) tier = 'dense';
    else if (t > 0.35) tier = 'medium';
    else if (t > 0.15) tier = 'light';
    else tier = 'very-light';

    // Interpolate all values between sparse (max) and dense (min)
    // Using eased interpolation for more aggressive scaling
    // IMPORTANT: Sparse values are LARGER to fill the page with less content
    return {
        // Page padding: sparse=45pt, dense=14pt (reduced further for very dense)
        pagePadding: easeOutLerp(45, 14, t),
        pagePaddingTop: easeOutLerp(40, 10, t),
        pagePaddingBottom: easeOutLerp(36, 8, t),

        // Typography: sparse=LARGE, dense=smaller to fit more content
        baseFontSize: easeOutLerp(11.5, 7, t),
        nameFontSize: easeOutLerp(26, 13, t),
        sectionTitleSize: easeOutLerp(13, 7.5, t),
        entryTitleSize: easeOutLerp(11, 7, t),
        detailFontSize: easeOutLerp(10.5, 6.5, t),

        // Spacing: sparse=GENEROUS, dense=very tight
        sectionMarginTop: easeOutLerp(14, 1, t),
        sectionMarginBottom: easeOutLerp(10, 1, t),
        entryMarginBottom: easeOutLerp(10, 1.5, t),
        bulletMarginBottom: easeOutLerp(3.5, 0.3, t),
        lineHeight: easeOutLerp(1.45, 1.1, t),

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
