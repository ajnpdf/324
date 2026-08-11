import { LegalPageShell } from '@/components/legal/legal-page-shell';

export default function PrivacyPage() {
  return (
    <LegalPageShell
      eyebrow="Privacy"
      title="Privacy Policy"
      summary="This policy explains how AJN PDF handles files during active workflows, when the processing service is used, how advertising consent works, and what information is not retained."
      sections={[
        {
          title: 'Session and service-assisted processing',
          paragraphs: [
            'Many AJN PDF tools handle supported documents within the active session. For those workflows, the selected file is not intentionally sent to the AJN PDF processing service.',
            'Protect PDF, Unlock PDF, Repair PDF and other service-assisted workflows may send a file to the configured AJN PDF processing service. Each request uses a dedicated working directory that is designed to be cleaned after the response is delivered.',
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
            'Do not use confidential material until you understand the file-handling details shown for the selected workflow.',
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
            'Session-based working files are cleared when the page state is reset, refreshed or closed, subject to normal browser behaviour.',
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
