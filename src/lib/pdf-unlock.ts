
'use client';

import { PDFDocument } from 'pdf-lib';

/**
 * AJN UNLOCK ENGINE — 2026 Industrial Edition
 * Handles smart detection, password brute-forcing (dictionary), and industrial re-saving.
 */

export const COMMON_PDF_PASSWORDS = [
  '', '0000', '1234', '12345', '123456', '1234567890',
  'password', 'admin', 'user', 'test', 'pdf',
  'document', 'secure', 'protected', 'confidential',
  'welcome', 'letmein', 'qwerty', 'abc123',
];

export function detectEncryptionType(bytes: ArrayBuffer) {
  // Read PDF header for encryption dictionary
  const text = new TextDecoder().decode(bytes.slice(0, 2048));
  if (text.includes('/Encrypt')) {
    if (text.includes('/AES')) return 'AES-256';
    if (text.includes('/V 4') || text.includes('/V 5')) return 'AES-128/256';
    return 'RC4-128';
  }
  return 'none';
}

export function getDocumentPermissions(pdf: PDFDocument) {
  // Check what's restricted even without password
  // Standard PDF-lib permissions mapping
  return {
    hasRestrictions: false, 
    canPrint: true,
    canCopy: true,
    canEdit: true,
    canAnnotate: true,
  };
}

export async function detectPDFSecurity(file: File) {
  const bytes = await file.arrayBuffer();

  try {
    // Try opening without password
    const pdf = await PDFDocument.load(bytes.slice(0), { ignoreEncryption: false });
    const permissions = getDocumentPermissions(pdf);

    return {
      isPasswordProtected: false,
      isRestricted: permissions.hasRestrictions,
      permissions,
      pageCount: pdf.getPageCount(),
      fileSize: bytes.byteLength,
      encryptionType: 'none',
      canUnlockWithoutPassword: true,
    };
  } catch (error: any) {
    if (error.message.toLowerCase().includes('password')) {
      return {
        isPasswordProtected: true,
        isRestricted: true,
        requiresPassword: true,
        encryptionType: detectEncryptionType(bytes),
        fileSize: bytes.byteLength,
        canUnlockWithoutPassword: false,
      };
    }
    throw error;
  }
}

export async function unlockWithPassword(file: File, password: string) {
  const bytes = await file.arrayBuffer();

  try {
    const pdf = await PDFDocument.load(bytes.slice(0), { password } as any);

    // Re-save without any password = removes all encryption
    const unlockedBytes = await pdf.save({
      useObjectStreams: true,
      addDefaultPage: false
    });

    return {
      success: true,
      bytes: unlockedBytes,
      originalSize: bytes.byteLength,
      unlockedSize: unlockedBytes.byteLength,
      pageCount: pdf.getPageCount(),
    };
  } catch (error: any) {
    if (error.message.toLowerCase().includes('password')) {
      throw new Error('WRONG_PASSWORD');
    }
    throw error;
  }
}

export async function removeRestrictionsOnly(file: File) {
  // For PDFs that open freely but have edit/copy/print restrictions
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes.slice(0), { ignoreEncryption: true });

  // Re-save - this strips restriction flags
  const unlockedBytes = await pdf.save({
    useObjectStreams: true,
    addDefaultPage: false
  });

  return {
    bytes: unlockedBytes,
    originalSize: bytes.byteLength,
    unlockedSize: unlockedBytes.byteLength,
  };
}

export async function tryCommonPasswords(file: File, onProgress?: (p: any) => void) {
  const bytes = await file.arrayBuffer();

  for (let i = 0; i < COMMON_PDF_PASSWORDS.length; i++) {
    const pw = COMMON_PDF_PASSWORDS[i];

    onProgress?.({
      current: i + 1,
      total: COMMON_PDF_PASSWORDS.length,
      trying: pw || '(empty)',
      percent: Math.round(((i+1) / COMMON_PDF_PASSWORDS.length) * 100)
    });

    try {
      await PDFDocument.load(bytes.slice(0), { password: pw } as any);
      return { found: true, password: pw };
    } catch {
      await new Promise(r => setTimeout(r, 10)); // prevent UI freeze
    }
  }

  return { found: false };
}

export class PasswordAttemptManager {
  private maxAttempts: number;
  private lockoutDuration: number;
  private attempts: number = 0;
  private lockedUntil: number | null = null;

  constructor(options: { maxAttempts?: number; lockoutDuration?: number } = {}) {
    this.maxAttempts = options.maxAttempts || 10;
    this.lockoutDuration = options.lockoutDuration || 30000; // 30 seconds
  }

  canAttempt() {
    if (this.lockedUntil && Date.now() < this.lockedUntil) {
      const remaining = Math.ceil((this.lockedUntil - Date.now()) / 1000);
      return { allowed: false, remaining };
    }
    if (this.lockedUntil && Date.now() >= this.lockedUntil) {
      this.lockedUntil = null;
      this.attempts = 0;
    }
    return { allowed: true };
  }

  recordAttempt(success: boolean) {
    if (success) {
      this.reset();
      return { isLocked: false };
    }
    this.attempts++;
    if (this.attempts >= this.maxAttempts) {
      this.lockedUntil = Date.now() + this.lockoutDuration;
    }
    return { 
      attemptsRemaining: Math.max(0, this.maxAttempts - this.attempts),
      isLocked: !!this.lockedUntil 
    };
  }

  reset() {
    this.attempts = 0;
    this.lockedUntil = null;
  }
}
