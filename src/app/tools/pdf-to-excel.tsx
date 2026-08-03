"use client";
import React, { useState } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, ToolFile, downloadBlob, InfoBox } from "./_shared";
import { extractText } from "./_pdfUtils";

export default function PdfToExcel() {
  const [files, setFiles]   = useState<ToolFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError]   = useState("");

  const process = async () => {
    if (!files.length) { setError("Upload a PDF first."); return; }
    setError(""); setLoading(true);
    try {
      const text = await extractText(files[0].file);
      const lines = text.split("\n").filter(l => l.trim());
      const csv = ["Line,Content", ...lines.map((l, i) => `${i + 1},"${l.replace(/"/g, '""')}"`)].join("\n");
      setResult(new Blob([csv], { type: "text/csv" }));
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <ToolLayout title="PDF to Excel" description="Extract text from PDF and export as CSV (opens in Excel)." icon="📊" accentColor="#059669">
      {result ? (
        <DoneState message="PDF exported to CSV!" downloadLabel="Download CSV" onDownload={() => downloadBlob(result!, "data.csv")} onReset={() => { setResult(null); setFiles([]); }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Dropzone files={files} onChange={setFiles} accept=".pdf" />
          <InfoBox color="#ECFDF5" textColor="#065F46">📊 Exports each line of PDF text as a row in the CSV. Open the .csv file directly in Excel or Google Sheets. For complex tables with columns, manual adjustment may be needed.</InfoBox>
          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}
          <Btn onClick={process} loading={loading} disabled={!files.length} fullWidth style={{ background: "#059669" }}>📊 Export to CSV</Btn>
        </div>
      )}
    </ToolLayout>
  );
}
