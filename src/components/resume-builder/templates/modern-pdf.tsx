"use client";

import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
    Link,
    pdf,
} from "@react-pdf/renderer";
import { ResumeData } from "@/types/resume";
import { calculateStyleConfig, StyleConfig } from "@/lib/resume-styles";
import { formatSkillName } from "@/lib/skill-formatter";

// Accent color
const ACCENT_COLOR = "#1e40af";

// Create dynamic styles based on content density
function createDynamicStyles(config: StyleConfig) {
    return StyleSheet.create({
        page: {
            padding: config.pagePadding,
            paddingTop: config.pagePaddingTop,
            paddingBottom: config.pagePaddingBottom,
            fontFamily: "Helvetica",
            fontSize: config.baseFontSize,
            color: "#333",
        },
        // Header
        header: {
            textAlign: "center",
            paddingBottom: 10,
            marginBottom: 10,
        },
        name: {
            fontSize: config.nameFontSize,
            fontWeight: "bold",
            color: ACCENT_COLOR,
            marginBottom: 2,
        },
        headline: {
            fontSize: config.detailFontSize,
            color: "#666",
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 4,
        },
        contactRow: {
            flexDirection: "row",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 6,
            fontSize: config.detailFontSize,
            color: "#666",
        },
        contactLink: {
            color: ACCENT_COLOR,
        },
        separator: {
            color: "#ccc",
            marginHorizontal: 3,
        },
        // Section header with lines
        sectionHeader: {
            flexDirection: "row",
            alignItems: "center",
            marginTop: config.sectionMarginTop,
            marginBottom: config.sectionMarginBottom * 0.6,
        },
        sectionLine: {
            flex: 1,
            height: 2,
            backgroundColor: ACCENT_COLOR,
        },
        sectionTitle: {
            fontSize: config.sectionTitleSize * 0.85,
            fontWeight: "bold",
            color: ACCENT_COLOR,
            textTransform: "uppercase",
            letterSpacing: 1,
            paddingHorizontal: 8,
        },
        // Content
        summary: {
            fontSize: config.detailFontSize,
            lineHeight: config.lineHeight,
            color: "#444",
        },
        // Entries
        entryContainer: {
            marginBottom: config.entryMarginBottom,
        },
        entryHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
        },
        entryLeft: {
            flex: 1,
        },
        entryTitle: {
            fontSize: config.entryTitleSize,
            fontWeight: "bold",
            color: "#1a1a1a",
        },
        entryTitleInline: {
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
        },
        entryTitleNormal: {
            fontSize: config.entryTitleSize,
            fontWeight: "bold",
            color: "#1a1a1a",
        },
        entryTitleAccent: {
            fontSize: config.entryTitleSize,
            fontWeight: "bold",
            color: ACCENT_COLOR,
        },
        entryTitleLink: {
            fontSize: config.entryTitleSize,
            fontWeight: "bold",
            color: ACCENT_COLOR,
            textDecoration: "underline",
        },
        entrySeparator: {
            color: "#999",
            marginHorizontal: 4,
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
        },
        // Bullets
        bulletList: {
            marginLeft: 10,
            marginTop: 2,
        },
        bulletItem: {
            flexDirection: "row",
            marginBottom: config.bulletMarginBottom,
        },
        bullet: {
            marginRight: 6,
            color: "#999",
        },
        bulletText: {
            flex: 1,
            fontSize: config.detailFontSize,
            lineHeight: config.lineHeight,
            color: "#444",
        },
        // Skills
        skillRow: {
            marginBottom: 2,
            flexDirection: "row",
            flexWrap: "wrap",
        },
        skillCategory: {
            fontSize: config.detailFontSize,
            fontWeight: "bold",
            color: "#1a1a1a",
        },
        skillItems: {
            fontSize: config.detailFontSize,
            color: "#444",
        },
        // Additional info
        additionalRow: {
            marginBottom: 3,
            flexDirection: "row",
            flexWrap: "wrap",
        },
        additionalLabel: {
            fontSize: config.detailFontSize,
            fontWeight: "bold",
            color: "#1a1a1a",
        },
        additionalText: {
            fontSize: config.detailFontSize,
            color: "#444",
        },
    });
}

