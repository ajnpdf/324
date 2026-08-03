'use server';
/**
 * @fileOverview Smart file processing flows for AJN.
 *
 * - runFileSmartAction - Handles summarization, categorization, Q&A, and analysis.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartInputSchema = z.object({
  toolId: z.enum(['summarizer', 'translator', 'ocr', 'categorize', 'contract', 'resume', 'enhancer', 'semantic', 'quiz']),
  content: z.string().describe('The text content or a description of the file to analyze.'),
  config: z.record(z.any()).optional(),
});

const SmartOutputSchema = z.object({
  resultText: z.string().describe('The primary text result of the smart operation.'),
  confidence: z.number().optional().describe('Confidence score from 0-1.'),
  metadata: z.record(z.any()).optional().describe('Additional structured data extracted.'),
  suggestedNextSteps: z.array(z.string()).optional().describe('Helpful suggestions for the next action.'),
});

export async function runFileSmartAction(input: z.infer<typeof SmartInputSchema>) {
  if (!process.env.GOOGLE_GENAI_API_KEY) {
    return {
      resultText: "The AI assistant is currently offline. Please verify your configuration or try again later.",
      confidence: 0,
      suggestedNextSteps: ["Refresh page", "Check settings"]
    };
  }
  return fileSmartFlow(input);
}

const fileSmartPrompt = ai.definePrompt({
  name: 'fileSmartPrompt',
  input: {schema: SmartInputSchema},
  output: {schema: SmartOutputSchema},
  prompt: `You are a helpful assistant for AJN (All-in-one Tool Box).
  You are performing the task: {{toolId}}.
  
  CONTEXT:
  {{{content}}}
  
  CONFIGURATION:
  {{#if config}}
  {{{json config}}}
  {{/if}}
  
  TASK INSTRUCTIONS:
  - summarizer: Provide a simple bulleted summary. Focus on the most important points.
  - translator: Translate the content to {{config.targetLanguage}}. Ensure a professional tone.
  - categorize: Determine the file category (Invoice, Contract, Resume, etc.).
  - contract: Identify parties, dates, and payment terms.
  - resume: Suggest simple improvements for clarity.
  - enhancer: Describe how this image could be improved.
  - semantic: Answer the specific query based on the content clearly.
  - quiz: Generate 5 simple questions based on the material.
  
  Return your response in the specified format. Always include 2-3 logical next steps.`,
});

const fileSmartFlow = ai.defineFlow(
  {
    name: 'fileSmartFlow',
    inputSchema: SmartInputSchema,
    outputSchema: SmartOutputSchema,
  },
  async (input) => {
    const {output} = await fileSmartPrompt(input);
    return output!;
  }
);
