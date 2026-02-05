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

    // Define min/max bounds for scores - calibrated for typical resumes
    // Score ~35 = sparse content (1-2 experiences, few bullets)
    // Score ~130 = dense content (4+ experiences, many bullets, projects, certs)
    const MIN_SCORE = 35;
    const MAX_SCORE = 130;

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
    // BALANCED: Values calibrated to fill exactly one page
    return {
        // Page padding: sparse=48pt, dense=24pt (not too tight)
        pagePadding: lerp(48, 24, t),
        pagePaddingTop: lerp(42, 18, t),
        pagePaddingBottom: lerp(38, 16, t),

        // Typography: readable range (never below 8pt)
        baseFontSize: lerp(11.5, 8.5, t),
        nameFontSize: lerp(26, 16, t),
        sectionTitleSize: lerp(13, 9, t),
        entryTitleSize: lerp(11, 8.5, t),
        detailFontSize: lerp(10.5, 8, t),

        // Spacing: balanced (not cramped, not too loose)
        sectionMarginTop: lerp(14, 5, t),
        sectionMarginBottom: lerp(10, 4, t),
        entryMarginBottom: lerp(10, 4, t),
        bulletMarginBottom: lerp(3, 1.5, t),
        lineHeight: lerp(1.45, 1.25, t),

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
