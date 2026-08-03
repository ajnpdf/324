"use client";
import React, { useState } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, Slider, Field, Pills, ToolFile, downloadBlob, InfoBox, C } from "./_shared";
import { pdfToImages, filesToZip } from "./_pdfUtils";

export default function PdfToJpg() {
  const [files, setFiles]   = useState<ToolFile[]>([]);
  const [dpi, setDpi]       = useState(150);
  const [quality, setQuality] = useState(85);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [error, setError]   = useState("");

  const DPI_OPTIONS = [
    { label: "72 dpi (Screen)", value: 72 },
    { label: "150 dpi (Standard)", value: 150 },
    { label: "300 dpi (Print)", value: 300 },
  ];

  const process = async () => {
    if (!files.length) { setError("Upload a PDF first."); return; }
    setError(""); setLoading(true); setProgress(10);
    try {
      const images = await pdfToImages(files[0].file, dpi, quality);
      setProgress(80);
      setPageCount(images.length);

      if (images.length === 1) {
        setResult(images[0].blob);
      } else {
        const zip = await filesToZip(images);
        setResult(zip);
      }
      setProgress(100);
    } catch (e: any) { setError("Could not render PDF. Make sure pdfjs-dist is installed: npm i pdfjs-dist"); }
    setLoading(false);
  };

  const download = () => {
    if (!result) return;
    const name = pageCount === 1 ? "page_1.jpg" : "pdf_images.zip";
    downloadBlob(result, name);
  };

  return (
    <ToolLayout title="PDF to JPG" description="Convert every PDF page to a high-quality JPEG image." icon="🖼️" accentColor={C.red}>
      {result ? (
        <DoneState
          message={`${pageCount} page${pageCount > 1 ? "s" : ""} converted!`}
          downloadLabel={pageCount === 1 ? "Download JPG" : "Download ZIP"}
          onDownload={download}
          onReset={() => { setResult(null); setFiles([]); setPageCount(0); }}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Dropzone files={files} onChange={setFiles} accept=".pdf" />
          <Field label="Resolution">
            <Pills options={DPI_OPTIONS} value={dpi} onChange={v => setDpi(v as number)} />
          </Field>
          <Slider label="JPEG Quality" value={quality} min={30} max={100} step={5} onChange={setQuality} format={v => `${v}%`} />
          <InfoBox>🖼️ Multiple pages are packaged into a <strong>ZIP file</strong>. Single-page PDFs download as a single JPG. Requires: <code style={{ background: "#F3F4F6", padding: "1px 5px", borderRadius: 4 }}>npm i pdfjs-dist</code></InfoBox>
          {loading && (
            <div style={{ background: "#E5E7EB", borderRadius: 4, height: 6, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: C.red, transition: "width 0.4s" }} />
            </div>
          )}
          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}
          <Btn onClick={process} loading={loading} disabled={!files.length} fullWidth>🖼️ Convert to JPG</Btn>
        </div>
      )}
    </ToolLayout>
  );
}
