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

// Create styles - optimized for single page
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: "Helvetica",
        fontSize: 9,
        color: "#333",
    },
    header: {
        textAlign: "center",
        marginBottom: 10,
    },
    name: {
        fontSize: 18,
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
        gap: 6,
        fontSize: 8,
        color: "#666",
    },
    contactItem: {
        flexDirection: "row",
    },
    separator: {
        marginHorizontal: 4,
    },
    link: {
        color: "#2563eb",
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 6,
        marginTop: 8,
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    summary: {
        fontSize: 8,
        lineHeight: 1.4,
        color: "#444",
        textAlign: "justify",
    },
    entryContainer: {
        marginBottom: 6,
    },
    entryHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 1,
    },
    entryTitle: {
        fontSize: 9,
        fontWeight: "bold",
        textTransform: "uppercase",
    },
    entryTitleLink: {
        fontSize: 9,
        fontWeight: "bold",
        textTransform: "uppercase",
        color: "#2563eb",
        textDecoration: "none",
    },
    entrySubtitle: {
        fontSize: 8,
        color: "#555",
        fontStyle: "italic",
    },
    entryRight: {
        textAlign: "right",
        fontSize: 8,
        color: "#666",
        flexShrink: 0,
        marginLeft: 8,
    },
    entryLocation: {
        fontSize: 8,
        color: "#666",
    },
    entryDate: {
        fontSize: 8,
        color: "#666",
    },
    bulletList: {
        marginLeft: 8,
        marginTop: 2,
    },
    bulletItem: {
        flexDirection: "row",
        marginBottom: 1,
    },
    bullet: {
        marginRight: 4,
        color: "#666",
    },
    bulletText: {
        flex: 1,
        fontSize: 8,
        lineHeight: 1.3,
        color: "#444",
    },
    skillsContainer: {
        textAlign: "center",
    },
    skillsText: {
        fontSize: 8,
        lineHeight: 1.4,
        color: "#444",
    },
    certContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 3,
    },
    certName: {
        fontSize: 8,
        fontWeight: "bold",
    },
    certIssuer: {
        fontSize: 7,
        color: "#666",
    },
    certDate: {
        fontSize: 7,
        color: "#666",
    },
});

// Content limits to ensure single page
const LIMITS = {
    MAX_EXPERIENCES: 4,
    MAX_BULLETS_PER_EXPERIENCE: 3,
    MAX_BULLET_LENGTH: 150,
    MAX_EDUCATION: 2,
    MAX_PROJECTS: 2,
    MAX_CERTIFICATIONS: 3,
    MAX_SKILLS: 15,
    MAX_SUMMARY_LENGTH: 350,
};

// Truncate text to a maximum length
function truncateText(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3).trim() + "...";
}

// Function to fit resume data within single page limits
function fitToSinglePage(data: ResumeData): ResumeData {
    const fitted = { ...data };

    // Truncate summary
    if (fitted.summary) {
        fitted.summary = truncateText(fitted.summary, LIMITS.MAX_SUMMARY_LENGTH);
    }

    // Limit and truncate experience
    fitted.experience = data.experience.slice(0, LIMITS.MAX_EXPERIENCES).map(exp => ({
        ...exp,
        bullets: exp.bullets
            .slice(0, LIMITS.MAX_BULLETS_PER_EXPERIENCE)
            .map(bullet => truncateText(bullet, LIMITS.MAX_BULLET_LENGTH))
    }));

    // Limit education
    fitted.education = data.education.slice(0, LIMITS.MAX_EDUCATION);

    // Limit projects (reduce if we have lots of experience)
    const projectLimit = fitted.experience.length >= 3 ? 1 : LIMITS.MAX_PROJECTS;
    fitted.projects = data.projects.slice(0, projectLimit).map(proj => ({
        ...proj,
        description: truncateText(proj.description, 120)
    }));

    // Limit certifications (skip if we have lots of other content)
    const certLimit = (fitted.experience.length >= 3 && fitted.projects.length > 0) ? 2 : LIMITS.MAX_CERTIFICATIONS;
    fitted.certifications = data.certifications.slice(0, certLimit);

    // Limit skills
    fitted.skills = data.skills.slice(0, LIMITS.MAX_SKILLS);

    return fitted;
}

interface ResumePDFDocumentProps {
    data: ResumeData;
}

// The PDF Document component
function ResumePDFDocument({ data }: ResumePDFDocumentProps) {
    // Apply single-page fitting
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

                {/* Projects - only show if we have room */}
                {projects.length > 0 && (
                    <View>
                        <Text style={styles.sectionTitle}>Projects</Text>
                        {projects.map((project, index) => (
                            <View key={index} style={styles.entryContainer}>
                                <View style={styles.entryHeader}>
                                    <Text style={styles.entryTitle}>{project.name}</Text>
                                    {project.technologies.length > 0 && (
                                        <Text style={{ fontSize: 7, color: "#666" }}>
                                            {project.technologies.slice(0, 5).join(", ")}
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
