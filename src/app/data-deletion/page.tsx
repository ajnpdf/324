import { LegalPageShell } from '@/components/legal/legal-page-shell';

export default function DataDeletionPage() {
  return (
    <LegalPageShell
      eyebrow="Data rights"
      title="Data Deletion Requests"
      summary="AJN PDF does not operate a user document library in Phase 1. This page explains what can be deleted and how to request removal of information you directly provided."
      sections={[
        {
          title: 'Files processed in the browser',
          paragraphs: ['AJN PDF does not have a server copy to delete. Reset or close the tool page and remove the downloaded file through your own device if desired.'],
        },
        {
          title: 'Files processed temporarily',
          paragraphs: ['The processing service is designed to remove temporary input and output files after delivery. If a processing request fails, abandoned temporary folders are subject to automatic cleanup.'],
        },
        {
          title: 'Correspondence and support data',
          paragraphs: ['Email anjanpatel325@gmail.com from the same address used to contact us and describe the information you want removed. We may retain limited records when required for security, fraud prevention, legal obligations or dispute resolution.'],
        },
        {
          title: 'Browser preferences',
          paragraphs: ['Cookie and interface choices can be cleared using the privacy controls or the browser’s site-data settings.'],
        },
      ]}
    />
  );
}
