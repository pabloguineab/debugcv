import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getApplication } from '@/lib/supabase';
import { getUserProfile } from '@/lib/kv-db';
import { getStrategyQuestions } from '@/app/actions/get-strategy';

const LIVE_AVATAR_API_URL = "https://api.liveavatar.com/v1/contexts";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { jobId, language } = await request.json();

        // 1. Get user profile (CV)
        const profile = await getUserProfile(session.user.email);
        if (!profile?.cv_text) {
            return NextResponse.json({ error: 'CV not found. Please scan your CV first.' }, { status: 404 });
        }

        // 2. Get job details
        const job = await getApplication(jobId, session.user.email);

        if (!job) {
            return NextResponse.json({ error: 'Job application not found' }, { status: 404 });
        }

        // 3. Fetch Technical Playbook Questions
        let technicalQuestions: string[] = [];
        try {
            // Fetch 3 specific questions for this role/company
            const allQuestions = await getStrategyQuestions(job.company, job.title, language);
            if (allQuestions && allQuestions.length > 0) {
                // Shuffle and pick 3
                technicalQuestions = allQuestions.sort(() => 0.5 - Math.random()).slice(0, 3);
            }
        } catch (err) {
            console.warn("Could not fetch playbook questions, falling back to generic.", err);
        }

        // Format questions for the prompt
        const techQuestionsText = technicalQuestions.length > 0
            ? technicalQuestions.map((q, i) => `   - Q${i + 1}: "${q}"`).join('\n')
            : (language === 'es'
                ? "   - Pregunta sobre un desafío técnico complejo relacionado con la descripción del trabajo.\n   - Pregunta sobre diseño de sistemas o arquitectura si aplica."
                : "   - Ask about a complex technical challenge related to the job description.\n   - Ask about system design or architecture if applicable.");

        // 4. Build personalized prompt (Multilingual support)
        let systemPrompt = "";
        let openingText = "";

        if (language === 'es') {
            // --- SPANISH PROMPT ---
            systemPrompt = `
## PERSONA:
Eres Pablo Guinea, un reclutador técnico senior en ${job.company}.
Realizas entrevistas para el rol de ${job.title}.
Eres amable pero técnicamente agudo. Tu objetivo es evaluar la profundidad real del candidato.

---

# KNOWLEDGE BASE:

## About the Role
Estás entrevistando a ${profile.full_name || "el candidato"} para el rol de ${job.title} en ${job.company}.
Descripción del trabajo:
${job.jobDescription ? job.jobDescription.substring(0, 1000) : "No se proporcionó descripción."}

## Candidate Profile
Nombre: ${profile.full_name || "Candidato"}
CV Resumido:
${profile.cv_text ? profile.cv_text.substring(0, 3000) : "No CV provided."}

---

## Interview Logic (Phase-based)

Esta entrevista tiene 2 partes claras. Debes gestionar el tiempo (aprox 4-6 preguntas en total).

### PART 1: Intro & Background (Start soft)
1.  **Bienvenida**: Saluda, preséntate brevemente y rompe el hielo.
2.  **Experiencia**: Pregunta sobre su rol actual o un proyecto reciente del CV.

### PART 2: Technical Deep Dive (THE CORE)
Una vez que el candidato haya explicado su background, **cambia a un tono más técnico**.
Diles: "Genial, ahora me gustaría profundizar un poco en aspectos más técnicos que solemos preguntar en ${job.company}."

**DEBES HACER ESTAS PREGUNTAS ESPECÍFICAS (una por turno):**
${techQuestionsText}

*Si el candidato responde brevemente, haz preguntas de seguimiento ("follow-up") para verificar que realmente sabe de lo que habla.*

### PART 3: Culture & Closing
Si queda tiempo, haz una pregunta sobre cultura ("¿Por qué ${job.company}?") y cierra la entrevista amablemente.

---

# INSTRUCTIONS:
- Mantén las respuestas CONCISAS (máx 40 palabras) para que la conversación sea fluida.
- **NO hagas todas las preguntas de golpe.** Una a la vez.
- Escucha la respuesta del usuario. Si es vaga, presiona un poco más ("¿Podrías darme un ejemplo concreto?").
- Si el usuario habla Inglés, responde Inglés. Si habla Español, responde Español.
`;

            openingText = `¡Hola ${profile.full_name ? profile.full_name.split(' ')[0] : ''}! Soy Pablo Guinea de ${job.company}. Un placer. ¿Listo para darle caña a esta entrevista para ${job.title}?`;

        } else {
            // --- ENGLISH PROMPT (DEFAULT) ---
            systemPrompt = `
## PERSONA:
You are Pablo Guinea, a Senior Technical Recruiter at ${job.company}.
You are interviewing candidates for the ${job.title} role.
You are friendly but technically sharp. Your goal is to evaluate the candidate's actual depth.

---

# KNOWLEDGE BASE:

## About the Role
Candidate: ${profile.full_name || "the candidate"}
Role: ${job.title} at ${job.company}.
Job Description:
${job.jobDescription ? job.jobDescription.substring(0, 1000) : "No description provided."}

## Candidate Profile
Name: ${profile.full_name || "Candidate"}
CV Summary:
${profile.cv_text ? profile.cv_text.substring(0, 3000) : "No CV provided."}

---

## Interview Logic (Phase-based)

This interview has 2 clear parts. You must manage the flow (approx 4-6 questions total).

### PART 1: Intro & Background (Soft start)
1.  **Welcome**: Say hi, introduce yourself briefly.
2.  **Background**: Ask about their current role or a recent project from their CV.

### PART 2: Technical Deep Dive (THE CORE)
After the candidate explains their background, **switch to a more technical mode**.
Say something like: "Great context. Now I'd like to dive deeper into some technical scenarios we often discuss here at ${job.company}."

**YOU MUST ASK THESE SPECIFIC QUESTIONS (one per turn):**
${techQuestionsText}

*If the candidate gives a shallow answer, ask a follow-up ("Can you give me a specific example?" or "Why did you choose that approach?").*

### PART 3: Culture & Closing
If time permits, ask one culture-fit question ("Why ${job.company}?") and then wrap up.

---

# INSTRUCTIONS:
- Keep responses CONCISE (max 40 words) to keep the flow dynamic.
- **DO NOT ask all questions at once.** One at a time.
- Listen to the user's answer. If it's vague, drill down.
- If the user speaks Spanish, respond in Spanish. If English, respond in English.
`;

            openingText = `Hi ${profile.full_name ? profile.full_name.split(' ')[0] : 'there'}! I'm Pablo Guinea from ${job.company}. Ready to jump into this interview for the ${job.title} position?`;
        }

        // 4. Update LiveAvatar context
        const apiKey = process.env.LIVE_AVATAR_API_KEY || "test-api-key"; // Fallback for dev if env missing
        const contextId = process.env.LIVE_AVATAR_CONTEXT_ID || "test-context-id";

        if (apiKey && contextId) {
            const response = await fetch(`${LIVE_AVATAR_API_URL}/${contextId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey
                },
                body: JSON.stringify({
                    name: `Interview: ${job.title} at ${job.company}`,
                    prompt: systemPrompt,
                    opening_text: openingText
                })
            });

            if (!response.ok) {
                console.error('Failed to update LiveAvatar context', await response.text());
            }
        }

        return NextResponse.json({ success: true, contextId });

    } catch (error) {
        console.error('Error setting up interview:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
