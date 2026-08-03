"use client";
import React, { useState } from "react";
import { ToolLayout, Dropzone, Btn, Field, ToolFile, downloadBlob, InfoBox, C } from "./_shared";
import { extractText } from "./_pdfUtils";

export default function SmartRead() {
  const [files, setFiles]   = useState<ToolFile[]>([]);
  const [text, setText]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const process = async () => {
    if (!files.length) { setError("Upload a PDF first."); return; }
    setError(""); setLoading(true);
    try { setText(await extractText(files[0].file)); }
    catch (e: any) { setError("Could not extract text — the PDF may be image-based."); }
    setLoading(false);
  };

  const copy = () => navigator.clipboard.writeText(text).catch(() => {});
  const download = () => downloadBlob(new Blob([text], { type: "text/plain" }), "extracted_text.txt");
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <ToolLayout title="Smart Read Text" description="Extract all text content from PDF files directly in your browser." icon="🤖" accentColor={C.purple}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Dropzone files={files} onChange={setFiles} accept=".pdf" label="Drop PDF to extract text" sublabel="Works on text-based PDFs (not scanned images)" />
        <InfoBox color="#F5F3FF" textColor="#5B21B6">🤖 Text is extracted locally — nothing leaves your device. For scanned PDFs, use an OCR service.</InfoBox>
        {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}
        <Btn onClick={process} loading={loading} disabled={!files.length} fullWidth style={{ background: C.purple }}>🤖 Extract Text</Btn>

        {text && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
              <p style={{ fontSize: 13, fontWeight: 700 }}>Extracted Text <span style={{ color: C.gray, fontWeight: 400 }}>({wordCount} words · {text.length} chars)</span></p>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn variant="secondary" onClick={copy} style={{ padding: "6px 14px", fontSize: 12 }}>📋 Copy</Btn>
                <Btn variant="secondary" onClick={download} style={{ padding: "6px 14px", fontSize: 12 }}>⬇ Save</Btn>
              </div>
            </div>
            <textarea
              readOnly value={text} rows={14}
              style={{ width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "12px 14px", fontSize: 13, fontFamily: "inherit", outline: "none", resize: "vertical", lineHeight: 1.7, color: "#374151", background: "#FAFAFA", boxSizing: "border-box" }}
            />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
