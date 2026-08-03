import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * AJN AI Core Initialization
 * Hardened with environment guards to prevent runtime crashes.
 */

if (!process.env.GOOGLE_GENAI_API_KEY) {
  console.warn('AI functionality is disabled — GOOGLE_GENAI_API_KEY is not set in environment.');
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
