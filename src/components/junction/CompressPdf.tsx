"use client";

import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { ToolWorkspace, Drop, Btn, Done, Err, F, G2, IS, Info, Pills, ToolFile, dl, fmtBytes, withProcessingActivity, updateToolProcessing } from "./_shared";
import { initPdfWorker } from "@/lib/pdfjs-worker";
import { safeOutputName, validateFiles } from "@/lib/file-validation";

type Level = "quality" | "balanced" | "strong";
const SETTINGS: Record<Level, { scale: number; quality: number; label: string }> = {
  quality: { scale: 1.35, quality: 0.88, label: "Higher quality" },
  balanced: { scale: 1, quality: 0.72, label: "Balanced" },
  strong: { scale: 0.78, quality: 0.52, label: "Smaller file" },
};

export default function CompressPdf() {
  const [files, setFiles] = useState<ToolFile[]>([]);
  const [level, setLevel] = useState<Level>("balanced");
  const [grayscale, setGrayscale] = useState(false);
  const [outputName, setOutputName] = useState("compressed.pdf");
  const [, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; original: number; output: number } | null>(null);
  const [error, setError] = useState("");

  const run = async () => {
    const validation = validateFiles(files.map(item => item.file), { extensions: [".pdf"], minFiles: 1, maxFiles: 1, maxSizeMb: 40 });
    if (validation) { setError(validation); return; }
    setError(""); setLoading(true); setProgress(0);
    try {
      const nextResult = await withProcessingActivity("Compress PDF", async () => {
      initPdfWorker();
      const pdfjs = await import("pdfjs-dist");
      const source = files[0].file;
      const pdf = await pdfjs.getDocument({ data: new Uint8Array(await source.arrayBuffer()) }).promise;
      const preset = SETTINGS[level];
      const first = await pdf.getPage(1);
      const firstViewport = first.getViewport({ scale: preset.scale });
      const out = new jsPDF({ orientation: firstViewport.width > firstViewport.height ? "landscape" : "portrait", unit: "pt", format: [firstViewport.width, firstViewport.height], compress: true });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas processing is unavailable in this browser.");

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = pageNumber === 1 ? first : await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: preset.scale });
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        context.save();
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.filter = grayscale ? "grayscale(1)" : "none";
        await page.render({ canvasContext: context, viewport }).promise;
        context.restore();
        const dataUrl = canvas.toDataURL("image/jpeg", preset.quality);
        if (pageNumber > 1) out.addPage([viewport.width, viewport.height], viewport.width > viewport.height ? "landscape" : "portrait");
        out.addImage(dataUrl, "JPEG", 0, 0, viewport.width, viewport.height, undefined, "FAST");
        const pct = Math.round((pageNumber / pdf.numPages) * 100);
        setProgress(pct);
        updateToolProcessing(pct, `Compressing page ${pageNumber} of ${pdf.numPages}`);
      }
      const blob = out.output("blob");
      return { blob, original: source.size, output: blob.size };
      });
      setResult(nextResult);
    } catch (e: any) { setError(e.message || "The PDF could not be compressed."); }
    finally { setLoading(false); }
  };

  const reduction = result ? Math.round(((result.original - result.output) / result.original) * 100) : 0;

  return (
    <ToolWorkspace title="Compress PDF" description="Reduce PDF size with selectable quality settings" accent="#10B981">
      {result ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Info><strong>{fmtBytes(result.original)}</strong> → <strong>{fmtBytes(result.output)}</strong> · {reduction >= 0 ? `${reduction}% smaller` : `${Math.abs(reduction)}% larger`}</Info>
          {reduction < 0 && <Info bg="rgba(245,158,11,.08)" col="#92400E">This PDF was already optimized. The selected raster quality produced a larger file.</Info>}
          <Done msg="Compression completed" onDownload={() => dl(result.blob, safeOutputName(outputName, "compressed", ".pdf"))} shareFile={{ blob: result.blob, name: safeOutputName(outputName, "compressed", ".pdf") }} onReset={() => { setResult(null); setFiles([]); setError(""); setProgress(0); }} />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Drop files={files} onChange={setFiles} accept=".pdf,application/pdf" label="Select one PDF" sub="Maximum 40 MB" />
          <F label="Compression level"><Pills opts={[{ label: "Higher quality", value: "quality" }, { label: "Balanced", value: "balanced" }, { label: "Strong", value: "strong" }]} val={level} onChange={setLevel} /></F>
          <G2><F label="Output filename"><input style={IS} value={outputName} onChange={event => setOutputName(event.target.value)} /></F><F label="Colour mode"><label className="jn-file-pill" style={{ height: 42, justifyContent: "flex-start" }}><input type="checkbox" checked={grayscale} onChange={event => setGrayscale(event.target.checked)} /><span style={{ fontSize: 10, fontWeight: 800 }}>Convert pages to grayscale</span></label></F></G2>
          
          <Info bg="rgba(245,158,11,.08)" col="#92400E">This compression mode rasterizes pages. Searchable text, links, forms, and accessibility can be reduced. Use Higher quality for important documents.</Info>
          <Err msg={error} />
          <Btn onClick={run} loading={loading} disabled={!files.length} full style={{ background: "#10B981" }}>Compress PDF</Btn>
        </div>
      )}
    </ToolWorkspace>
  );
}
