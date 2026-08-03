"use client";
import React, { useState, useRef, useEffect } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, Field, Grid2, ToolFile, downloadBlob, InfoBox, S, C } from "./_shared";
import { signPdf } from "./_pdfUtils";

export default function SignPdf() {
  const [files, setFiles]   = useState<ToolFile[]>([]);
  const [x, setX]           = useState(100);
  const [y, setY]           = useState(100);
  const [w, setW]           = useState(160);
  const [h, setH]           = useState(80);
  const [page, setPage]     = useState(1);
  const [drawing, setDraw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError]   = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = "#1A1A2E";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const ctx = canvasRef.current!.getContext("2d")!;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setDraw(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return;
    e.preventDefault();
    const ctx = canvasRef.current!.getContext("2d")!;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const clearSig = () => {
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, c.width, c.height);
  };

  const process = async () => {
    if (!files.length) { setError("Upload a PDF first."); return; }
    setError(""); setLoading(true);
    try {
      const dataUrl = canvasRef.current!.toDataURL("image/png");
      const blob = await signPdf(files[0].file, dataUrl, x, y, w, h, page);
      setResult(blob);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <ToolLayout title="Sign PDF" description="Draw your signature and place it on any PDF page." icon="✍️" accentColor={C.purple}>
      {result ? (
        <DoneState message="PDF signed!" onDownload={() => downloadBlob(result, "signed.pdf")} onReset={() => { setResult(null); setFiles([]); }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Dropzone files={files} onChange={setFiles} accept=".pdf" />

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>Draw your signature</p>
              <Btn variant="secondary" onClick={clearSig} style={{ padding: "5px 12px", fontSize: 12 }}>🗑️ Clear</Btn>
            </div>
            <canvas
              ref={canvasRef}
              width={600}
              height={180}
              style={{ border: "1.5px solid #E5E7EB", borderRadius: 10, width: "100%", touchAction: "none", cursor: "crosshair", background: "#fff" }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={() => setDraw(false)}
              onMouseLeave={() => setDraw(false)}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={() => setDraw(false)}
            />
            <p style={{ fontSize: 11, color: C.gray, marginTop: 4 }}>Draw in the box above. Works with mouse and touch.</p>
          </div>

          <Grid2>
            <Field label="X position (pt)"><input style={S.input} type="number" min={0} value={x} onChange={e => setX(Number(e.target.value))} /></Field>
            <Field label="Y position (pt)"><input style={S.input} type="number" min={0} value={y} onChange={e => setY(Number(e.target.value))} /></Field>
            <Field label="Width (pt)"><input style={S.input} type="number" min={10} value={w} onChange={e => setW(Number(e.target.value))} /></Field>
            <Field label="Height (pt)"><input style={S.input} type="number" min={10} value={h} onChange={e => setH(Number(e.target.value))} /></Field>
            <Field label="Page number"><input style={S.input} type="number" min={1} value={page} onChange={e => setPage(Number(e.target.value))} /></Field>
          </Grid2>

          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}
          <Btn onClick={process} loading={loading} disabled={!files.length} fullWidth style={{ background: C.purple }}>✍️ Apply Signature</Btn>
        </div>
      )}
    </ToolLayout>
  );
}