// Group skills by category
function groupSkills(skills: string[]): [string, string[]][] {
    const groups: Record<string, string[]> = {
        "Programming Languages": [],
        "Machine Learning": [],
        "Web Development": [],
        "Cloud & DevOps": [],
        "Data Analytics": [],
        "Business Intelligence": [],
        "Other": []
    };

    const mlKeywords = ['tensorflow', 'pytorch', 'keras', 'ml', 'ai', 'neural', 'deep learning', 'nlp', 'llm', 'hugging', 'transformers', 'langchain', 'gensim', 'spacy', 'nltk', 'qdrant', 'chromadb', 'pinecone', 'llamaindex', 'langsmith', 'langgraph'];
    const webKeywords = ['react', 'vue', 'angular', 'node', 'next', 'html', 'css', 'javascript', 'typescript', 'flask', 'fastapi', 'streamlit', 'gradio', 'chainlit'];
    const cloudKeywords = ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd', 'devops', 'lambda', 's3', 'ec2', 'sagemaker', 'dialogflow'];
    const dataKeywords = ['pandas', 'numpy', 'scipy', 'plotly', 'matplotlib', 'hadoop', 'spark', 'pyspark'];
    const biKeywords = ['tableau', 'power bi', 'd3'];
    const langKeywords = ['python', 'javascript', 'java', 'c++', 'c#', 'r', 'matlab', 'bash', 'shell', 'sql'];

    skills.forEach(skill => {
        const lower = skill.toLowerCase();
        if (langKeywords.some(k => lower.includes(k))) {
            groups["Programming Languages"].push(skill);
        } else if (mlKeywords.some(k => lower.includes(k))) {
            groups["Machine Learning"].push(skill);
        } else if (webKeywords.some(k => lower.includes(k))) {
            groups["Web Development"].push(skill);
        } else if (cloudKeywords.some(k => lower.includes(k))) {
            groups["Cloud & DevOps"].push(skill);
        } else if (biKeywords.some(k => lower.includes(k))) {
            groups["Business Intelligence"].push(skill);
        } else if (dataKeywords.some(k => lower.includes(k))) {
            groups["Data Analytics"].push(skill);
        } else {
            groups["Other"].push(skill);
        }
    });

    return Object.entries(groups).filter(([_, skills]) => skills.length > 0);
}

