
"use client";
import React, { useState } from "react";
import { ToolWorkspace, Drop, Btn, Done, F, Err, IS, ToolFile, dl } from "./_shared";
import { unlockPdf } from "./_pdfUtils";

export default function UnlockPdf() {
  const [files, setF] = useState<ToolFile[]>([]);
  const [pw, setPw] = useState(""); const [show, setS] = useState(false);
  const [loading, setL] = useState(false); const [result, setR] = useState<Blob | null>(null);
  const [err, setE] = useState("");
  const run = async () => {
    if (!files.length) { setE("Upload a PDF first."); return; }
    setE(""); setL(true);
    try { setR(await unlockPdf(files[0].file, pw)); } catch { setE("Wrong password or cannot be unlocked."); }
    setL(false);
  };
  return (
    <ToolWorkspace title="Unlock PDF" description="SURGICAL PERMISSION RESTORATION" icon="🔓" accent="#059669" badge="SECURITY UNLOCK">
      {result
        ? <Done msg="PDF unlocked!" onDownload={() => dl(result, "unlocked.pdf")} onReset={() => { setR(null); setF([]); setPw(""); }} />
        : <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Drop files={files} onChange={setF} accept=".pdf" label="Drop locked PDF here" />
            <F label="PDF Password" hint="Leave blank if the file is not password-protected">
              <div style={{ position: "relative" }}>
                <input style={IS} type={show ? "text" : "password"} value={pw} onChange={e => setPw(e.target.value)} placeholder="Enter current password (or leave blank)" />
                <button onClick={() => setS(!show)} style={{ position: "absolute", right: 10, top: 9, background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>{show ? "🙈" : "👁️"}</button>
              </div>
            </F>
            <Err msg={err} />
            <Btn onClick={run} loading={loading} disabled={!files.length} full style={{ background: "#059669" }}>🔓 Unlock PDF</Btn>
          </div>
      }
    </ToolWorkspace>
  );
}
