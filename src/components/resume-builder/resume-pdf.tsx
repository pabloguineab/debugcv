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

// Create styles - balanced for readability and fitting on one page
const styles = StyleSheet.create({
    page: {
        padding: 35,
        paddingTop: 30,
        paddingBottom: 25,
        fontFamily: "Helvetica",
        fontSize: 10,
        color: "#333",
    },
    header: {
        textAlign: "center",
        marginBottom: 12,
    },
    name: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 4,
        color: "#1a1a1a",
    },
    divider: {
        height: 1,
        backgroundColor: "#ccc",
        marginVertical: 6,
    },
    contactRow: {
        flexDirection: "row",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 8,
        fontSize: 9,
        color: "#666",
    },
    separator: {
        marginHorizontal: 4,
    },
    link: {
        color: "#2563eb",
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 5,
        marginTop: 6,
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    summary: {
        fontSize: 9,
        lineHeight: 1.4,
        color: "#444",
        textAlign: "justify",
    },
    entryContainer: {
        marginBottom: 4,
    },
    entryHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 1,
    },
    entryTitle: {
        fontSize: 10,
        fontWeight: "bold",
        textTransform: "uppercase",
    },
    entryTitleLink: {
        fontSize: 10,
        fontWeight: "bold",
        textTransform: "uppercase",
        color: "#2563eb",
        textDecoration: "none",
    },
    entrySubtitle: {
        fontSize: 9,
        color: "#555",
        fontStyle: "italic",
    },
    entryRight: {
        textAlign: "right",
        fontSize: 9,
        color: "#666",
        flexShrink: 0,
        marginLeft: 10,
    },
    entryLocation: {
        fontSize: 9,
        color: "#666",
    },
    entryDate: {
        fontSize: 9,
        color: "#666",
    },
    bulletList: {
        marginLeft: 10,
        marginTop: 3,
    },
    bulletItem: {
        flexDirection: "row",
        marginBottom: 2,
    },
    bullet: {
        marginRight: 5,
        color: "#666",
    },
    bulletText: {
        flex: 1,
        fontSize: 9,
        lineHeight: 1.35,
        color: "#444",
    },
    skillsContainer: {
        textAlign: "center",
    },
    skillsText: {
        fontSize: 9,
        lineHeight: 1.4,
        color: "#444",
    },
    certContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    certName: {
        fontSize: 9,
        fontWeight: "bold",
    },
    certIssuer: {
        fontSize: 8,
        color: "#666",
    },
    certDate: {
        fontSize: 8,
        color: "#666",
    },
});

// Smart content limits based on total content volume
// This adjusts limits dynamically to fill the page without overflow
function calculateContentLimits(data: ResumeData): {
    maxExperiences: number;
    maxBulletsPerExperience: number;
    maxEducation: number;
    maxProjects: number;
    maxCertifications: number;
    maxSkills: number;
} {
    // Count total content
    const expCount = data.experience.length;
    const totalBullets = data.experience.reduce((sum, exp) => sum + exp.bullets.length, 0);
    const eduCount = data.education.length;
    const projCount = data.projects.length;
    const certCount = data.certifications.length;

    // Calculate approximate "content units" (rough estimate of space usage)
    const expUnits = expCount * 3 + totalBullets * 1.5;
    const eduUnits = eduCount * 2;
    const projUnits = projCount * 2.5;
    const certUnits = certCount * 1;
    const totalUnits = expUnits + eduUnits + projUnits + certUnits;

    // If we have a lot of content, be more aggressive with limits
    if (totalUnits > 30) {
        // Lots of content - restrictive but fill the page
        return {
            maxExperiences: 3,
            maxBulletsPerExperience: 3,
            maxEducation: 2,
            maxProjects: 1,
            maxCertifications: 3,
            maxSkills: 12,
        };
    } else if (totalUnits > 20) {
        // Medium content - show more
        return {
            maxExperiences: 4,
            maxBulletsPerExperience: 3,
            maxEducation: 2,
            maxProjects: 2,
            maxCertifications: 3,
            maxSkills: 15,
        };
    } else {
        // Light content - show everything
        return {
            maxExperiences: 5,
            maxBulletsPerExperience: 4,
            maxEducation: 3,
            maxProjects: 2,
            maxCertifications: 4,
            maxSkills: 18,
        };
    }
}

// Function to fit resume data within calculated limits - NO TRUNCATION
function fitToSinglePage(data: ResumeData): ResumeData {
    const limits = calculateContentLimits(data);
    const fitted = { ...data };

    // Keep summary as-is (no truncation)

    // Limit experience entries and bullets (but don't truncate text!)
    fitted.experience = data.experience.slice(0, limits.maxExperiences).map(exp => ({
        ...exp,
        bullets: exp.bullets.slice(0, limits.maxBulletsPerExperience)
        // NO text truncation - show full bullets
    }));

    // Limit education
    fitted.education = data.education.slice(0, limits.maxEducation);

    // Limit projects
    fitted.projects = data.projects.slice(0, limits.maxProjects);
    // NO description truncation

    // Limit certifications
    fitted.certifications = data.certifications.slice(0, limits.maxCertifications);

    // Limit skills
    fitted.skills = data.skills.slice(0, limits.maxSkills);

    return fitted;
}

interface ResumePDFDocumentProps {
    data: ResumeData;
}

// The PDF Document component
function ResumePDFDocument({ data }: ResumePDFDocumentProps) {
    // Apply single-page fitting (no truncation, just limiting items)
    const fittedData = fitToSinglePage(data);
    const { personalInfo, summary, skills, experience, education, projects, certifications } = fittedData;

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
                                        <Text style={{ fontSize: 8, color: "#666" }}>
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
