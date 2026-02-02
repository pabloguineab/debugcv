"use client";

import { Document, Page, Text, View, StyleSheet, Font, pdf, Link } from "@react-pdf/renderer";
import { ResumeData } from "@/types/resume";

// Register fonts for a professional look
Font.register({
    family: "Georgia",
    fonts: [
        { src: "https://fonts.gstatic.com/s/eb-garamond/v20/SlGUmQSNjdsmc35JDF1K5GRwUjcdlttVFm-rI7e8QL11.ttf" }
    ]
});

// Dynamic style configuration based on content density
interface StyleConfig {
    pagePadding: number;
    baseFontSize: number;
    nameFontSize: number;
    sectionTitleSize: number;
    entryTitleSize: number;
    detailFontSize: number;
    sectionMarginTop: number;
    sectionMarginBottom: number;
    entryMarginBottom: number;
    bulletMarginBottom: number;
    lineHeight: number;
}

// Calculate content density and return appropriate style config
function calculateStyleConfig(data: ResumeData): StyleConfig {
    // Count all content items
    const totalBullets = data.experience.reduce((sum, exp) => sum + exp.bullets.length, 0);
    const totalDescriptionLength = data.projects.reduce((sum, p) => sum + (p.description?.length || 0), 0)
        + (data.summary?.length || 0);

    // Calculate content score (higher = more content)
    const contentScore =
        data.experience.length * 8 +
        totalBullets * 3 +
        data.education.length * 4 +
        data.projects.length * 6 +
        data.certifications.length * 2 +
        (data.languages?.length || 0) * 2 +
        Math.floor(data.skills.length / 3) +
        Math.floor(totalDescriptionLength / 100);

    // Determine style tier based on content score
    if (contentScore > 60) {
        // Very dense content - compact everything
        return {
            pagePadding: 28,
            baseFontSize: 8.5,
            nameFontSize: 18,
            sectionTitleSize: 10,
            entryTitleSize: 9,
            detailFontSize: 8,
            sectionMarginTop: 5,
            sectionMarginBottom: 3,
            entryMarginBottom: 3,
            bulletMarginBottom: 1,
            lineHeight: 1.25,
        };
    } else if (contentScore > 45) {
        // Medium-high content
        return {
            pagePadding: 32,
            baseFontSize: 9,
            nameFontSize: 19,
            sectionTitleSize: 10.5,
            entryTitleSize: 9.5,
            detailFontSize: 8.5,
            sectionMarginTop: 6,
            sectionMarginBottom: 4,
            entryMarginBottom: 4,
            bulletMarginBottom: 1.5,
            lineHeight: 1.3,
        };
    } else if (contentScore > 30) {
        // Medium content - balanced
        return {
            pagePadding: 35,
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
        };
    } else if (contentScore > 18) {
        // Light content - more spacious
        return {
            pagePadding: 40,
            baseFontSize: 10,
            nameFontSize: 22,
            sectionTitleSize: 12,
            entryTitleSize: 10.5,
            detailFontSize: 9.5,
            sectionMarginTop: 10,
            sectionMarginBottom: 6,
            entryMarginBottom: 6,
            bulletMarginBottom: 2.5,
            lineHeight: 1.4,
        };
    } else {
        // Very light content - maximize spacing to fill page
        return {
            pagePadding: 45,
            baseFontSize: 10.5,
            nameFontSize: 24,
            sectionTitleSize: 13,
            entryTitleSize: 11,
            detailFontSize: 10,
            sectionMarginTop: 14,
            sectionMarginBottom: 8,
            entryMarginBottom: 8,
            bulletMarginBottom: 3,
            lineHeight: 1.5,
        };
    }
}

