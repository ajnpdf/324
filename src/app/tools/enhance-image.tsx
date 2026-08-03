"use client";
import React, { useState } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, Field, Pills, ToolFile, downloadBlob, InfoBox, C } from "./_shared";
import { enhanceImage } from "./_imageUtils";

export default function EnhanceImage() {
  const [files, setFiles] = useState<ToolFile[]>([]);
  const [scale, setScale] = useState(2);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<Blob | null>(null);
  const [error, setError]     = useState("");

  const process = async () => {
    if (!files.length) { setError("Upload an image first."); return; }
    setError(""); setLoading(true);
    try { setResult(await enhanceImage(files[0].file, scale)); }
    catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <ToolLayout title="Smart Enhancer" description="Upscale small images and apply sharpening to make them clearer." icon="✨" accentColor={C.purple}>
      {result ? (
        <DoneState message="Image enhanced!" onDownload={() => downloadBlob(result!, "enhanced_" + (files[0]?.name || "image.jpg"))} onReset={() => { setResult(null); setFiles([]); }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Dropzone files={files} onChange={setFiles} accept=".jpg,.jpeg,.png,.webp,.bmp" label="Drop image to enhance" sublabel="Best on small or low-res images" />
          <Field label="Upscale factor">
            <div style={{ display: "flex", gap: 8 }}>
              {[2, 3, 4].map(s => (
                <button key={s} onClick={() => setScale(s)} style={{
                  flex: 1, padding: "12px 0", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer",
                  border: scale === s ? `2px solid ${C.purple}` : "1.5px solid #E5E7EB",
                  background: scale === s ? "#F5F3FF" : "#fff",
                  color: scale === s ? C.purple : "#6B7280",
                }}>{s}×</button>
              ))}
            </div>
          </Field>
          <InfoBox color="#F5F3FF" textColor="#5B21B6">✨ Uses bicubic interpolation + unsharp masking. For AI-powered upscaling, use a dedicated ML tool. Large images at 4× may be slow.</InfoBox>
          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}
          <Btn onClick={process} loading={loading} disabled={!files.length} fullWidth style={{ background: C.purple }}>✨ Enhance {scale}×</Btn>
        </div>
      )}
    </ToolLayout>
  );
}
