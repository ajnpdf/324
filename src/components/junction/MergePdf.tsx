"use client";

import {
  ChangeEvent,
  DragEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type PdfItem = {
  id: string;
  file: File;
};

type ResultFile = {
  url: string;
  name: string;
  bytes: number;
};

const MAX_FILE_BYTES = 75 * 1024 * 1024;
const MAX_TOTAL_BYTES = 150 * 1024 * 1024;
const MAX_FILES = 20;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(value >= 10 ? 1 : 2)} ${units[index]}`;
}

async function hasPdfHeader(file: File): Promise<boolean> {
  const first = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  return (
    first.length >= 5 &&
    first[0] === 0x25 &&
    first[1] === 0x50 &&
    first[2] === 0x44 &&
    first[3] === 0x46 &&
    first[4] === 0x2d
  );
}

function normalizeOutputName(value: string): string {
  const trimmed = value.trim() || "merged.pdf";
  return trimmed.toLowerCase().endsWith(".pdf") ? trimmed : `${trimmed}.pdf`;
}

export function MergePdf() {
  const inputRef = useRef<HTMLInputElement>(null);
  const idCounter = useRef(0);
  const cancelRequested = useRef(false);

  const [items, setItems] = useState<PdfItem[]>([]);
  const [outputName, setOutputName] = useState("merged.pdf");
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("Add two or more PDF files to begin.");
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ResultFile | null>(null);

  const totalBytes = useMemo(
    () => items.reduce((sum, item) => sum + item.file.size, 0),
    [items]
  );

  useEffect(() => {
    return () => {
      if (result?.url) URL.revokeObjectURL(result.url);
    };
  }, [result]);

  function clearResult() {
    setResult((current) => {
      if (current?.url) URL.revokeObjectURL(current.url);
      return null;
    });
  }

  async function addFiles(files: File[]) {
    setError("");
    clearResult();

    if (files.length === 0) return;

    const availableSlots = Math.max(0, MAX_FILES - items.length);
    const selected = files.slice(0, availableSlots);

    if (files.length > availableSlots) {
      setError(`You can merge up to ${MAX_FILES} PDFs in one browser job.`);
      return;
    }

    const next: PdfItem[] = [];
    let addedBytes = 0;

    for (const file of selected) {
      if (file.size <= 0) {
        setError(`${file.name}: empty files cannot be merged.`);
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        setError(`${file.name}: file exceeds the 75 MB browser limit.`);
        return;
      }

      const extensionOk = file.name.toLowerCase().endsWith(".pdf");
      const headerOk = await hasPdfHeader(file);
      if (!extensionOk || !headerOk) {
        setError(`${file.name}: choose a readable PDF file.`);
        return;
      }

      addedBytes += file.size;
      next.push({
        id: `${file.name}-${file.size}-${file.lastModified}-${idCounter.current++}`,
        file,
      });
    }

    if (totalBytes + addedBytes > MAX_TOTAL_BYTES) {
      setError("Selected files exceed the 150 MB total browser-job limit.");
      return;
    }

    setItems((current) => [...current, ...next]);
    setStage("Arrange the PDFs in the order you want, then merge.");
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    void addFiles(files);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files ?? []);
    void addFiles(files);
  }

  function move(index: number, direction: -1 | 1) {
    setItems((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const copy = [...current];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
    clearResult();
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
    clearResult();
  }

  function reset() {
    cancelRequested.current = false;
    clearResult();
    setItems([]);
    setError("");
    setProgress(null);
    setStage("Add two or more PDF files to begin.");
    setOutputName("merged.pdf");
  }

  function cancel() {
    if (!busy) return;
    cancelRequested.current = true;
    setStage("Cancellingâ€¦");
  }

  async function mergePdfs() {
    if (busy) return;

    setError("");
    clearResult();

    if (items.length < 2) {
      setError("Add at least two PDF files to merge.");
      return;
    }

    if (totalBytes > MAX_TOTAL_BYTES) {
      setError("Selected files exceed the 150 MB total browser-job limit.");
      return;
    }

    setBusy(true);
    setProgress(0);
    setStage("Preparing browser-local mergeâ€¦");
    cancelRequested.current = false;

    try {
      // Deliberately load pdf-lib only after the user starts the browser-local
      // job. This avoids browser runtime/module-evaluation failures during the
      // initial page render and keeps the public tool route stable.
      const { PDFDocument } = await import("pdf-lib");
      const merged = await PDFDocument.create();

      for (let index = 0; index < items.length; index += 1) {
        if (cancelRequested.current) {
          throw new DOMException("Merge cancelled by the user.", "AbortError");
        }

        const item = items[index];
        setStage(`Reading ${item.file.name}â€¦`);
        setProgress(Math.round((index / items.length) * 80));

        const sourceBytes = await item.file.arrayBuffer();
        const source = await PDFDocument.load(sourceBytes, {
          ignoreEncryption: false,
          updateMetadata: false,
        });

        const pageIndices = source.getPageIndices();
        const copiedPages = await merged.copyPages(source, pageIndices);
        for (const page of copiedPages) merged.addPage(page);

        setProgress(Math.round(((index + 1) / items.length) * 80));
      }

      if (cancelRequested.current) {
        throw new DOMException("Merge cancelled by the user.", "AbortError");
      }

      setStage("Writing merged PDFâ€¦");
      setProgress(90);

      merged.setProducer("AJN PDF");
      merged.setCreator("AJN PDF");
      const saved = await merged.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 50,
      });

      // Create a concrete ArrayBuffer so Blob does not receive an
      // ArrayBufferLike/SharedArrayBuffer-compatible view.
      const buffer = new ArrayBuffer(saved.byteLength);
      new Uint8Array(buffer).set(saved);

      const blob = new Blob([buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const name = normalizeOutputName(outputName);

      setResult({ url, name, bytes: blob.size });
      setProgress(100);
      setStage(`Merged ${items.length} PDFs successfully.`);
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") {
        setStage("Merge cancelled.");
        setError("");
      } else {
        const message =
          caught instanceof Error ? caught.message : "Unable to merge these PDFs.";
        setError(
          message.toLowerCase().includes("encrypted")
            ? "One of the PDFs is password-protected. Unlock it first, then merge again."
            : `Merge failed: ${message}`
        );
        setStage("Merge could not be completed.");
      }
      setProgress(null);
    } finally {
      setBusy(false);
      cancelRequested.current = false;
    }
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-4 md:py-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:p-8">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="break-words text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              Merge PDF
            </h2>
            <p className="mt-2 max-w-2xl break-words text-sm leading-6 text-slate-600 sm:text-base">
              Combine PDF files in the order you choose. This merge runs in your browser.
            </p>
          </div>
          <div className="shrink-0 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
            Browser-local
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/60 p-3 text-sm text-slate-700">
          <strong>Limits:</strong> up to {MAX_FILES} PDFs, 75 MB per file and 150 MB total for this browser job.
        </div>

        <div
          className="mt-5 flex min-h-44 w-full min-w-0 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-7 text-center"
          onDragOver={(event) => event.preventDefault()}
          onDrop={onDrop}
        >
          <input
            ref={inputRef}
            className="sr-only"
            type="file"
            accept=".pdf,application/pdf"
            multiple
            onChange={onInputChange}
          />
          <p className="break-words text-base font-bold text-slate-900">
            Drop PDF files here
          </p>
          <p className="mt-1 text-sm text-slate-500">
            or choose files from your device
          </p>
          <button
            type="button"
            className="mt-4 min-h-11 max-w-full rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => inputRef.current?.click()}
            disabled={busy || items.length >= MAX_FILES}
          >
            {items.length > 0 ? "Add more PDFs" : "Choose PDFs"}
          </button>
        </div>

        {items.length > 0 && (
          <div className="mt-6">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-bold text-slate-900">
                {items.length} PDF{items.length === 1 ? "" : "s"} Â· {formatBytes(totalBytes)}
              </p>
              <button
                type="button"
                className="text-sm font-semibold text-slate-600 hover:text-slate-950"
                onClick={reset}
                disabled={busy}
              >
                Clear all
              </button>
            </div>

            <ol className="mt-3 space-y-2">
              {items.map((item, index) => (
                <li
                  key={item.id}
                  className="flex min-w-0 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <p className="break-all text-sm font-bold text-slate-900">
                      {index + 1}. {item.file.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatBytes(item.file.size)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="min-h-10 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 disabled:opacity-40"
                      onClick={() => move(index, -1)}
                      disabled={busy || index === 0}
                      aria-label={`Move ${item.file.name} up`}
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      className="min-h-10 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 disabled:opacity-40"
                      onClick={() => move(index, 1)}
                      disabled={busy || index === items.length - 1}
                      aria-label={`Move ${item.file.name} down`}
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      className="min-h-10 rounded-lg border border-red-200 px-3 text-sm font-semibold text-red-700 disabled:opacity-40"
                      onClick={() => removeItem(item.id)}
                      disabled={busy}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="mt-6 grid min-w-0 gap-2">
          <label htmlFor="ajn-merge-output" className="text-sm font-bold text-slate-900">
            Output filename
          </label>
          <input
            id="ajn-merge-output"
            value={outputName}
            onChange={(event) => setOutputName(event.target.value)}
            disabled={busy}
            className="min-h-11 w-full min-w-0 rounded-xl border border-slate-300 px-3 text-sm outline-none ring-blue-200 focus:ring-2"
            placeholder="merged.pdf"
          />
        </div>

        {error && (
          <div
            role="alert"
            className="mt-5 break-words rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800"
          >
            {error}
          </div>
        )}

        <div className="mt-5" aria-live="polite">
          <p className="break-words text-sm font-medium text-slate-600">{stage}</p>
          {progress !== null && (
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-[width] duration-200"
                style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
              />
            </div>
          )}
        </div>

        <div className="mt-6 flex min-w-0 flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => void mergePdfs()}
            disabled={busy || items.length < 2}
            className="min-h-12 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
          >
            {busy ? "Merging PDFsâ€¦" : `Merge PDFs`}
          </button>

          {busy && (
            <button
              type="button"
              onClick={cancel}
              className="min-h-12 w-full rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 sm:w-auto"
            >
              Cancel
            </button>
          )}

          {!busy && items.length > 0 && (
            <button
              type="button"
              onClick={reset}
              className="min-h-12 w-full rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 sm:w-auto"
            >
              Reset
            </button>
          )}
        </div>

        {result && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="font-black text-emerald-900">Merged PDF ready</p>
            <p className="mt-1 break-all text-sm text-emerald-800">
              {result.name} Â· {formatBytes(result.bytes)}
            </p>
            <a
              href={result.url}
              download={result.name}
              className="mt-4 inline-flex min-h-11 max-w-full items-center justify-center rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-black text-white hover:bg-emerald-800"
            >
              Download PDF
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

export default MergePdf;