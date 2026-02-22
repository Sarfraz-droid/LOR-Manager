'use server';
/**
 * @fileOverview A Genkit flow for drafting Letters of Recommendation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateLoRDraftInputSchema = z.object({
  professorName: z.string(),
  professorExpertise: z.string(),
  studentName: z.string(),
  studentHistory: z.string(),
  university: z.string(),
  program: z.string(),
});
export type GenerateLoRDraftInput = z.infer<typeof GenerateLoRDraftInputSchema>;

const GenerateLoRDraftOutputSchema = z.object({
  draft: z.string().describe('The complete text of the drafted Letter of Recommendation.'),
});
export type GenerateLoRDraftOutput = z.infer<typeof GenerateLoRDraftOutputSchema>;

export async function generateLoRDraft(input: GenerateLoRDraftInput): Promise<GenerateLoRDraftOutput> {
  return generateLoRDraftFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLoRDraftPrompt',
  input: { schema: GenerateLoRDraftInputSchema },
  output: { schema: GenerateLoRDraftOutputSchema },
  prompt: `You are an expert academic writing assistant. Your task is to draft a professional and compelling Letter of Recommendation.

Professor: {{{professorName}}} (Expertise: {{{professorExpertise}}})
Student: {{{studentName}}}
Student Background: {{{studentHistory}}}
Target Application: {{{university}}} - {{{program}}}

The letter should:
1. Be formal and structured (Salutation, Introduction, Academic Assessment, Personal Qualities, Conclusion).
2. Highlight specific strengths based on the student's background.
3. Use a tone appropriate for high-level academic admissions.
4. Leave placeholders for specific dates or grades if they aren't provided.

Return only the text of the letter.`,
});

const generateLoRDraftFlow = ai.defineFlow(
  {
    name: 'generateLoRDraftFlow',
    inputSchema: GenerateLoRDraftInputSchema,
    outputSchema: GenerateLoRDraftOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('Failed to generate draft.');
    return output;
  }
);
