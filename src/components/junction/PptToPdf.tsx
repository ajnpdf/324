"use client";
import React, { useState } from "react";
import { ToolWorkspace, Drop, Btn, Done, Info, Err, ToolFile, dl } from "./_shared";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

async function convert(file: File): Promise<Blob> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bf = await doc.embedFont(StandardFonts.HelveticaBold);
  const W = 720, H = 540;
  
  const slides = Object.keys(zip.files)
    .filter(n => /ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)![0]);
      const numB = parseInt(b.match(/\d+/)![0]);
      return numA - numB;
    });

  for (let si = 0; si < slides.length; si++) {
    const xml = await zip.files[slides[si]].async("string");
    const texts = [...xml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)]
      .map(m => m[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim())
      .filter(Boolean);
      
    const page = doc.addPage([W, H]);
    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: rgb(1, 1, 1) });
    page.drawText(`Slide ${si + 1}`, { x: W - 70, y: H - 22, size: 9, font, color: rgb(0.7, 0.7, 0.7) });

    if (!texts.length) {
      page.drawText("(No text content)", { x: 40, y: H / 2, size: 13, font, color: rgb(0.6, 0.6, 0.6) });
      continue;
    }
    
    page.drawText(texts[0].slice(0, 80), { x: 40, y: H - 60, size: 20, font: bf, color: rgb(0.1, 0.1, 0.1) });
    let y = H - 100;
    for (const t of texts.slice(1)) {
      if (y < 30) break;
      page.drawText(`• ${t.slice(0, 90)}`, { x: 50, y, size: 12, font, color: rgb(0.25, 0.25, 0.25) });
      y -= 22;
    }
  }
  
  if (!doc.getPageCount()) {
    const p = doc.addPage([W, H]);
    p.drawText("No slides found", { x: 40, y: H / 2, size: 14, font, color: rgb(0.5, 0.5, 0.5) });
  }
  
  const finalBytes = await doc.save();
  return new Blob([finalBytes.buffer as ArrayBuffer], { type: "application/pdf" });
}

export default function PptToPdf() {
  const [files, setF] = useState<ToolFile[]>([]);
  const [loading, setL] = useState(false);
  const [result, setR] = useState<Blob | null>(null);
  const [err, setE] = useState("");

  const run = async () => {
    if (!files.length) { setE("Upload a PowerPoint file."); return; }
    setE(""); setL(true);
    try {
      setR(await convert(files[0].file));
    } catch {
      setE("Could not convert — ensure it's a valid .pptx file.");
    }
    setL(false);
  };

  return (
    <ToolWorkspace title="PPT to PDF" description="CINEMATIC SLIDE-TO-DOCUMENT RASTERIZATION" icon="📽️" accent="#DC2626" badge="PPT TO PDF">
      {result ? (
        <Done msg="Presentation converted!" onDownload={() => dl(result, "presentation.pdf")} onReset={() => { setR(null); setF([]); }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Drop files={files} onChange={setF} accept=".pptx" label="Drop PowerPoint file here" sub="Supports .pptx (PowerPoint 2007+)" />
          <Info bg="#FEF2F2" col="#991B1B">📽️ Extracts slide text. Images and exact layout are not preserved. Requires: <code style={{ background: "#FEE2E2", padding: "1px 5px", borderRadius: 4 }}>jszip</code></Info>
          <Err msg={err} />
          <Btn onClick={run} loading={loading} disabled={!files.length} full style={{ background: "#DC2626" }}>📽️ Convert to PDF</Btn>
        </div>
      )}
    </ToolWorkspace>
  );
}