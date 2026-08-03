"use client";
import React, { useState } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, Slider, Field, Pills, ToolFile, downloadBlob, InfoBox, S, C } from "./_shared";
import { convertImageFormat } from "./_imageUtils";

const FORMAT_OPTIONS = [
  { label: "JPEG",  value: "jpeg" },
  { label: "PNG",   value: "png"  },
  { label: "WebP",  value: "webp" },
  { label: "BMP",   value: "bmp"  },
];

const FORMAT_INFO: Record<string, string> = {
  jpeg: "Best for photos. Lossy compression — smaller files but slight quality loss.",
  png:  "Lossless with transparency support. Best for graphics, logos, screenshots.",
  webp: "Modern format. Great compression for both photos and graphics.",
  bmp:  "Uncompressed. Very large files but perfect quality. Used in legacy systems.",
};

export default function ConvertImage() {
  const [files,   setFiles]   = useState<ToolFile[]>([]);
  const [format,  setFormat]  = useState("jpeg");
  const [quality, setQuality] = useState(90);
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState<Blob | null>(null);
  const [error,   setError]   = useState("");

  const process = async () => {
    if (!files.length) { setError("Upload an image first."); return; }
    setError(""); setLoading(true);
    try { setResult(await convertImageFormat(files[0].file, format, quality)); }
    catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  const ext = format === "jpeg" ? "jpg" : format;
  const outName = (files[0]?.name.replace(/\.[^.]+$/, "") || "converted") + "." + ext;

  return (
    <ToolLayout title="Convert Image" description="Convert images between JPEG, PNG, WebP and BMP formats." icon="🔀" accentColor="#7C3AED">
      {result ? (
        <DoneState
          message={`Converted to ${format.toUpperCase()}!`}
          downloadLabel={`Download .${ext}`}
          onDownload={() => downloadBlob(result!, outName)}
          onReset={() => { setResult(null); setFiles([]); }}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Dropzone
            files={files}
            onChange={setFiles}
            accept=".jpg,.jpeg,.png,.webp,.bmp,.gif,.tiff"
            label="Drop image to convert"
            sublabel="JPG, PNG, WebP, BMP, GIF, TIFF accepted"
          />

          <Field label="Convert to">
            <Pills options={FORMAT_OPTIONS} value={format} onChange={v => setFormat(v as string)} color="#7C3AED" />
          </Field>

          <InfoBox color="#F5F3FF" textColor="#5B21B6">
            ℹ️ {FORMAT_INFO[format]}
          </InfoBox>

          {format !== "png" && format !== "bmp" && (
            <Slider
              label="Quality"
              value={quality}
              min={10} max={100} step={5}
              onChange={setQuality}
              format={v => `${v}%`}
            />
          )}

          {files.length > 0 && (
            <div style={{ fontSize: 13, color: C.gray, fontWeight: 500 }}>
              <strong>{files[0].name}</strong> → <strong>{outName}</strong>
            </div>
          )}

          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}

          <Btn
            onClick={process}
            loading={loading}
            disabled={!files.length}
            fullWidth
            style={{ background: "#7C3AED" }}
          >
            🔀 Convert to {format.toUpperCase()}
          </Btn>
        </div>
      )}
    </ToolLayout>
  );
}