// Section Header component
function SectionHeader({ title, styles }: { title: string; styles: ReturnType<typeof createDynamicStyles> }) {
    return (
        <View style={styles.sectionHeader}>
            <View style={styles.sectionLine} />
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

// Modern PDF Document Component
export function ModernPDFDocument({ data }: { data: ResumeData }) {
    const { personalInfo, summary, skills, experience, education, projects, certifications, languages } = data;

    const styleConfig = calculateStyleConfig(data);
    const styles = createDynamicStyles(styleConfig);
    const groupedSkills = groupSkills(skills);

    // Auto-generate headline based on targetJob, first experience, or default
    const generatedHeadline = data.targetJob
        || (experience.length > 0 && experience[0].title ? experience[0].title : "");

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.name}>{personalInfo.fullName}</Text>
                    {generatedHeadline && (
                        <Text style={styles.headline}>{generatedHeadline}</Text>
                    )}
                    <View style={styles.contactRow}>
                        {personalInfo.email && (
                            <Link src={`mailto:${personalInfo.email}`} style={styles.contactLink}>
                                {personalInfo.email}
                            </Link>
                        )}
                        {personalInfo.location && (
                            <>
                                <Text style={styles.separator}>|</Text>
                                <Text>{personalInfo.location}</Text>
                            </>
                        )}
                        {personalInfo.phone && (
                            <>
                                <Text style={styles.separator}>|</Text>
                                <Text>{personalInfo.phone}</Text>
                            </>
                        )}
                        {personalInfo.linkedin && (
                            <>
                                <Text style={styles.separator}>|</Text>
                                <Link
                                    src={personalInfo.linkedin.startsWith("http") ? personalInfo.linkedin : `https://${personalInfo.linkedin}`}
                                    style={styles.contactLink}
                                >
                                    LinkedIn
                                </Link>
                            </>
                        )}
                        {personalInfo.github && (
                            <>
                                <Text style={styles.separator}>|</Text>
                                <Link
                                    src={personalInfo.github.startsWith("http") ? personalInfo.github : `https://${personalInfo.github}`}
                                    style={styles.contactLink}
                                >
                                    GitHub
                                </Link>
                            </>
                        )}
                    </View>
                </View>

                {/* Summary */}
                {summary && (
                    <View>
                        <SectionHeader title="Professional Summary" styles={styles} />
                        <Text style={styles.summary}>{summary}</Text>
                    </View>
                )}

                {/* Education */}
                {education.length > 0 && (
                    <View>
                        <SectionHeader title="Education" styles={styles} />
                        {education.map((edu) => (
                            <View key={edu.id} style={styles.entryContainer}>
                                <View style={styles.entryHeader}>
                                    <View style={styles.entryLeft}>
                                        <Text style={styles.entryTitle}>{edu.institution}</Text>
                                        <Text style={styles.entrySubtitle}>
                                            {edu.degree}{edu.field ? ` in ${edu.field}` : ""}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text style={styles.entryRight}>{edu.location}</Text>
                                        <Text style={styles.entryRight}>
                                            {formatDateRange(edu.startDate, edu.endDate)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Experience */}
                {experience.length > 0 && (
                    <View>
                        <SectionHeader title="Professional Experience" styles={styles} />
                        {experience.map((exp) => (
                            <View key={exp.id} style={styles.entryContainer}>
                                <View style={styles.entryHeader}>
                                    <View style={styles.entryTitleInline}>
                                        <Text style={styles.entryTitleNormal}>{exp.title}</Text>
                                        <Text style={styles.entrySeparator}>|</Text>
                                        {exp.companyUrl ? (
                                            <Link
                                                src={exp.companyUrl.startsWith("http") ? exp.companyUrl : `https://${exp.companyUrl}`}
                                                style={styles.entryTitleLink}
                                            >
                                                {exp.company}
                                            </Link>
                                        ) : (
                                            <Text style={styles.entryTitleAccent}>{exp.company}</Text>
                                        )}
                                    </View>
                                    <Text style={styles.entryRight}>
                                        {exp.location}{exp.location ? " | " : ""}{formatDateRange(exp.startDate, exp.endDate, exp.current)}
                                    </Text>
                                </View>

                                {exp.bullets.length > 0 && (
                                    <View style={styles.bulletList}>
                                        {exp.bullets.filter(b => b.trim()).map((bullet, i) => (
                                            <View key={i} style={styles.bulletItem}>
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
                        <SectionHeader title="Projects" styles={styles} />
                        {projects.map((project) => (
                            <View key={project.id} style={styles.entryContainer}>
                                <View style={styles.entryHeader}>
                                    <View style={styles.entryTitleInline}>
                                        {project.url ? (
                                            <Link
                                                src={project.url.startsWith("http") ? project.url : `https://${project.url}`}
                                                style={styles.entryTitleLink}
                                            >
                                                {project.name}
                                            </Link>
                                        ) : (
                                            <Text style={styles.entryTitleAccent}>{project.name}</Text>
                                        )}
                                        {project.technologies.length > 0 && (
                                            <Text style={{ ...styles.skillItems, marginLeft: 4 }}>
                                                ({project.technologies.slice(0, 4).join(", ")})
                                            </Text>
                                        )}
                                    </View>
                                    <Text style={styles.entryRight}>
                                        {formatDateRange(project.startDate, project.endDate)}
                                    </Text>
                                </View>

                                <View style={styles.bulletList}>
                                    <View style={styles.bulletItem}>
                                        <Text style={styles.bullet}>•</Text>
                                        <Text style={styles.bulletText}>{project.description}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Technical Skills */}
                {skills.length > 0 && (
                    <View>
                        <SectionHeader title="Technical Skills" styles={styles} />
                        {groupedSkills.map(([category, categorySkills]) => (
                            <View key={category} style={styles.skillRow}>
                                <Text style={styles.skillCategory}>{category}: </Text>
                                <Text style={styles.skillItems}>{categorySkills.map(s => formatSkillName(s)).join(", ")}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Additional Information */}
                {(certifications.length > 0 || (languages && languages.length > 0)) && (
                    <View>
                        <SectionHeader title="Additional Information" styles={styles} />

                        {certifications.length > 0 && (
                            <View style={styles.additionalRow}>
                                <Text style={styles.additionalLabel}>Certifications: </Text>
                                <Text style={styles.additionalText}>
                                    {certifications.map((cert, i) =>
                                        `${cert.name} (${cert.issueDate})${i < certifications.length - 1 ? " • " : ""}`
                                    ).join("")}
                                </Text>
                            </View>
                        )}

                        {languages && languages.length > 0 && (
                            <View style={styles.additionalRow}>
                                <Text style={styles.additionalLabel}>Languages: </Text>
                                <Text style={styles.additionalText}>
                                    {languages.map(lang => `${lang.language} (${lang.level})`).join(" • ")}
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </Page>
        </Document>
    );
}

// Download function for Modern template
export async function downloadModernPDF(data: ResumeData, filename?: string) {
    const blob = await pdf(<ModernPDFDocument data={data} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || `${data.personalInfo.fullName.replace(/\s+/g, "_")}_Resume_Modern.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
