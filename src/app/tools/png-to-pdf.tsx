"use client";
import React, { useState } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, ToolFile, downloadBlob, InfoBox, C } from "./_shared";
import { imagesToPdf } from "./_pdfUtils";

export default function PngToPdf() {
  const [files, setFiles]   = useState<ToolFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError]   = useState("");

  const process = async () => {
    if (!files.length) { setError("Upload at least one PNG image."); return; }
    setError(""); setLoading(true);
    try { setResult(await imagesToPdf(files.map(f => f.file))); }
    catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <ToolLayout title="PNG to PDF" description="Convert transparent PNG images into a PDF document." icon="🖼️" accentColor="#8B5CF6">
      {result ? (
        <DoneState message="PNG images converted to PDF!" onDownload={() => downloadBlob(result, "images.pdf")} onReset={() => { setResult(null); setFiles([]); }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Dropzone files={files} onChange={setFiles} accept=".png" multiple label="Drop PNG images here" sublabel="Transparency is preserved in the PDF • Upload multiple" />
          <InfoBox color="#F5F3FF" textColor="#5B21B6">🖼️ Each PNG becomes one PDF page. Images are embedded at their native resolution.</InfoBox>
          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}
          <Btn onClick={process} loading={loading} disabled={!files.length} fullWidth style={{ background: "#8B5CF6" }}>🖼️ Create PDF</Btn>
        </div>
      )}
    </ToolLayout>
  );
}
