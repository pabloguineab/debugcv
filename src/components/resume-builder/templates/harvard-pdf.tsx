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
} from "@react-pdf/renderer";
import { ResumeData } from "@/types/resume";

// Accent color matching your PDF
const ACCENT_COLOR = "#2563eb";

// Create styles
const styles = StyleSheet.create({
    page: {
        fontFamily: "Helvetica",
        fontSize: 9,
        color: "#333",
    },
    // Header section
    header: {
        padding: "18 20 10 20",
    },
    name: {
        fontSize: 22,
        fontWeight: "bold",
        color: ACCENT_COLOR,
        letterSpacing: 0.5,
    },
    headline: {
        fontSize: 10,
        color: "#555",
        marginTop: 2,
    },
    headerDivider: {
        height: 3,
        backgroundColor: ACCENT_COLOR,
        marginTop: 6,
        marginBottom: 6,
    },
    contactRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        fontSize: 8,
        color: "#555",
    },
    contactItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
    },
    contactLink: {
        color: ACCENT_COLOR,
    },
    // Two column layout
    columnsContainer: {
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    leftColumn: {
        width: "60%",
        paddingRight: 12,
        borderRightWidth: 1,
        borderRightColor: "#e0e0e0",
    },
    rightColumn: {
        width: "40%",
        paddingLeft: 12,
    },
    // Section header
    sectionHeader: {
        marginBottom: 6,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 9,
        fontWeight: "bold",
        color: ACCENT_COLOR,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    sectionLine: {
        height: 2,
        backgroundColor: ACCENT_COLOR,
        marginTop: 2,
    },
    // Summary
    summary: {
        fontSize: 8,
        lineHeight: 1.5,
        color: "#444",
    },
    // Experience entry
    entryContainer: {
        marginBottom: 8,
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
    },
    entryTitle: {
        fontSize: 9,
        fontWeight: "bold",
        color: "#1a1a1a",
    },
    entryCompany: {
        fontSize: 9,
        fontWeight: "bold",
        color: ACCENT_COLOR,
    },
    entryCompanyLink: {
        fontSize: 9,
        fontWeight: "bold",
        color: ACCENT_COLOR,
        textDecoration: "underline",
    },
    entrySeparator: {
        color: "#999",
        marginHorizontal: 3,
        fontSize: 9,
    },
    entryMeta: {
        fontSize: 7,
        color: "#888",
    },
    // Bullets
    bulletList: {
        marginTop: 3,
        marginLeft: 4,
    },
    bulletItem: {
        flexDirection: "row",
        marginBottom: 2,
    },
    bulletIcon: {
        marginRight: 4,
        marginTop: 2,
    },
    bulletText: {
        flex: 1,
        fontSize: 7.5,
        lineHeight: 1.4,
        color: "#444",
    },
    // Education
    eduTitle: {
        fontSize: 8,
        fontWeight: "bold",
        color: "#1a1a1a",
    },
    eduSubtitle: {
        fontSize: 7,
        color: "#666",
        fontStyle: "italic",
    },
    // Skills
    skillTagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 3,
    },
    skillTag: {
        backgroundColor: "#eff6ff",
        color: ACCENT_COLOR,
        fontSize: 7,
        paddingVertical: 2,
        paddingHorizontal: 5,
        borderRadius: 2,
    },
    // Projects
    projectTitle: {
        fontSize: 8,
        fontWeight: "bold",
        color: ACCENT_COLOR,
    },
    projectTech: {
        fontSize: 6,
        color: "#888",
    },
    projectUrl: {
        fontSize: 6,
        color: ACCENT_COLOR,
        marginTop: 1,
    },
    projectDesc: {
        fontSize: 7,
        color: "#444",
        lineHeight: 1.4,
        marginTop: 2,
    },
    // Certifications
    certItem: {
        fontSize: 7,
        marginBottom: 2,
    },
    certName: {
        fontWeight: "bold",
        color: ACCENT_COLOR,
    },
    certIssuer: {
        color: "#666",
    },
    certDate: {
        color: "#999",
    },
    // Languages
    langContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    langItem: {
        fontSize: 7,
    },
    langName: {
        fontWeight: "bold",
        color: "#1a1a1a",
    },
    langLevel: {
        color: "#666",
    },
});

// Check icon SVG
function CheckIcon() {
    return (
        <Svg width="7" height="7" viewBox="0 0 24 24">
            <Circle cx="12" cy="12" r="10" fill={ACCENT_COLOR} />
            <Path
                d="M9 12l2 2 4-4"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
        </Svg>
    );
}

