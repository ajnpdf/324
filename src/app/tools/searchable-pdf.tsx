"use client";
import React, { useState } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, ToolFile, downloadBlob, InfoBox, C } from "./_shared";
import { repairPdf } from "./_pdfUtils";

export default function SearchablePdf() {
  const [files, setFiles]   = useState<ToolFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError]   = useState("");

  const process = async () => {
    if (!files.length) { setError("Upload a PDF first."); return; }
    setError(""); setLoading(true);
    try {
      // Re-save ensures metadata and text layer are preserved/accessible
      const blob = await repairPdf(files[0].file);
      setResult(blob);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <ToolLayout title="Searchable PDF" description="Ensure your PDF's text layer is accessible and searchable." icon="🔍" accentColor={C.purple}>
      {result ? (
        <DoneState message="PDF is now searchable!" onDownload={() => downloadBlob(result, "searchable.pdf")} onReset={() => { setResult(null); setFiles([]); }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Dropzone files={files} onChange={setFiles} accept=".pdf" label="Drop PDF here" sublabel="Best for text-based PDFs" />
          <InfoBox color="#F5F3FF" textColor="#5B21B6">
            🔍 This tool preserves and optimises the existing text layer. For scanned image PDFs that have <strong>no text layer</strong>, real OCR (e.g. Tesseract) is required — that needs a server.
          </InfoBox>
          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}
          <Btn onClick={process} loading={loading} disabled={!files.length} fullWidth style={{ background: C.purple }}>🔍 Make Searchable</Btn>
        </div>
      )}
    </ToolLayout>
  );
}
