"use client";
import React, { useState } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, Field, ToolFile, downloadBlob, InfoBox, S, C } from "./_shared";
import { deletePages } from "./_pdfUtils";

export default function DeletePages() {
  const [files, setFiles]   = useState<ToolFile[]>([]);
  const [pages, setPages]   = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError]   = useState("");

  const process = async () => {
    if (!files.length) { setError("Upload a PDF first."); return; }
    if (!pages.trim()) { setError("Specify which pages to delete."); return; }
    setError(""); setLoading(true);
    try {
      const blob = await deletePages(files[0].file, pages);
      setResult(blob);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <ToolLayout title="Delete Pages" description="Remove specific pages from your PDF document." icon="🗑️" accentColor="#EF4444">
      {result ? (
        <DoneState message="Pages deleted!" onDownload={() => downloadBlob(result, "edited.pdf")} onReset={() => { setResult(null); setFiles([]); }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Dropzone files={files} onChange={setFiles} accept=".pdf" />
          <Field label="Pages to delete *" hint="e.g. 1, 3, 5-8   Separate multiple with commas">
            <input style={S.input} value={pages} onChange={e => setPages(e.target.value)} placeholder="e.g. 1, 3, 5-8" />
          </Field>
          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}
          <Btn onClick={process} loading={loading} disabled={!files.length || !pages.trim()} fullWidth style={{ background: "#EF4444" }}>🗑️ Delete Pages</Btn>
        </div>
      )}
    </ToolLayout>
  );
}
