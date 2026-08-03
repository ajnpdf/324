
'use server';
/**
 * @fileOverview Provides AI-driven tool recommendations based on file type and desired modifications for AJN.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartToolSuggestionsInputSchema = z.object({
  fileType: z
    .string()
    .describe(
      'The MIME type of the file (e.g., "image/jpeg", "application/pdf").'
    ),
  modificationDescription: z
    .string()
    .optional()
    .describe(
      'An optional short phrase describing the desired change (e.g., "make it smaller").'
    ),
});
export type SmartToolSuggestionsInput = z.infer<
  typeof SmartToolSuggestionsInputSchema
>;

const SmartToolSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(
      z.object({
        toolName: z.string().describe('The name of the suggested tool.'),
        toolDescription: z
          .string()
          .describe('A brief description of what the tool does.'),
        isRecommended: z
          .boolean()
          .describe(
            'Whether this tool is recommended based on the input.'
          ),
      })
    )
    .describe(' A list of tool suggestions.'),
});
export type SmartToolSuggestionsOutput = z.infer<
  typeof SmartToolSuggestionsOutputSchema
>;

export async function smartToolSuggestions(
  input: SmartToolSuggestionsInput
): Promise<SmartToolSuggestionsOutput> {
  if (!process.env.GOOGLE_GENAI_API_KEY) {
    return {
      suggestions: [
        { toolName: "Merge PDF", toolDescription: "Combine multiple PDF files into one.", isRecommended: true },
        { toolName: "Compress PDF", toolDescription: "Reduce the file size of your PDF.", isRecommended: true },
        { toolName: "PDF to Word", toolDescription: "Convert PDF to an editable document.", isRecommended: false }
      ]
    };
  }
  return smartToolSuggestionsFlow(input);
}

const smartToolSuggestionsPrompt = ai.definePrompt({
  name: 'smartToolSuggestionsPrompt',
  input: {schema: SmartToolSuggestionsInputSchema},
  output: {schema: SmartToolSuggestionsOutputSchema},
  prompt: `You are an assistant for AJN – All-in-one Tool Box, designed to help users find the right tools for file editing and conversion.

Based on the file type and the desired change (if provided), suggest relevant tools. For each tool, provide a name, a brief description, and indicate if it is recommended.

File Type: {{{fileType}}}
{{#if modificationDescription}}
Desired Change: {{{modificationDescription}}}
{{/if}}

Return your suggestions in a JSON array format.`,
});

const smartToolSuggestionsFlow = ai.defineFlow(
  {
    name: 'smartToolSuggestionsFlow',
    inputSchema: SmartToolSuggestionsInputSchema,
    outputSchema: SmartToolSuggestionsOutputSchema,
  },
  async (input) => {
    const {output} = await smartToolSuggestionsPrompt(input);
    return output!;
  }
);
