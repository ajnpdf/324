/**
 * AJN AI Development Entry Point
 * This file is for local Genkit development only.
 * It is excluded from production builds via tsconfig.json.
 */

if (process.env.NODE_ENV !== 'production') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const dotenv = require('dotenv');
    dotenv.config();
  } catch (e) {
    console.warn('Development: dotenv not found, skipping local env load.');
  }
}

import '@/ai/flows/smart-tool-suggestions.ts';
import '@/ai/flows/file-intelligence.ts';
