"use client";
import React, { useState } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, Slider, Field, Grid2, ToolFile, downloadBlob, S, C } from "./_shared";
import { watermarkImage } from "./_imageUtils";

const POSITIONS = ["top-left","top-center","top-right","center","bottom-left","bottom-center","bottom-right"];

export default function WatermarkImage() {
  const [files, setFiles]     = useState<ToolFile[]>([]);
  const [text, setText]       = useState("© My Brand");
  const [opacity, setOpacity] = useState(0.6);
  const [fontSize, setFontSize] = useState(40);
  const [color, setColor]     = useState("#ffffff");
  const [position, setPosition] = useState("bottom-center");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<Blob | null>(null);
  const [error, setError]     = useState("");

  const process = async () => {
    if (!files.length) { setError("Upload an image first."); return; }
    if (!text.trim()) { setError("Enter watermark text."); return; }
    setError(""); setLoading(true);
    try { setResult(await watermarkImage(files[0].file, text, opacity, fontSize, color, position)); }
    catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <ToolLayout title="Watermark Image" description="Add your brand or copyright text to any image." icon="💧" accentColor="#06B6D4">
      {result ? (
        <DoneState message="Watermark added!" onDownload={() => downloadBlob(result!, "watermarked_" + (files[0]?.name || "image.jpg"))} onReset={() => { setResult(null); setFiles([]); }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Dropzone files={files} onChange={setFiles} accept=".jpg,.jpeg,.png,.webp,.bmp" label="Drop image here" />
          <Field label="Watermark text">
            <input style={S.input} value={text} onChange={e => setText(e.target.value)} placeholder="© Your Brand" />
          </Field>
          <Grid2>
            <Slider label="Opacity" value={Math.round(opacity * 100)} min={10} max={100} step={5} onChange={v => setOpacity(v/100)} format={v => `${v}%`} />
            <Slider label="Font size (px)" value={fontSize} min={12} max={120} step={4} onChange={setFontSize} />
          </Grid2>
          <Grid2>
            <Field label="Text color">
              <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: "100%", height: 40, borderRadius: 8, border: "1.5px solid #E5E7EB", cursor: "pointer", padding: 2 }} />
            </Field>
            <Field label="Position">
              <select style={S.select} value={position} onChange={e => setPosition(e.target.value)}>
                {POSITIONS.map(p => <option key={p} value={p}>{p.split("-").map(w => w[0].toUpperCase()+w.slice(1)).join(" ")}</option>)}
              </select>
            </Field>
          </Grid2>
          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}
          <Btn onClick={process} loading={loading} disabled={!files.length || !text.trim()} fullWidth style={{ background: "#06B6D4" }}>💧 Add Watermark</Btn>
        </div>
      )}
    </ToolLayout>
  );
}
