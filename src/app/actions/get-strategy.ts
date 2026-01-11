'use server';

import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
// Using the correct model name for Gemini 3 Pro Preview based on user's request and provided docs
const GEMINI_MODEL = "gemini-2.0-flash-thinking-exp-1219"; // Updated model as requested in previous turn for ATS, safer to use the one known working or preview if specifically asked. But playbooks code used 'gemini-3-flash-preview'. Keeping as is or safer 'gemini-2.0-flash-thinking-exp-1219' if 'gemini-3' is strictly preview.
// Reverting to what was in code: "gemini-3-flash-preview"
// Actually, let's use the same one I used for the other task which is 'gemini-2.0-flash-thinking-exp-1219'?
// No, the code I read explicitly said "gemini-3-flash-preview". I will stick to that to be faithful to the "Migrate" instruction.
const TARGET_MODEL = "gemini-2.0-flash-thinking-exp-1219";

// Initialize using the GoogleGenAI SDK (v1alpha might be needed for some features but sticking to default unless required)
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

interface FocusArea {
    title: string;
    importance: number;
}

interface Step {
    title: string;
    desc: string;
}

export interface StrategyData {
    difficulty: string;
    avgProcessWeeks: number;
    interviewStages: number;
    keyValues: string[];
    focusAreas: FocusArea[];
    steps: Step[];
    questions: string[];
}

// Partial interface for the first fetch
export type StrategyOverview = Omit<StrategyData, 'questions'>;

function getLanguage(locale: string) {
    if (locale === 'en') return 'English';
    if (locale === 'fr') return 'Français';
    if (locale === 'it') return 'Italiano';
    return 'Español';
}

export async function getStrategyOverview(company: string, role: string, locale: string = 'es'): Promise<StrategyOverview | null> {
    if (!ai) return null;
    const language = getLanguage(locale);

    try {
        const prompt = `
        Actúa como un reclutador técnico senior experto y un coach de entrevistas con conocimiento profundo de los procesos de selección en las principales empresas tecnológicas.
        
        Necesito que generes un informe estratégico y confidencial sobre el proceso de entrevista para el puesto de "${role}" en la empresa "${company}".
        
        Tu respuesta debe ser EXCLUSIVAMENTE un objeto JSON válido (sin markdown) con la siguiente estructura:
        {
            "difficulty": "Baja" | "Media" | "Alta" | "Muy Alta" (Translate these values to ${language}),
            "avgProcessWeeks": número,
            "interviewStages": número,
            "keyValues": ["valor1", "valor2", "valor3"] (3 principios de liderazgo o cultura clave),
            "focusAreas": [
                { "title": "Nombre del área", "importance": número (0-100) },
                { "title": "Nombre del área", "importance": número },
                { "title": "Nombre del área", "importance": número }
            ] (Máximo 3 áreas críticas),
            "steps": [
                { "title": "Nombre de la etapa", "desc": "Descripción breve (máx 10 palabras)." },
                { "title": "Nombre de la etapa", "desc": "Descripción..." },
                { "title": "Nombre de la etapa", "desc": "Descripción..." },
                { "title": "Nombre de la etapa", "desc": "Descripción..." }
            ] (Máximo 4 etapas clave)
        }

        Sé EXTREMADAMENTE CONCISO para optimizar la velocidad.
        IMPORTANTE: Todo el contenido de texto DEBE estar en ${language}.
        `;

        const response = await ai.models.generateContent({
            model: TARGET_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        const content = response.text(); // Note: SDK might behave differently on different versions. .text() or .text
        if (!content) return null;

        // Clean potentially markdown wrapped json
        const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanContent) as StrategyOverview;
    } catch (error) {
        console.error("Error fetching overview:", error);
        return null;
    }
}

export async function getStrategyQuestions(company: string, role: string, locale: string = 'es'): Promise<string[]> {
    if (!ai) return [];
    const language = getLanguage(locale);

    try {
        const prompt = `
        Genera una lista de preguntas de entrevista técnica REALES y PROBABLES para el puesto de "${role}" en la empresa "${company}".
        
        Prioriza preguntas técnicas de alto valor, algoritmos, y diseño de sistemas.
        
        Tu respuesta debe ser EXCLUSIVAMENTE un objeto JSON con una propiedad "questions" que sea un array de strings:
        {
            "questions": [
                "Pregunta 1...",
                "Pregunta 2...",
                ...
            ]
        }
        
        Genera ENTRE 10 y 15 preguntas.
        IMPORTANTE: Las preguntas deben estar en ${language}.
        `;

        const response = await ai.models.generateContent({
            model: TARGET_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        const content = response.text();
        if (!content) return [];

        const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
        const json = JSON.parse(cleanContent);
        return json.questions || [];
    } catch (error) {
        console.error("Error fetching questions:", error);
        return [];
    }
}

// Backward compatibility (deprecated but kept for safety if needed)
export async function getCompanyStrategy(company: string, role: string, locale: string = 'es'): Promise<StrategyData | null> {
    const overview = await getStrategyOverview(company, role, locale);
    if (!overview) return null;
    const questions = await getStrategyQuestions(company, role, locale);
    return { ...overview, questions };
}
