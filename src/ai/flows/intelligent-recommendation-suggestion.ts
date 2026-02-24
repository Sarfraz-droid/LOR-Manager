'use server';
/**
 * @fileOverview A Genkit flow for suggesting suitable professors for Letters of Recommendation (LoRs).
 *
 * - intelligentRecommendationSuggestion - A function that handles the professor suggestion process.
 * - IntelligentRecommendationSuggestionInput - The input type for the intelligentRecommendationSuggestion function.
 * - IntelligentRecommendationSuggestionOutput - The return type for the intelligentRecommendationSuggestion function.
 */

import { ai, createAI } from '@/ai/genkit';
import { z } from 'genkit';

const ProfessorProfileSchema = z.object({
  name: z.string().describe('The name of the professor.'),
  expertise: z.string().describe('A summary of the professor\'s expertise, including courses taught, research areas, and publications.'),
  contactInfo: z.string().optional().describe('Contact information for the professor.'),
});

const IntelligentRecommendationSuggestionInputSchema = z.object({
  studentAcademicHistory: z.string().describe(
    'A detailed summary of the student\'s academic history, including courses taken, grades, research interests, projects, and any significant achievements relevant to their academic pursuits.'
  ),
  professorProfiles: z.array(ProfessorProfileSchema).describe(
    'An array of available professor profiles, each containing their name, expertise, and optional contact information.'
  ),
});
export type IntelligentRecommendationSuggestionInput = z.infer<typeof IntelligentRecommendationSuggestionInputSchema>;

const IntelligentRecommendationSuggestionOutputSchema = z.object({
  suggestedProfessor: z.string().describe('The name of the professor most suitable for writing a Letter of Recommendation.'),
  reasoning: z.string().describe('A detailed explanation of why this professor is the best fit, considering the student\'s academic history and the professor\'s expertise.'),
  confidenceScore: z.number().min(0).max(100).describe('A confidence score (0-100) indicating how strongly the AI recommends this professor.'),
});
export type IntelligentRecommendationSuggestionOutput = z.infer<typeof IntelligentRecommendationSuggestionOutputSchema>;

function buildRecommendationPrompt(input: IntelligentRecommendationSuggestionInput): string {
  const professorList = input.professorProfiles
    .map((p) => `  - Professor Name: ${p.name}\n  - Expertise: ${p.expertise}`)
    .join('\n');
  return `You are an expert academic advisor specializing in matching students with the best professors for Letters of Recommendation. Your goal is to provide the most suitable professor based on the student's academic history and the available professor profiles.

Student Academic History:
${input.studentAcademicHistory}

Available Professor Profiles:
${professorList}

Analyze the student's academic background and research interests against the expertise of each professor. Identify the professor who has the strongest alignment with the student's areas of study, courses taken, and research interests.

Provide your suggestion as a JSON object with the following fields:
- 'suggestedProfessor': The name of the most suitable professor.
- 'reasoning': A detailed explanation justifying your choice, highlighting specific matches between the student's history and the professor's expertise.
- 'confidenceScore': A numerical score from 0 to 100, where 100 indicates very high confidence in the recommendation.
`;
}

export async function intelligentRecommendationSuggestion(
  input: IntelligentRecommendationSuggestionInput,
  geminiApiKey?: string,
): Promise<IntelligentRecommendationSuggestionOutput> {
  const aiInstance = geminiApiKey ? createAI(geminiApiKey) : ai;
  const { output } = await aiInstance.generate({
    prompt: buildRecommendationPrompt(input),
    output: { schema: IntelligentRecommendationSuggestionOutputSchema },
  });
  if (!output) throw new Error('Failed to get a recommendation from the AI.');
  return output;
}

// Kept for Genkit dev server discovery
const intelligentRecommendationSuggestionFlow = ai.defineFlow(
  {
    name: 'intelligentRecommendationSuggestionFlow',
    inputSchema: IntelligentRecommendationSuggestionInputSchema,
    outputSchema: IntelligentRecommendationSuggestionOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt: buildRecommendationPrompt(input),
      output: { schema: IntelligentRecommendationSuggestionOutputSchema },
    });
    if (!output) {
      throw new Error('Failed to get a recommendation from the AI.');
    }
    return output;
  }
);

export { intelligentRecommendationSuggestionFlow };

