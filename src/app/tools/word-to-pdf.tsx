"use client";
import React, { useState, useCallback } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, ToolFile, downloadBlob, InfoBox } from "./_shared";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

async function wordToPdf(file: File): Promise<Blob> {
  const mammoth = await import("mammoth");
  const buf = await file.arrayBuffer();
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer: buf });

  const plain = html.replace(/<[^>]+>/g, "\n").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\n{3,}/g, "\n\n");

  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const marginX = 56, marginY = 56, lineH = 16, fontSize = 11;
  const pageW = 595, pageH = 842;
  const maxW = pageW - marginX * 2;

  let page = doc.addPage([pageW, pageH]);
  let curY = pageH - marginY;

  const newPage = () => {
    page = doc.addPage([pageW, pageH]);
    curY = pageH - marginY;
  };

  const wrapLine = (line: string): string[] => {
    const words = line.split(" ");
    const lines: string[] = [];
    let cur = "";
    for (const word of words) {
      const test = cur ? `${cur} ${word}` : word;
      const tw = font.widthOfTextAtSize(test, fontSize);
      if (tw > maxW && cur) { lines.push(cur); cur = word; }
      else cur = test;
    }
    if (cur) lines.push(cur);
    return lines.length ? lines : [""];
  };

  for (const raw of plain.split("\n")) {
    const line = raw.replace(/[^\x20-\x7E]/g, ""); 
    for (const wrapped of wrapLine(line)) {
      if (curY < marginY + lineH) newPage();
      if (wrapped.trim()) {
        page.drawText(wrapped, { x: marginX, y: curY, size: fontSize, font, color: rgb(0, 0, 0) });
      }
      curY -= lineH;
    }
  }

  const bytes = await doc.save();
  return new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

export default function WordToPdf() {
  const [files, setFiles]   = useState<ToolFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError]   = useState("");

  const process = async () => {
    if (!files.length) { setError("Upload a Word document first."); return; }
    setError(""); setLoading(true);
    try {
      setResult(await wordToPdf(files[0].file));
    } catch { 
      setError("Could not convert. Make sure it's a valid .docx file."); 
    }
    setLoading(false);
  };

  const reset = useCallback(() => {
    setResult(null);
    setFiles([]);
  }, []);

  return (
    <ToolLayout title="Word to PDF" description="Convert Word documents (.docx) to PDF entirely in your browser." icon="📝" accentColor="#2563EB">
      {result ? (
        <DoneState message="Word converted to PDF!" onDownload={() => downloadBlob(result, "document.pdf")} onReset={reset} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Dropzone files={files} onChange={setFiles} accept=".docx,.doc" label="Drop Word document here" sublabel="Supports .docx format" />
          <InfoBox>📝 Conversion happens 100% in your browser using <strong>mammoth.js</strong>. Complex formatting (tables, images, columns) is simplified to plain text layout.</InfoBox>
          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}
          <Btn onClick={process} loading={loading} disabled={!files.length} fullWidth style={{ background: "#2563EB" }}>📝 Convert to PDF</Btn>
        </div>
      )}
    </ToolLayout>
  );
}