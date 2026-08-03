"use client";
import React, { useState } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, Field, Slider, Grid2, Pills, ToolFile, downloadBlob, S, C } from "./_shared";
import { watermarkPdf } from "./_pdfUtils";

const COLOR_OPTIONS = [
  { label: "Gray", value: "#9CA3AF" },
  { label: "Black", value: "#000000" },
  { label: "Red", value: "#EF4444" },
  { label: "Blue", value: "#2563EB" },
];

export default function WatermarkPdf() {
  const [files, setFiles]     = useState<ToolFile[]>([]);
  const [text, setText]       = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(0.3);
  const [size, setSize]       = useState(50);
  const [color, setColor]     = useState("#9CA3AF");
  const [diagonal, setDiag]   = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<Blob | null>(null);
  const [error, setError]     = useState("");

  const process = async () => {
    if (!files.length) { setError("Upload a PDF first."); return; }
    if (!text.trim()) { setError("Enter watermark text."); return; }
    setError(""); setLoading(true);
    try {
      const blob = await watermarkPdf(files[0].file, text, opacity, size, color, diagonal);
      setResult(blob);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <ToolLayout title="Watermark PDF" description="Add a custom text watermark to every page." icon="💧" accentColor="#06B6D4">
      {result ? (
        <DoneState message="Watermark added!" onDownload={() => downloadBlob(result, "watermarked.pdf")} onReset={() => { setResult(null); setFiles([]); }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Dropzone files={files} onChange={setFiles} accept=".pdf" />
          <Field label="Watermark text">
            <input style={S.input} value={text} onChange={e => setText(e.target.value)} placeholder="CONFIDENTIAL" />
          </Field>
          <Grid2>
            <Slider label="Opacity" value={Math.round(opacity * 100)} min={5} max={80} step={5} onChange={v => setOpacity(v / 100)} format={v => `${v}%`} />
            <Slider label="Font size (pt)" value={size} min={20} max={100} step={5} onChange={setSize} />
          </Grid2>
          <Field label="Color">
            <Pills options={COLOR_OPTIONS} value={color} onChange={v => setColor(v as string)} color="#06B6D4" />
          </Field>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
            <input type="checkbox" checked={diagonal} onChange={e => setDiag(e.target.checked)} style={{ width: 16, height: 16 }} />
            Diagonal watermark (45°)
          </label>
          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}
          <Btn onClick={process} loading={loading} disabled={!files.length || !text.trim()} fullWidth style={{ background: "#06B6D4" }}>💧 Add Watermark</Btn>
        </div>
      )}
    </ToolLayout>
  );
}
