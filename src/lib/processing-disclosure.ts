export const PROCESSING_DISCLOSURE = {
  headline: 'Local-first, with secure processing for advanced tools.',
  summary:
    'Many AJN PDF tools process supported files directly in the active browser session. Advanced conversion, OCR, repair and security workflows can use AJN PDF’s configured processing service when the selected tool requires it.',
  browserTitle: 'Browser-native',
  browser:
    'Supported local workflows keep the selected file in the active browser session. Browser memory, document complexity and device capability remain practical limits.',
  serverTitle: 'Server-backed when required',
  server:
    'When a selected workflow requires online processing, AJN PDF sends the selected file and required options only for that active request so the requested result can be produced and returned.',
  storageTitle: 'Processing, not permanent storage',
  storage:
    'AJN PDF is designed as a file-processing service, not a permanent cloud-drive product. Online request workspaces are temporary and are subject to the active backend cleanup policy.',
  limitsTitle: 'Limits shown by the tool',
  limits:
    'The tool interface is the practical source of truth for file and request limits. Online workflows can apply lower live limits reported by the active backend.',
} as const;

export const TRUST_DESTINATIONS = [
  { href: '/limits', label: 'Current limits' },
  { href: '/file-processing-policy', label: 'File processing policy' },
  { href: '/transparency', label: 'Transparency' },
  { href: '/security', label: 'Security practices' },
] as const;