// Create dynamic styles based on config
function createDynamicStyles(config: StyleConfig) {
    return StyleSheet.create({
        page: {
            padding: config.pagePadding,
            paddingTop: config.pagePadding - 5,
            paddingBottom: config.pagePadding - 10,
            fontFamily: "Helvetica",
            fontSize: config.baseFontSize,
            color: "#333",
        },
        header: {
            textAlign: "center",
            marginBottom: config.sectionMarginBottom + 4,
        },
        name: {
            fontSize: config.nameFontSize,
            fontWeight: "bold",
            marginBottom: 4,
            color: "#1a1a1a",
        },
        divider: {
            height: 1,
            backgroundColor: "#ccc",
            marginVertical: config.sectionMarginBottom,
        },
        contactRow: {
            flexDirection: "row",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 8,
            fontSize: config.detailFontSize,
            color: "#666",
        },
        separator: {
            marginHorizontal: 4,
        },
        link: {
            color: "#2563eb",
        },
        sectionTitle: {
            fontSize: config.sectionTitleSize,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: config.sectionMarginBottom,
            marginTop: config.sectionMarginTop,
            textTransform: "uppercase",
            letterSpacing: 1,
        },
        summary: {
            fontSize: config.detailFontSize,
            lineHeight: config.lineHeight,
            color: "#444",
            textAlign: "justify",
        },
        entryContainer: {
            marginBottom: config.entryMarginBottom,
        },
        entryHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 1,
        },
        entryTitle: {
            fontSize: config.entryTitleSize,
            fontWeight: "bold",
            textTransform: "uppercase",
        },
        entryTitleLink: {
            fontSize: config.entryTitleSize,
            fontWeight: "bold",
            textTransform: "uppercase",
            color: "#2563eb",
            textDecoration: "none",
        },
        entrySubtitle: {
            fontSize: config.detailFontSize,
            color: "#555",
            fontStyle: "italic",
        },
        entryRight: {
            textAlign: "right",
            fontSize: config.detailFontSize,
            color: "#666",
            flexShrink: 0,
            marginLeft: 10,
        },
        entryLocation: {
            fontSize: config.detailFontSize,
            color: "#666",
        },
        entryDate: {
            fontSize: config.detailFontSize,
            color: "#666",
        },
        bulletList: {
            marginLeft: 10,
            marginTop: 2,
        },
        bulletItem: {
            flexDirection: "row",
            marginBottom: config.bulletMarginBottom,
        },
        bullet: {
            marginRight: 5,
            color: "#666",
        },
        bulletText: {
            flex: 1,
            fontSize: config.detailFontSize,
            lineHeight: config.lineHeight,
            color: "#444",
        },
        skillsContainer: {
            textAlign: "center",
        },
        skillsText: {
            fontSize: config.detailFontSize,
            lineHeight: config.lineHeight,
            color: "#444",
        },
        certContainer: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: config.entryMarginBottom,
        },
        certName: {
            fontSize: config.detailFontSize,
            fontWeight: "bold",
        },
        certIssuer: {
            fontSize: config.detailFontSize - 1,
            color: "#666",
        },
        certDate: {
            fontSize: config.detailFontSize - 1,
            color: "#666",
        },
        projectTech: {
            fontSize: config.detailFontSize - 1,
            color: "#666",
        },
        languagesContainer: {
            flexDirection: "row",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 6,
        },
        languageItem: {
            flexDirection: "row",
            gap: 2,
        },
        languageName: {
            fontSize: config.detailFontSize,
            fontWeight: "bold",
            color: "#333",
        },
        languageLevel: {
            fontSize: config.detailFontSize,
            color: "#666",
        },
    });
}

interface ResumePDFDocumentProps {
    data: ResumeData;
}

