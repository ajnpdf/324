"use client";
import React, { useState } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, Field, Pills, ToolFile, downloadBlob, InfoBox, C } from "./_shared";
import { splitPdf, filesToZip } from "./_pdfUtils";

export default function PdfToZip() {
  const [files, setFiles]   = useState<ToolFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [error, setError]   = useState("");

  const process = async () => {
    if (!files.length) { setError("Upload a PDF first."); return; }
    setError(""); setLoading(true);
    try {
      const pages = await splitPdf(files[0].file, ""); // split all pages
      setPageCount(pages.length);
      const zip = await filesToZip(pages);
      setResult(zip);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <ToolLayout title="PDF to ZIP" description="Split every page into individual PDFs and bundle them in a ZIP." icon="📦" accentColor="#6B7280">
      {result ? (
        <DoneState
          message={`${pageCount} pages zipped!`}
          downloadLabel="Download ZIP"
          onDownload={() => downloadBlob(result!, "pdf_pages.zip")}
          onReset={() => { setResult(null); setFiles([]); setPageCount(0); }}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Dropzone files={files} onChange={setFiles} accept=".pdf" />
          <InfoBox>📦 Each page of the PDF becomes a separate <strong>single-page PDF</strong> inside the ZIP archive.</InfoBox>
          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}
          <Btn onClick={process} loading={loading} disabled={!files.length} fullWidth style={{ background: "#6B7280" }}>📦 Export Pages to ZIP</Btn>
        </div>
      )}
    </ToolLayout>
  );
}
