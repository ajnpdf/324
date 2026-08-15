'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FileOutput, Loader2 } from 'lucide-react';
import { BUILD_PUBLIC_TOOLS } from '@/lib/build-public-tools';
import { checkPdfBackendHealth, convertOnServer, getConversionToolManifest, getPdfBackendErrorCode, type ConversionToolManifest } from '@/lib/pdf-backend';
import { getToolPolicy } from '@/lib/tool-policy';
import { Btn, Done, Drop, Err, F, G2, Info, IS, Pills, Range, ToolWorkspace, type ToolFile, dl } from './_shared';
import { sendAjnAnalytics } from '@/components/analytics/site-analytics';
import { useLanguage } from '@/lib/i18n/language-context';
import { friendlyBackendError } from '@/lib/i18n/backend-errors';

const OCR_IDS = new Set([
  'scanned-pdf-to-text', 'scanned-pdf-to-word', 'scanned-pdf-to-searchable-pdf',
  'image-to-searchable-pdf', 'image-to-text', 'image-to-word', 'handwriting-image-to-text',
]);
const IMAGE_OUTPUT_IDS = new Set([
  'pdf-to-image', 'pdf-to-jpg', 'pdf-to-jpeg', 'pdf-to-png', 'pdf-to-webp',
  'pdf-to-tiff', 'pdf-to-bmp', 'pdf-to-gif', 'pdf-to-svg', 'pdf-to-avif', 'pdf-to-heic',
]);
const SCAN_IDS = new Set(['camera-scan-to-pdf', 'receipt-to-pdf', 'document-scanner-to-pdf']);
function extensionAccept(extensions: string[] | undefined): string {
  if (!extensions?.length) return '*/*';
  return extensions.join(',');
}

