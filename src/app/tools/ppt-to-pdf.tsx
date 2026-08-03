"use client";
import React, { useState } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, ToolFile, downloadBlob, InfoBox, C } from "./_shared";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

async function pptxToPdf(file: File): Promise<Blob> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(await file.arrayBuffer());

  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const W = 720, H = 540;

  // Find all slide XML files
  const slideFiles = Object.keys(zip.files)
    .filter(n => /ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)![0]);
      const numB = parseInt(b.match(/\d+/)![0]);
      return numA - numB;
    });

  for (let si = 0; si < slideFiles.length; si++) {
    const xml = await zip.files[slideFiles[si]].async("string");
    // Extract text runs from XML
    const texts = [...xml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)].map(m =>
      m[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").trim()
    ).filter(Boolean);

    const page = doc.addPage([W, H]);
    // Slide background
    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: rgb(1, 1, 1) });
    // Slide number badge
    page.drawText(`Slide ${si + 1}`, { x: W - 70, y: H - 22, size: 9, font, color: rgb(0.7, 0.7, 0.7) });

    if (texts.length === 0) {
      page.drawText("(No text content)", { x: 40, y: H / 2, size: 13, font, color: rgb(0.6, 0.6, 0.6) });
      continue;
    }

    // First text = title
    const title = texts[0].slice(0, 80);
    page.drawText(title, { x: 40, y: H - 60, size: 20, font: boldFont, color: rgb(0.1, 0.1, 0.1) });

    // Remaining texts = bullets
    let y = H - 100;
    for (const t of texts.slice(1)) {
      if (y < 30) break;
      const line = t.slice(0, 90);
      page.drawText(`• ${line}`, { x: 50, y, size: 12, font, color: rgb(0.25, 0.25, 0.25) });
      y -= 22;
    }
  }

  if (doc.getPageCount() === 0) {
    const p = doc.addPage([W, H]);
    p.drawText("No slides found", { x: 40, y: H / 2, size: 14, font, color: rgb(0.5, 0.5, 0.5) });
  }

  return new Blob([await doc.save().then((b: Uint8Array) => b.buffer as ArrayBuffer)], { type: "application/pdf" });
}

export default function PptToPdf() {
  const [files, setFiles]   = useState<ToolFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError]   = useState("");

  const process = async () => {
    if (!files.length) { setError("Upload a PowerPoint file first."); return; }
    setError(""); setLoading(true);
    try { setResult(await pptxToPdf(files[0].file)); }
    catch (e: any) { setError("Could not convert. Make sure it's a valid .pptx file."); }
    setLoading(false);
  };

  return (
    <ToolLayout title="PPT to PDF" description="Convert PowerPoint presentations to PDF in your browser." icon="📽️" accentColor="#DC2626">
      {result ? (
        <DoneState message="Presentation converted to PDF!" onDownload={() => downloadBlob(result, "presentation.pdf")} onReset={() => { setResult(null); setFiles([]); }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Dropzone files={files} onChange={setFiles} accept=".pptx" label="Drop PowerPoint file here" sublabel="Supports .pptx format (PowerPoint 2007+)" />
          <InfoBox color="#FEF2F2" textColor="#991B1B">📽️ Browser conversion extracts text from each slide. Images, charts, and exact layout are not preserved — for pixel-perfect output, use the desktop app.</InfoBox>
          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}
          <Btn onClick={process} loading={loading} disabled={!files.length} fullWidth style={{ background: "#DC2626" }}>📽️ Convert to PDF</Btn>
        </div>
      )}
    </ToolLayout>
  );
}
