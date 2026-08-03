"use client";
import React, { useState } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, ToolFile, downloadBlob, InfoBox, C } from "./_shared";
import { imagesToPdf } from "./_pdfUtils";

export default function JpgToPdf() {
  const [files, setFiles]   = useState<ToolFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError]   = useState("");

  const process = async () => {
    if (!files.length) { setError("Upload at least one image."); return; }
    setError(""); setLoading(true);
    try { setResult(await imagesToPdf(files.map(f => f.file))); }
    catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <ToolLayout title="JPG to PDF" description="Turn one or more JPEG images into a single PDF document." icon="🖼️" accentColor={C.red}>
      {result ? (
        <DoneState message="Images converted to PDF!" onDownload={() => downloadBlob(result, "images.pdf")} onReset={() => { setResult(null); setFiles([]); }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Dropzone files={files} onChange={setFiles} accept=".jpg,.jpeg" multiple label="Drop JPG images here" sublabel="Each image becomes one PDF page • Upload multiple" />
          {files.length > 1 && <InfoBox>📋 <strong>{files.length} images</strong> will become <strong>{files.length} pages</strong> in the PDF, in listed order.</InfoBox>}
          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}
          <Btn onClick={process} loading={loading} disabled={!files.length} fullWidth>🖼️ Create PDF</Btn>
        </div>
      )}
    </ToolLayout>
  );
}
