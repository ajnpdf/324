"use client";
import React, { useState } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, ToolFile, downloadBlob, InfoBox } from "./_shared";
import { repairPdf } from "./_pdfUtils";

export default function RepairPdf() {
  const [files, setFiles] = useState<ToolFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState("");

  const process = async () => {
    if (!files.length) { setError("Upload a PDF first."); return; }
    setError(""); setLoading(true);
    try { setResult(await repairPdf(files[0].file)); }
    catch (e: any) { setError("Could not repair this file. It may be too corrupted."); }
    setLoading(false);
  };

  return (
    <ToolLayout title="Repair PDF" description="Try to recover and fix corrupted or broken PDF files." icon="🔧" accentColor="#DC2626">
      {result ? (
        <DoneState message="PDF repaired!" onDownload={() => downloadBlob(result, "repaired.pdf")} onReset={() => { setResult(null); setFiles([]); }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Dropzone files={files} onChange={setFiles} accept=".pdf" label="Drop broken PDF here" sublabel="We'll try to recover and re-save it" />
          <InfoBox color="#FEF2F2" textColor="#991B1B">⚠️ Success depends on how damaged the file is. Severely corrupted files may not be recoverable.</InfoBox>
          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}
          <Btn onClick={process} loading={loading} disabled={!files.length} fullWidth style={{ background: "#DC2626" }}>🔧 Repair PDF</Btn>
        </div>
      )}
    </ToolLayout>
  );
}
