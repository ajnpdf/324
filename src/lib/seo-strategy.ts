import type { ServiceTool } from './tools-data';
import { getPublicToolCategory } from './tools-data';

export type SearchIntent = 'transactional' | 'informational' | 'comparison' | 'troubleshooting';

export type ToolSeoProfile = {
  primaryKeyword: string;
  secondaryKeywords: string[];
  questionKeywords: string[];
  audience: string[];
  intent: SearchIntent;
  title: string;
  description: string;
  categoryLabel: string;
};

const CATEGORY_TERMS = {
  conversion: ['online file converter', 'convert files online', 'document converter online'],
  image: ['online image converter', 'image tools online', 'convert image files'],
  pdf: ['online PDF tools', 'edit PDF online', 'PDF utility tools'],
} as const;

const OCR_MARKERS = ['ocr', 'scanned', 'scan', 'image-to-text', 'searchable'];

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9+]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function unique(values: string[]): string[] {
  return [...new Set(values.map(normalize).filter(Boolean))];
}

function buildTitle(tool: ServiceTool): string {
  const base = `${tool.name} Online`;
  const suffix = tool.id.includes('ocr') || OCR_MARKERS.some((marker) => tool.id.includes(marker))
    ? 'OCR Tool'
    : tool.id.includes('-to-') || tool.tag === 'convert'
      ? 'File Converter'
      : 'PDF Tool';
  const candidate = `${base} – Free ${suffix}`;
  return candidate.length <= 60 ? candidate : base;
}

export function getToolSeoProfile(tool: ServiceTool): ToolSeoProfile {
  const category = getPublicToolCategory(tool);
  const normalizedName = normalize(tool.name);
  const isOcr = OCR_MARKERS.some((marker) => tool.id.includes(marker) || normalizedName.includes(marker));
  const isConversion = tool.id.includes('-to-') || tool.tag === 'convert' || category === 'conversion';
  const intent: SearchIntent = isConversion || isOcr ? 'transactional' : 'transactional';
  const categoryLabel = category === 'conversion' ? 'File Conversion' : category === 'image' ? 'Image Tools' : 'PDF Tools';
  const primaryKeyword = `${normalizedName} online`;
  const secondaryKeywords = unique([
    `free ${normalizedName}`,
    `${normalizedName} without signup`,
    `${normalizedName} converter`,
    `${normalizedName} tool`,
    ...tool.keywords,
    ...CATEGORY_TERMS[category],
    ...(isOcr ? ['online OCR tool', 'extract text from scanned document', 'scanned document converter'] : []),
  ]).slice(0, 18);
  const questionKeywords = unique([
    `how to ${normalizedName} online`,
    `how do I ${normalizedName}`,
    `best way to ${normalizedName}`,
    isOcr ? `how to extract text from a scanned file` : `how to process ${normalizedName} safely`,
  ]);
  const audience = isOcr
    ? ['students', 'offices', 'researchers', 'archives', 'small businesses']
    : category === 'image'
      ? ['creators', 'students', 'marketing teams', 'small businesses']
      : ['students', 'professionals', 'business teams', 'legal and finance users'];
  const description = `${tool.desc} Use AJN PDF with simple controls, clear steps and a downloadable result.`.slice(0, 158);

  return {
    primaryKeyword,
    secondaryKeywords,
    questionKeywords,
    audience,
    intent,
    title: buildTitle(tool),
    description,
    categoryLabel,
  };
}

export const ICP_SEGMENTS = [
  {
    id: 'students',
    label: 'Students and applicants',
    jobs: ['merge assignments', 'compress application files', 'convert scans to editable text', 'prepare image files as PDF'],
    priorityQueries: ['merge pdf online', 'compress pdf for application', 'scanned pdf to word', 'jpg to pdf online'],
  },
  {
    id: 'professionals',
    label: 'Professionals and office teams',
    jobs: ['convert office files', 'extract tables and text', 'protect confidential PDFs', 'repair or reorganize documents'],
    priorityQueries: ['word to pdf online', 'pdf to excel', 'protect pdf with password', 'organize pdf pages'],
  },
  {
    id: 'small-business',
    label: 'Small businesses and operations teams',
    jobs: ['prepare invoices and receipts', 'convert email attachments', 'create searchable archives', 'reduce document size'],
    priorityQueries: ['receipt to pdf', 'eml to pdf', 'ocr searchable pdf', 'compress pdf online'],
  },
  {
    id: 'creators',
    label: 'Creators and marketing teams',
    jobs: ['convert images', 'export PDF pages', 'prepare campaign assets', 'combine visuals into PDFs'],
    priorityQueries: ['png to pdf', 'pdf to png', 'webp to pdf', 'images to pdf'],
  },
] as const;

export const SEARCH_INTENT_CLUSTERS = [
  { cluster: 'Core PDF actions', intent: 'transactional', examples: ['merge pdf', 'split pdf', 'compress pdf', 'organize pdf'] },
  { cluster: 'PDF conversion', intent: 'transactional', examples: ['pdf to word', 'pdf to excel', 'pdf to jpg', 'word to pdf'] },
  { cluster: 'OCR and scanned documents', intent: 'transactional', examples: ['scanned pdf to text', 'image to text', 'searchable pdf'] },
  { cluster: 'Document security', intent: 'transactional', examples: ['protect pdf', 'unlock pdf', 'repair pdf'] },
  { cluster: 'How-to guidance', intent: 'informational', examples: ['how to merge pdf safely', 'how OCR works', 'how to reduce pdf size'] },
  { cluster: 'Tool evaluation', intent: 'comparison', examples: ['best free pdf tools', 'online pdf converter comparison', 'PDF tool comparison'] },
] as const;
