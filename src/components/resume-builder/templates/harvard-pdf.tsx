"use client";

import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Link,
    pdf,
    Svg,
    Path,
    Circle,
    Font,
    Image,
} from "@react-pdf/renderer";
import { ResumeData } from "@/types/resume";
import { calculateStyleConfig } from "@/lib/resume-styles";
import { formatSkillName } from "@/lib/skill-formatter";
import { getCompanyLogoUrl, getInstitutionLogoUrl } from "@/lib/logo-utils";

// Helper to proxy external images for PDF generation
const getProxiedUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("data:")) return url;
    // Use window.location.origin to ensure absolute URL if available
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/api/image-proxy?url=${encodeURIComponent(url)}`;
};

// Register Poppins font
Font.register({
    family: "Poppins",
    fonts: [
        { src: "/Poppins/Poppins-Regular.ttf", fontWeight: 400 },
        { src: "/Poppins/Poppins-Medium.ttf", fontWeight: 500 },
        { src: "/Poppins/Poppins-SemiBold.ttf", fontWeight: 600 },
        { src: "/Poppins/Poppins-Bold.ttf", fontWeight: 700 },
        { src: "/Poppins/Poppins-Italic.ttf", fontWeight: 400, fontStyle: "italic" },
        { src: "/Poppins/Poppins-MediumItalic.ttf", fontWeight: 500, fontStyle: "italic" },
        { src: "/Poppins/Poppins-SemiBoldItalic.ttf", fontWeight: 600, fontStyle: "italic" },
        { src: "/Poppins/Poppins-BoldItalic.ttf", fontWeight: 700, fontStyle: "italic" },
    ],
});

// Check icon SVG - Outlined to match CheckCircle2
function CheckIcon({ size = 7, color = "#2563eb" }: { size?: number, color?: string }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
            <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
            <Path
                d="M9 12l2 2 4-4"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
        </Svg>
    );
}

// Phone icon SVG
function PhoneIcon({ size = 8, color = "#2563eb" }: { size?: number, color?: string }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
            <Path
                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
        </Svg>
    );
}

// Mail icon SVG
function MailIcon({ size = 8, color = "#2563eb" }: { size?: number, color?: string }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
            <Path
                d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            <Path
                d="M22 6l-10 7L2 6"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
        </Svg>
    );
}

// LinkedIn icon SVG
function LinkedInIcon({ size = 8, color = "#2563eb" }: { size?: number, color?: string }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
            <Path
                d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            <Path
                d="M2 9h4v12H2z"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            <Circle cx="4" cy="4" r="2" stroke={color} strokeWidth="2" fill="none" />
        </Svg>
    );
}

// GitHub icon SVG
function GitHubIcon({ size = 8, color = "#2563eb" }: { size?: number, color?: string }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
            <Path
                d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
        </Svg>
    );
}

// MapPin icon SVG
function MapPinIcon({ size = 8, color = "#2563eb" }: { size?: number, color?: string }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
            <Path
                d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth="2" fill="none" />
        </Svg>
    );
}

// Format date range
function formatDateRange(startDate?: string, endDate?: string, current?: boolean): string {
    const end = current ? "Present" : (endDate || "");
    const start = startDate || "";
    if (start && end) return `${start} - ${end}`;
    if (start) return start;
    if (end) return end;
    return "";
}

// Categorize skills - expanded keywords
function categorizeSkills(skills: string[]): { general: string[]; technical: string[] } {
    const techKeywords = ['python', 'javascript', 'react', 'sql', 'tensorflow', 'pytorch', 'aws', 'docker', 'git', 'numpy', 'pandas', 'matplotlib', 'tableau', 'excel', 'r', 'matlab', 'spark', 'hadoop', 'llm', 'nlp', 'api', 'mongodb', 'postgresql', 'nosql', 'flask', 'fastapi', 'streamlit', 'langchain', 'keras', 'scikit', 'java', 'c++', 'typescript', 'node', 'vue', 'angular', 'html', 'css', 'linux', 'azure', 'gcp', 'kubernetes', 'jenkins', 'ci/cd', 'power bi', 'd3', 'plotly', 'scipy', 'pyspark', 'qdrant', 'chromadb', 'pinecone', 'hugging', 'transformers', 'openai', 'anthropic', 'gradio', 'chainlit', 'dialogflow', 'sagemaker', 'lambda', 'ec2', 's3', 'bash', 'shell', 'scripting', 'google-cloud', 'langgraph'];

    const technical = skills.filter(skill =>
        techKeywords.some(k => skill.toLowerCase().includes(k))
    );
    const general = skills.filter(skill =>
        !techKeywords.some(k => skill.toLowerCase().includes(k))
    );

    return { technical, general };
}

// Harvard PDF Document Component with dynamic sizing
export function HarvardPDFDocument({ data }: { data: ResumeData }) {
    const { personalInfo, summary, skills, experience, education, projects, certifications, languages } = data;

    // Calculate dynamic styles based on content density
    const styleConfig = calculateStyleConfig(data);
    const accentColor = data.accentColor || "#2563eb";

    // Dynamic density scaling to fill page or save space
    // Shifted baseline: "very-dense" is now the standard (1.0) to avoid shrinking content that fits.
    // Restored "perfect" aggressive filling, relying on removing bottom padding to fix overflow
    const densityFactors = {
        'very-dense': 1.0,  // Baseline
        'dense': 1.05,      // Boost
        'medium': 1.1,      // Significant Boost
        'light': 1.2,       // Large Expansion
        'very-light': 1.35  // Maximum Expansion
    };
    const densityFactor = densityFactors[styleConfig.tier] || 1.0;

    // Vertical spacing scaling to fill vertical whitespace
    const spacingFactors = {
        'very-dense': 1.16, // Micro-reduction to prevent page 2
        'dense': 1.26,      // High density but safe
        'medium': 1.43,     // Boosted
        'light': 1.63,      // Open
        'very-light': 1.83  // Maximum spread
    };
    const spacingFactor = (spacingFactors[styleConfig.tier] || 1.0) * (data.showPhoto ? 0.95 : 1.0);

    // Auto-generate headline
    const generatedHeadline = data.targetJob
        || (experience.length > 0 && experience[0].title ? experience[0].title : "");

    const { technical: technicalSkills, general: generalSkills } = categorizeSkills(skills);

    // Dynamic styles based on content density
    // Colors matching Tailwind: gray-700=#374151, gray-600=#4b5563, gray-500=#6b7280, gray-400=#9ca3af, gray-200=#e5e7eb, gray-900=#111827
    const styles = StyleSheet.create({
        page: {
            fontFamily: "Poppins",
            fontSize: styleConfig.baseFontSize * densityFactor,
            color: "#374151", // text-gray-700
            display: "flex",
            flexDirection: "column",
            // Removed height: "100%" to avoid forcing overflow
        },
        header: {
            padding: `${styleConfig.pagePaddingTop} ${styleConfig.pagePadding} ${styleConfig.sectionMarginBottom * spacingFactor} ${styleConfig.pagePadding}`,
        },
        name: {
            fontSize: styleConfig.nameFontSize, // Keep name prominent
            fontWeight: 700, // bold
            color: accentColor,
            letterSpacing: 0.5,
        },
        headline: {
            fontSize: styleConfig.detailFontSize * densityFactor * 1.1,
            color: "#4b5563", // text-gray-600
            marginTop: 2,
        },
        headerDivider: {
            height: 3,
            backgroundColor: accentColor,
            marginTop: 6 * spacingFactor,
            marginBottom: 6 * spacingFactor,
        },
        contactRow: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
            fontSize: styleConfig.detailFontSize * densityFactor * 0.9,
            color: "#4b5563", // text-gray-600
        },
        contactItem: {
            flexDirection: "row",
            alignItems: "center",
            gap: 3,
        },
        contactLink: {
            color: accentColor,
        },
        // ... (omitted styles)
        columnsContainer: {
            flexDirection: "row",
            paddingHorizontal: styleConfig.pagePadding,
            gap: 16,
            // Removed flexGrow: 1 and paddingBottom to prevent pushing a new page
        },
        leftColumn: {
            width: "55%", // Match Preview 55%
            paddingRight: 10,
            borderRightWidth: 1,
            borderRightColor: "#e5e7eb", // border-gray-200
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
        },
        rightColumn: {
            width: "45%", // Match Preview 45%
            paddingLeft: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
        },
        sectionHeader: {
            marginBottom: styleConfig.sectionMarginBottom * 0.5 * spacingFactor,
            marginTop: styleConfig.sectionMarginTop * 0.9 * spacingFactor,
        },
        sectionTitle: {
            fontSize: styleConfig.sectionTitleSize * densityFactor,
            fontWeight: 700, // bold
            color: accentColor,
            textTransform: "uppercase",
            letterSpacing: 0.8,
        },
        sectionLine: {
            height: 2,
            backgroundColor: accentColor,
            marginTop: 2 * spacingFactor,
        },
        summary: {
            fontSize: styleConfig.detailFontSize * densityFactor,
            lineHeight: styleConfig.lineHeight,
            color: "#374151", // text-gray-700
        },
        entryContainer: {
            marginBottom: styleConfig.entryMarginBottom * 0.9 * spacingFactor,
        },
        entryHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
        },
        entryTitleRow: {
            flexDirection: "row",
            alignItems: "center",
            flexWrap: "wrap",
            flex: 1,
        },
        entryTitle: {
            fontSize: styleConfig.entryTitleSize * densityFactor,
            fontWeight: 700, // bold
            color: "#111827", // text-gray-900
        },
        entryCompany: {
            fontSize: styleConfig.entryTitleSize * densityFactor,
            fontWeight: 600, // semibold was used in preview often
            color: accentColor,
        },
        entryCompanyLink: {
            fontSize: styleConfig.entryTitleSize * densityFactor,
            fontWeight: 600, // semibold
            color: accentColor,
            textDecoration: "underline",
        },
        entrySeparator: {
            color: "#6b7280",
            marginHorizontal: 3,
            fontSize: styleConfig.detailFontSize * densityFactor,
        },
        entryMeta: {
            fontSize: styleConfig.detailFontSize * densityFactor * 0.9,
            color: "#6b7280",
            flexShrink: 0,
            marginLeft: 8,
            textAlign: "right",
        },
        bulletList: {
            marginTop: 4,
            marginLeft: 8,
        },
        bulletItem: {
            flexDirection: "row",
            marginBottom: styleConfig.bulletMarginBottom * spacingFactor,
        },
        bulletIcon: {
            marginRight: 6,
            marginTop: 1.5,
        },
        bulletText: {
            flex: 1,
            fontSize: styleConfig.detailFontSize * densityFactor,
            lineHeight: styleConfig.lineHeight,
            color: "#374151",
        },
        eduHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
        },
        eduTitle: {
            fontSize: styleConfig.entryTitleSize * densityFactor,
            fontWeight: 700, // bold
            color: "#111827",
        },
        eduSubtitle: {
            fontSize: styleConfig.detailFontSize * densityFactor,
            color: "#4b5563",
            fontStyle: "italic",
        },
        eduDate: {
            fontSize: styleConfig.detailFontSize * densityFactor * 0.9,
            color: "#6b7280",
            flexShrink: 0,
            textAlign: "right",
        },
        skillTagsContainer: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 3,
            marginBottom: 6 * spacingFactor,
        },
        skillTag: {
            backgroundColor: `${accentColor}15`,
            color: accentColor,
            fontSize: styleConfig.detailFontSize * densityFactor * 0.8, // Small but scales
            paddingVertical: 2, // Adjusted to 2
            paddingHorizontal: 6, // Adjusted to 6
            borderRadius: 2, // Reduced from 3
            fontWeight: 500, // medium
        },
        projectTitle: {
            fontSize: styleConfig.entryTitleSize * densityFactor,
            fontWeight: 700, // bold
            color: accentColor,
        },
        projectTech: {
            fontSize: styleConfig.detailFontSize * densityFactor * 0.9,
            color: "#6b7280",
            marginLeft: 3,
        },
        projectDesc: {
            fontSize: styleConfig.detailFontSize * densityFactor,
            color: "#374151",
            lineHeight: styleConfig.lineHeight,
            marginTop: 2,
        },
        certItem: {
            fontSize: styleConfig.detailFontSize * densityFactor,
            marginBottom: styleConfig.bulletMarginBottom * 1.2 * spacingFactor,
            color: "#374151",
        },
        certName: {
            fontWeight: 600, // semibold
            color: accentColor,
        },
        certIssuer: {
            color: "#6b7280",
        },
        certDate: {
            color: "#9ca3af",
        },
        langContainer: {
            flexDirection: "row",
            flexWrap: "wrap",
            rowGap: 2, // reduced
            columnGap: 12, // reduced
        },
        langItem: {
            fontSize: styleConfig.detailFontSize * densityFactor,
        },
        langName: {
            fontWeight: 600, // semibold for language name
            color: "#1f2937",
        },
        langLevel: {
            color: "#6b7280",
            marginLeft: 4,
        },
    });

    // Section Header Component
    function SectionHeader({ title }: { title: string }) {
        return (
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{title}</Text>
                <View style={styles.sectionLine} />
            </View>
        );
    }

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={{ flexDirection: data.showPhoto ? "row" : "column", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <View style={{ flex: data.showPhoto ? 1 : undefined, width: data.showPhoto ? "auto" : "100%" }}>
                            <Text style={styles.name}>{personalInfo.fullName}</Text>
                            {generatedHeadline && (
                                <Text style={styles.headline}>{generatedHeadline}</Text>
                            )}
                        </View>
                        {data.showPhoto && personalInfo.pictureUrl && (
                            <Image
                                src={personalInfo.pictureUrl}
                                style={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: 30, // Circle
                                    objectFit: "cover",
                                    marginLeft: 10,
                                    borderWidth: 2,
                                    borderColor: accentColor,
                                }}
                            />
                        )}
                    </View>

                    <View style={styles.headerDivider} />

                    {/* Contact Row */}
                    <View style={styles.contactRow}>
                        {personalInfo.phone && (
                            <View style={styles.contactItem}>
                                <PhoneIcon size={styleConfig.detailFontSize * 0.75} color={accentColor} />
                                <Text>{personalInfo.phone}</Text>
                            </View>
                        )}
                        {personalInfo.email && (
                            <View style={styles.contactItem}>
                                <MailIcon size={styleConfig.detailFontSize * 0.75} color={accentColor} />
                                <Link src={`mailto:${personalInfo.email}`} style={styles.contactLink}>
                                    {personalInfo.email}
                                </Link>
                            </View>
                        )}
                        {personalInfo.linkedin && (
                            <View style={styles.contactItem}>
                                <LinkedInIcon size={styleConfig.detailFontSize * 0.75} color={accentColor} />
                                <Link
                                    src={personalInfo.linkedin.startsWith("http") ? personalInfo.linkedin : `https://${personalInfo.linkedin}`}
                                    style={styles.contactLink}
                                >
                                    {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}
                                </Link>
                            </View>
                        )}
                        {personalInfo.github && (
                            <View style={styles.contactItem}>
                                <GitHubIcon size={styleConfig.detailFontSize * 0.75} color={accentColor} />
                                <Link
                                    src={personalInfo.github.startsWith("http") ? personalInfo.github : `https://${personalInfo.github}`}
                                    style={styles.contactLink}
                                >
                                    {personalInfo.github.replace(/^https?:\/\/(www\.)?/, '')}
                                </Link>
                            </View>
                        )}
                        {personalInfo.location && (
                            <View style={styles.contactItem}>
                                <MapPinIcon size={styleConfig.detailFontSize * 0.75} color={accentColor} />
                                <Text>{personalInfo.location}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Two Column Layout */}
                <View style={styles.columnsContainer}>
                    {/* Left Column - Summary, Experience & Education */}
                    <View style={styles.leftColumn}>
                        {/* Summary */}
                        {summary && (
                            <View>
                                <SectionHeader title="Summary" />
                                <Text style={styles.summary}>{summary}</Text>
                            </View>
                        )}

                        {/* Experience */}
                        {experience.length > 0 && (
                            <View>
                                <SectionHeader title="Experience" />
                                {experience.map((exp, index) => (
                                    <View
                                        key={exp.id}
                                        style={[
                                            styles.entryContainer,
                                            index === experience.length - 1 ? { marginBottom: 0 } : {}
                                        ]}
                                    >
                                        <View style={{ flexDirection: "row", gap: 10 }}>
                                            {data.showCompanyLogos && (
                                                <Image
                                                    src={exp.logoUrl || getProxiedUrl(getCompanyLogoUrl(exp.company, exp.companyUrl))}
                                                    style={{ width: 30, height: 30, objectFit: "contain", marginTop: 2, borderRadius: 4 }}
                                                />
                                            )}
                                            <View style={{ flex: 1 }}>
                                                <View style={styles.entryHeader}>
                                                    <View style={[styles.entryTitleRow, { marginRight: 20 }]}>
                                                        <Text style={styles.entryTitle}>{exp.title}</Text>
                                                        <Text style={styles.entrySeparator}>|</Text>
                                                        {exp.companyUrl ? (
                                                            <Link
                                                                src={exp.companyUrl.startsWith("http") ? exp.companyUrl : `https://${exp.companyUrl}`}
                                                                style={styles.entryCompanyLink}
                                                            >
                                                                {exp.company}
                                                            </Link>
                                                        ) : (
                                                            <Text style={styles.entryCompany}>{exp.company}</Text>
                                                        )}
                                                    </View>
                                                    <Text style={styles.entryMeta}>
                                                        {exp.location}{exp.location ? " | " : ""}{formatDateRange(exp.startDate, exp.endDate, exp.current)}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>

                                        {
                                            exp.bullets.length > 0 && (
                                                <View style={styles.bulletList}>
                                                    {exp.bullets.filter(b => b.trim()).map((bullet, i) => (
                                                        <View key={i} style={styles.bulletItem}>
                                                            <View style={styles.bulletIcon}>
                                                                <CheckIcon size={styleConfig.detailFontSize} color={accentColor} />
                                                            </View>
                                                            <Text style={styles.bulletText}>{bullet}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            )
                                        }
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Education - Now on left column with Experience */}
                        {education.length > 0 && (
                            <View>
                                <SectionHeader title="Education" />
                                {education.map((edu, index) => (
                                    <View
                                        key={edu.id}
                                        style={[
                                            styles.entryContainer,
                                            index === education.length - 1 ? { marginBottom: 0 } : {},
                                            { flexDirection: "row", gap: 10 }
                                        ]}
                                    >
                                        {data.showInstitutionLogos && (
                                            <Image
                                                src={edu.logoUrl || getProxiedUrl(getInstitutionLogoUrl(edu.institution, edu.website))}
                                                style={{ width: 30, height: 30, objectFit: "contain", marginTop: 2, borderRadius: 4 }}
                                            />
                                        )}
                                        <View style={{ flex: 1 }}>
                                            <View style={styles.eduHeader}>
                                                <View style={{ flex: 1, marginRight: 20 }}>
                                                    <Text style={styles.eduTitle}>{edu.institution}</Text>
                                                </View>
                                                <Text style={styles.eduDate}>
                                                    {formatDateRange(edu.startDate, edu.endDate)}
                                                </Text>
                                            </View>
                                            <Text style={styles.eduSubtitle}>
                                                {edu.degree}{edu.field ? ` in ${edu.field}` : ""}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Right Column - Skills, Projects, Certifications, Languages */}
                    <View style={styles.rightColumn}>
                        {/* Technical Skills */}
                        {technicalSkills.length > 0 && (
                            <View>
                                <SectionHeader title="Technical Skills" />
                                <View style={styles.skillTagsContainer}>
                                    {technicalSkills.map((skill, index) => (
                                        <Text key={index} style={styles.skillTag}>{formatSkillName(skill)}</Text>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Other Skills */}
                        {generalSkills.length > 0 && (
                            <View>
                                <SectionHeader title="Other Skills" />
                                <View style={styles.skillTagsContainer}>
                                    {generalSkills.map((skill, index) => (
                                        <Text key={index} style={styles.skillTag}>{formatSkillName(skill)}</Text>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* All skills if no categorization */}
                        {technicalSkills.length === 0 && generalSkills.length === 0 && skills.length > 0 && (
                            <View>
                                <SectionHeader title="Skills" />
                                <View style={styles.skillTagsContainer}>
                                    {skills.map((skill, index) => (
                                        <Text key={index} style={styles.skillTag}>{formatSkillName(skill)}</Text>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Projects */}
                        {projects.length > 0 && (
                            <View>
                                <SectionHeader title="Projects" />
                                {projects.map((project, index) => (
                                    <View
                                        key={project.id}
                                        style={[
                                            styles.entryContainer,
                                            index === projects.length - 1 ? { marginBottom: 0 } : {}
                                        ]}
                                    >
                                        <View>
                                            {project.url ? (
                                                <Link
                                                    src={project.url.startsWith("http") ? project.url : `https://${project.url}`}
                                                    style={styles.projectTitle}
                                                >
                                                    {project.name}
                                                </Link>
                                            ) : (
                                                <Text style={styles.projectTitle}>{project.name}</Text>
                                            )}
                                            {project.technologies.length > 0 && (
                                                <Text style={styles.projectTech}>
                                                    ({project.technologies.slice(0, 3).join(", ")})
                                                </Text>
                                            )}
                                        </View>
                                        <Text style={styles.projectDesc}>{project.description}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Certifications */}
                        {certifications.length > 0 && (
                            <View>
                                <SectionHeader title="Certifications" />
                                {certifications.map((cert, index) => (
                                    <View
                                        key={cert.id}
                                        style={[
                                            styles.certItem,
                                            index === certifications.length - 1 ? { marginBottom: 0 } : {}
                                        ]}
                                    >
                                        <Text style={styles.certName}>{cert.name}</Text>
                                        <Text style={{ marginTop: 2 }}>
                                            {cert.issuer && <Text style={styles.certIssuer}>{cert.issuer}</Text>}
                                            {cert.issueDate && <Text style={styles.certDate}> ({cert.issueDate})</Text>}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Languages */}
                        {languages && languages.length > 0 && (
                            <View>
                                <SectionHeader title="Languages" />
                                <View style={styles.langContainer}>
                                    {languages.map((lang, index) => (
                                        <View key={index} style={styles.langItem}>
                                            <Text>
                                                <Text style={styles.langName}>{lang.language}</Text>
                                                <Text style={styles.langLevel}> {lang.level.charAt(0).toUpperCase() + lang.level.slice(1)}</Text>
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </Page>
        </Document >
    );
}
