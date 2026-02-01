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

// Create styles
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: "Helvetica",
        fontSize: 10,
        color: "#333",
    },
    header: {
        textAlign: "center",
        marginBottom: 15,
    },
    name: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 5,
        color: "#1a1a1a",
    },
    divider: {
        height: 1,
        backgroundColor: "#ccc",
        marginVertical: 8,
    },
    contactRow: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 10,
        fontSize: 9,
        color: "#666",
    },
    contactItem: {
        flexDirection: "row",
    },
    separator: {
        marginHorizontal: 5,
    },
    link: {
        color: "#2563eb",
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 8,
        marginTop: 12,
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    summary: {
        fontSize: 9,
        lineHeight: 1.5,
        color: "#444",
        textAlign: "justify",
    },
    entryContainer: {
        marginBottom: 8,
    },
    entryHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 2,
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
        marginTop: 4,
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
        lineHeight: 1.4,
        color: "#444",
    },
    skillsContainer: {
        textAlign: "center",
    },
    skillsText: {
        fontSize: 9,
        lineHeight: 1.5,
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

interface ResumePDFDocumentProps {
    data: ResumeData;
}

// The PDF Document component
function ResumePDFDocument({ data }: ResumePDFDocumentProps) {
    const { personalInfo, summary, skills, experience, education, projects, certifications } = data;

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
                                        <Text style={styles.entrySubtitle}>{edu.degree} in {edu.field}</Text>
                                    </View>
                                    <View style={styles.entryRight}>
                                        {edu.location && <Text style={styles.entryLocation}>{edu.location}</Text>}
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
                                    {project.url && <Text style={styles.link}>{project.url}</Text>}
                                </View>
                                <Text style={styles.summary}>{project.description}</Text>
                                {project.technologies.length > 0 && (
                                    <Text style={{ fontSize: 8, color: "#666", marginTop: 2 }}>
                                        Technologies: {project.technologies.join(", ")}
                                    </Text>
                                )}
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
                                    {cert.issueDate}{cert.expiryDate ? ` - ${cert.expiryDate}` : ""}
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
