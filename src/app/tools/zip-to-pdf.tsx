"use client";
import React, { useState } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, ToolFile, downloadBlob, InfoBox } from "./_shared";
import { imagesToPdf, zipToPdfs, mergePdfs } from "./_pdfUtils";

export default function ZipToPdf() {
  const [files, setFiles]   = useState<ToolFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError]   = useState("");

  const process = async () => {
    if (!files.length) { setError("Upload a ZIP file first."); return; }
    setError(""); setLoading(true);
    try {
      const extracted = await zipToPdfs(files[0].file);
      const images  = extracted.filter(f => /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(f.name));
      const pdfs    = extracted.filter(f => /\.pdf$/i.test(f.name));

      let resultBlob: Blob;
      if (images.length > 0 && pdfs.length === 0) {
        resultBlob = await imagesToPdf(images);
      } else if (pdfs.length > 0 && images.length === 0) {
        resultBlob = pdfs.length === 1
          ? new Blob([await pdfs[0].arrayBuffer()], { type: "application/pdf" })
          : await mergePdfs(pdfs);
      } else if (images.length > 0 && pdfs.length > 0) {
        const imgPdf = await imagesToPdf(images);
        const imgFile = new File([imgPdf], "images.pdf", { type: "application/pdf" });
        resultBlob = await mergePdfs([...pdfs, imgFile]);
      } else {
        throw new Error("ZIP contains no supported image or PDF files.");
      }

      setResult(resultBlob);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <ToolLayout title="ZIP to PDF" description="Convert a ZIP archive of images or PDFs into a single PDF." icon="📦" accentColor="#6B7280">
      {result ? (
        <DoneState message="ZIP converted to PDF!" onDownload={() => downloadBlob(result, "from_zip.pdf")} onReset={() => { setResult(null); setFiles([]); }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Dropzone files={files} onChange={setFiles} accept=".zip" label="Drop ZIP file here" sublabel="ZIP should contain JPG, PNG, or PDF files" />
          <InfoBox>📦 Supported contents: <strong>JPG, PNG</strong> (each becomes a page) · <strong>PDF</strong> files (merged together). Mixed ZIPs are also supported.</InfoBox>
          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}
          <Btn onClick={process} loading={loading} disabled={!files.length} fullWidth style={{ background: "#6B7280" }}>📦 Convert ZIP to PDF</Btn>
        </div>
      )}
    </ToolLayout>
  );
}
