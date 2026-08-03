"use client";
import React, { useState } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, Field, Grid2, ToolFile, downloadBlob, InfoBox, S, C } from "./_shared";
import { protectPdf } from "./_pdfUtils";

export default function ProtectPdf() {
  const [files, setFiles]   = useState<ToolFile[]>([]);
  const [userPw, setUserPw] = useState("");
  const [ownPw,  setOwnPw]  = useState("");
  const [show,   setShow]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError]   = useState("");

  const process = async () => {
    if (!files.length) { setError("Upload a PDF first."); return; }
    if (!userPw) { setError("Enter a user password."); return; }
    setError(""); setLoading(true);
    try {
      const blob = await protectPdf(files[0].file, userPw, ownPw || userPw + "_owner");
      setResult(blob);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <ToolLayout title="Protect PDF" description="Lock your PDF with a password to prevent unauthorised access." icon="🔒" accentColor={C.blue}>
      {result ? (
        <DoneState message="PDF protected!" onDownload={() => downloadBlob(result, "protected.pdf")} onReset={() => { setResult(null); setFiles([]); }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Dropzone files={files} onChange={setFiles} accept=".pdf" />
          <Grid2>
            <Field label="User password *" hint="Required to open the PDF">
              <div style={{ position: "relative" }}>
                <input style={S.input} type={show ? "text" : "password"} value={userPw} onChange={e => setUserPw(e.target.value)} placeholder="Enter password" />
                <button onClick={() => setShow(!show)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>{show ? "🙈" : "👁️"}</button>
              </div>
            </Field>
            <Field label="Owner password" hint="Optional — full access password">
              <input style={S.input} type={show ? "text" : "password"} value={ownPw} onChange={e => setOwnPw(e.target.value)} placeholder="Optional" />
            </Field>
          </Grid2>
          <InfoBox color="#FFFBEB" textColor="#92400E">⚠️ Browser-based protection uses metadata marking. For strong AES-256 encryption, use a server-side tool.</InfoBox>
          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}
          <Btn onClick={process} loading={loading} disabled={!files.length || !userPw} fullWidth style={{ background: C.blue }}>🔒 Protect PDF</Btn>
        </div>
      )}
    </ToolLayout>
  );
}
