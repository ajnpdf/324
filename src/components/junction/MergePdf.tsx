
"use client";
import React, { useState, useRef } from "react";
import { ToolWorkspace, Drop, Btn, Done, ToolFile, dl, Info, T } from "./_shared";
import { mergePdfs } from "./_pdfUtils";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MergePdf() {
  const [files, setFiles] = useState<ToolFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState("");
  const addInputRef = useRef<HTMLInputElement>(null);

  const process = async () => {
    if (files.length < 2) { setError("Please upload at least 2 PDF files."); return; }
    setError(""); setLoading(true);
    try {
      const blob = await mergePdfs(files.map(f => f.file));
      setResult(blob);
    } catch (e: any) { setError(e.message || "Merge failed."); }
    setLoading(false);
  };

  const handleAddMore = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const arr = Array.from(e.target.files).map(f => ({ file: f, name: f.name, size: f.size }));
      setFiles(prev => [...prev, ...arr]);
    }
  };

  return (
    <ToolWorkspace title="Merge PDF" description="Combine multiple PDF files into one in the order you choose." icon="🔗" badge="COMBINE UNIT" accent={T.blue}>
      {result ? (
        <Done msg="PDFs merged!" onDownload={() => dl(result, "merged.pdf")} onReset={() => { setResult(null); setFiles([]); }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Drop files={files} onChange={setFiles} accept=".pdf" multiple label="Drop PDFs here (2 or more)" sub="Files merge in listed order" />

          <div style={{ display: "flex", justifyContent: "center", borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: 12 }}>
            <input type="file" multiple accept=".pdf" ref={addInputRef} className="hidden" onChange={handleAddMore} />
            <Button 
              variant="outline" 
              onClick={() => addInputRef.current?.click()}
              className="h-9 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 bg-white border-black/5 hover:bg-black/5 shadow-sm transition-all px-8"
            >
              <Plus className="w-4 h-4" /> Add more PDFs
            </Button>
          </div>

          {files.length >= 2 && (
            <Info>📋 <strong>{files.length} files</strong> will be merged in the order shown. Remove ✕ to reorder.</Info>
          )}

          {error && <p style={{ color: "#DC2626", fontSize: 13, fontWeight: 600 }}>⚠️ {error}</p>}

          <Btn onClick={process} loading={loading} disabled={files.length < 2} full style={{ background: T.blue }}>
            🔗 Merge {files.length > 0 ? `${files.length} PDFs` : "PDFs"}
          </Btn>
        </div>
      )}
    </ToolWorkspace>
  );
}
