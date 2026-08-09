'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Download, FileOutput, Loader2, RefreshCcw, ShieldCheck } from 'lucide-react';
import { BUILD_PUBLIC_TOOLS } from '@/lib/build-public-tools';
import { checkPdfBackendHealth, convertOnServer, getConversionToolManifest, type ConversionToolManifest } from '@/lib/pdf-backend';
import { getToolPolicy } from '@/lib/tool-policy';
import { Btn, Drop, Err, F, G2, Info, IS, Pills, Range, ToolWorkspace, type ToolFile, dl } from './_shared';
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
    setProcessingStage('processing.uploading');
    sendAjnAnalytics({ event_name: 'tool_start', path: window.location.pathname, tool_id: toolId });
    window.setTimeout(() => setProcessingStage('processing.converting'), 150);
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
      setError(friendlyBackendError(t, cause));
      sendAjnAnalytics({ event_name: 'tool_error', path: window.location.pathname, tool_id: toolId });
    } finally {
      // Server endpoint does not expose truthful per-job percentage progress yet.
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
      icon="⇄"
      accent={tool.cat === 'img' ? '#10B981' : '#2563EB'}
      badge={tool.cat === 'img' ? t('conversion.imageConversion') : OCR_IDS.has(toolId) ? t('conversion.ocrConversion') : t('conversion.documentConversion')}
      processingMode="temporary-server"
    >
      <div className="space-y-4">
        {status === 'checking' ? (
          <div className="flex min-h-48 items-center justify-center gap-3 text-sm font-bold text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" /> {t('processing.preparing')}
          </div>
        ) : status === 'done' && result ? (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-400/20 dark:bg-emerald-500/10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg"><CheckCircle2 className="h-7 w-7" /></div>
            <h2 className="mt-4 text-xl font-black text-foreground">{t('result.ready')}</h2>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">{result.filename}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Btn onClick={() => dl(result.blob, result.filename)}><Download size={15} /> {t('common.download')}</Btn>
              <Btn variant="secondary" onClick={reset}><RefreshCcw size={14} /> {t('common.processAnother')}</Btn>
            </div>
          </div>
        ) : (
          <>
            {manifest?.available === false && (
              <Info bg="rgba(239,68,68,.08)" col="#991B1B">{manifest.unavailableReason || t('conversion.dependencyMissing')}</Info>
            )}

            {availabilityIssue && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-400/20 dark:bg-red-500/10">
                <div className="text-sm font-bold text-red-900 dark:text-red-200">
                  {availabilityIssue === 'service' ? t('errors.SERVICE_UNAVAILABLE') : t('conversion.dependencyMissing')}
                </div>
                <button type="button" onClick={() => void refreshAvailability()} className="mt-3 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-black text-red-800 dark:border-red-400/20 dark:bg-red-950/40 dark:text-red-200">
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

            {status === 'processing' && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-400/20 dark:bg-blue-500/10" role="status" aria-live="polite">
                <div className="flex items-center gap-3 text-sm font-extrabold text-blue-900 dark:text-blue-200"><Loader2 className="h-5 w-5 animate-spin" /><span>{t(processingStage)}</span></div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-100 dark:bg-blue-950"><div className="h-full w-1/3 animate-[pulse_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-blue-600 via-emerald-500 to-red-500" /></div>
              </div>
            )}

            <Btn full onClick={process} disabled={!canProcess || status === 'processing'} loading={status === 'processing'}>
              <FileOutput size={16} /> {t('processing.converting')}
            </Btn>

            <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-xs font-semibold leading-5 text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" /> {t('conversion.temporaryPrivacy')}
            </div>
          </>
        )}
      </div>
    </ToolWorkspace>
  );
}
