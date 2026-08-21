'use client';

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export type SignatureSource = 'draw' | 'type' | 'upload';

export interface ElectronicSignatureInput {
  signerName: string;
  signerEmail: string;
  reason: string;
  consented: boolean;
  consentText: string;
  signatureSource: SignatureSource;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  includeAuditCaption?: boolean;
}

export interface ElectronicSignatureEvidence {
  version: '1.0';
  evidence_id: string;
  created_at_utc: string;
  product: 'AJN PDF';
  signature_type: 'electronic-signature';
  certificate_signature: false;
  signer: {
    name: string;
    email: string;
  };
  intent: {
    consented: true;
    consent_text: string;
    reason: string;
  };
  document: {
    original_filename: string;
    original_sha256: string;
    signed_content_sha256: string;
    final_pdf_sha256: string;
  };
  signature: {
    source: SignatureSource;
    signature_image_sha256: string;
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
  };
  notice: string;
}

function clean(value: string, maximum: number): string {
  return String(value || '').replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maximum);
}

export async function sha256Hex(input: Blob | ArrayBuffer | Uint8Array): Promise<string> {
  let bytes: ArrayBuffer;
  if (input instanceof Blob) bytes = await input.arrayBuffer();
  else if (input instanceof Uint8Array) bytes = input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength) as ArrayBuffer;
  else bytes = input;
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map(value => value.toString(16).padStart(2, '0')).join('');
}

