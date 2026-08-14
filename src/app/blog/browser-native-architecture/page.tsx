import { GuideArticle } from '@/components/blog/guide-article';
import { guideMetadata } from '@/lib/guide-metadata';

export const metadata = guideMetadata('browser-native-architecture', 'How browser-based PDF processing works', 'Browser workflows can process selected files with JavaScript and WebAssembly inside the active tab, while advanced formats may still require a clearly labelled server engine.');

export default function BrowserArchitectureGuide() {
  return <GuideArticle
    slug="browser-native-architecture"
    eyebrow="Architecture guide"
    title="How browser-based PDF processing works"
    summary="Browser workflows can process selected files with JavaScript and WebAssembly inside the active tab, while advanced formats may still require a clearly labelled server engine."
    readTime="6 minute guide"
    sections={[
      { title: 'What browser processing means', paragraphs: ['A browser tool reads the selected file through browser APIs and performs its operation in the active session. AJN PDF uses this model for workflows such as merging, splitting, rotating and selected image operations.', 'The browser may use memory, workers and temporary object URLs. Closing or resetting the workspace releases application references, although operating-system memory management remains outside the website’s control.'] },
      { title: 'Why some tools need a server', paragraphs: ['OCR language engines, Office conversion, eBook conversion and some PDF security operations depend on native libraries or command-line applications that browsers do not provide consistently.', 'AJN PDF labels those workflows as server-assisted. The Python service validates inputs, uses a request-specific temporary directory and cleans the request workspace after completion or failure.'], bullets: ['Tesseract for scanned-document OCR', 'LibreOffice for Office and OpenDocument conversion', 'Calibre for supported eBook conversion', 'pikepdf and PyMuPDF for selected PDF operations'] },
      { title: 'Practical browser limits', paragraphs: ['Large PDFs and high-resolution images can use significant memory. Browser extensions, low-memory mobile devices and inactive-tab throttling can also affect processing.', 'A professional interface should show file limits, prevent repeated submission and explain when a smaller batch is safer.'] },
      { title: 'How AJN PDF exposes availability', paragraphs: ['The deployment exports a capability manifest from the Python backend before the frontend build. Tools missing a required native dependency are excluded from public navigation and indexing.', 'This avoids treating a registered route as proof that a conversion engine is actually available.'] },
    ]}
    checklist={['Read the processing label before selecting files', 'Use smaller batches on low-memory devices', 'Keep server-assisted tools behind HTTPS', 'Hide dependency-missing tools from public indexing']}
    relatedTools={[
      { href: '/pdf-tools', title: 'All public tools', description: 'Search the current deployment catalogue.' },
      { href: '/transparency', title: 'Processing transparency', description: 'Compare browser and server-assisted workflows.' },
      { href: '/file-processing-policy', title: 'File processing policy', description: 'Review limits, cleanup and documented constraints.' },
    ]}
  />;
}
