"use client";
import React, { useState } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, Field, Grid2, ToolFile, downloadBlob, InfoBox, S, C } from "./_shared";
import { addImageToPdf } from "./_pdfUtils";

export default function AddImageToPdf() {
  const [pdfFiles, setPdf]    = useState<ToolFile[]>([]);
  const [imgFiles, setImg]    = useState<ToolFile[]>([]);
  const [x, setX]             = useState(50);
  const [y, setY]             = useState(100);
  const [w, setW]             = useState(200);
  const [h, setH]             = useState(150);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<Blob | null>(null);
  const [error, setError]     = useState("");

  const process = async () => {
    if (!pdfFiles.length) { setError("Upload a PDF file."); return; }
    if (!imgFiles.length) { setError("Upload an image to insert."); return; }
    setError(""); setLoading(true);
    try {
      const blob = await addImageToPdf(pdfFiles[0].file, imgFiles[0].file, x, y, w, h, page);
      setResult(blob);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <ToolLayout title="Add Image to PDF" description="Embed a JPG or PNG image anywhere on a PDF page." icon="🖼️" accentColor="#7C3AED">
      {result ? (
        <DoneState
          message="Image added to PDF!"
          onDownload={() => downloadBlob(result!, "image_added.pdf")}
          onReset={() => { setResult(null); setPdf([]); setImg([]); }}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* PDF upload */}
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10 }}>📄 Target PDF</p>
            <Dropzone files={pdfFiles} onChange={setPdf} accept=".pdf" label="Drop PDF here" sublabel="The PDF to add an image to" />
          </div>

          {/* Image upload */}
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10 }}>🖼️ Image to insert</p>
            <Dropzone files={imgFiles} onChange={setImg} accept=".jpg,.jpeg,.png" label="Drop image here" sublabel="JPG or PNG supported" />
          </div>

          {/* Position controls */}
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 12 }}>Placement (PDF points — 72pt = 1 inch)</p>
            <Grid2>
              <Field label="X — from left (pt)"><input style={S.input} type="number" min={0} value={x} onChange={e => setX(Number(e.target.value))} /></Field>
              <Field label="Y — from bottom (pt)"><input style={S.input} type="number" min={0} value={y} onChange={e => setY(Number(e.target.value))} /></Field>
              <Field label="Width (pt)"><input style={S.input} type="number" min={10} value={w} onChange={e => setW(Number(e.target.value))} /></Field>
              <Field label="Height (pt)"><input style={S.input} type="number" min={10} value={h} onChange={e => setH(Number(e.target.value))} /></Field>
              <Field label="Page number"><input style={S.input} type="number" min={1} value={page} onChange={e => setPage(Number(e.target.value))} /></Field>
            </Grid2>
          </div>

          <InfoBox color="#F5F3FF" textColor="#5B21B6">
            💡 Y=0 is the <strong>bottom</strong> of the page in PDF coordinates. For A4 (842pt tall), Y=692 places the image 150pt from the top.
          </InfoBox>

          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}

          <Btn
            onClick={process}
            loading={loading}
            disabled={!pdfFiles.length || !imgFiles.length}
            fullWidth
            style={{ background: "#7C3AED" }}
          >
            🖼️ Add Image to PDF
          </Btn>
        </div>
      )}
    </ToolLayout>
  );
}
