"use client";
import React, { useState } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, Field, Pills, ToolFile, downloadBlob, S, C } from "./_shared";
import { rotatePdf } from "./_pdfUtils";

const DEG_OPTIONS = [
  { label: "↻ 90° Right", value: 90 },
  { label: "↕ 180°", value: 180 },
  { label: "↺ 90° Left", value: 270 },
];

export default function RotatePdf() {
  const [files, setFiles] = useState<ToolFile[]>([]);
  const [degrees, setDegrees] = useState(90);
  const [pages, setPages]     = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<Blob | null>(null);
  const [error, setError]     = useState("");

  const process = async () => {
    if (!files.length) { setError("Upload a PDF first."); return; }
    setError(""); setLoading(true);
    try {
      const blob = await rotatePdf(files[0].file, degrees, pages);
      setResult(blob);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <ToolLayout title="Rotate PDF" description="Rotate all pages or specific pages to fix orientation." icon="🔄" accentColor={C.amber}>
      {result ? (
        <DoneState message="PDF rotated!" onDownload={() => downloadBlob(result, "rotated.pdf")} onReset={() => { setResult(null); setFiles([]); }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Dropzone files={files} onChange={setFiles} accept=".pdf" />
          <Field label="Rotation angle">
            <Pills options={DEG_OPTIONS} value={degrees} onChange={v => setDegrees(v as number)} color={C.amber} />
          </Field>
          <Field label="Pages (blank = all)" hint="e.g. 1, 3, 5-8">
            <input style={S.input} value={pages} onChange={e => setPages(e.target.value)} placeholder="Leave blank for all pages" />
          </Field>
          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}
          <Btn onClick={process} loading={loading} disabled={!files.length} fullWidth style={{ background: C.amber }}>🔄 Rotate PDF</Btn>
        </div>
      )}
    </ToolLayout>
  );
}
