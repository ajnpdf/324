"use client";
import React, { useState } from "react";
import { ToolWorkspace, Drop, Btn, Done, F, Pills, Info, Err, ToolFile, dl, T } from "./_shared";

interface Slide { title: string; bullets: string[]; notes: string; }

async function parsePptx(file: File): Promise<Slide[]> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(await file.arrayBuffer());

  const slideKeys = Object.keys(zip.files)
    .filter(n => /ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => {
      const na = parseInt(a.match(/\d+/)![0]);
      const nb = parseInt(b.match(/\d+/)![0]);
      return na - nb;
    });

  const slides: Slide[] = [];

  for (let si = 0; si < slideKeys.length; si++) {
    const xml = await zip.files[slideKeys[si]].async("string");

    const paras = [...xml.matchAll(/<a:p>([\s\S]*?)<\/a:p>/g)].map(m => {
      const runs = [...m[1].matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)].map(r =>
        r[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').trim()
      );
      return runs.join(" ").trim();
    }).filter(Boolean);

    const noteKey = `ppt/notesSlides/notesSlide${si + 1}.xml`;
    let notes = "";
    if (zip.files[noteKey]) {
      const nxml = await zip.files[noteKey].async("string");
      const noteTexts = [...nxml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)].map(m => m[1].trim()).filter(Boolean);
      notes = noteTexts.join(" ").trim();
    }

    const title = paras[0] || `Slide ${si + 1}`;
    const bullets = paras.slice(1);
    slides.push({ title, bullets, notes });
  }

  return slides;
}

function slidesToTxt(slides: Slide[]): Blob {
  const lines: string[] = [];
  slides.forEach((s, i) => {
    lines.push(`${"=".repeat(60)}`);
    lines.push(`SLIDE ${i + 1}: ${s.title}`);
    lines.push(`${"=".repeat(60)}`);
    if (s.bullets.length) s.bullets.forEach(b => lines.push(`  • ${b}`));
    if (s.notes) { lines.push(""); lines.push(`  [Notes]: ${s.notes}`); }
    lines.push("");
  });
  return new Blob([lines.join("\n")], { type: "text/plain" });
}

async function slidesToDocxAsync(slides: Slide[]): Promise<Blob> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const paraXml = (text: string, bold = false, size = 24): string =>
    `<w:p><w:pPr><w:spacing w:after="80"/></w:pPr><w:r><w:rPr>${bold ? "<w:b/>" : ""}<w:sz w:val="${size}"/><w:szCs w:val="${size}"/></w:rPr><w:t xml:space="preserve">${escape(text)}</w:t></w:r></w:p>`;
  const rulerXml = `<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="CCCCCC"/></w:pBdr></w:pPr></w:p>`;

  let bodyContent = "";
  slides.forEach((s, i) => {
    bodyContent += paraXml(`Slide ${i + 1}`, false, 18);
    bodyContent += paraXml(s.title, true, 32);
    s.bullets.forEach(b => { if (b) bodyContent += paraXml(`• ${b}`, false, 22); });
    if (s.notes) bodyContent += paraXml(`Notes: ${s.notes}`, false, 20);
    bodyContent += rulerXml;
    bodyContent += paraXml("");
  });

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${bodyContent}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>`;
  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`);
  zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`);
  zip.file("word/document.xml", documentXml);

  const buf = await zip.generateAsync({ type: "arraybuffer", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  return new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
}

export default function PptToWord() {
  const [files, setF] = useState<ToolFile[]>([]);
  const [format, setFormat] = useState<"docx" | "txt">("docx");
  const [loading, setL] = useState(false);
  const [result, setR] = useState<Blob | null>(null);
  const [slideCount, setSlideCount] = useState(0);
  const [err, setE] = useState("");

  const run = async () => {
    if (!files.length) { setE("Upload a PowerPoint file."); return; }
    setE(""); setL(true);
    try {
      const slides = await parsePptx(files[0].file);
      if (!slides.length) throw new Error("No slides found in the file.");
      setSlideCount(slides.length);
      const blob = format === "docx" ? await slidesToDocxAsync(slides) : slidesToTxt(slides);
      setR(blob);
    } catch (e: any) {
      setE(e.message || "Conversion failed. Ensure the file is a valid .pptx.");
    }
    setL(false);
  };

  const baseName = files[0]?.name.replace(/\.pptx?$/i, "") || "presentation";
  const ext = format === "docx" ? "docx" : "txt";

  return (
    <ToolWorkspace title="PPT to Word" description="Extract all slide text and notes from PowerPoint into a Word document." icon="📝" accent={T.amber} badge="PPT → WORD">
      {result ? (
        <Done msg={`${slideCount} slides extracted!`} onDownload={() => dl(result, `${baseName}.${ext}`)} dlLabel={`Download .${ext.toUpperCase()}`} onReset={() => { setR(null); setF([]); }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Drop files={files} onChange={setF} accept=".pptx" label="Drop PowerPoint file here" sub="Supports .pptx (PowerPoint 2007 and newer)" />
          <F label="Output format">
            <Pills opts={[{ label: "Word Document (.docx)", value: "docx" }, { label: "Plain Text (.txt)", value: "txt" }]} val={format} onChange={(v: any) => setFormat(v)} />
          </F>
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100"><p className="text-[11px] font-bold text-amber-700 leading-relaxed uppercase tracking-wider mb-0">📝 Extracts slide titles, bullets, and notes. Visual layout is not preserved. No server needed.</p></div>
          <Err msg={err} /><Btn onClick={run} loading={loading} disabled={!files.length} full style={{ background: T.amber }}>📝 Convert to {format === "docx" ? "Word" : "Text"}</Btn>
        </div>
      )}
    </ToolWorkspace>
  );
}