export default function ServerConversionTool({ toolId }: { toolId: string }) {
  const { t } = useLanguage();
  const tool = BUILD_PUBLIC_TOOLS.find((item) => item.id === toolId);
  const policy = getToolPolicy(toolId);
  const [manifest, setManifest] = useState<ConversionToolManifest | null>(null);
  const [backendReady, setBackendReady] = useState(false);
  const [availabilityIssue, setAvailabilityIssue] = useState<'service' | 'manifest' | null>(null);
  const [files, setFiles] = useState<ToolFile[]>([]);
  const [sourceUrl, setSourceUrl] = useState('');
  const [outputName, setOutputName] = useState(toolId);
  const [language, setLanguage] = useState('eng');
  const [dpi, setDpi] = useState(150);
  const [quality, setQuality] = useState(90);
  const [grayscale, setGrayscale] = useState(SCAN_IDS.has(toolId));
  const [status, setStatus] = useState<'idle' | 'checking' | 'processing' | 'done'>('checking');
  const [processingStage, setProcessingStage] = useState('processing.preparing');
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);

  const refreshAvailability = useCallback(async (signal?: AbortSignal) => {
    setStatus('checking');
    setAvailabilityIssue(null);
    const [health, tools] = await Promise.all([
      checkPdfBackendHealth(signal),
      getConversionToolManifest(signal),
    ]);
    const nextManifest = tools.find((entry) => entry.id === toolId) || null;
    setBackendReady(health.status === 'online');
    setManifest(nextManifest);
    if (health.status !== 'online') setAvailabilityIssue('service');
    else if (!nextManifest) setAvailabilityIssue('manifest');
    setStatus('idle');
  }, [toolId]);

  useEffect(() => {
    const controller = new AbortController();
    void refreshAvailability(controller.signal);
    return () => controller.abort();
  }, [refreshAvailability]);

  useEffect(() => {
    if (!manifest?.ocrLanguages?.length) return;
    if (!manifest.ocrLanguages.includes(language)) {
      setLanguage(manifest.ocrLanguages.includes('eng') ? 'eng' : manifest.ocrLanguages[0]);
    }
  }, [language, manifest]);

  useEffect(() => {
    setFiles([]);
    setSourceUrl('');
    setOutputName(toolId);
    setResult(null);
    setError('');
    setProcessingStage('processing.preparing');
  }, [toolId]);

  const isUrlTool = toolId === 'url-to-pdf';
  const multiple = manifest?.multiFile ?? policy.maxFiles > 1;
  const accept = extensionAccept(manifest?.inputExtensions);
  const canProcess = Boolean(
    tool &&
    status !== 'processing' &&
    backendReady &&
    manifest?.available === true &&
    (isUrlTool ? /^https?:\/\//i.test(sourceUrl.trim()) : files.length > 0),
  );

  const optionSummary = useMemo(() => {
    const parts: string[] = [];
    if (OCR_IDS.has(toolId)) parts.push(`${t('ocr.language')}: ${language.toUpperCase()}`);
    if (OCR_IDS.has(toolId) || IMAGE_OUTPUT_IDS.has(toolId)) parts.push(`${dpi} DPI`);
    if (IMAGE_OUTPUT_IDS.has(toolId) || toolId.includes('image') || toolId.includes('scan') || toolId.includes('receipt')) parts.push(`${quality}% quality`);
    if (SCAN_IDS.has(toolId)) parts.push(grayscale ? t('conversion.documentCleanup') : t('conversion.colourMode'));
    return parts.join(' • ');
  }, [dpi, grayscale, language, quality, toolId, t]);

  if (!tool) return null;

  const process = async () => {
    setError('');
    setResult(null);
    const latestHealth = await checkPdfBackendHealth();
    if (latestHealth.status !== 'online' || manifest?.available !== true) {
      setBackendReady(false);
      setAvailabilityIssue(latestHealth.status !== 'online' ? 'service' : 'manifest');
      setError(t('errors.SERVICE_UNAVAILABLE'));
      return;
    }
    setStatus('processing');
    setProcessingStage('processing.converting');
    sendAjnAnalytics({ event_name: 'tool_start', path: window.location.pathname, tool_id: toolId });
    try {
      const converted = await convertOnServer({
        toolId,
        files: files.map((item) => item.file),
        outputName: outputName.trim() || toolId,
        sourceUrl: sourceUrl.trim(),
        options: { language, dpi, quality, grayscale },
      });
      setProcessingStage('processing.finishing');
      setResult(converted);
      setStatus('done');
      sendAjnAnalytics({ event_name: 'tool_complete', path: window.location.pathname, tool_id: toolId });
    } catch (cause) {
      setStatus('idle');
      setProcessingStage('processing.preparing');
      if (getPdfBackendErrorCode(cause) === 'CANCELLED') {
        setError('');
        sendAjnAnalytics({ event_name: 'interaction', path: window.location.pathname, tool_id: toolId, element_id: 'processing-cancelled' });
        return;
      }
      setError(friendlyBackendError(t, cause));
      sendAjnAnalytics({ event_name: 'tool_error', path: window.location.pathname, tool_id: toolId });
    } finally {
      // This workflow does not expose truthful per-job percentage progress yet.
    }
  };

  const reset = () => {
    setFiles([]);
    setSourceUrl('');
    setResult(null);
    setError('');
    setProcessingStage('processing.preparing');
    setStatus('idle');
  };

  return (
    <ToolWorkspace
      title={tool.name}
      description={tool.desc}
      accent={tool.cat === 'img' ? '#10B981' : '#2563EB'}
    >
      <div className="space-y-4">
        {status === 'checking' ? (
          <div className="flex min-h-48 items-center justify-center gap-3 text-sm font-bold text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" /> {t('processing.preparing')}
          </div>
        ) : status === 'done' && result ? (
          <Done
            msg={t('result.ready')}
            onDownload={() => dl(result.blob, result.filename)}
            dlLabel={t('common.download')}
            onReset={reset}
            shareFile={{ blob: result.blob, name: result.filename }}
          />
        ) : (
          <>
            {manifest?.available === false && (
              <Info bg="rgba(239,68,68,.08)" col="#991B1B">{manifest.unavailableReason || t('conversion.dependencyMissing')}</Info>
            )}

            {availabilityIssue && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <div className="text-sm font-bold text-red-900">
                  {availabilityIssue === 'service' ? t('errors.SERVICE_UNAVAILABLE') : t('conversion.dependencyMissing')}
                </div>
                <button type="button" onClick={() => void refreshAvailability()} className="mt-3 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-black text-red-800">
                  {t('common.tryAgain')}
                </button>
              </div>
            )}

            {isUrlTool ? (
              <F label={t('conversion.publicUrl')} hint={t('conversion.publicUrlHint')}>
                <input value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://example.com/article" style={IS} inputMode="url" />
              </F>
            ) : (
              <Drop
                files={files}
                onChange={(next) => setFiles(next.slice(0, policy.maxFiles))}
                accept={accept}
                multiple={multiple}
                label={multiple ? t('common.chooseFiles') : t('common.chooseFile')}
                sub={`${manifest?.inputExtensions?.join(', ') || t('conversion.supportedFormats')} • Up to ${policy.maxFileSizeMb} MB each`}
              />
            )}

            <div className="rounded-2xl border border-border bg-muted/45 p-4">
              <G2>
                <F label={t('common.outputName')} hint={t('conversion.outputExtensionHint', { extension: manifest?.outputExtension || '' })}>
                  <input value={outputName} onChange={(event) => setOutputName(event.target.value)} maxLength={100} style={IS} />
                </F>
                {OCR_IDS.has(toolId) ? (
                  <F label={t('ocr.language')} hint={t('tool.recommended')}>
                    <select value={language} onChange={(event) => setLanguage(event.target.value)} style={IS}>
                      {(manifest?.ocrLanguages?.length ? manifest.ocrLanguages : ['eng']).map((code) => (
                        <option key={code} value={code}>{({ eng: t('ocr.english'), hin: t('ocr.hindi'), tel: t('ocr.telugu'), tam: t('ocr.tamil'), kan: t('ocr.kannada'), mal: t('ocr.malayalam') } as Record<string, string>)[code] || code.toUpperCase()}</option>
                      ))}
                    </select>
                  </F>
                ) : (
                  <F label={t('common.output')} hint={t('conversion.formatSelected')}>
                    <div className="flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-3 text-xs font-black text-card-foreground"><FileOutput className="h-4 w-4 text-blue-600" />{manifest?.outputExtension || t('conversion.resultFile')}</div>
                  </F>
                )}
              </G2>

              {(OCR_IDS.has(toolId) || IMAGE_OUTPUT_IDS.has(toolId)) && (
                <div className="mt-4"><Range label={t('conversion.resolution')} min={72} max={400} step={10} value={dpi} onChange={setDpi} fmt={(value) => `${value} DPI`} /></div>
              )}
              {(IMAGE_OUTPUT_IDS.has(toolId) || tool.cat === 'img') && (
                <div className="mt-4"><Range label={t('common.quality')} min={45} max={100} step={5} value={quality} onChange={setQuality} fmt={(value) => `${value}%`} /></div>
              )}
              {SCAN_IDS.has(toolId) && (
                <div className="mt-4">
                  <F label={t('common.appearance')}>
                    <Pills opts={[{ label: t('conversion.documentCleanup'), value: 'clean' }, { label: t('conversion.colourMode'), value: 'colour' }]} val={grayscale ? 'clean' : 'colour'} onChange={(value) => setGrayscale(value === 'clean')} />
                  </F>
                </div>
              )}
            </div>

            {optionSummary && <Info>{optionSummary}</Info>}
            {(manifest?.limitation || policy.limitation) && <Info bg="rgba(245,158,11,.09)" col="#92400E">{manifest?.limitation || policy.limitation}</Info>}
            <Err msg={error} />

            {status === 'processing' && <div className="sr-only" role="status" aria-live="polite">{t(processingStage)}</div>}

            <Btn full onClick={process} disabled={!canProcess || status === 'processing'} loading={status === 'processing'}>
              <FileOutput size={16} /> {t('processing.converting')}
            </Btn>

          </>
        )}
      </div>
    </ToolWorkspace>
  );
}
