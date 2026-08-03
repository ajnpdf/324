"use client";
import React, { useState } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, Field, Pills, ToolFile, downloadBlob, InfoBox, S, C } from "./_shared";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

async function htmlTextToPdf(html: string): Promise<Blob> {
  // Strip HTML to plain text then render as PDF
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  const plain = (tmp.textContent || tmp.innerText || "").replace(/\n{3,}/g, "\n\n");

  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontSize = 11, lineH = 16, marginX = 56, marginY = 56;
  const pageW = 595, pageH = 842, maxW = pageW - marginX * 2;

  let page = doc.addPage([pageW, pageH]);
  let curY = pageH - marginY;

  const wrapLine = (line: string): string[] => {
    const words = line.split(" ");
    const lines: string[] = [];
    let cur = "";
    for (const word of words) {
      const test = cur ? `${cur} ${word}` : word;
      if (font.widthOfTextAtSize(test, fontSize) > maxW && cur) { lines.push(cur); cur = word; }
      else cur = test;
    }
    if (cur) lines.push(cur);
    return lines.length ? lines : [""];
  };

  for (const raw of plain.split("\n")) {
    const safe = raw.replace(/[^\x20-\x7E]/g, "");
    for (const wrapped of wrapLine(safe)) {
      if (curY < marginY + lineH) { page = doc.addPage([pageW, pageH]); curY = pageH - marginY; }
      if (wrapped.trim()) page.drawText(wrapped, { x: marginX, y: curY, size: fontSize, font, color: rgb(0, 0, 0) });
      curY -= lineH;
    }
  }
  const _hb = await doc.save(); return new Blob([_hb.buffer as ArrayBuffer], { type: "application/pdf" });
}

export default function HtmlToPdf() {
  const [mode, setMode]     = useState<"paste" | "file">("paste");
  const [html, setHtml]     = useState("<h1>Hello World</h1>\n<p>Your HTML content goes here.</p>");
  const [files, setFiles]   = useState<ToolFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError]   = useState("");

  const process = async () => {
    setError(""); setLoading(true);
    try {
      let content = html;
      if (mode === "file") {
        if (!files.length) { setError("Upload an HTML file."); setLoading(false); return; }
        content = await files[0].file.text();
      }
      if (!content.trim()) { setError("No HTML content."); setLoading(false); return; }
      setResult(await htmlTextToPdf(content));
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <ToolLayout title="HTML to PDF" description="Convert HTML code or .html files to PDF in your browser." icon="🌐" accentColor="#D97706">
      {result ? (
        <DoneState message="HTML converted to PDF!" onDownload={() => downloadBlob(result, "page.pdf")} onReset={() => { setResult(null); setFiles([]); }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Field label="Input method">
            <Pills options={[{ label: "Paste HTML", value: "paste" }, { label: "Upload .html file", value: "file" }]} value={mode} onChange={v => setMode(v as "paste" | "file")} color="#D97706" />
          </Field>

          {mode === "paste" ? (
            <Field label="HTML content">
              <textarea value={html} onChange={e => setHtml(e.target.value)} rows={12}
                style={{ ...S.input, resize: "vertical", fontFamily: "monospace", fontSize: 12, lineHeight: 1.6 }} />
            </Field>
          ) : (
            <Dropzone files={files} onChange={setFiles} accept=".html,.htm" label="Drop .html file here" />
          )}

          <InfoBox color="#FFFBEB" textColor="#92400E">🌐 Text content is extracted from HTML and laid out in a clean A4 PDF. CSS styles, images, and complex layouts are not rendered. For pixel-perfect HTML-to-PDF, use a headless browser (Puppeteer).</InfoBox>
          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}
          <Btn onClick={process} loading={loading} fullWidth style={{ background: "#D97706" }}>🌐 Convert to PDF</Btn>
        </div>
      )}
    </ToolLayout>
  );
}
