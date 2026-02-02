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

// Register fonts
Font.register({
    family: "Helvetica",
    fonts: [
        { src: "https://fonts.cdnfonts.com/s/29107/Helvetica.woff", fontWeight: "normal" },
        { src: "https://fonts.cdnfonts.com/s/29107/Helvetica-Bold.woff", fontWeight: "bold" },
    ],
});

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
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: config.sectionMarginBottom,
        },
        headerLeft: {
            flex: 1,
        },
        name: {
            fontSize: config.nameFontSize,
            fontWeight: "bold",
            color: "#2c4a7c",
            letterSpacing: 6,
            marginBottom: 4,
        },
        headline: {
            fontSize: config.detailFontSize + 1,
            color: "#2c4a7c",
            letterSpacing: 3,
            textTransform: "uppercase",
            marginBottom: 6,
        },
        contactRow: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 4,
            fontSize: config.detailFontSize,
            color: "#666",
        },
        contactLink: {
            color: "#2563eb",
        },
        photoPlaceholder: {
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: "#e5e7eb",
            borderWidth: 2,
            borderColor: "#2c4a7c",
        },
        // Section divider
        sectionDivider: {
            flexDirection: "row",
            alignItems: "center",
            marginTop: config.sectionMarginTop,
            marginBottom: config.sectionMarginBottom,
        },
        sectionLine: {
            flex: 1,
            height: 1,
            backgroundColor: "#2c4a7c",
        },
        sectionTitle: {
            fontSize: config.sectionTitleSize - 1,
            color: "#2c4a7c",
            letterSpacing: 4,
            textTransform: "uppercase",
            paddingHorizontal: 8,
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
        entryInline: {
            fontSize: config.entryTitleSize,
            flexDirection: "row",
            flexWrap: "wrap",
        },
        entryTitleNormal: {
            fontSize: config.entryTitleSize,
            fontWeight: "normal",
        },
        entryTitleBold: {
            fontSize: config.entryTitleSize,
            fontWeight: "bold",
        },
        entryTitleLink: {
            fontSize: config.entryTitleSize,
            fontWeight: "bold",
            color: "#2563eb",
            textDecoration: "underline",
        },
        separator: {
            marginHorizontal: 3,
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
            color: "#666",
        },
        bulletText: {
            flex: 1,
            fontSize: config.detailFontSize,
            lineHeight: config.lineHeight,
            color: "#444",
        },
        // Skills
        skillsSection: {},
        skillCategory: {
            flexDirection: "row",
            flexWrap: "wrap",
            marginBottom: config.bulletMarginBottom,
        },
        skillCategoryName: {
            fontSize: config.detailFontSize,
            fontWeight: "bold",
            color: "#1a1a1a",
        },
        skillCategoryItems: {
            fontSize: config.detailFontSize,
            color: "#444",
        },
        // Additional info
        additionalSection: {},
        additionalLabel: {
            fontSize: config.detailFontSize,
            fontWeight: "bold",
            color: "#1a1a1a",
            marginBottom: 2,
        },
        additionalText: {
            fontSize: config.detailFontSize,
            color: "#444",
        },
    });
}

