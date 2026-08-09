import { LegalPageShell } from '@/components/legal/legal-page-shell';

export default function PrivacyPage() {
  return (
    <LegalPageShell
      eyebrow="Privacy"
      title="Privacy Policy"
      summary="This policy explains what AJN PDF processes in the browser, when a file is sent to the optional secure processing service, how advertising consent works, and what information we do not retain."
      sections={[
        {
          title: 'Local and temporary processing',
          paragraphs: [
            'Most AJN PDF tools process documents directly in your browser. For those tools, the selected file remains on your device and is not intentionally uploaded to AJN PDF.',
            'Protect PDF, Unlock PDF, Repair PDF and other clearly labelled server tools may send a file to the configured AJN PDF processing service. Each request uses a temporary working directory. The service is designed to delete the temporary input and output after the response is delivered.',
          ],
        },
        {
          title: 'Information we may receive',
          bullets: [
            'Basic web-server information such as IP address, browser type, requested URL, timestamp and error status may appear in infrastructure logs.',
            'Cookie, analytics and advertising choices may be stored in the browser so the website can respect the selected preference.',
            'We do not require an account for the Phase 1 public tools and do not intentionally collect filenames, passwords or document contents for analytics.',
          ],
        },
        {
          title: 'Passwords and document content',
          paragraphs: [
            'Passwords submitted to Protect PDF or Unlock PDF are used only for the active processing request. The application must not log, store or include passwords in analytics or error messages.',
            'Do not upload confidential material unless you understand whether the selected tool is marked Browser processing or Temporary server processing.',
          ],
        },
        {
          title: 'Analytics, advertising and cookies',
          paragraphs: [
            'After optional consent, AJN PDF may record anonymous page paths, tool-funnel events, aggregate conversion outcomes and Core Web Vitals. The product analytics database excludes uploaded contents, filenames, passwords, extracted OCR text and persisted raw IP addresses.',
            'If a GA4 measurement ID is configured, Google Analytics may receive optional website interaction events. AJN PDF uses Google AdSense on eligible public content pages only after the applicable consent flow. Google and its partners may use cookies or similar technologies according to the user consent configuration and their own policies.',
            'Advertisements are not placed inside upload, processing or download cards. Legal, error and backend-unavailable screens are not intended to display ads.',
          ],
        },
        {
          title: 'Retention and deletion',
          bullets: [
            'Browser-processed files are cleared when the page state is reset, refreshed or closed, subject to normal browser behaviour.',
            'Temporary backend files are scheduled for deletion after the response and abandoned temporary folders are cleaned by the processing service.',
            'Admin-published AJN Discover images and their captions remain in persistent media storage until edited or deleted by the administrator. A user may request removal of correspondence or public media by emailing the address below.',
          ],
        },
        {
          title: 'Children and sensitive information',
          paragraphs: [
            'AJN PDF is a general document utility and is not designed to collect children’s personal information. Users should avoid submitting highly sensitive personal, medical, financial or identity documents to a server-processed tool unless it is necessary and they are authorised to do so.',
          ],
        },
      ]}
    />
  );
}
