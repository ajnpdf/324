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

const PRIORITY_TITLES: Record<string, string> = {
  'merge-pdf': 'Merge PDF Online - Combine PDF Files | AJN PDF',
  'split-pdf': 'Split PDF Online - Extract PDF Pages | AJN PDF',
  'compress-pdf': 'Compress PDF Online - Reduce PDF Size | AJN PDF',
  'pdf-to-word': 'PDF to Word Online - Convert PDF to DOCX | AJN PDF',
  'word-to-pdf': 'Word to PDF Online - Convert DOCX to PDF | AJN PDF',
  'pdf-to-jpg': 'PDF to JPG Online - Convert PDF Pages | AJN PDF',
  'jpg-to-pdf': 'JPG to PDF Online - Convert Images to PDF | AJN PDF',
  'pdf-to-excel': 'PDF to Excel Online - Convert PDF Tables | AJN PDF',
  'excel-to-pdf': 'Excel to PDF Online - Convert Spreadsheets | AJN PDF',
  'pdf-to-powerpoint': 'PDF to PowerPoint Online - Convert Slides | AJN PDF',
  'protect-pdf': 'Protect PDF Online - Add a PDF Password | AJN PDF',
  'unlock-pdf': 'Unlock PDF Online - Remove PDF Password | AJN PDF',
  'organize-pdf': 'Organize PDF Online - Reorder PDF Pages | AJN PDF',
  'add-text': 'Edit PDF Online - Add Text to PDF | AJN PDF',
  'scanned-pdf-to-text': 'OCR PDF Online - Extract Text from Scans | AJN PDF',
};

const PRIORITY_DESCRIPTIONS: Record<string, string> = {
  'merge-pdf': 'Combine multiple PDF files in the order you choose, remove files before processing, and download one merged PDF.',
  'split-pdf': 'Split a PDF into smaller files, extract selected pages, or separate sections of a document with clear page controls.',
  'compress-pdf': 'Reduce PDF file size with practical compression controls. Already optimized PDFs may shrink only slightly.',
  'pdf-to-word': 'Convert PDF content to an editable Word document. Complex layouts, scans and tables may need review after conversion.',
  'word-to-pdf': 'Convert Word documents to PDF for consistent sharing and printing, using the available document conversion service.',
  'pdf-to-jpg': 'Render PDF pages as JPG images for previews, sharing and image-based workflows, with selectable output settings.',
  'jpg-to-pdf': 'Turn one or more JPG images into a PDF in the order you choose, with practical page size and image-fit controls.',
  'pdf-to-excel': 'Convert supported PDF table content to an Excel workbook. Review complex tables and scanned pages after conversion.',
  'excel-to-pdf': 'Convert Excel spreadsheets to PDF for easier sharing and printing with the available document conversion service.',
  'pdf-to-powerpoint': 'Convert supported PDF content to a PowerPoint presentation. Review complex layouts after conversion.',
  'protect-pdf': 'Add password protection to an authorized PDF using the AJN PDF processing service and download a protected copy.',
  'unlock-pdf': 'Remove PDF encryption when you know the valid password and are authorized to create an unlocked copy.',
  'organize-pdf': 'Reorder, rotate, remove or duplicate PDF pages with a visual workspace, then download the updated document.',
  'add-text': 'Add text directly to PDF pages, position it visually, and download a new copy without changing the original file.',
  'scanned-pdf-to-text': 'Use OCR to extract text from scanned PDF pages with supported language options and a downloadable result.',
};

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9+]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function unique(values: string[]): string[] {
  return [...new Set(values.map(normalize).filter(Boolean))];
}

function buildTitle(tool: ServiceTool): string {
  const priority = PRIORITY_TITLES[tool.id];
  if (priority) return priority;
  const base = `${tool.name} Online`;
  const suffix = tool.id.includes('ocr') || OCR_MARKERS.some((marker) => tool.id.includes(marker))
    ? 'OCR Tool'
    : tool.id.includes('-to-') || tool.tag === 'convert'
      ? 'File Converter'
      : 'PDF Tool';
  const candidate = `${base} - ${suffix} | AJN PDF`;
  return candidate.length <= 62 ? candidate : `${base} | AJN PDF`;
}

function buildNaturalDescription(tool: ServiceTool, isOcr: boolean, isConversion: boolean): string {
  const priority = PRIORITY_DESCRIPTIONS[tool.id];
  if (priority) return priority;
  const cleanDesc = tool.desc.trim().replace(/\s+/g, ' ').replace(/\.$/, '');
  const useCase = isOcr
    ? 'extract usable text from supported scanned documents and images'
    : isConversion
      ? 'convert supported files into the requested output format'
      : `complete the ${tool.name.toLowerCase()} workflow with clear file controls`;
  const benefit = isOcr
    ? 'Review OCR output before using it in important work.'
    : isConversion
      ? 'Download and review the result when processing is complete.'
      : 'Practical limits and result controls are shown before processing.';
  if (isOcr) return `${tool.name} helps you ${useCase}. ${cleanDesc}. ${benefit}`;
  if (isConversion) return `${tool.name} helps you ${useCase}. ${cleanDesc}. ${benefit}`;
  return `${cleanDesc}. ${tool.name} lets you ${useCase}. ${benefit}`;
}

export function getToolSeoProfile(tool: ServiceTool): ToolSeoProfile {
  const category = getPublicToolCategory(tool);
  const normalizedName = normalize(tool.name);
  const isOcr = OCR_MARKERS.some((marker) => tool.id.includes(marker) || normalizedName.includes(marker));
  const isConversion = tool.id.includes('-to-') || tool.tag === 'convert' || category === 'conversion';
  const intent: SearchIntent = 'transactional';
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
    isOcr ? 'how to extract text from a scanned file' : `how to use ${normalizedName}`,
  ]);
  const audience = isOcr
    ? ['students', 'offices', 'researchers', 'archives', 'small businesses']
    : category === 'image'
      ? ['creators', 'students', 'marketing teams', 'small businesses']
      : ['students', 'professionals', 'business teams', 'legal and finance users'];
  const description = buildNaturalDescription(tool, isOcr, isConversion).replace(/\s+/g, ' ').slice(0, 158).trim();

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
