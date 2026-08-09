'use client';

/**
 * Legacy compatibility module.
 * Password guessing and browser-side decryption were intentionally removed.
 * Use src/lib/pdf-backend.ts with the optional Python backend instead.
 */
export async function detectPDFSecurity() {
  throw new Error('Security inspection requires the optional AJN PDF Python backend.');
}

export async function unlockWithPassword() {
  throw new Error('Real PDF decryption requires the optional AJN PDF Python backend.');
}

export async function removeRestrictionsOnly() {
  throw new Error('Restriction removal requires the optional AJN PDF Python backend.');
}

export class PasswordAttemptManager {
  canAttempt() { return { allowed: true }; }
  recordAttempt(success: boolean) { return { isLocked: false, attemptsRemaining: success ? 10 : 9 }; }
  reset() {}
}
