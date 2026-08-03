
"use client";
import React, { useState } from "react";
import { ToolWorkspace, Drop, Btn, Done, F, Pills, ToolFile, dl } from "./_shared";
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
      setResult(zip);
      dl(zip, name);
    } catch (e: any) { setError(e.message || "Split failed."); }
    setLoading(false);
  };

  return (
    <ToolWorkspace title="Split PDF" description="Split a PDF into individual pages or custom page ranges." icon="✂️" badge="SPLIT UNIT" accent="#8B5CF6">
      {result ? (
        <Done msg="PDF split!" onReset={() => { setResult(null); setFiles([]); }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Drop files={files} onChange={setFiles} accept=".pdf" label="Drop PDF to split" />

          <F label="Split mode">
            <Pills
              opts={[{ label: "Split every page", value: "all" }, { label: "Custom ranges", value: "ranges" }]}
              val={mode} onChange={(v) => setMode(v as "all" | "ranges")}
            />
          </F>

          {mode === "ranges" && (
            <F label="Page ranges" hint="e.g. 1-3, 4-6, 7   Each range becomes a separate PDF">
              <input 
                style={{ 
                  width: "100%", 
                  border: "1.5px solid rgba(0,0,0,0.08)", 
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
            </F>
          )}

          {error && <p style={{ color: "#DC2626", fontSize: 13, fontWeight: 600 }}>⚠️ {error}</p>}

          <Btn onClick={process} loading={loading} disabled={!files.length} full style={{ background: "#8B5CF6" }}>✂️ Split PDF</Btn>
        </div>
      )}
    </ToolWorkspace>
  );
}
