import { getPublicToolCategory, type ServiceTool } from './tools-data';
import { BUILD_PUBLIC_TOOLS } from './build-public-tools';

const GUIDE_MAP: Record<string, { href: string; title: string }[]> = {
  conversion: [
    { href: '/blog/browser-native-architecture', title: 'How online conversion processing works' },
    { href: '/blog/best-free-pdf-editor', title: 'How to evaluate an online PDF tool' },
  ],
  image: [
    { href: '/blog/ocr-digital-archiving', title: 'OCR and scanned document preparation' },
    { href: '/blog/browser-native-architecture', title: 'Browser processing and file limits' },
  ],
  pdf: [
    { href: '/blog/how-to-merge-pdfs-online-safely', title: 'How to merge PDFs safely' },
    { href: '/blog/document-security-aes256', title: 'PDF passwords and AES-256 explained' },
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
  return GUIDE_MAP[getPublicToolCategory(tool)] ?? GUIDE_MAP.pdf;
}
