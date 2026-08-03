"use client";
import React, { useState, useEffect } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, Field, ToolFile, downloadBlob, InfoBox, S, C } from "./_shared";
import { editMetadata, loadPdf } from "./_pdfUtils";

export default function PdfMetadata() {
  const [files,    setFiles]   = useState<ToolFile[]>([]);
  const [title,    setTitle]   = useState("");
  const [author,   setAuthor]  = useState("");
  const [subject,  setSubject] = useState("");
  const [keywords, setKeywords] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [reading,  setReading]  = useState(false);
  const [result,   setResult]  = useState<Blob | null>(null);
  const [error,    setError]   = useState("");

  useEffect(() => {
    if (!files.length) { setTitle(""); setAuthor(""); setSubject(""); setKeywords(""); return; }
    setReading(true);
    const run = async () => {
      try {
        const doc = await loadPdf(files[0].file);
        setTitle(doc.getTitle() || "");
        setAuthor(doc.getAuthor() || "");
        setSubject(doc.getSubject() || "");
        
        // pdf-lib keywords standard handling: it returns a string or undefined in v1.x
        const kw = doc.getKeywords();
        setKeywords(typeof kw === 'string' ? kw : "");
      } catch {
        console.warn("Could not parse metadata from source.");
      }
      setReading(false);
    };
    run();
  }, [files]);

  const process = async () => {
    if (!files.length) { setError("Upload a PDF first."); return; }
    setError(""); setLoading(true);
    try {
      const blob = await editMetadata(files[0].file, title, author, subject, keywords);
      setResult(blob);
    } catch (e: any) { 
      setError(e.message || "Synthesis failed."); 
    }
    setLoading(false);
  };

  return (
    <ToolLayout title="PDF Metadata" description="View and edit the title, author, subject and keywords of any PDF." icon="🏷️" accentColor="#0891B2">
      {result ? (
        <DoneState
          message="Metadata saved!"
          onDownload={() => downloadBlob(result!, "metadata_" + (files[0]?.name || "document.pdf"))}
          onReset={() => { setResult(null); setFiles([]); }}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Dropzone files={files} onChange={setFiles} accept=".pdf" label="Drop PDF here to view & edit metadata" />

          {reading && (
            <p style={{ fontSize: 13, color: C.gray, textAlign: "center" }}>
              ⏳ Reading current metadata…
            </p>
          )}

          {files.length > 0 && !reading && (
            <>
              <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 12 }}>
                  Document metadata — edit any field below
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <Field label="Title">
                    <input style={S.input} value={title} onChange={e => setTitle(e.target.value)} placeholder="Document title" />
                  </Field>
                  <Field label="Author">
                    <input style={S.input} value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author name" />
                  </Field>
                  <Field label="Subject">
                    <input style={S.input} value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject or description" />
                  </Field>
                  <Field label="Keywords" hint="Separate keywords with commas">
                    <input style={S.input} value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="pdf, document, report" />
                  </Field>
                </div>
              </div>

              <InfoBox color="#ECFEFF" textColor="#0E7490">
                🏷️ Metadata is embedded in the PDF and visible in file properties. Leave fields blank to keep them unchanged.
              </InfoBox>
            </>
          )}

          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}

          <Btn
            onClick={process}
            loading={loading}
            disabled={!files.length}
            full
            style={{ background: "#0891B2" }}
          >
            🏷️ Save Metadata
          </Btn>
        </div>
      )}
    </ToolLayout>
  );
}
