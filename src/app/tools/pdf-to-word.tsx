"use client";
import React, { useState } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, ToolFile, downloadBlob, InfoBox, C } from "./_shared";
import { extractText } from "./_pdfUtils";

export default function PdfToWord() {
  const [files, setFiles]   = useState<ToolFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError]   = useState("");

  const process = async () => {
    if (!files.length) { setError("Upload a PDF first."); return; }
    setError(""); setLoading(true);
    try {
      const text = await extractText(files[0].file);
      setResult(new Blob([text], { type: "text/plain" }));
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <ToolLayout title="PDF to Word" description="Extract text from a PDF and download as a .txt document." icon="📝" accentColor={C.blue}>
      {result ? (
        <DoneState message="Text extracted!" downloadLabel="Download .txt" onDownload={() => downloadBlob(result!, files[0]?.name.replace(".pdf", ".txt") || "document.txt")} onReset={() => { setResult(null); setFiles([]); }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Dropzone files={files} onChange={setFiles} accept=".pdf" />
          <InfoBox>📝 Extracts the embedded text layer. For scanned PDFs without a text layer, the output will be empty — use Smart Read + OCR instead.</InfoBox>
          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}
          <Btn onClick={process} loading={loading} disabled={!files.length} fullWidth style={{ background: C.blue }}>📝 Extract Text</Btn>
        </div>
      )}
    </ToolLayout>
  );
}
