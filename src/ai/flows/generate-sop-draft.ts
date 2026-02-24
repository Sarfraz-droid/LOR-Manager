'use server';
/**
 * @fileOverview A Genkit flow for drafting Statements of Purpose.
 */

import { ai, createAI } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateSopDraftInputSchema = z.object({
  college: z.string(),
  program: z.string(),
  studentBackground: z.string(),
  achievements: z.string(),
  goals: z.string(),
});
export type GenerateSopDraftInput = z.infer<typeof GenerateSopDraftInputSchema>;

const GenerateSopDraftOutputSchema = z.object({
  draft: z.string().describe('The complete text of the drafted Statement of Purpose.'),
});
export type GenerateSopDraftOutput = z.infer<typeof GenerateSopDraftOutputSchema>;

function buildSopDraftPrompt(input: GenerateSopDraftInput): string {
  return `You are an expert academic writing assistant. Your task is to draft a compelling Statement of Purpose (SOP).

Target Institution: ${input.college}
Program: ${input.program}
Student Background: ${input.studentBackground}
Key Achievements: ${input.achievements}
Career Goals: ${input.goals}

The SOP should:
1. Open with a compelling hook that introduces the student's passion for the field.
2. Detail relevant academic background and experiences.
3. Highlight key achievements and how they relate to the program.
4. Articulate clear short-term and long-term career goals.
5. Explain why this specific program and institution is the right fit.
6. Close with a strong concluding statement.

Use a formal, professional tone appropriate for graduate admissions. Return only the text of the SOP.`;
}

export async function generateSopDraft(input: GenerateSopDraftInput, geminiApiKey?: string): Promise<GenerateSopDraftOutput> {
  const aiInstance = geminiApiKey ? createAI(geminiApiKey) : ai;
  const { output } = await aiInstance.generate({
    prompt: buildSopDraftPrompt(input),
    output: { schema: GenerateSopDraftOutputSchema },
  });
  if (!output) throw new Error('Failed to generate SOP draft.');
  return output;
}

// Kept for Genkit dev server discovery
const generateSopDraftFlow = ai.defineFlow(
  {
    name: 'generateSopDraftFlow',
    inputSchema: GenerateSopDraftInputSchema,
    outputSchema: GenerateSopDraftOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt: buildSopDraftPrompt(input),
      output: { schema: GenerateSopDraftOutputSchema },
    });
    if (!output) throw new Error('Failed to generate SOP draft.');
    return output;
  }
);

export { generateSopDraftFlow };