// Section Header Component
function SectionHeader({ title }: { title: string }) {
    return (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.sectionLine} />
        </View>
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

// Categorize skills
function categorizeSkills(skills: string[]): { general: string[]; technical: string[] } {
    const businessKeywords = ['sales', 'management', 'leadership', 'communication', 'negotiation', 'strategy', 'business', 'analytics', 'visualization', 'crm', 'rfp', 'project'];
    const techKeywords = ['python', 'javascript', 'react', 'sql', 'tensorflow', 'pytorch', 'aws', 'docker', 'git', 'numpy', 'pandas', 'matplotlib', 'tableau', 'excel', 'r', 'matlab', 'spark', 'hadoop', 'llm', 'nlp', 'api', 'mongodb', 'postgresql', 'nosql'];

    const general = skills.filter(skill =>
        businessKeywords.some(k => skill.toLowerCase().includes(k))
    );
    const technical = skills.filter(skill =>
        techKeywords.some(k => skill.toLowerCase().includes(k))
    );

    return { general, technical };
}

// Harvard PDF Document Component
export function HarvardPDFDocument({ data }: { data: ResumeData }) {
    const { personalInfo, summary, skills, experience, education, projects, certifications, languages } = data;

    // Auto-generate headline
    const generatedHeadline = data.targetJob
        || (experience.length > 0 && experience[0].title ? experience[0].title : "");

    const { general: generalSkills, technical: technicalSkills } = categorizeSkills(skills);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.name}>{personalInfo.fullName}</Text>
                    {generatedHeadline && (
                        <Text style={styles.headline}>{generatedHeadline}</Text>
                    )}
                    <View style={styles.headerDivider} />

                    {/* Contact Row */}
                    <View style={styles.contactRow}>
                        {personalInfo.phone && (
                            <View style={styles.contactItem}>
                                <Text>📞 {personalInfo.phone}</Text>
                            </View>
                        )}
                        {personalInfo.email && (
                            <View style={styles.contactItem}>
                                <Link src={`mailto:${personalInfo.email}`} style={styles.contactLink}>
                                    ✉ {personalInfo.email}
                                </Link>
                            </View>
                        )}
                        {personalInfo.linkedin && (
                            <View style={styles.contactItem}>
                                <Link
                                    src={personalInfo.linkedin.startsWith("http") ? personalInfo.linkedin : `https://${personalInfo.linkedin}`}
                                    style={styles.contactLink}
                                >
                                    🔗 {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}
                                </Link>
                            </View>
                        )}
                        {personalInfo.location && (
                            <View style={styles.contactItem}>
                                <Text>📍 {personalInfo.location}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Two Column Layout */}
                <View style={styles.columnsContainer}>
                    {/* Left Column */}
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
                                {experience.map((exp) => (
                                    <View key={exp.id} style={styles.entryContainer}>
                                        <View style={styles.entryHeader}>
                                            <View style={styles.entryTitleRow}>
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

                                        {exp.bullets.length > 0 && (
                                            <View style={styles.bulletList}>
                                                {exp.bullets.filter(b => b.trim()).map((bullet, i) => (
                                                    <View key={i} style={styles.bulletItem}>
                                                        <View style={styles.bulletIcon}>
                                                            <CheckIcon />
                                                        </View>
                                                        <Text style={styles.bulletText}>{bullet}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Education */}
                        {education.length > 0 && (
                            <View>
                                <SectionHeader title="Education" />
                                {education.map((edu) => (
                                    <View key={edu.id} style={styles.entryContainer}>
                                        <View style={styles.entryHeader}>
                                            <View>
                                                <Text style={styles.eduTitle}>{edu.institution}</Text>
                                                <Text style={styles.eduSubtitle}>
                                                    {edu.degree}{edu.field ? ` in ${edu.field}` : ""}
                                                </Text>
                                            </View>
                                            <Text style={styles.entryMeta}>
                                                {formatDateRange(edu.startDate, edu.endDate)}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Certifications */}
                        {certifications.length > 0 && (
                            <View>
                                <SectionHeader title="Certification" />
                                {certifications.map((cert) => (
                                    <View key={cert.id} style={styles.certItem}>
                                        <Text>
                                            <Text style={styles.certName}>{cert.name}</Text>
                                            {cert.issuer && <Text style={styles.certIssuer}> - {cert.issuer}</Text>}
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
                                                <Text style={styles.langLevel}> {lang.level}</Text>
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Right Column */}
                    <View style={styles.rightColumn}>
                        {/* General Skills */}
                        {generalSkills.length > 0 && (
                            <View>
                                <SectionHeader title="General Skills" />
                                <View style={styles.skillTagsContainer}>
                                    {generalSkills.map((skill, index) => (
                                        <Text key={index} style={styles.skillTag}>{skill}</Text>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Technical Skills */}
                        {technicalSkills.length > 0 && (
                            <View>
                                <SectionHeader title="Technical Skills" />
                                <View style={styles.skillTagsContainer}>
                                    {technicalSkills.map((skill, index) => (
                                        <Text key={index} style={styles.skillTag}>{skill}</Text>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* All skills if no categorization */}
                        {generalSkills.length === 0 && technicalSkills.length === 0 && skills.length > 0 && (
                            <View>
                                <SectionHeader title="Skills" />
                                <View style={styles.skillTagsContainer}>
                                    {skills.map((skill, index) => (
                                        <Text key={index} style={styles.skillTag}>{skill}</Text>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Projects */}
                        {projects.length > 0 && (
                            <View>
                                <SectionHeader title="Projects" />
                                {projects.map((project) => (
                                    <View key={project.id} style={styles.entryContainer}>
                                        <View style={styles.entryHeader}>
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
                                            {(project.startDate || project.endDate) && (
                                                <Text style={styles.entryMeta}>
                                                    {formatDateRange(project.startDate, project.endDate)}
                                                </Text>
                                            )}
                                        </View>

                                        {project.url && (
                                            <Link
                                                src={project.url.startsWith("http") ? project.url : `https://${project.url}`}
                                                style={styles.projectUrl}
                                            >
                                                🔗 {project.url.replace(/^https?:\/\/(www\.)?/, '')}
                                            </Link>
                                        )}

                                        <Text style={styles.projectDesc}>{project.description}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </View>
            </Page>
        </Document>
    );
}

// Download function for Harvard template
export async function downloadHarvardPDF(data: ResumeData, filename?: string) {
    const blob = await pdf(<HarvardPDFDocument data={data} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || `${data.personalInfo.fullName.replace(/\s+/g, "_")}_Resume.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