function dataUrlBytes(dataUrl: string): Uint8Array {
  const match = /^data:image\/png;base64,(.+)$/i.exec(dataUrl);
  if (!match) throw new Error('The signature must be a PNG image.');
  const binary = atob(match[1]);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function evidenceAttachmentPayload(
  evidenceId: string,
  createdAt: string,
  input: ElectronicSignatureInput,
  file: File,
  originalSha256: string,
  signedContentSha256: string,
  signatureImageSha256: string,
) {
  return {
    version: '1.0',
    evidence_id: evidenceId,
    created_at_utc: createdAt,
    product: 'AJN PDF',
    signature_type: 'electronic-signature',
    certificate_signature: false,
    signer: { name: clean(input.signerName, 120), email: clean(input.signerEmail, 180) },
    intent: {
      consented: true,
      consent_text: clean(input.consentText, 500),
      reason: clean(input.reason, 300),
    },
    document: {
      original_filename: clean(file.name, 200),
      original_sha256: originalSha256,
      signed_content_sha256: signedContentSha256,
      final_pdf_sha256: 'See companion evidence manifest generated after the final PDF is serialized.',
    },
    signature: {
      source: input.signatureSource,
      signature_image_sha256: signatureImageSha256,
      page: input.page,
      x: input.x,
      y: input.y,
      width: input.width,
      height: input.height,
    },
    notice: 'AJN PDF electronic-signature evidence. This is not a certificate-backed PAdES digital signature.',
  };
}

export async function createElectronicSignature(
  pdfFile: File,
  signaturePngDataUrl: string,
  input: ElectronicSignatureInput,
): Promise<{ pdfBlob: Blob; evidence: ElectronicSignatureEvidence; evidenceBlob: Blob }> {
  const signerName = clean(input.signerName, 120);
  const signerEmail = clean(input.signerEmail, 180);
  const reason = clean(input.reason, 300);
  const consentText = clean(input.consentText, 500);
  if (!signerName) throw new Error('Enter the signer name.');
  if (!/^\S+@\S+\.\S+$/.test(signerEmail)) throw new Error('Enter a valid signer email address.');
  if (!input.consented) throw new Error('Confirm your intent and consent to sign electronically.');
  if (!consentText) throw new Error('The electronic-signature consent statement is missing.');

  const originalBytes = await pdfFile.arrayBuffer();
  const originalSha256 = await sha256Hex(originalBytes);
  const signatureBytes = dataUrlBytes(signaturePngDataUrl);
  const signatureImageSha256 = await sha256Hex(signatureBytes);
  const createdAt = new Date().toISOString();
  const evidenceId = typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;

  let pdf: PDFDocument;
  try {
    pdf = await PDFDocument.load(originalBytes, { ignoreEncryption: false });
  } catch {
    throw new Error('This PDF is encrypted, password protected, or structurally unreadable. Unlock it first, then sign it.');
  }
  if (pdf.isEncrypted) throw new Error('Encrypted PDFs must be unlocked before electronic signing.');

  const pageIndex = Math.max(0, Math.min(pdf.getPageCount() - 1, Math.round(input.page || 1) - 1));
  const page = pdf.getPage(pageIndex);
  const pageSize = page.getSize();
  const width = Math.max(30, Math.min(pageSize.width, Number(input.width) || 160));
  const height = Math.max(18, Math.min(pageSize.height, Number(input.height) || 80));
  const x = Math.max(0, Math.min(pageSize.width - width, Number(input.x) || 0));
  const y = Math.max(0, Math.min(pageSize.height - height, Number(input.y) || 0));
  const signatureImage = await pdf.embedPng(signatureBytes);
  page.drawImage(signatureImage, { x, y, width, height });

  if (input.includeAuditCaption !== false) {
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const caption = `Electronically signed by ${signerName} • ${createdAt.slice(0, 10)} UTC`;
    const fontSize = 7;
    const captionY = Math.max(3, y - 10);
    page.drawText(caption.slice(0, 160), { x, y: captionY, size: fontSize, font, color: rgb(0.2, 0.24, 0.31) });
  }

  pdf.setProducer('AJN PDF');
  pdf.setCreator('AJN PDF Electronic Signature');
  pdf.setSubject('Electronic signature with AJN PDF evidence manifest');
  pdf.setKeywords(['AJN PDF', 'electronic signature', 'audit evidence', evidenceId]);
  pdf.setModificationDate(new Date(createdAt));

  const signedContentBytes = await pdf.save({ useObjectStreams: true });
  const signedContentSha256 = await sha256Hex(signedContentBytes);
  const attachedEvidence = evidenceAttachmentPayload(
    evidenceId,
    createdAt,
    { ...input, signerName, signerEmail, reason, consentText, page: pageIndex + 1, x, y, width, height },
    pdfFile,
    originalSha256,
    signedContentSha256,
    signatureImageSha256,
  );
  const attachmentBytes = new TextEncoder().encode(JSON.stringify(attachedEvidence, null, 2));
  await pdf.attach(attachmentBytes, 'ajn-signature-evidence.json', {
    mimeType: 'application/json',
    description: 'AJN PDF electronic signature evidence manifest',
    creationDate: new Date(createdAt),
    modificationDate: new Date(createdAt),
  });

  const finalBytes = await pdf.save({ useObjectStreams: true });
  const finalPdfSha256 = await sha256Hex(finalBytes);
  const evidence: ElectronicSignatureEvidence = {
    version: '1.0',
    evidence_id: evidenceId,
    created_at_utc: createdAt,
    product: 'AJN PDF',
    signature_type: 'electronic-signature',
    certificate_signature: false,
    signer: { name: signerName, email: signerEmail },
    intent: { consented: true, consent_text: consentText, reason },
    document: {
      original_filename: clean(pdfFile.name, 200),
      original_sha256: originalSha256,
      signed_content_sha256: signedContentSha256,
      final_pdf_sha256: finalPdfSha256,
    },
    signature: {
      source: input.signatureSource,
      signature_image_sha256: signatureImageSha256,
      page: pageIndex + 1,
      x,
      y,
      width,
      height,
    },
    notice: 'This record documents an AJN PDF electronic signature workflow. It is not a certificate-backed PAdES digital signature.',
  };
  const evidenceBlob = new Blob([JSON.stringify(evidence, null, 2)], { type: 'application/json' });
  const pdfBlob = new Blob([finalBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  return { pdfBlob, evidence, evidenceBlob };
}
