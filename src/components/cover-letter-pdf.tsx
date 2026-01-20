"use client";

import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";

// Create styles for cover letter
const styles = StyleSheet.create({
    page: {
        padding: 60,
        fontFamily: "Times-Roman",
        fontSize: 11,
        color: "#333",
        lineHeight: 1.6,
    },
    header: {
        marginBottom: 30,
    },
    date: {
        marginBottom: 20,
        fontSize: 11,
        color: "#555",
    },
    recipient: {
        marginBottom: 20,
    },
    recipientLine: {
        fontSize: 11,
        marginBottom: 2,
    },
    salutation: {
        marginBottom: 15,
        fontSize: 11,
    },
    body: {
        marginBottom: 20,
    },
    paragraph: {
        marginBottom: 12,
        fontSize: 11,
        textAlign: "justify",
        lineHeight: 1.7,
    },
    closing: {
        marginTop: 20,
    },
    closingText: {
        marginBottom: 25,
        fontSize: 11,
    },
    signature: {
        fontSize: 11,
        fontFamily: "Times-Roman",
    },
});

interface CoverLetterPDFProps {
    content: string;
    name: string;
}

// The PDF Document component for Cover Letter
function CoverLetterPDFDocument({ content }: CoverLetterPDFProps) {
    // Split content into paragraphs
    const paragraphs = content.split("\n\n").filter(p => p.trim());

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.body}>
                    {paragraphs.map((paragraph, index) => (
                        <Text key={index} style={styles.paragraph}>
                            {paragraph.trim()}
                        </Text>
                    ))}
                </View>
            </Page>
        </Document>
    );
}

// Function to generate and download Cover Letter PDF
export async function downloadCoverLetterPDF(content: string, name: string): Promise<void> {
    const blob = await pdf(<CoverLetterPDFDocument content={content} name={name} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const fileName = `${name}.pdf`.replace(/[^a-zA-Z0-9_-]/g, "_");
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export { CoverLetterPDFDocument };
