'use client';

/**
 * AJN OCR NLP Post-Processing - Advanced Industrial Layer
 * Features: Smart Spacing, Case Correction, Noise Purge, and Entity Extraction.
 */

export function cleanText(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, "$1 $2") // Split camelCase
    .replace(/\s{2,}/g, " ")            // Collapse spaces
    .replace(/ ([,\.;:!?])/g, "$1")     // Fix punctuation spacing
    .replace(/([,\.;:])([^\s])/g, "$1 $2") // Space after punct
    .replace(/\n{3,}/g, "\n\n")          // Max 2 blank lines
    .replace(/Th1s/g, "This")           // Fix common artifacts
    .replace(/rn/g, "m")
    .trim();
}

/**
 * Capitalizes first letter after sentence-ending punctuation.
 */
export function smartCase(text: string): string {
  return text.replace(/(^|[.!?]\s+)([a-z])/g, 
    (_, prefix, letter) => prefix + letter.toUpperCase());
}

/**
 * Removes non-printable characters and lone symbols.
 */
export function stripNoise(text: string): string {
  return text
    .replace(/[^\x20-\x7E\n\t]/g, "")  // keep printable ASCII + newline/tab
    .replace(/\b[^a-zA-Z0-9\s]{1,2}\b/g, " ") // Remove lone symbols
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Regex extraction of structured entities from OCR text.
 */
export function extractEntities(text: string) {
  const patterns: Record<string, RegExp> = {
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    phone: /(?:\+?\d{1,3}[\s-]?)?\(?\d{2,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,6}/g,
    date: /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}-\d{2}-\d{2}/g,
    pan: /[A-Z]{5}[0-9]{4}[A-Z]/g,   // Indian PAN
    gst: /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/g // Indian GST
  };

  const results: Record<string, string[]> = {};
  Object.keys(patterns).forEach(key => {
    results[key] = text.match(patterns[key]) || [];
  });
  
  return results;
}

/**
 * Heuristic script detection based on Unicode ranges.
 */
export function detectLanguage(text: string): string {
  if (/[\u0900-\u097F]/.test(text)) return "Hindi/Devanagari";
  if (/[\u0600-\u06FF]/.test(text)) return "Arabic";
  if (/[\u4E00-\u9FFF]/.test(text)) return "Chinese";
  if (/[\u3040-\u30FF]/.test(text)) return "Japanese";
  if (/[\u0400-\u04FF]/.test(text)) return "Cyrillic";
  
  const eng = /\b(the|and|is|are|in|of|to|a)\b/gi;
  if ((text.match(eng)||[]).length > 2) return "English";
  
  return "Latin/Unknown";
}

/**
 * Case-insensitive search and replace with basic regex support.
 */
export function findAndReplace(text: string, query: string, replacement: string, isRegex = false) {
  try {
    const pattern = isRegex ? new RegExp(query, "gi") : new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "gi");
    return text.replace(pattern, replacement);
  } catch (e) {
    return text;
  }
}

export function computeStats(result: any) {
  const words = result.words || [];
  return {
    wordCount: words.length,
    charCount: result.text.replace(/\s/g, "").length,
    avgConfidence: words.length > 0 ? words.reduce((acc: number, w: any) => acc + w.confidence, 0) / words.length : 0,
    lowConfCount: words.filter((w: any) => w.confidence < 50).length
  };
}
