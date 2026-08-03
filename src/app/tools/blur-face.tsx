"use client";
import React, { useState, useRef, useEffect } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, Slider, Field, Grid2, ToolFile, downloadBlob, InfoBox, S, C, formatBytes } from "./_shared";
import { blurRegion } from "./_imageUtils";

export default function BlurFace() {
  const [files, setFiles]     = useState<ToolFile[]>([]);
  const [x, setX]             = useState(0);
  const [y, setY]             = useState(0);
  const [w, setW]             = useState(150);
  const [h, setH]             = useState(150);
  const [radius, setRadius]   = useState(15);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [imgW, setImgW]       = useState(0);
  const [imgH, setImgH]       = useState(0);
  const [error, setError]     = useState("");
  const canvasRef             = useRef<HTMLCanvasElement>(null);
  const [dragging, setDrag]   = useState(false);
  const [startPt, setStart]   = useState({ x: 0, y: 0 });

  // Load preview image when file selected
  useEffect(() => {
    if (!files.length) { setPreview(""); return; }
    const url = URL.createObjectURL(files[0].file);
    const img = new Image();
    img.onload = () => {
      setImgW(img.naturalWidth);
      setImgH(img.naturalHeight);
      setPreview(url);
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [files]);

  // Draw canvas preview with selection box
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !preview) return;
    const img = new Image();
    img.onload = () => {
      const scaleX = canvas.width / imgW;
      const scaleY = canvas.height / imgH;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      // Draw selection rectangle
      ctx.strokeStyle = C.red;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.strokeRect(x * scaleX, y * scaleY, w * scaleX, h * scaleY);
      ctx.setLineDash([]);
      ctx.fillStyle = `${C.red}22`;
      ctx.fillRect(x * scaleX, y * scaleY, w * scaleX, h * scaleY);
    };
    img.src = preview;
  }, [preview, x, y, w, h, imgW, imgH]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = imgW / canvas.width;
    const scaleY = imgH / canvas.height;
    return {
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY),
    };
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pt = getCanvasCoords(e);
    setStart(pt); setX(pt.x); setY(pt.y); setW(0); setH(0); setDrag(true);
  };
  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging) return;
    const pt = getCanvasCoords(e);
    setW(Math.max(1, pt.x - startPt.x));
    setH(Math.max(1, pt.y - startPt.y));
  };
  const onMouseUp = () => setDrag(false);

  const process = async () => {
    if (!files.length) { setError("Upload an image first."); return; }
    if (w < 2 || h < 2) { setError("Select a region to blur (draw on the image preview below)."); return; }
    setError(""); setLoading(true);
    try { setResult(await blurRegion(files[0].file, x, y, w, h, radius)); }
    catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <ToolLayout title="Blur Face" description="Hide faces or sensitive regions by drawing a blur box on your image." icon="😶" accentColor="#4F46E5">
      {result ? (
        <DoneState
          message="Region blurred!"
          onDownload={() => downloadBlob(result!, "blurred_" + (files[0]?.name || "image.jpg"))}
          onReset={() => { setResult(null); setFiles([]); setPreview(""); setW(0); setH(0); }}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Dropzone files={files} onChange={setFiles} accept=".jpg,.jpeg,.png,.webp,.bmp" label="Drop image here" />

          {preview && (
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>
                🖱 Draw blur region on image
                <span style={{ fontWeight: 400, color: C.gray, marginLeft: 8, fontSize: 12 }}>
                  ({imgW}×{imgH}px) — drag to select
                </span>
              </p>
              <canvas
                ref={canvasRef}
                width={600}
                height={Math.round(600 * (imgH / imgW))}
                style={{ width: "100%", borderRadius: 10, border: "1.5px solid #E5E7EB", cursor: "crosshair", display: "block" }}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
              />
              {w > 0 && h > 0 && (
                <p style={{ fontSize: 11, color: C.gray, marginTop: 4 }}>
                  Selected: x={x}, y={y}, {w}×{h}px
                </p>
              )}
            </div>
          )}

          <p style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Or enter coordinates manually</p>
          <Grid2>
            <Field label="X (px from left)"><input style={S.input} type="number" min={0} value={x} onChange={e => setX(Number(e.target.value))} /></Field>
            <Field label="Y (px from top)"><input style={S.input} type="number" min={0} value={y} onChange={e => setY(Number(e.target.value))} /></Field>
            <Field label="Width (px)"><input style={S.input} type="number" min={1} value={w} onChange={e => setW(Number(e.target.value))} /></Field>
            <Field label="Height (px)"><input style={S.input} type="number" min={1} value={h} onChange={e => setH(Number(e.target.value))} /></Field>
          </Grid2>
          <Slider label="Blur strength (pixel block size)" value={radius} min={4} max={60} step={2} onChange={setRadius} format={v => `${v}px`} />

          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}
          <Btn onClick={process} loading={loading} disabled={!files.length} fullWidth style={{ background: "#4F46E5" }}>
            😶 Blur Region
          </Btn>
          <InfoBox>💡 You can run this tool multiple times on the same image to blur different regions.</InfoBox>
        </div>
      )}
    </ToolLayout>
  );
}
