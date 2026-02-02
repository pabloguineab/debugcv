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
    const score =
        data.experience.length * 10 +        // Each experience entry ~10 units
        totalBullets * 4 +                   // Each bullet ~4 units
        data.education.length * 6 +          // Each education ~6 units
        data.projects.length * 8 +           // Each project ~8 units
        data.certifications.length * 3 +     // Each cert ~3 units
        (data.languages?.length || 0) * 2 +  // Each language ~2 units
        Math.floor(data.skills.length / 4) + // Skills (grouped) ~0.25 each
        Math.floor(totalDescriptionLength / 80); // Text length contribution

    return score;
}

// Calculate style config based on content density
// Target: Fill exactly 1 page (A4: ~842pt height, ~595pt width)
export function calculateStyleConfig(data: ResumeData): StyleConfig {
    const contentScore = calculateContentScore(data);

    // Thresholds tuned for A4 page with typical resume content
    // Higher score = more content = need smaller fonts/margins

    if (contentScore > 80) {
        // Very dense content - ultra compact
        return {
            pagePadding: 24,
            pagePaddingTop: 20,
            pagePaddingBottom: 16,
            baseFontSize: 8,
            nameFontSize: 16,
            sectionTitleSize: 9.5,
            entryTitleSize: 8.5,
            detailFontSize: 7.5,
            sectionMarginTop: 4,
            sectionMarginBottom: 2,
            entryMarginBottom: 2,
            bulletMarginBottom: 0.5,
            lineHeight: 1.2,
            tier: 'very-dense',
            contentScore,
        };
    } else if (contentScore > 60) {
        // Dense content
        return {
            pagePadding: 28,
            pagePaddingTop: 24,
            pagePaddingBottom: 18,
            baseFontSize: 8.5,
            nameFontSize: 17,
            sectionTitleSize: 10,
            entryTitleSize: 9,
            detailFontSize: 8,
            sectionMarginTop: 5,
            sectionMarginBottom: 3,
            entryMarginBottom: 3,
            bulletMarginBottom: 1,
            lineHeight: 1.25,
            tier: 'dense',
            contentScore,
        };
    } else if (contentScore > 45) {
        // Medium-high content
        return {
            pagePadding: 32,
            pagePaddingTop: 28,
            pagePaddingBottom: 22,
            baseFontSize: 9,
            nameFontSize: 18,
            sectionTitleSize: 10.5,
            entryTitleSize: 9.5,
            detailFontSize: 8.5,
            sectionMarginTop: 6,
            sectionMarginBottom: 4,
            entryMarginBottom: 4,
            bulletMarginBottom: 1.5,
            lineHeight: 1.3,
            tier: 'medium',
            contentScore,
        };
    } else if (contentScore > 30) {
        // Light content - more spacious
        return {
            pagePadding: 38,
            pagePaddingTop: 34,
            pagePaddingBottom: 28,
            baseFontSize: 9.5,
            nameFontSize: 20,
            sectionTitleSize: 11,
            entryTitleSize: 10,
            detailFontSize: 9,
            sectionMarginTop: 8,
            sectionMarginBottom: 5,
            entryMarginBottom: 5,
            bulletMarginBottom: 2,
            lineHeight: 1.35,
            tier: 'light',
            contentScore,
        };
    } else {
        // Very light content - maximize spacing to fill page
        return {
            pagePadding: 45,
            pagePaddingTop: 40,
            pagePaddingBottom: 35,
            baseFontSize: 10.5,
            nameFontSize: 24,
            sectionTitleSize: 12,
            entryTitleSize: 11,
            detailFontSize: 10,
            sectionMarginTop: 12,
            sectionMarginBottom: 8,
            entryMarginBottom: 8,
            bulletMarginBottom: 3,
            lineHeight: 1.5,
            tier: 'very-light',
            contentScore,
        };
    }
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