// The PDF Document component with dynamic styling
function ResumePDFDocument({ data }: ResumePDFDocumentProps) {
    // Calculate style config based on content
    const styleConfig = calculateStyleConfig(data);
    const styles = createDynamicStyles(styleConfig);

    // Use all available data (no artificial limits - styles adapt instead)
    const { personalInfo, summary, skills, experience, education, projects, certifications, languages } = data;

    const formatDateRange = (startDate?: string, endDate?: string, current?: boolean) => {
        const end = current ? "Present" : (endDate || "");
        const start = startDate || "";
        if (start && end) return `${start} - ${end}`;
        if (start) return start;
        if (end) return end;
        return "";
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.name}>{personalInfo.fullName}</Text>
                    <View style={styles.divider} />
                    <View style={styles.contactRow}>
                        {personalInfo.location && <Text>{personalInfo.location}</Text>}
                        {personalInfo.location && personalInfo.email && <Text style={styles.separator}>•</Text>}
                        {personalInfo.email && (
                            <Link src={`mailto:${personalInfo.email}`} style={styles.link}>
                                {personalInfo.email}
                            </Link>
                        )}
                        {personalInfo.email && personalInfo.phone && <Text style={styles.separator}>•</Text>}
                        {personalInfo.phone && <Text>{personalInfo.phone}</Text>}
                        {personalInfo.phone && personalInfo.linkedin && <Text style={styles.separator}>•</Text>}
                        {personalInfo.linkedin && (
                            <Link src={personalInfo.linkedin.startsWith("http") ? personalInfo.linkedin : `https://${personalInfo.linkedin}`} style={styles.link}>
                                LinkedIn
                            </Link>
                        )}
                        {personalInfo.linkedin && personalInfo.github && <Text style={styles.separator}>•</Text>}
                        {!personalInfo.linkedin && personalInfo.phone && personalInfo.github && <Text style={styles.separator}>•</Text>}
                        {personalInfo.github && (
                            <Link src={personalInfo.github.startsWith("http") ? personalInfo.github : `https://${personalInfo.github}`} style={styles.link}>
                                GitHub
                            </Link>
                        )}
                    </View>
                </View>

                {/* Summary */}
                {summary && (
                    <View>
                        <Text style={styles.sectionTitle}>Professional Summary</Text>
                        <Text style={styles.summary}>{summary}</Text>
                    </View>
                )}

                {/* Education */}
                {education.length > 0 && (
                    <View>
                        <Text style={styles.sectionTitle}>Education</Text>
                        {education.map((edu, index) => (
                            <View key={index} style={styles.entryContainer}>
                                <View style={styles.entryHeader}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.entryTitle}>{edu.institution}</Text>
                                        <Text style={styles.entrySubtitle}>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</Text>
                                    </View>
                                    <View style={styles.entryRight}>
                                        <Text style={styles.entryDate}>{formatDateRange(edu.startDate, edu.endDate)}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Experience */}
                {experience.length > 0 && (
                    <View>
                        <Text style={styles.sectionTitle}>Experience</Text>
                        {experience.map((exp, index) => (
                            <View key={index} style={styles.entryContainer}>
                                <View style={styles.entryHeader}>
                                    <View style={{ flex: 1 }}>
                                        {exp.companyUrl ? (
                                            <Link src={exp.companyUrl.startsWith("http") ? exp.companyUrl : `https://${exp.companyUrl}`} style={styles.entryTitleLink}>
                                                {exp.company}
                                            </Link>
                                        ) : (
                                            <Text style={styles.entryTitle}>{exp.company}</Text>
                                        )}
                                        <Text style={styles.entrySubtitle}>{exp.title}</Text>
                                    </View>
                                    <View style={styles.entryRight}>
                                        {exp.location && <Text style={styles.entryLocation}>{exp.location}</Text>}
                                        <Text style={styles.entryDate}>{formatDateRange(exp.startDate, exp.endDate, exp.current)}</Text>
                                    </View>
                                </View>
                                {exp.bullets.length > 0 && (
                                    <View style={styles.bulletList}>
                                        {exp.bullets.map((bullet, bulletIndex) => (
                                            <View key={bulletIndex} style={styles.bulletItem}>
                                                <Text style={styles.bullet}>•</Text>
                                                <Text style={styles.bulletText}>{bullet}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Projects */}
                {projects.length > 0 && (
                    <View>
                        <Text style={styles.sectionTitle}>Projects</Text>
                        {projects.map((project, index) => (
                            <View key={index} style={styles.entryContainer}>
                                <View style={styles.entryHeader}>
                                    <Text style={styles.entryTitle}>{project.name}</Text>
                                    {project.technologies.length > 0 && (
                                        <Text style={styles.projectTech}>
                                            {project.technologies.join(", ")}
                                        </Text>
                                    )}
                                </View>
                                <Text style={styles.summary}>{project.description}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Certifications */}
                {certifications.length > 0 && (
                    <View>
                        <Text style={styles.sectionTitle}>Certifications</Text>
                        {certifications.map((cert, index) => (
                            <View key={index} style={styles.certContainer}>
                                <View>
                                    <Text style={styles.certName}>{cert.name}</Text>
                                    <Text style={styles.certIssuer}>{cert.issuer}</Text>
                                </View>
                                <Text style={styles.certDate}>
                                    {cert.issueDate}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Skills */}
                {skills.length > 0 && (
                    <View>
                        <Text style={styles.sectionTitle}>Skills</Text>
                        <View style={styles.skillsContainer}>
                            <Text style={styles.skillsText}>{skills.join(" • ")}</Text>
                        </View>
                    </View>
                )}

                {/* Languages */}
                {languages && languages.length > 0 && (
                    <View>
                        <Text style={styles.sectionTitle}>Languages</Text>
                        <View style={styles.languagesContainer}>
                            {languages.map((lang, index) => (
                                <View key={index} style={styles.languageItem}>
                                    <Text style={styles.languageName}>{lang.language}</Text>
                                    <Text style={styles.languageLevel}>({lang.level})</Text>
                                    {index < languages.length - 1 && <Text style={styles.languageLevel}> •</Text>}
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </Page>
        </Document>
    );
}

// Function to generate and download PDF
export async function downloadResumePDF(data: ResumeData): Promise<void> {
    const blob = await pdf(<ResumePDFDocument data={data} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const fileName = `${data.personalInfo.fullName || "Resume"}_${data.name || "CV"}.pdf`.replace(/[^a-zA-Z0-9_-]/g, "_");
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export { ResumePDFDocument };
