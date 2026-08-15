import { LegalPageShell } from '@/components/legal/legal-page-shell';

export default function SecurityPage() {
  return (
    <LegalPageShell
      eyebrow="Security"
      title="Security Practices"
      summary="AJN PDF separates on-device work from temporary online workflows and applies practical safeguards before files are processed."
      sections={[
        {
          title: 'Clear file handling',
          bullets: [
            'Compatible tools work inside the active browser session.',
            'Advanced workflows clearly indicate when the selected file will be uploaded temporarily to complete the requested action.',
            'Tool pages check live availability before accepting files for an online workflow.',
          ],
        },
        {
          title: 'Temporary request safeguards',
          bullets: [
            'Each online request uses an isolated temporary working area.',
            'File type, size and request inputs are validated before processing.',
            'HTTPS, origin restrictions, timeouts and workload limits protect the request path.',
            'Temporary request files are scheduled for cleanup after delivery and abandoned work is cleaned automatically.',
            'PDF passwords are never intended to appear in application logs or analytics.',
          ],
        },
        {
          title: 'User responsibilities',
          paragraphs: ['Use a strong unique password when protecting a PDF, preserve an original copy, and do not process a document on a shared or untrusted computer. Only unlock a file when you know the current password and have permission.'],
        },
        {
          title: 'Responsible disclosure',
          paragraphs: ['Report a reproducible security issue privately to anjanpatel325@gmail.com. Do not access another user’s data, disrupt the service or publish sensitive exploit details before a reasonable remediation period.'],
        },
      ]}
    />
  );
}
