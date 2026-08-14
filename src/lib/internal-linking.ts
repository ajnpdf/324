import { getPublicToolCategory, type ServiceTool } from './tools-data';
import { BUILD_PUBLIC_TOOLS } from './build-public-tools';

const GUIDE_MAP: Record<string, { href: string; title: string }[]> = {
  conversion: [
    { href: '/blog/pdf-vs-docx', title: 'PDF vs DOCX: when to use each format' },
    { href: '/blog/scanned-pdf-to-word', title: 'How scanned PDF to Word conversion works' },
    { href: '/blog/browser-native-architecture', title: 'How online conversion processing works' },
  ],
  image: [
    { href: '/blog/image-to-pdf-jpg-vs-png', title: 'Image to PDF: JPG vs PNG' },
    { href: '/blog/how-ocr-works', title: 'How OCR works on images and scans' },
    { href: '/blog/improve-ocr-indian-languages', title: 'Improve OCR for Indian-language scans' },
  ],
  pdf: [
    { href: '/blog/how-to-merge-pdfs-online-safely', title: 'How to merge PDFs safely' },
    { href: '/blog/reduce-pdf-size-keep-quality', title: 'Reduce PDF size while keeping text readable' },
    { href: '/blog/document-security-aes256', title: 'PDF passwords and AES-256 explained' },
  ],
};

const TOOL_GUIDES: Record<string, { href: string; title: string }[]> = {
  'compress-pdf': [
    { href: '/blog/reduce-pdf-size-keep-quality', title: 'Reduce PDF size while keeping text readable' },
    { href: '/blog/why-pdf-compression-limited', title: 'Why some PDFs barely shrink' },
  ],
  'pdf-to-word': [
    { href: '/blog/pdf-vs-docx', title: 'PDF vs DOCX: when to use each format' },
    { href: '/blog/scanned-pdf-to-word', title: 'Convert scanned PDFs to editable Word text' },
  ],
  'scanned-pdf-to-word': [
    { href: '/blog/scanned-pdf-to-word', title: 'Convert scanned PDFs to editable Word text' },
    { href: '/blog/how-ocr-works', title: 'How OCR works on scans' },
  ],
  'scanned-pdf-to-text': [
    { href: '/blog/how-ocr-works', title: 'How OCR works on scans' },
    { href: '/blog/improve-ocr-indian-languages', title: 'Improve OCR for Indian-language scans' },
  ],
  'image-to-text': [
    { href: '/blog/how-ocr-works', title: 'How OCR works on images' },
    { href: '/blog/improve-ocr-indian-languages', title: 'Improve OCR for Indian-language scans' },
  ],
  'jpg-to-pdf': [
    { href: '/blog/image-to-pdf-jpg-vs-png', title: 'Image to PDF: JPG vs PNG' },
  ],
  'png-to-pdf': [
    { href: '/blog/image-to-pdf-jpg-vs-png', title: 'Image to PDF: JPG vs PNG' },
  ],
  'scanned-pdf-to-searchable-pdf': [
    { href: '/blog/pdf-accessibility-basics', title: 'PDF accessibility basics' },
    { href: '/blog/how-ocr-works', title: 'How OCR works on scans' },
  ],
};

function keywordSet(tool: ServiceTool): Set<string> {
  return new Set([tool.tag, tool.cat, ...tool.keywords].map((item) => item.toLowerCase()));
}

export function getRelatedTools(toolId: string, limit = 6): ServiceTool[] {
  const current = BUILD_PUBLIC_TOOLS.find((tool) => tool.id === toolId);
  if (!current) return [];
  const currentKeywords = keywordSet(current);
  const category = getPublicToolCategory(current);

  return BUILD_PUBLIC_TOOLS
    .filter((tool) => tool.id !== toolId)
    .map((tool) => {
      const shared = [...keywordSet(tool)].filter((keyword) => currentKeywords.has(keyword)).length;
      const categoryScore = getPublicToolCategory(tool) === category ? 4 : 0;
      const tagScore = tool.tag === current.tag ? 3 : 0;
      const conversionPair = current.id.includes('-to-') && tool.id.includes('-to-') ? 2 : 0;
      const popularScore = tool.badge === 'Popular' ? 1 : 0;
      return { tool, score: shared + categoryScore + tagScore + conversionPair + popularScore };
    })
    .sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name))
    .slice(0, limit)
    .map(({ tool }) => tool);
}

export function getRelatedGuides(tool: ServiceTool) {
  const specific = TOOL_GUIDES[tool.id] ?? [];
  const category = GUIDE_MAP[getPublicToolCategory(tool)] ?? GUIDE_MAP.pdf;
  const combined = [...specific, ...category];
  return combined.filter((guide, index) => combined.findIndex((candidate) => candidate.href === guide.href) === index).slice(0, 3);
}
