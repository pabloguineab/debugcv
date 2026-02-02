// Format skill name - proper capitalization for resume display
// Acronyms appear in UPPERCASE, regular words with first letter capitalized

const ACRONYMS = new Set([
    'aws', 'sql', 'api', 'nlp', 'llm', 'css', 'html', 'gcp', 'ci/cd', 'ec2', 's3',
    'nosql', 'bert', 'rag', 'gpu', 'cpu', 'sdk', 'ide', 'rest', 'graphql', 'json',
    'xml', 'yaml', 'npm', 'pip', 'cli', 'ssh', 'ssl', 'tls', 'http', 'https', 'tcp',
    'ip', 'dns', 'cdn', 'vm', 'os', 'ui', 'ux', 'ai', 'ml', 'dl', 'cv', 'ocr', 'ner',
    'rnn', 'cnn', 'lstm', 'gan', 'vae', 'svm', 'knn', 'pca', 'etl', 'olap', 'crm',
    'erp', 'seo', 'saas', 'paas', 'iaas', 'vpc', 'iam', 'sns', 'sqs', 'rds', 'eks',
    'd3', 'c', 'r', 'sap', 'bi', 'kpi', 'roi', 'agile', 'scrum'
]);

export function formatSkillName(skill: string): string {
    // Handle compound words (e.g. "google-cloud-platform-(gcp)")
    return skill.split(/([\s\-_\/]+)/).map(part => {
        // Skip separators
        if (/^[\s\-_\/]+$/.test(part)) return part;

        // Remove parentheses for matching but keep for display
        const cleanPart = part.replace(/[()]/g, '').toLowerCase();

        // Check if it's an acronym
        if (ACRONYMS.has(cleanPart)) {
            // Preserve parentheses
            if (part.startsWith('(')) return `(${cleanPart.toUpperCase()})`;
            if (part.endsWith(')')) return `${cleanPart.toUpperCase()})`;
            return cleanPart.toUpperCase();
        }

        // Check for compound acronym patterns like "d3js", "html5", "vue3"
        const acronymMatch = cleanPart.match(/^([a-z]+)(\d+)?$/);
        if (acronymMatch) {
            const [, word, number] = acronymMatch;
            if (ACRONYMS.has(word)) {
                return word.toUpperCase() + (number || '');
            }
        }

        // Capitalize first letter for regular words
        if (part.length > 0) {
            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        }
        return part;
    }).join('');
}
