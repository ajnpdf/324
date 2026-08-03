"use client";
import React, { useState } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, Slider, ToolFile, downloadBlob, InfoBox, C } from "./_shared";
import { removeBackground } from "./_imageUtils";

export default function RemoveBackground() {
  const [files, setFiles]       = useState<ToolFile[]>([]);
  const [threshold, setThresh]  = useState(30);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<Blob | null>(null);
  const [error, setError]       = useState("");

  const process = async () => {
    if (!files.length) { setError("Upload an image first."); return; }
    setError(""); setLoading(true);
    try { setResult(await removeBackground(files[0].file, threshold)); }
    catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <ToolLayout title="Remove Background" description="Remove the background from any photo with a solid or plain background." icon="🪄" accentColor={C.purple}>
      {result ? (
        <DoneState
          message="Background removed!"
          downloadLabel="Download PNG"
          onDownload={() => downloadBlob(result!, (files[0]?.name.replace(/\.[^.]+$/, "") || "image") + "_nobg.png")}
          onReset={() => { setResult(null); setFiles([]); }}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Dropzone
            files={files}
            onChange={setFiles}
            accept=".jpg,.jpeg,.png,.webp,.bmp"
            label="Drop image here"
            sublabel="Works best on images with a plain solid background"
          />

          <Slider
            label="Color tolerance"
            value={threshold}
            min={5}
            max={120}
            step={5}
            onChange={setThresh}
            format={v => v < 25 ? `${v} — Precise` : v < 60 ? `${v} — Balanced` : `${v} — Aggressive`}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.gray, marginTop: -10 }}>
            <span>Low (precise edges)</span><span>High (removes more)</span>
          </div>

          <InfoBox color="#F5F3FF" textColor="#5B21B6">
            🪄 Detects background colour from the image corners and makes matching pixels transparent. Output is always <strong>PNG</strong> to preserve transparency.
            <br />💡 <strong>Tips:</strong> Use low tolerance for white/grey backgrounds. Increase if corners aren&apos;t fully removed.
          </InfoBox>
          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}
          <Btn onClick={process} loading={loading} disabled={!files.length} fullWidth style={{ background: C.purple }}>
            🪄 Remove Background
          </Btn>
        </div>
      )}
    </ToolLayout>
  );
}
