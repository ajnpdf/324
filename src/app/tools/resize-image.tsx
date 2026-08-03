"use client";
import React, { useState } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, Field, Grid2, ToolFile, downloadBlob, InfoBox, S, C } from "./_shared";
import { resizeImage } from "./_imageUtils";

const PRESETS = [
  { label: "HD 720p",   w: 1280, h: 720  },
  { label: "Full HD",   w: 1920, h: 1080 },
  { label: "4K",        w: 3840, h: 2160 },
  { label: "Square 1K", w: 1080, h: 1080 },
  { label: "Thumb",     w: 300,  h: 300  },
  { label: "Twitter",   w: 1500, h: 500  },
  { label: "FB Cover",  w: 851,  h: 315  },
  { label: "A4 72dpi",  w: 595,  h: 842  },
];

export default function ResizeImage() {
  const [files, setFiles]   = useState<ToolFile[]>([]);
  const [width,  setWidth]  = useState(800);
  const [height, setHeight] = useState(600);
  const [aspect, setAspect] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError]   = useState("");

  const applyPreset = (p: { w: number; h: number }) => { setWidth(p.w); setHeight(p.h); setAspect(false); };

  const process = async () => {
    if (!files.length) { setError("Upload an image first."); return; }
    if (!width && !height) { setError("Enter at least one dimension."); return; }
    setError(""); setLoading(true);
    try { setResult(await resizeImage(files[0].file, width, height, aspect)); }
    catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <ToolLayout title="Resize Image" description="Change the width and height of any image." icon="📐" accentColor={C.blue}>
      {result ? (
        <DoneState message="Image resized!" onDownload={() => downloadBlob(result!, "resized_" + (files[0]?.name || "image.jpg"))} onReset={() => { setResult(null); setFiles([]); }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Dropzone files={files} onChange={setFiles} accept=".jpg,.jpeg,.png,.webp,.bmp" label="Drop image here" />
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 8 }}>Quick presets</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {PRESETS.map(p => (
                <button key={p.label} onClick={() => applyPreset(p)} style={{ padding: "5px 11px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid #E5E7EB", background: "#F9FAFB", color: "#374151" }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <Grid2>
            <Field label="Width (px)"><input style={S.input} type="number" min={1} max={10000} value={width} onChange={e => setWidth(Number(e.target.value))} /></Field>
            <Field label="Height (px)"><input style={S.input} type="number" min={1} max={10000} value={height} onChange={e => setHeight(Number(e.target.value))} /></Field>
          </Grid2>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
            <input type="checkbox" checked={aspect} onChange={e => setAspect(e.target.checked)} style={{ width: 16, height: 16, accentColor: C.blue }} />
            Maintain aspect ratio
          </label>
          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}
          <Btn onClick={process} loading={loading} disabled={!files.length} fullWidth style={{ background: C.blue }}>📐 Resize Image</Btn>
        </div>
      )}
    </ToolLayout>
  );
}
