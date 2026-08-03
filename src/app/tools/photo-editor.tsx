"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ToolLayout, Dropzone, Btn, DoneState, Slider, Field, ToolFile, downloadBlob, InfoBox, C } from "./_shared";
import { editPhoto } from "./_imageUtils";

const FILTERS = [
  { value: "none",      label: "🎨 None",      bg: "#F3F4F6" },
  { value: "grayscale", label: "⚫ Grayscale",  bg: "#1F2937" },
  { value: "sepia",     label: "🟤 Sepia",      bg: "#92400E" },
  { value: "invert",    label: "🔄 Invert",     bg: "#4F46E5" },
  { value: "warm",      label: "🌅 Warm",       bg: "#D97706" },
  { value: "cool",      label: "❄️ Cool",       bg: "#0369A1" },
];

export default function PhotoEditor() {
  const [files, setFiles]         = useState<ToolFile[]>([]);
  const [brightness, setBright]   = useState(1.0);
  const [contrast,   setContrast] = useState(1.0);
  const [filter,     setFilter]   = useState("none");
  const [loading,    setLoading]  = useState(false);
  const [result,     setResult]   = useState<Blob | null>(null);
  const [error,      setError]    = useState("");
  const [preview,    setPreview]  = useState("");

  const cssBrightness = brightness;
  const cssContrast   = contrast;
  const cssFilter     = filter === "grayscale" ? "grayscale(100%)"
    : filter === "sepia"     ? "sepia(100%)"
    : filter === "invert"    ? "invert(100%)"
    : filter === "warm"      ? "sepia(40%) saturate(1.4) hue-rotate(-10deg)"
    : filter === "cool"      ? "hue-rotate(180deg) saturate(0.8)"
    : "none";

  useEffect(() => {
    if (!files.length) { setPreview(""); return; }
    const url = URL.createObjectURL(files[0].file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [files]);

  const reset = () => { setBright(1); setContrast(1); setFilter("none"); };

  const process = async () => {
    if (!files.length) { setError("Upload an image first."); return; }
    setError(""); setLoading(true);
    try { 
      setResult(await editPhoto(files[0].file, { 
        brightness, 
        contrast, 
        filter,
        saturation: 1.0,
        exposure: 0,
        rotation: 0,
        flipH: false,
        flipV: false
      })); 
    }
    catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <ToolLayout title="Photo Editor" description="Adjust brightness, contrast and apply artistic filters to your photos." icon="🎨" accentColor="#EC4899">
      {result ? (
        <DoneState
          message="Photo edited!"
          onDownload={() => downloadBlob(result!, "edited_" + (files[0]?.name || "image.jpg"))}
          onReset={() => { setResult(null); setFiles([]); setPreview(""); reset(); }}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Dropzone files={files} onChange={setFiles} accept=".jpg,.jpeg,.png,.webp,.bmp" label="Drop image here" />

          {preview && (
            <div style={{ borderRadius: 10, overflow: "hidden", border: "1.5px solid #E5E7EB" }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: C.gray, textAlign: "center", background: "#F9FAFB", padding: "6px 0", borderBottom: "1px solid #E5E7EB" }}>
                LIVE PREVIEW (CSS approximation)
              </p>
              <div className="relative w-full h-[260px] bg-black">
                <Image
                  src={preview}
                  alt="preview"
                  fill
                  unoptimized
                  className="object-contain"
                  style={{
                    filter: `brightness(${cssBrightness}) contrast(${cssContrast}) ${cssFilter}`
                  }}
                />
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Slider
              label="☀️ Brightness"
              value={Math.round(brightness * 100)}
              min={10} max={300} step={5}
              onChange={v => setBright(v / 100)}
              format={v => v === 100 ? "100% (original)" : `${v}%`}
            />
            <Slider
              label="🌗 Contrast"
              value={Math.round(contrast * 100)}
              min={10} max={300} step={5}
              onChange={v => setContrast(v / 100)}
              format={v => v === 100 ? "100% (original)" : `${v}%`}
            />
          </div>

          <Field label="🎭 Filter">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {FILTERS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  style={{
                    padding: "10px 6px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                    cursor: "pointer", transition: "all 0.15s", textAlign: "center",
                    border: filter === f.value ? "2px solid #EC4899" : "1.5px solid #E5E7EB",
                    background: filter === f.value ? "#FDF2F8" : "#fff",
                    color: filter === f.value ? "#BE185D" : "#374151",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </Field>

          <Btn variant="secondary" onClick={reset} style={{ fontSize: 13 }}>↺ Reset to Original</Btn>

          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}

          <Btn
            onClick={process}
            loading={loading}
            disabled={!files.length}
            fullWidth
            style={{ background: "#EC4899" }}
          >
            🎨 Apply Edits
          </Btn>
          <InfoBox color="#FDF2F8" textColor="#9D174D">
            💡 The preview above uses CSS filters for instant feedback. The downloaded image is processed pixel-by-pixel for accurate output.
          </InfoBox>
        </div>
      )}
    </ToolLayout>
  );
}
