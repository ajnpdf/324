import { LegalPageShell } from '@/components/legal/legal-page-shell';

export default function SecurityPage() {
  return (
    <LegalPageShell
      eyebrow="Security"
      title="Security Practices"
      summary="AJN PDF uses a local-first architecture for compatible tools and a separate temporary processing service for operations that require a native PDF engine."
      sections={[
        {
          title: 'Processing separation',
          bullets: [
            'Some workflows can process files on your device. When a secure processing service is required, AJN PDF identifies that workflow in its file-processing information.',
            'Protect, Unlock and Repair use a clearly labelled temporary server workflow when the secure processing service is online.',
            'Tool pages display their processing mode and backend availability before processing begins.',
          ],
        },
        {
          title: 'Temporary backend controls',
          bullets: [
            'Unique temporary working directory for each request.',
            'PDF signature, file-size and input validation.',
            'Restricted CORS origins and processing timeouts.',
            'Automatic cleanup after file delivery and cleanup of abandoned temporary data.',
            'Passwords are not included in application logs.',
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
