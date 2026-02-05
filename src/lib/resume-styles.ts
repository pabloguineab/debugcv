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

// Calculate style config based on content density
// Uses conservative, stable values that work well for most content
export function calculateStyleConfig(data: ResumeData): StyleConfig {
    const contentScore = calculateContentScore(data);

    // Determine density tier for minor adjustments
    let tier: StyleConfig['tier'];
    let t: number; // adjustment factor (0 = sparse, 1 = dense)

    if (contentScore > 100) {
        tier = 'very-dense';
        t = 0.9;
    } else if (contentScore > 80) {
        tier = 'dense';
        t = 0.7;
    } else if (contentScore > 60) {
        tier = 'medium';
        t = 0.5;
    } else if (contentScore > 40) {
        tier = 'light';
        t = 0.3;
    } else {
        tier = 'very-light';
        t = 0.1;
    }

    // Stable values with minimal variation
    // These are designed to fill one page well for typical resumes
    return {
        // Page padding: stable with minor adjustment
        pagePadding: lerp(40, 28, t),
        pagePaddingTop: lerp(35, 24, t),
        pagePaddingBottom: lerp(30, 20, t),

        // Typography: consistent, readable sizes
        baseFontSize: lerp(10.5, 9, t),
        nameFontSize: lerp(24, 18, t),
        sectionTitleSize: lerp(11.5, 9.5, t),
        entryTitleSize: lerp(10, 8.5, t),
        detailFontSize: lerp(9.5, 8, t),

        // Spacing: consistent with slight compression for dense content
        sectionMarginTop: lerp(10, 6, t),
        sectionMarginBottom: lerp(6, 4, t),
        entryMarginBottom: lerp(8, 5, t),
        bulletMarginBottom: lerp(2.5, 1.5, t),
        lineHeight: lerp(1.4, 1.25, t),

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
