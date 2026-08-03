"use client";
import React, { useState } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, Field, Grid2, ToolFile, downloadBlob, InfoBox, S, C } from "./_shared";
import { cropImage } from "./_imageUtils";

export default function CropImage() {
  const [files, setFiles] = useState<ToolFile[]>([]);
  const [x, setX] = useState(0), [y, setY] = useState(0);
  const [w, setW] = useState(400), [h, setH] = useState(300);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<Blob | null>(null);
  const [error, setError]     = useState("");

  const process = async () => {
    if (!files.length) { setError("Upload an image first."); return; }
    setError(""); setLoading(true);
    try { setResult(await cropImage(files[0].file, x, y, w, h)); }
    catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <ToolLayout title="Crop Image" description="Cut out a specific rectangular region of your image." icon="✂️" accentColor="#D97706">
      {result ? (
        <DoneState message="Image cropped!" onDownload={() => downloadBlob(result!, "cropped_" + (files[0]?.name || "image.jpg"))} onReset={() => { setResult(null); setFiles([]); }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Dropzone files={files} onChange={setFiles} accept=".jpg,.jpeg,.png,.webp,.bmp" label="Drop image here" />
          <p style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>Crop region (pixels from top-left corner)</p>
          <Grid2>
            <Field label="X — left offset (px)"><input style={S.input} type="number" min={0} value={x} onChange={e => setX(Number(e.target.value))} /></Field>
            <Field label="Y — top offset (px)"><input style={S.input} type="number" min={0} value={y} onChange={e => setY(Number(e.target.value))} /></Field>
            <Field label="Crop width (px)"><input style={S.input} type="number" min={1} value={w} onChange={e => setW(Number(e.target.value))} /></Field>
            <Field label="Crop height (px)"><input style={S.input} type="number" min={1} value={h} onChange={e => setH(Number(e.target.value))} /></Field>
          </Grid2>
          <InfoBox color="#FFFBEB" textColor="#92400E">💡 X=0, Y=0 is the top-left corner. Crop starts at (X,Y) and extends W×H pixels to the right and down.</InfoBox>
          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}
          <Btn onClick={process} loading={loading} disabled={!files.length} fullWidth style={{ background: "#D97706" }}>✂️ Crop Image</Btn>
        </div>
      )}
    </ToolLayout>
  );
}
