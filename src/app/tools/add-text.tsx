"use client";
import React, { useState } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, Field, Grid2, ToolFile, downloadBlob, InfoBox, S, C } from "./_shared";
import { addTextToPdf } from "./_pdfUtils";

export default function AddText() {
  const [files, setFiles]   = useState<ToolFile[]>([]);
  const [text, setText]     = useState("");
  const [x, setX]           = useState(100);
  const [y, setY]           = useState(100);
  const [page, setPage]     = useState(1);
  const [size, setSize]     = useState(14);
  const [color, setColor]   = useState("#000000");
  const [bold, setBold]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError]   = useState("");

  const process = async () => {
    if (!files.length) { setError("Upload a PDF first."); return; }
    if (!text.trim()) { setError("Enter text to add."); return; }
    setError(""); setLoading(true);
    try {
      const blob = await addTextToPdf(files[0].file, text, x, y, page, size, color, bold);
      setResult(blob);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <ToolLayout title="Add Text" description="Write custom text anywhere on your PDF pages." icon="✏️" accentColor="#0369A1">
      {result ? (
        <DoneState message="Text added!" onDownload={() => downloadBlob(result, "text-added.pdf")} onReset={() => { setResult(null); setFiles([]); }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Dropzone files={files} onChange={setFiles} accept=".pdf" />
          <Field label="Text to add *">
            <input style={S.input} value={text} onChange={e => setText(e.target.value)} placeholder="Type your text here…" />
          </Field>
          <Grid2>
            <Field label="X — points from left"><input style={S.input} type="number" min={0} value={x} onChange={e => setX(Number(e.target.value))} /></Field>
            <Field label="Y — points from bottom"><input style={S.input} type="number" min={0} value={y} onChange={e => setY(Number(e.target.value))} /></Field>
            <Field label="Page number"><input style={S.input} type="number" min={1} value={page} onChange={e => setPage(Number(e.target.value))} /></Field>
            <Field label="Font size (pt)"><input style={S.input} type="number" min={6} max={120} value={size} onChange={e => setSize(Number(e.target.value))} /></Field>
            <Field label="Color">
              <input type="color" value={color} onChange={e => setColor(e.target.value)}
                style={{ width: "100%", height: 40, borderRadius: 8, border: "1.5px solid #E5E7EB", cursor: "pointer", padding: 2 }} />
            </Field>
            <Field label="Style">
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", height: 40 }}>
                <input type="checkbox" checked={bold} onChange={e => setBold(e.target.checked)} style={{ width: 16, height: 16 }} />
                <span style={{ fontSize: 14, fontWeight: 700 }}>Bold</span>
              </label>
            </Field>
          </Grid2>
          <InfoBox>💡 Y=0 is the bottom of the page. For A4, Y≈842 is the top. X=0 is the left edge.</InfoBox>
          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}
          <Btn onClick={process} loading={loading} disabled={!files.length || !text.trim()} fullWidth style={{ background: "#0369A1" }}>✏️ Add Text</Btn>
        </div>
      )}
    </ToolLayout>
  );
}
