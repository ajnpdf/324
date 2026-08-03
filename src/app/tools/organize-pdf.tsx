"use client";
import React, { useState } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, Field, ToolFile, downloadBlob, InfoBox, S, C } from "./_shared";
import { organizePdf } from "./_pdfUtils";

export default function OrganizePdf() {
  const [files, setFiles]   = useState<ToolFile[]>([]);
  const [order, setOrder]   = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError]   = useState("");

  const process = async () => {
    if (!files.length) { setError("Upload a PDF first."); return; }
    if (!order.trim()) { setError("Enter the new page order."); return; }
    setError(""); setLoading(true);
    try {
      const blob = await organizePdf(files[0].file, order);
      setResult(blob);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <ToolLayout title="Organize PDF" description="Reorder pages by specifying the new page sequence." icon="📋" accentColor={C.purple}>
      {result ? (
        <DoneState message="Pages reordered!" onDownload={() => downloadBlob(result, "organized.pdf")} onReset={() => { setResult(null); setFiles([]); }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Dropzone files={files} onChange={setFiles} accept=".pdf" />
          <Field label="New page order *" hint="Enter page numbers in the new order, separated by commas">
            <input style={S.input} value={order} onChange={e => setOrder(e.target.value)} placeholder="e.g. 3, 1, 2, 4, 5" />
          </Field>
          <InfoBox color="#F5F3FF" textColor="#5B21B6">💡 A 5-page PDF with order <strong>3,1,2,4,5</strong> puts page 3 first, then page 1, then 2, etc. Omitting a page number removes it.</InfoBox>
          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}
          <Btn onClick={process} loading={loading} disabled={!files.length || !order.trim()} fullWidth style={{ background: C.purple }}>📋 Reorder Pages</Btn>
        </div>
      )}
    </ToolLayout>
  );
}
