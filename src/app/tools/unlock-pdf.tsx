"use client";
import React, { useState } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, Field, ToolFile, downloadBlob, InfoBox, S, C } from "./_shared";
import { unlockPdf } from "./_pdfUtils";

export default function UnlockPdf() {
  const [files, setFiles]   = useState<ToolFile[]>([]);
  const [password, setPassword] = useState("");
  const [show, setShow]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError]   = useState("");

  const process = async () => {
    if (!files.length) { setError("Upload a PDF first."); return; }
    setError(""); setLoading(true);
    try {
      const blob = await unlockPdf(files[0].file, password);
      setResult(blob);
    } catch (e: any) { setError("Wrong password or file cannot be unlocked."); }
    setLoading(false);
  };

  return (
    <ToolLayout title="Unlock PDF" description="Remove password protection from a locked PDF file." icon="🔓" accentColor="#059669">
      {result ? (
        <DoneState message="PDF unlocked!" onDownload={() => downloadBlob(result, "unlocked.pdf")} onReset={() => { setResult(null); setFiles([]); }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Dropzone files={files} onChange={setFiles} accept=".pdf" label="Drop locked PDF here" />
          <Field label="PDF password" hint="Leave blank if the file is not password-protected">
            <div style={{ position: "relative" }}>
              <input style={S.input} type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter current password (or leave blank)" />
              <button onClick={() => setShow(!show)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>{show ? "🙈" : "👁️"}</button>
            </div>
          </Field>
          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}
          <Btn onClick={process} loading={loading} disabled={!files.length} fullWidth style={{ background: "#059669" }}>🔓 Unlock PDF</Btn>
        </div>
      )}
    </ToolLayout>
  );
}
