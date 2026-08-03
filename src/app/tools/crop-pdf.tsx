"use client";
import React, { useState } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, Field, Grid2, ToolFile, downloadBlob, InfoBox, S, C } from "./_shared";
import { cropPdf } from "./_pdfUtils";

export default function CropPdf() {
  const [files, setFiles] = useState<ToolFile[]>([]);
  const [margins, setMargins] = useState({ top: 0, bottom: 0, left: 0, right: 0 });
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<Blob | null>(null);
  const [error, setError]     = useState("");
  const set = (k: string, v: number) => setMargins(m => ({ ...m, [k]: v }));

  const process = async () => {
    if (!files.length) { setError("Upload a PDF first."); return; }
    setError(""); setLoading(true);
    try {
      const blob = await cropPdf(files[0].file, margins.top, margins.bottom, margins.left, margins.right);
      setResult(blob);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <ToolLayout title="Crop PDF" description="Trim page margins. All values in PDF points (72pt = 1 inch)." icon="🔲" accentColor="#F59E0B">
      {result ? (
        <DoneState message="PDF cropped!" onDownload={() => downloadBlob(result, "cropped.pdf")} onReset={() => { setResult(null); setFiles([]); }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Dropzone files={files} onChange={setFiles} accept=".pdf" />
          <Grid2>
            {(["top","bottom","left","right"] as const).map(side => (
              <Field key={side} label={`${side.charAt(0).toUpperCase()+side.slice(1)} margin (pt)`}>
                <input style={S.input} type="number" min={0} max={500} value={margins[side]} onChange={e => set(side, Number(e.target.value))} />
              </Field>
            ))}
          </Grid2>
          <InfoBox color="#FFFBEB" textColor="#92400E">💡 72pt = 1 inch · 36pt = 0.5 inch · 18pt = 0.25 inch</InfoBox>
          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}
          <Btn onClick={process} loading={loading} disabled={!files.length} fullWidth style={{ background: "#F59E0B" }}>🔲 Crop PDF</Btn>
        </div>
      )}
    </ToolLayout>
  );
}
