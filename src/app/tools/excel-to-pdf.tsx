"use client";
import React, { useState } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, ToolFile, downloadBlob, InfoBox, C } from "./_shared";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

async function excelToPdf(file: File): Promise<Blob> {
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });

  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Courier);
  const boldFont = await doc.embedFont(StandardFonts.CourierBold);
  const fontSize = 9;
  const lineH = 13;
  const pageW = 842, pageH = 595; // A4 landscape
  const marginX = 40, marginY = 40;
  const colW = 90;

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const data: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as string[][];

    let page = doc.addPage([pageW, pageH]);
    let curY = pageH - marginY;

    // Sheet title
    page.drawText(`Sheet: ${sheetName}`, {
      x: marginX, y: curY, size: 12, font: boldFont, color: rgb(0.15, 0.15, 0.15),
    });
    curY -= 20;

    for (const row of data) {
      if (curY < marginY + lineH) {
        page = doc.addPage([pageW, pageH]);
        curY = pageH - marginY;
      }
      const cols = Math.min(row.length, Math.floor((pageW - marginX * 2) / colW));
      for (let c = 0; c < cols; c++) {
        const cell = String(row[c] ?? "").slice(0, 14);
        const x = marginX + c * colW;
        page.drawText(cell, { x, y: curY, size: fontSize, font, color: rgb(0, 0, 0) });
      }
      // Row divider
      page.drawLine({ start: { x: marginX, y: curY - 2 }, end: { x: pageW - marginX, y: curY - 2 }, thickness: 0.3, color: rgb(0.85, 0.85, 0.85) });
      curY -= lineH;
    }
  }

  return new Blob([await doc.save().then((b: Uint8Array) => b.buffer as ArrayBuffer)], { type: "application/pdf" });
}

export default function ExcelToPdf() {
  const [files, setFiles]   = useState<ToolFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError]   = useState("");

  const process = async () => {
    if (!files.length) { setError("Upload an Excel file first."); return; }
    setError(""); setLoading(true);
    try { setResult(await excelToPdf(files[0].file)); }
    catch (e: any) { setError("Could not convert. Make sure it's a valid .xlsx/.xls file."); }
    setLoading(false);
  };

  return (
    <ToolLayout title="Excel to PDF" description="Convert Excel spreadsheets to PDF in your browser." icon="📊" accentColor="#059669">
      {result ? (
        <DoneState message="Excel converted to PDF!" onDownload={() => downloadBlob(result, "spreadsheet.pdf")} onReset={() => { setResult(null); setFiles([]); }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Dropzone files={files} onChange={setFiles} accept=".xlsx,.xls,.csv" label="Drop Excel or CSV file here" sublabel="Supports .xlsx, .xls, .csv" />
          <InfoBox color="#ECFDF5" textColor="#065F46">📊 Uses <strong>SheetJS (xlsx)</strong> for reading. Renders in landscape A4 with all sheets. Install: <code style={{ background: "#D1FAE5", padding: "1px 5px", borderRadius: 4 }}>npm i xlsx</code></InfoBox>
          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}
          <Btn onClick={process} loading={loading} disabled={!files.length} fullWidth style={{ background: "#059669" }}>📊 Convert to PDF</Btn>
        </div>
      )}
    </ToolLayout>
  );
}
