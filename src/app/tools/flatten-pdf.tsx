"use client";
import React, { useState } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, ToolFile, downloadBlob, InfoBox } from "./_shared";
import { flattenPdf } from "./_pdfUtils";

export default function FlattenPdf() {
  const [files, setFiles] = useState<ToolFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState("");

  const process = async () => {
    if (!files.length) { setError("Upload a PDF first."); return; }
    setError(""); setLoading(true);
    try { setResult(await flattenPdf(files[0].file)); }
    catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <ToolLayout title="Flatten PDF" description="Convert form fields and annotations into static content." icon="📄" accentColor="#6B7280">
      {result ? (
        <DoneState message="PDF flattened!" onDownload={() => downloadBlob(result, "flattened.pdf")} onReset={() => { setResult(null); setFiles([]); }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Dropzone files={files} onChange={setFiles} accept=".pdf" label="Drop PDF with forms or annotations" />
          <InfoBox>📋 Flattening removes interactive form fields and merges all annotations permanently into the page content.</InfoBox>
          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}
          <Btn onClick={process} loading={loading} disabled={!files.length} fullWidth style={{ background: "#6B7280" }}>📄 Flatten PDF</Btn>
        </div>
      )}
    </ToolLayout>
  );
}
