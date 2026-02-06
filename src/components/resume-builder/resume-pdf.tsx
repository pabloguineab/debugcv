"use client";

import { Document, Page, Text, View, StyleSheet, Font, pdf, Link, Image } from "@react-pdf/renderer";
import { ResumeData } from "@/types/resume";
import { calculateStyleConfig, StyleConfig } from "@/lib/resume-styles";

// Register fonts for a professional look
Font.register({
    family: "Georgia",
    fonts: [
        { src: "https://fonts.gstatic.com/s/eb-garamond/v20/SlGUmQSNjdsmc35JDF1K5GRwUjcdlttVFm-rI7e8QL11.ttf" }
    ]
});

// Create dynamic styles based on config and density/spacing factors
function createDynamicStyles(config: StyleConfig, densityFactor: number, spacingFactor: number, accentColor: string) {
    return StyleSheet.create({
        page: {
            padding: config.pagePadding,
            paddingTop: config.pagePaddingTop,
            paddingBottom: 12, // minimal safe padding
            fontFamily: "Helvetica",
            fontSize: config.baseFontSize * densityFactor,
            color: "#333",
        },
        header: {
            textAlign: "center",
            marginBottom: (config.sectionMarginBottom + 2) * spacingFactor,
        },
        name: {
            fontSize: config.nameFontSize,
            fontWeight: "bold",
            marginBottom: 3 * spacingFactor,
            color: accentColor,
        },
        divider: {
            height: 1,
            backgroundColor: accentColor,
            opacity: 0.3,
            marginVertical: config.sectionMarginBottom * spacingFactor,
        },
        contactRow: {
            flexDirection: "row",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 6,
            fontSize: config.detailFontSize * densityFactor,
            color: "#666",
        },
        separator: {
            marginHorizontal: 3,
        },
        link: {
            color: accentColor,
        },
        sectionTitle: {
            fontSize: config.sectionTitleSize * densityFactor,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: config.sectionMarginBottom * spacingFactor,
            marginTop: config.sectionMarginTop * spacingFactor,
            textTransform: "uppercase",
            letterSpacing: 1,
            color: accentColor,
        },
        summary: {
            fontSize: config.detailFontSize * densityFactor,
            lineHeight: config.lineHeight,
            color: "#444",
            textAlign: "justify",
        },
        entryContainer: {
            marginBottom: config.entryMarginBottom * spacingFactor,
        },
        entryHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 1,
        },
        entryTitle: {
            fontSize: config.entryTitleSize * densityFactor,
            fontWeight: "bold",
            textTransform: "uppercase",
        },
        entryTitleLink: {
            fontSize: config.entryTitleSize * densityFactor,
            fontWeight: "bold",
            textTransform: "uppercase",
            color: accentColor,
            textDecoration: "none",
        },
        entrySubtitle: {
            fontSize: config.detailFontSize * densityFactor,
            color: "#555",
            fontStyle: "italic",
        },
        entryRight: {
            textAlign: "right",
            fontSize: config.detailFontSize * densityFactor,
            color: "#666",
            flexShrink: 0,
            marginLeft: 8,
        },
        entryLocation: {
            fontSize: config.detailFontSize * densityFactor,
            color: "#666",
        },
        entryDate: {
            fontSize: config.detailFontSize * densityFactor,
            color: "#666",
        },
        bulletList: {
            marginLeft: 8,
            marginTop: 1,
        },
        bulletItem: {
            flexDirection: "row",
            marginBottom: config.bulletMarginBottom * spacingFactor,
        },
        bullet: {
            marginRight: 4,
            color: "#666",
        },
        bulletText: {
            flex: 1,
            fontSize: config.detailFontSize * densityFactor,
            lineHeight: config.lineHeight,
            color: "#444",
        },
        skillsContainer: {
            textAlign: "center",
        },
        skillsText: {
            fontSize: config.detailFontSize * densityFactor,
            lineHeight: config.lineHeight,
            color: "#444",
        },
        certContainer: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: config.entryMarginBottom * spacingFactor,
        },
        certName: {
            fontSize: config.detailFontSize * densityFactor,
            fontWeight: "bold",
        },
        certIssuer: {
            fontSize: (config.detailFontSize - 0.5) * densityFactor,
            color: "#666",
        },
        certDate: {
            fontSize: (config.detailFontSize - 0.5) * densityFactor,
            color: "#666",
        },
        projectTech: {
            fontSize: (config.detailFontSize - 0.5) * densityFactor,
            color: "#666",
        },
        languagesContainer: {
            flexDirection: "row",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 4,
        },
        languageItem: {
            flexDirection: "row",
            gap: 2,
        },
        languageName: {
            fontSize: config.detailFontSize * densityFactor,
            fontWeight: "bold",
            color: "#333",
        },
        languageLevel: {
            fontSize: config.detailFontSize * densityFactor,
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

    // Dynamic density scaling - Simple template needs more aggressive compression
    const densityFactors = {
        'very-dense': 0.98, // Slightly relaxed
        'dense': 1.02,
        'medium': 1.08,
        'light': 1.15,
        'very-light': 1.3
    };
    const densityFactor = densityFactors[styleConfig.tier] || 1.0;

    const spacingFactors = {
        'very-dense': 0.95, // Increased compaction
        'dense': 1.05,
        'medium': 1.3,
        'light': 1.5,
        'very-light': 1.7
    };
    const spacingFactor = (spacingFactors[styleConfig.tier] || 1.0) * (data.showPhoto ? 0.85 : 1.0);
    const accentColor = data.accentColor || "#1a1a1a";

    const styles = createDynamicStyles(styleConfig, densityFactor, spacingFactor, accentColor);

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
                    <View style={{ flexDirection: data.showPhoto ? "row" : "column", alignItems: data.showPhoto ? "flex-start" : "center", textAlign: data.showPhoto ? "left" : "center" }}>
                        <View style={{ flex: data.showPhoto ? 1 : undefined, width: data.showPhoto ? "auto" : "100%" }}>
                            <Text style={styles.name}>{personalInfo.fullName}</Text>
                            <View style={styles.divider} />
                            <View style={[styles.contactRow, data.showPhoto ? { justifyContent: "flex-start" } : {}]}>
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
                        {data.showPhoto && personalInfo.pictureUrl && (
                            <Image
                                src={personalInfo.pictureUrl}
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 40,
                                    marginLeft: 20,
                                    marginBottom: 10,
                                    borderWidth: 2,
                                    borderColor: accentColor,
                                    objectFit: "cover"
                                }}
                            />
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
                            <View key={index} style={[styles.entryContainer, index === education.length - 1 ? { marginBottom: 0 } : {}]}>
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
                            <View key={index} style={[styles.entryContainer, index === experience.length - 1 ? { marginBottom: 0 } : {}]}>
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
                                            <View key={bulletIndex} style={[styles.bulletItem, bulletIndex === exp.bullets.length - 1 ? { marginBottom: 0 } : {}]}>
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
                            <View key={index} style={[styles.entryContainer, index === projects.length - 1 ? { marginBottom: 0 } : {}]}>
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
                            <View key={index} style={[styles.certContainer, index === certifications.length - 1 ? { marginBottom: 0 } : {}]}>
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

// Function to generate and download PDF based on template
export async function downloadResumePDF(originalData: ResumeData): Promise<void> {
    const { getCompanyLogoUrl, getInstitutionLogoUrl } = await import("@/lib/logo-utils");

    // Helper to convert URL to Base64
    const urlToBase64 = async (url: string): Promise<string> => {
        try {
            // Using our proxy to avoid CORS issues during the fetch
            const origin = window.location.origin;
            const proxyUrl = `${origin}/api/image-proxy?url=${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl);

            if (!response.ok) {
                console.warn(`Failed to fetch image via proxy: ${response.statusText}`);
                return "";
            }

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.startsWith("image/")) {
                console.warn(`Invalid content type for image: ${contentType}`);
                return "";
            }

            const blob = await response.blob();
            // Double check blob size
            if (blob.size < 100) {
                console.warn("Image blob too small, likely invalid");
                return "";
            }

            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const result = reader.result as string;
                    // Ensure it is a valid data URL
                    if (result && result.startsWith("data:image")) {
                        resolve(result);
                    } else {
                        resolve("");
                    }
                };
                reader.onerror = () => resolve(""); // Resolve empty string on error to avoid crash
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.warn("Failed to convert image to base64:", url, error);
            return "";
        }
    };

    // Deep copy data to avoid mutating state
    const data = JSON.parse(JSON.stringify(originalData));

    // Pre-fetch images to base64 to ensure they render in PDF
    // Experience Company Logos
    if (data.showCompanyLogos) {
        await Promise.all(data.experience.map(async (exp: any) => {
            if (!exp.logoUrl) {
                const url = getCompanyLogoUrl(exp.company, exp.companyUrl);
                if (url) {
                    exp.logoUrl = await urlToBase64(url);
                }
            } else if (exp.logoUrl.startsWith('http')) {
                // Even manually added URLs might need proxying if not base64
                exp.logoUrl = await urlToBase64(exp.logoUrl);
            }
        }));
    }

    // Education Institution Logos
    if (data.showInstitutionLogos) {
        await Promise.all(data.education.map(async (edu: any) => {
            if (!edu.logoUrl) {
                const url = getInstitutionLogoUrl(edu.institution, edu.website);
                if (url) {
                    edu.logoUrl = await urlToBase64(url);
                }
            } else if (edu.logoUrl.startsWith('http')) {
                edu.logoUrl = await urlToBase64(edu.logoUrl);
            }
        }));
    }

    let pdfBlob: Blob;
    let fileNameSuffix = "Simple";

    // Import PDF templates dynamically to avoid circular dependencies
    if (data.template === "modern") {
        const { ModernPDFDocument } = await import("./templates/modern-pdf");
        pdfBlob = await pdf(<ModernPDFDocument data={data} />).toBlob();
        fileNameSuffix = "Modern";
    } else if (data.template === "harvard") {
        const { HarvardPDFDocument } = await import("./templates/harvard-pdf");
        pdfBlob = await pdf(<HarvardPDFDocument data={data} />).toBlob();
        fileNameSuffix = "Harvard";
    } else {
        // Simple template
        pdfBlob = await pdf(<ResumePDFDocument data={data} />).toBlob();
    }

    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    const fileName = `${data.personalInfo.fullName || "Resume"}_${data.name || "CV"}_${fileNameSuffix}.pdf`.replace(/[^a-zA-Z0-9_-]/g, "_");
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export { ResumePDFDocument };
