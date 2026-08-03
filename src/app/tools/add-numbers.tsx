"use client";
import React, { useState } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, Field, Grid2, ToolFile, downloadBlob, InfoBox, S, C } from "./_shared";
import { addPageNumbers } from "./_pdfUtils";

const POS_OPTIONS = [
  { label: "Bottom Center", value: "bottom-center" },
  { label: "Bottom Left",   value: "bottom-left"   },
  { label: "Bottom Right",  value: "bottom-right"  },
  { label: "Top Center",    value: "top-center"    },
  { label: "Top Left",      value: "top-left"      },
  { label: "Top Right",     value: "top-right"     },
];

export default function AddNumbers() {
  const [files, setFiles]     = useState<ToolFile[]>([]);
  const [position, setPos]    = useState("bottom-center");
  const [start, setStart]     = useState(1);
  const [size, setSize]       = useState(11);
  const [prefix, setPrefix]   = useState("");
  const [suffix, setSuffix]   = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<Blob | null>(null);
  const [error, setError]     = useState("");

  const process = async () => {
    if (!files.length) { setError("Upload a PDF first."); return; }
    setError(""); setLoading(true);
    try {
      const blob = await addPageNumbers(files[0].file, start, position, prefix, suffix, size);
      setResult(blob);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <ToolLayout title="Add Page Numbers" description="Add page numbers to every page of your PDF." icon="🔢" accentColor="#10B981">
      {result ? (
        <DoneState message="Page numbers added!" onDownload={() => downloadBlob(result, "numbered.pdf")} onReset={() => { setResult(null); setFiles([]); }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Dropzone files={files} onChange={setFiles} accept=".pdf" />
          <Field label="Position">
            <select style={S.select} value={position} onChange={e => setPos(e.target.value)}>
              {POS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Grid2>
            <Field label="Start number">
              <input style={S.input} type="number" min={1} value={start} onChange={e => setStart(Number(e.target.value))} />
            </Field>
            <Field label="Font size (pt)">
              <input style={S.input} type="number" min={6} max={24} value={size} onChange={e => setSize(Number(e.target.value))} />
            </Field>
            <Field label="Prefix" hint={'e.g. "Page "'}>
              <input style={S.input} value={prefix} onChange={e => setPrefix(e.target.value)} placeholder='e.g. "Page "' />
            </Field>
            <Field label="Suffix" hint={'e.g. " of 10"'}>
              <input style={S.input} value={suffix} onChange={e => setSuffix(e.target.value)} placeholder='e.g. " of 10"' />
            </Field>
          </Grid2>
          <InfoBox color="#ECFDF5" textColor="#065F46">
            Preview: <strong>{prefix}{start}{suffix}</strong>, {prefix}{start+1}{suffix}, {prefix}{start+2}{suffix}…
          </InfoBox>
          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}
          <Btn onClick={process} loading={loading} disabled={!files.length} fullWidth style={{ background: "#10B981" }}>🔢 Add Numbers</Btn>
        </div>
      )}
    </ToolLayout>
  );
}
