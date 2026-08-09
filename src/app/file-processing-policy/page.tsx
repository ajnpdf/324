import { LegalPageShell } from '@/components/legal/legal-page-shell';

export default function FileProcessingPolicyPage() {
  return (
    <LegalPageShell
      eyebrow="File processing"
      title="File Processing Policy"
      summary="AJN PDF labels production tools as browser processing or temporary server processing so users can understand the workflow before selecting a file."
      sections={[
        {
          title: 'Browser processing',
          bullets: [
            'The selected document is read by JavaScript or WebAssembly in the current browser tab.',
            'AJN PDF does not intentionally send the file to its processing API for a browser-labelled tool.',
            'The browser may use memory, temporary cache or download storage according to browser and operating-system behaviour.',
          ],
        },
        {
          title: 'Temporary server processing',
          bullets: [
            'The file and required options are transmitted over HTTPS to the configured AJN PDF processing service.',
            'The service creates a request-specific temporary directory, performs the requested operation and streams the result back.',
            'The application removes the request directory after the response and runs cleanup for abandoned temporary jobs.',
            'Server-assisted tools include advanced OCR, office and eBook conversions, PDF security operations, repair and format workflows that cannot run reliably in the browser.',
          ],
        },
        {
          title: 'Availability and dependencies',
          paragraphs: [
            'The public catalogue is generated from a deployment capability manifest. A tool that requires an unavailable converter, codec or licensed engine is hidden from public navigation and excluded from the generated sitemap.',
            'Conversion quality depends on the original document, fonts, images, page structure and destination format. Reconstructed office documents may not preserve every layout detail.',
          ],
        },
        {
          title: 'Configured limits',
          paragraphs: [
            'The default local setup accepts up to 75 MB per file and 150 MB across one request, with a five-minute processing timeout. A production operator may apply stricter limits according to infrastructure capacity and abuse protection.',
            'Complex, damaged, encrypted or unusually large documents may fail or time out. AJN PDF displays a clear error or unavailable state rather than returning a fake result.',
          ],
        },
        {
          title: 'Passwords, OCR text and logs',
          bullets: [
            'PDF passwords are used only for the active request and must not be written to application analytics or request logs.',
            'Extracted OCR text and document contents are not stored in the anonymous analytics database.',
            'Operational logs contain request identifiers, route, status and duration—not uploaded filenames or document contents.',
          ],
        },
      ]}
    />
  );
}
