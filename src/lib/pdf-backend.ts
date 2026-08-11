const RAW_BACKEND_URL = (process.env.NEXT_PUBLIC_PDF_BACKEND_URL || '').trim();
export const PDF_BACKEND_URL = RAW_BACKEND_URL.replace(/\/$/, '');
export const isPdfBackendConfigured = Boolean(PDF_BACKEND_URL);

export class PdfBackendError extends Error {
  code: string;
  status?: number;
  requestId?: string;

  constructor(message: string, code = 'REQUEST_FAILED', status?: number, requestId?: string) {
    super(message);
    this.name = 'PdfBackendError';
    this.code = code;
    this.status = status;
    this.requestId = requestId || undefined;
  }
}

export function getPdfBackendErrorCode(error: unknown): string | null {
  return error instanceof PdfBackendError ? error.code : null;
}

export function getPdfBackendErrorRequestId(error: unknown): string | null {
  return error instanceof PdfBackendError ? error.requestId || null : null;
}


export type PdfBackendHealth = {
  status: 'online' | 'offline' | 'not-configured';
  message: string;
  messageKey: string;
  service?: string;
  version?: string;
};

export async function checkPdfBackendHealth(signal?: AbortSignal): Promise<PdfBackendHealth> {
  if (!isPdfBackendConfigured) {
    return {
      status: 'not-configured',
      message: 'Processing service URL is not configured.',
      messageKey: 'backend.notConfigured',
    };
  }

  try {
    const response = await fetch(`${PDF_BACKEND_URL}/ready`, {
      method: 'GET',
      cache: 'no-store',
      signal,
    });
    if (!response.ok) {
      return { status: 'offline', message: `Processing service returned HTTP ${response.status}.`, messageKey: 'backend.offline' };
    }
    const payload = await response.json().catch(() => ({}));
    if (payload?.status !== 'ok') {
      return { status: 'offline', message: 'Processing service returned an unhealthy response.', messageKey: 'backend.offline' };
    }
    return {
      status: 'online',
      message: 'Processing service is ready for file processing.',
      messageKey: 'backend.ready',
      service: payload.service,
      version: payload.version,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { status: 'offline', message: 'Processing service health check timed out.', messageKey: 'backend.offline' };
    }
    return { status: 'offline', message: 'Processing service is temporarily unavailable.', messageKey: 'backend.offline' };
  }
}

async function postPdf(path: string, form: FormData): Promise<Blob> {
  if (!isPdfBackendConfigured) {
    throw new PdfBackendError('Processing service is not configured.', 'SERVICE_UNAVAILABLE');
  }
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 295_000);
  try {
    const response = await fetch(`${PDF_BACKEND_URL}${path}`, {
      method: 'POST',
      body: form,
      signal: controller.signal,
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new PdfBackendError(payload.error || `Processing failed with status ${response.status}.`, payload.code || 'PROCESSING_FAILED', response.status, response.headers.get('x-request-id') || payload.request_id);
    }
    return await response.blob();
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new PdfBackendError('Processing timed out.', 'TIMEOUT');
    }
    if (error instanceof TypeError) {
      throw new PdfBackendError('Processing service is temporarily unavailable.', 'SERVICE_UNAVAILABLE');
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function protectPdfOnServer(args: {
  file: File;
  userPassword: string;
  ownerPassword?: string;
  outputName: string;
  allowPrinting: boolean;
  allowCopying: boolean;
  allowEditing: boolean;
  allowAnnotations: boolean;
  allowFormFilling: boolean;
}): Promise<Blob> {
  const form = new FormData();
  form.set('file', args.file);
  form.set('user_password', args.userPassword);
  form.set('owner_password', args.ownerPassword || '');
  form.set('output_name', args.outputName);
  form.set('allow_printing', String(args.allowPrinting));
  form.set('allow_copying', String(args.allowCopying));
  form.set('allow_editing', String(args.allowEditing));
  form.set('allow_annotations', String(args.allowAnnotations));
  form.set('allow_form_filling', String(args.allowFormFilling));
  return postPdf('/api/pdf/protect', form);
}

export async function unlockPdfOnServer(args: {
  file: File;
  password: string;
  authorized: boolean;
  outputName: string;
}): Promise<Blob> {
  const form = new FormData();
  form.set('file', args.file);
  form.set('password', args.password);
  form.set('authorized', String(args.authorized));
  form.set('output_name', args.outputName);
  return postPdf('/api/pdf/unlock', form);
}

export async function repairPdfOnServer(file: File, outputName: string): Promise<Blob> {
  const form = new FormData();
  form.set('file', file);
  form.set('output_name', outputName);
  return postPdf('/api/pdf/repair', form);
}

export type ConversionToolManifest = {
  id: string;
  name: string;
  category: string;
  inputExtensions: string[];
  outputExtension: string;
  available: boolean;
  unavailableReason?: string | null;
  limitation?: string | null;
  multiFile: boolean;
  ocrLanguages?: string[];
};

export async function getConversionToolManifest(signal?: AbortSignal): Promise<ConversionToolManifest[]> {
  if (!isPdfBackendConfigured) return [];
  try {
    const response = await fetch(`${PDF_BACKEND_URL}/api/tools`, { cache: 'no-store', signal });
    if (!response.ok) return [];
    const payload = await response.json();
    return Array.isArray(payload?.tools) ? payload.tools : [];
  } catch {
    return [];
  }
}

export async function convertOnServer(args: {
  toolId: string;
  files: File[];
  outputName: string;
  sourceUrl?: string;
  options?: Record<string, unknown>;
}): Promise<{ blob: Blob; filename: string }> {
  if (!isPdfBackendConfigured) {
    throw new PdfBackendError('The conversion service is not configured.', 'SERVICE_UNAVAILABLE');
  }
  const form = new FormData();
  for (const file of args.files) form.append('files', file);
  form.set('output_name', args.outputName);
  form.set('source_url', args.sourceUrl || '');
  form.set('options_json', JSON.stringify(args.options || {}));

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 295_000);
  try {
    const response = await fetch(`${PDF_BACKEND_URL}/api/convert/${encodeURIComponent(args.toolId)}`, {
      method: 'POST',
      body: form,
      signal: controller.signal,
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new PdfBackendError(payload.error || `Conversion failed with status ${response.status}.`, payload.code || 'PROCESSING_FAILED', response.status, response.headers.get('x-request-id') || payload.request_id);
    }
    const disposition = response.headers.get('content-disposition') || '';
    const utfMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
    const plainMatch = disposition.match(/filename="?([^";]+)"?/i);
    const filename = decodeURIComponent(utfMatch?.[1] || plainMatch?.[1] || `${args.toolId}-result`);
    return { blob: await response.blob(), filename };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new PdfBackendError('The conversion timed out.', 'TIMEOUT');
    }
    if (error instanceof TypeError) {
      throw new PdfBackendError('The conversion service is temporarily unavailable.', 'SERVICE_UNAVAILABLE');
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}