// Helper to space letters (E D U C A T I O N)
function spaceLetters(text: string): string {
    return text.toUpperCase().split('').join(' ');
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

// Section Divider component
function SectionDivider({ title, styles }: { title: string; styles: ReturnType<typeof createDynamicStyles> }) {
    return (
        <View style={styles.sectionDivider}>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionTitle}>{spaceLetters(title)}</Text>
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
    const { personalInfo, skills, experience, education, projects, certifications, languages } = data;

    const styleConfig = calculateStyleConfig(data);
    const styles = createDynamicStyles(styleConfig);
    const groupedSkills = groupSkills(skills);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.name}>{spaceLetters(personalInfo.fullName)}</Text>
                        {data.targetJob && (
                            <Text style={styles.headline}>{data.targetJob}</Text>
                        )}
                        <View style={styles.contactRow}>
                            {personalInfo.email && (
                                <Link src={`mailto:${personalInfo.email}`} style={styles.contactLink}>
                                    {personalInfo.email}
                                </Link>
                            )}
                            {personalInfo.location && (
                                <>
                                    <Text> | </Text>
                                    <Text>{personalInfo.location}</Text>
                                </>
                            )}
                            {personalInfo.phone && (
                                <>
                                    <Text> | </Text>
                                    <Text>{personalInfo.phone}</Text>
                                </>
                            )}
                        </View>
                    </View>
                    <View style={styles.photoPlaceholder} />
                </View>

                {/* Education */}
                {education.length > 0 && (
                    <View>
                        <SectionDivider title="Education" styles={styles} />
                        {education.map((edu) => (
                            <View key={edu.id} style={styles.entryContainer}>
                                <View style={styles.entryHeader}>
                                    <View style={styles.entryLeft}>
                                        <Text style={styles.entryTitle}>{edu.institution}</Text>
                                        <Text style={styles.entrySubtitle}>
                                            {edu.degree} in {edu.field}
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

                {/* Corporate Experience */}
                {experience.length > 0 && (
                    <View>
                        <SectionDivider title="Corporate Experience" styles={styles} />
                        {experience.map((exp) => (
                            <View key={exp.id} style={styles.entryContainer}>
                                <View style={styles.entryHeader}>
                                    <View style={styles.entryInline}>
                                        <Text style={styles.entryTitleNormal}>{exp.title}</Text>
                                        <Text style={styles.separator}>|</Text>
                                        {exp.companyUrl ? (
                                            <Link src={exp.companyUrl.startsWith("http") ? exp.companyUrl : `https://${exp.companyUrl}`} style={styles.entryTitleLink}>
                                                {exp.company}
                                            </Link>
                                        ) : (
                                            <Text style={styles.entryTitleBold}>{exp.company}</Text>
                                        )}
                                    </View>
                                    <Text style={styles.entryRight}>
                                        {exp.location} | {formatDateRange(exp.startDate, exp.endDate, exp.current)}
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

                {/* Projects Experience */}
                {projects.length > 0 && (
                    <View>
                        <SectionDivider title="Projects Experience" styles={styles} />
                        {projects.map((project) => (
                            <View key={project.id} style={styles.entryContainer}>
                                <View style={styles.entryHeader}>
                                    <View style={styles.entryInline}>
                                        <Text style={styles.entryTitleNormal}>Founder and Developer</Text>
                                        <Text style={styles.separator}>|</Text>
                                        {project.url ? (
                                            <Link src={project.url.startsWith("http") ? project.url : `https://${project.url}`} style={styles.entryTitleLink}>
                                                {project.name}
                                            </Link>
                                        ) : (
                                            <Text style={styles.entryTitleBold}>{project.name}</Text>
                                        )}
                                        <Text style={{ ...styles.entryTitleNormal, color: "#666" }}> (startup prototype)</Text>
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
                                    {project.technologies.length > 0 && (
                                        <View style={styles.bulletItem}>
                                            <Text style={styles.bullet}>•</Text>
                                            <Text style={styles.bulletText}>
                                                Technologies: {project.technologies.join(", ")}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Technical Skills */}
                {skills.length > 0 && (
                    <View>
                        <SectionDivider title="Technical Skills" styles={styles} />
                        <View style={styles.skillsSection}>
                            {groupedSkills.map(([category, categorySkills]) => (
                                <View key={category} style={styles.skillCategory}>
                                    <Text style={styles.skillCategoryName}>{category}: </Text>
                                    <Text style={styles.skillCategoryItems}>
                                        {categorySkills.join(", ")}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Additional Information */}
                {(certifications.length > 0 || (languages && languages.length > 0)) && (
                    <View>
                        <SectionDivider title="Additional Information" styles={styles} />
                        <View style={styles.additionalSection}>
                            {/* Certifications */}
                            {certifications.length > 0 && (
                                <View>
                                    <Text style={styles.additionalLabel}>Certifications:</Text>
                                    <View style={styles.bulletList}>
                                        {certifications.map((cert) => (
                                            <View key={cert.id} style={styles.bulletItem}>
                                                <Text style={styles.bullet}>•</Text>
                                                <Text style={styles.bulletText}>
                                                    {cert.name} ({cert.issueDate})
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* Languages */}
                            {languages && languages.length > 0 && (
                                <View style={styles.skillCategory}>
                                    <Text style={styles.skillCategoryName}>Languages: </Text>
                                    <Text style={styles.skillCategoryItems}>
                                        {languages.map(lang => `${lang.language} (${lang.level})`).join(" and ")}
                                    </Text>
                                </View>
                            )}
                        </View>
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
