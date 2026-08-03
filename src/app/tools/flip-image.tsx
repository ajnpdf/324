"use client";
import React, { useState } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, Field, ToolFile, downloadBlob, InfoBox, C } from "./_shared";
import { flipImage } from "./_imageUtils";

export default function FlipImage() {
  const [files,      setFiles]  = useState<ToolFile[]>([]);
  const [horizontal, setH]      = useState(true);
  const [vertical,   setV]      = useState(false);
  const [loading,    setLoading] = useState(false);
  const [result,     setResult]  = useState<Blob | null>(null);
  const [error,      setError]   = useState("");

  const process = async () => {
    if (!files.length) { setError("Upload an image first."); return; }
    if (!horizontal && !vertical) { setError("Select at least one flip direction."); return; }
    setError(""); setLoading(true);
    try { setResult(await flipImage(files[0].file, horizontal, vertical)); }
    catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  const label = horizontal && vertical ? "Horizontal + Vertical" : horizontal ? "Horizontal (mirror)" : "Vertical (upside down)";

  return (
    <ToolLayout title="Flip Image" description="Mirror your image horizontally, vertically, or both." icon="↔️" accentColor="#0891B2">
      {result ? (
        <DoneState
          message="Image flipped!"
          onDownload={() => downloadBlob(result!, "flipped_" + (files[0]?.name || "image.jpg"))}
          onReset={() => { setResult(null); setFiles([]); }}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Dropzone files={files} onChange={setFiles} accept=".jpg,.jpeg,.png,.webp,.bmp" label="Drop image here" />

          <Field label="Flip direction">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={horizontal}
                  onChange={e => setH(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: "#0891B2", cursor: "pointer" }}
                />
                ↔️ Horizontal flip (mirror left ↔ right)
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={vertical}
                  onChange={e => setV(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: "#0891B2", cursor: "pointer" }}
                />
                ↕️ Vertical flip (upside down top ↕ bottom)
              </label>
            </div>
          </Field>

          {(horizontal || vertical) && (
            <div style={{ background: "#ECFEFF", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#0E7490", fontWeight: 600 }}>
              Will apply: <strong>{label}</strong>
            </div>
          )}

          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}

          <Btn
            onClick={process}
            loading={loading}
            disabled={!files.length || (!horizontal && !vertical)}
            fullWidth
            style={{ background: "#0891B2" }}
          >
            ↔️ Flip Image
          </Btn>
        </div>
      )}
    </ToolLayout>
  );
}
