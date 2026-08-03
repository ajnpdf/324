"use client";
import React, { useState } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, Field, Pills, ToolFile, downloadBlob } from "./_shared";
import { splitPdf, filesToZip } from "./_pdfUtils";

export default function SplitPdf() {
  const [files, setFiles] = useState<ToolFile[]>([]);
  const [mode, setMode] = useState<"all" | "ranges">("all");
  const [ranges, setRanges] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState("");

  const process = async () => {
    if (!files.length) { setError("Please upload a PDF."); return; }
    setError(""); setLoading(true);
    try {
      const parts = await splitPdf(files[0].file, mode === "ranges" ? ranges : "");
      const zip = parts.length === 1 ? parts[0].blob : await filesToZip(parts);
      const name = parts.length === 1 ? parts[0].name : "split_pages.zip";
      setResult(new File([zip], name));
      // auto download
      downloadBlob(zip, name);
    } catch (e: any) { setError(e.message || "Split failed."); }
    setLoading(false);
  };

  return (
    <ToolLayout title="Split PDF" description="Split a PDF into individual pages or custom page ranges." icon="✂️" accentColor="#8B5CF6">
      {result ? (
        <DoneState message="PDF split!" onReset={() => { setResult(null); setFiles([]); }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Dropzone files={files} onChange={setFiles} accept=".pdf" label="Drop PDF to split" />

          <Field label="Split mode">
            <Pills
              options={[{ label: "Split every page", value: "all" }, { label: "Custom ranges", value: "ranges" }]}
              value={mode} onChange={(v) => setMode(v as "all" | "ranges")}
            />
          </Field>

          {mode === "ranges" && (
            <Field label="Page ranges" hint="e.g. 1-3, 4-6, 7   Each range becomes a separate PDF">
              <input 
                style={{ 
                  width: "100%", 
                  border: "1.5px solid rgba(30, 41, 59, 0.1)", 
                  borderRadius: 12, 
                  padding: "10px 13px", 
                  fontSize: 14, 
                  outline: "none", 
                  background: "rgba(255,255,255,0.6)", 
                  fontWeight: 700 
                }} 
                value={ranges} 
                onChange={e => setRanges(e.target.value)} 
                placeholder="1-3, 4-6, 7" 
              />
            </Field>
          )}

          {error && <p style={{ color: "#DC2626", fontSize: 13, fontWeight: 600 }}>⚠️ {error}</p>}

          <Btn onClick={process} loading={loading} disabled={!files.length} fullWidth>✂️ Split PDF</Btn>
        </div>
      )}
    </ToolLayout>
  );
}
