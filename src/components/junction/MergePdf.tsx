"use client";

import React, { useRef, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { ToolWorkspace, Btn, Done, Err, F, IS, ToolFile, dl, fmtBytes, Info, T } from "./_shared";
import { mergePdfs } from "./_pdfUtils";
import { hasPdfHeader, safeOutputName, validateFiles } from "@/lib/file-validation";

export default function MergePdf() {
  const [files, setFiles] = useState<ToolFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [outputName, setOutputName] = useState("merged.pdf");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = async (list: FileList | null) => {
    if (!list) return;
    const incoming = Array.from(list);
    const validation = validateFiles(incoming, { extensions: [".pdf"], maxSizeMb: 50, maxFiles: 30 });
    if (validation) { setError(validation); return; }
    for (const file of incoming) {
      if (!(await hasPdfHeader(file))) { setError(`${file.name} is not a valid PDF.`); return; }
    }
    setError("");
    setFiles(prev => [...prev, ...incoming.map(file => ({ file, name: file.name, size: file.size }))].slice(0, 30));
  };

  const move = (index: number, direction: -1 | 1) => {
    const next = [...files];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setFiles(next);
  };

  const process = async () => {
    const validation = validateFiles(files.map(item => item.file), { extensions: [".pdf"], minFiles: 2, maxFiles: 30, maxSizeMb: 50 });
    if (validation) { setError(validation); return; }
    setError(""); setLoading(true);
    try { setResult(await mergePdfs(files.map(item => item.file))); }
    catch (e: any) { setError(e.message || "The PDFs could not be merged."); }
    finally { setLoading(false); }
  };

  const reset = () => { setResult(null); setFiles([]); setError(""); setOutputName("merged.pdf"); };

  return (
    <ToolWorkspace title="Merge PDF" description="Combine PDF files in your chosen order" icon="🔗" badge="PDF MERGE" accent={T.blue}>
      {result ? (
        <Done msg="PDFs merged successfully" onDownload={() => dl(result, safeOutputName(outputName, "merged", ".pdf"))} onReset={reset} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="jn-drop" onClick={() => inputRef.current?.click()}>
            <input ref={inputRef} type="file" accept=".pdf,application/pdf" multiple hidden onChange={event => void addFiles(event.target.files)} />
            <div style={{ width: 42, height: 42, borderRadius: 14, background: "white", display: "grid", placeItems: "center", margin: "0 auto 8px", boxShadow: "0 8px 24px rgba(0,0,0,.06)" }}><Plus size={18} /></div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 900, textTransform: "uppercase" }}>Select PDF files</p>
            <p style={{ margin: "3px 0 0", fontSize: 9, color: T.gray, fontWeight: 800, textTransform: "uppercase" }}>2–30 PDFs · maximum 50 MB each · processed locally</p>
          </div>

          {files.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {files.map((item, index) => (
                <div key={`${item.name}-${index}`} className="jn-file-pill">
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p title={item.name} style={{ margin: 0, fontSize: 11, fontWeight: 850, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{index + 1}. {item.name}</p>
                    <p style={{ margin: 0, fontSize: 9, color: T.gray }}>{fmtBytes(item.size)}</p>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button aria-label={`Move ${item.name} up`} disabled={index === 0} onClick={() => move(index, -1)} className="h-8 w-8 rounded-lg bg-black/5 disabled:opacity-30 grid place-items-center"><ArrowUp size={13} /></button>
                    <button aria-label={`Move ${item.name} down`} disabled={index === files.length - 1} onClick={() => move(index, 1)} className="h-8 w-8 rounded-lg bg-black/5 disabled:opacity-30 grid place-items-center"><ArrowDown size={13} /></button>
                    <button aria-label={`Remove ${item.name}`} onClick={() => setFiles(files.filter((_, i) => i !== index))} className="h-8 w-8 rounded-lg bg-red-500/10 text-red-600 grid place-items-center"><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <F label="Output filename"><input style={IS} value={outputName} onChange={event => setOutputName(event.target.value)} placeholder="merged.pdf" /></F>
          {files.length >= 2 && <Info><strong>{files.length} PDFs</strong> will be merged in the exact order shown above.</Info>}
          <Err msg={error} />
          <Btn onClick={process} loading={loading} disabled={files.length < 2} full style={{ background: T.blue }}>Merge {files.length || ""} PDFs</Btn>
        </div>
      )}
    </ToolWorkspace>
  );
}
