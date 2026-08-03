"use client";
import React, { useState } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, Slider, Field, Pills, ToolFile, downloadBlob, InfoBox, S, C } from "./_shared";
import { compressImage } from "./_imageUtils";

const ACCEPT = ".jpg,.jpeg,.png,.webp,.bmp,.gif";

export default function ReduceImage() {
  const [files, setFiles]   = useState<ToolFile[]>([]);
  const [quality, setQuality] = useState(70);
  const [format, setFormat] = useState("jpeg");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [saved, setSaved]   = useState(0);
  const [error, setError]   = useState("");

  const levelLabel = quality >= 80 ? "High quality" : quality >= 50 ? "Balanced" : "Max compression";
  const levelColor = quality >= 80 ? "#059669" : quality >= 50 ? "#D97706" : C.red;

  const process = async () => {
    if (!files.length) { setError("Upload an image first."); return; }
    setError(""); setLoading(true);
    try {
      const blob = await compressImage(files[0].file, quality, format);
      setSaved(files[0].size - blob.size);
      setResult(blob);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  const ext = format === "png" ? "png" : "jpg";
  const name = (files[0]?.name.replace(/\.[^.]+$/, "") || "compressed") + "." + ext;

  return (
    <ToolLayout title="Reduce Image" description="Compress images to smaller file sizes while keeping them clear." icon="🗜️" accentColor={C.red}>
      {result ? (
        <DoneState
          message={saved > 0 ? `Saved ${(saved/1024).toFixed(1)} KB!` : "Image compressed!"}
          onDownload={() => downloadBlob(result!, name)}
          onReset={() => { setResult(null); setFiles([]); setSaved(0); }}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Dropzone files={files} onChange={setFiles} accept={ACCEPT} label="Drop image here" sublabel="JPG, PNG, WebP, BMP, GIF supported" />
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>Quality</label>
              <span style={{ fontSize: 13, fontWeight: 700, color: levelColor }}>{quality}% — {levelLabel}</span>
            </div>
            <input type="range" min={10} max={100} step={5} value={quality} onChange={e => setQuality(Number(e.target.value))} style={{ width: "100%", accentColor: C.red }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.gray, marginTop: 3 }}>
              <span>Smallest file</span><span>Best quality</span>
            </div>
          </div>
          <Field label="Output format">
            <Pills options={[{ label: "JPEG", value: "jpeg" }, { label: "PNG", value: "png" }]} value={format} onChange={v => setFormat(v as string)} />
          </Field>
          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}
          <Btn onClick={process} loading={loading} disabled={!files.length} fullWidth>🗜️ Compress Image</Btn>
        </div>
      )}
    </ToolLayout>
  );
}
