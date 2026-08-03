"use client";
import React, { useState } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, ToolFile, downloadBlob, InfoBox, C } from "./_shared";

/**
 * AJN PDF to PPT - Professional Synthesis
 * Hardened: Uses modern .mjs worker format for PDF.js v4 compatibility.
 */
async function pdfToPptx(file: File): Promise<Blob> {
  const { initPdfWorker } = await import('@/lib/pdfjs-worker');
  initPdfWorker();
  const pdfjsLib = await import("pdfjs-dist");

  const buf = await file.arrayBuffer();
  // Fix: Ensure data is passed as Uint8Array for pdfjs v4 compatibility
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  const slideXmls: string[] = [];
  const slideRelXmls: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const lines = content.items.map((item: any) => item.str).filter(Boolean);
    const title = lines[0]?.slice(0, 80) || `Slide ${i}`;
    const bullets = lines.slice(1, 8);

    const bulletXml = bullets.map(b =>
      `<a:p><a:r><a:rPr lang="en-US" sz="1800"/><a:t>${b.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").slice(0,100)}</a:t></a:p>`
    ).join("");

    slideXmls.push(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
       xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
       xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:cSld><p:spTree>
    <p:sp><p:nvSpPr><p:cNvPr id="2" name="Title"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="title"/></p:nvPr></p:nvSpPr>
      <p:spPr/><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:t>${title.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</a:t></a:r></a:p></p:txBody>
    </p:sp>
    <p:sp><p:nvSpPr><p:cNvPr id="3" name="Content"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph idx="1"/></p:nvPr></p:nvSpPr>
      <p:spPr/><p:txBody><a:bodyPr/><a:lstStyle/>${bulletXml || "<a:p/>"}
      </p:txBody>
    </p:sp>
  </p:spTree></p:cSld>
</p:sld>`);

    slideRelXmls.push(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/></Relationships>`);
  }

  const n = pdf.numPages;
  const slideRefs = Array.from({ length: n }, (_, i) =>
    `<p:sldId id="${256+i}" r:id="rId${i+2}"/>`).join("");
  const presRels = Array.from({ length: n }, (_, i) =>
    `<Relationship Id="rId${i+2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i+1}.xml"/>`).join("\n");

  slideXmls.forEach((xml, i) => zip.file(`ppt/slides/slide${i+1}.xml`, xml));
  slideRelXmls.forEach((xml, i) => zip.file(`ppt/slides/_rels/slide${i+1}.xml.rels`, xml));

  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>${Array.from({length:n},(_,i)=>`<Override PartName="/ppt/slides/slide${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`).join("")}</Types>`);
  zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>`);
  zip.file("ppt/_rels/presentation.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${presRels}</Relationships>`);
  zip.file("ppt/presentation.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><p:sldMasterIdLst/><p:sldIdLst>${slideRefs}</p:sldIdLst><p:sldSz cx="9144000" cy="6858000"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>`);

  return zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation" });
}

export default function PdfToPpt() {
  const [files, setFiles]   = useState<ToolFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError]   = useState("");

  const process = async () => {
    if (!files.length) { setError("Upload a PDF first."); return; }
    setError(""); setLoading(true);
    try { setResult(await pdfToPptx(files[0].file)); }
    catch (e: any) { setError("Could not convert. Ensure the file is a valid PDF."); }
    setLoading(false);
  };

  return (
    <ToolLayout title="PDF to PPT" description="Convert each PDF page into a PowerPoint slide (.pptx)." icon="📽️" accentColor="#DC2626">
      {result ? (
        <DoneState message="PDF converted to PowerPoint!" downloadLabel="Download .pptx" onDownload={() => downloadBlob(result!, "presentation.pptx")} onReset={() => { setResult(null); setFiles([]); }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Dropzone files={files} onChange={setFiles} accept=".pdf" />
          <InfoBox color="#FEF2F2" textColor="#991B1B">📽️ Each PDF page becomes one slide. The first text line becomes the slide title. Requires: <code style={{ background: "#FEE2E2", padding: "1px 5px", borderRadius: 4 }}>jszip</code></InfoBox>
          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}
          <Btn onClick={process} loading={loading} disabled={!files.length} full style={{ background: "#DC2626" }}>📽️ Convert to PDF</Btn>
        </div>
      )}
    </ToolLayout>
  );
}
