'use server';
/**
 * @fileOverview A Genkit flow for drafting Statements of Purpose.
 */

import { ai } from '@/ai/genkit';
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

export async function generateSopDraft(input: GenerateSopDraftInput): Promise<GenerateSopDraftOutput> {
  return generateSopDraftFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSopDraftPrompt',
  input: { schema: GenerateSopDraftInputSchema },
  output: { schema: GenerateSopDraftOutputSchema },
  prompt: `You are an expert academic writing assistant. Your task is to draft a compelling Statement of Purpose (SOP).

Target Institution: {{{college}}}
Program: {{{program}}}
Student Background: {{{studentBackground}}}
Key Achievements: {{{achievements}}}
Career Goals: {{{goals}}}

The SOP should:
1. Open with a compelling hook that introduces the student's passion for the field.
2. Detail relevant academic background and experiences.
3. Highlight key achievements and how they relate to the program.
4. Articulate clear short-term and long-term career goals.
5. Explain why this specific program and institution is the right fit.
6. Close with a strong concluding statement.

Use a formal, professional tone appropriate for graduate admissions. Return only the text of the SOP.`,
});

const generateSopDraftFlow = ai.defineFlow(
  {
    name: 'generateSopDraftFlow',
    inputSchema: GenerateSopDraftInputSchema,
    outputSchema: GenerateSopDraftOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('Failed to generate SOP draft.');
    return output;
  }
);
