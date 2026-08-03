"use client";
import React, { useState } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, Slider, Field, Pills, ToolFile, downloadBlob, S, C } from "./_shared";
import { rotateImage } from "./_imageUtils";

export default function RotateImage() {
  const [files, setFiles] = useState<ToolFile[]>([]);
  const [mode, setMode]   = useState<"preset" | "custom">("preset");
  const [degrees, setDeg] = useState(90);
  const [custom, setCustom] = useState(45);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<Blob | null>(null);
  const [error, setError]     = useState("");

  const finalDeg = mode === "custom" ? custom : degrees;

  const process = async () => {
    if (!files.length) { setError("Upload an image first."); return; }
    setError(""); setLoading(true);
    try { setResult(await rotateImage(files[0].file, finalDeg)); }
    catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <ToolLayout title="Rotate Image" description="Turn images left, right, or by any custom angle." icon="🔄" accentColor="#059669">
      {result ? (
        <DoneState message="Image rotated!" onDownload={() => downloadBlob(result!, "rotated_" + (files[0]?.name || "image.jpg"))} onReset={() => { setResult(null); setFiles([]); }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Dropzone files={files} onChange={setFiles} accept=".jpg,.jpeg,.png,.webp,.bmp" label="Drop image here" />
          <Field label="Rotation">
            <Pills options={[{ label: "Preset", value: "preset" }, { label: "Custom angle", value: "custom" }]} value={mode} onChange={v => setMode(v as "preset"|"custom")} color="#059669" />
          </Field>
          {mode === "preset" ? (
            <Pills
              options={[
                { label: "↺ 90° Left",  value: -90  },
                { label: "↻ 90° Right", value: 90   },
                { label: "↕ 180°",      value: 180  },
                { label: "↻ 270°",      value: 270  },
              ]}
              value={degrees}
              onChange={v => setDeg(v as number)}
              color="#059669"
            />
          ) : (
            <Slider label="Custom angle" value={custom} min={1} max={359} step={1} onChange={setCustom} format={v => `${v}°`} />
          )}
          <p style={{ fontSize: 12, color: C.gray }}>Non-90° rotations add white padding to fill the new bounding box.</p>
          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}
          <Btn onClick={process} loading={loading} disabled={!files.length} fullWidth style={{ background: "#059669" }}>🔄 Rotate {finalDeg}°</Btn>
        </div>
      )}
    </ToolLayout>
  );
}
