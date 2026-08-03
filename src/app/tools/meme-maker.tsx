"use client";
import React, { useState, useEffect, useRef } from "react";
import { ToolLayout, Dropzone, Btn, DoneState, Field, Slider, ToolFile, downloadBlob, S, C } from "./_shared";
import { makeMeme } from "./_imageUtils";

export default function MemeMaker() {
  const [files,    setFiles]    = useState<ToolFile[]>([]);
  const [topText,  setTop]      = useState("WHEN YOU FINALLY FIX THE BUG");
  const [botText,  setBot]      = useState("BUT CREATE 3 MORE");
  const [fontSize, setSize]     = useState(0);   // 0 = auto
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState<Blob | null>(null);
  const [preview,  setPreview]  = useState("");
  const [imgSize,  setImgSize]  = useState({ w: 0, h: 0 });
  const [error,    setError]    = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!files.length) { setPreview(""); return; }
    const url = URL.createObjectURL(files[0].file);
    const img = new Image();
    img.onload = () => setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = url;
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [files]);

  // Live canvas meme preview
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !preview || !imgSize.w) return;
    const img = new Image();
    img.onload = () => {
      const displayW = canvas.width;
      const displayH = Math.round(canvas.width * (imgSize.h / imgSize.w));
      canvas.height = displayH;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, displayW, displayH);

      const fs = fontSize > 0 ? Math.round(fontSize * displayW / imgSize.w) : Math.max(18, Math.round(displayW / 10));
      const drawText = (text: string, yPos: number) => {
        ctx.font = `900 ${fs}px Impact, "Arial Narrow", Arial, sans-serif`;
        ctx.textAlign = "center";
        const outline = Math.max(2, Math.round(fs / 12));
        ctx.lineWidth = outline * 2;
        ctx.strokeStyle = "#000";
        ctx.strokeText(text, displayW / 2, yPos);
        ctx.fillStyle = "#fff";
        ctx.fillText(text, displayW / 2, yPos);
      };
      if (topText) drawText(topText.toUpperCase(), fs + 8);
      if (botText) drawText(botText.toUpperCase(), displayH - 10);
    };
    img.src = preview;
  }, [preview, topText, botText, fontSize, imgSize]);

  const process = async () => {
    if (!files.length) { setError("Upload an image first."); return; }
    setError(""); setLoading(true);
    try { setResult(await makeMeme(files[0].file, topText, botText, fontSize)); }
    catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <ToolLayout title="Meme Maker" description="Add classic Impact-font meme text to any image — top and bottom." icon="😂" accentColor="#F59E0B">
      {result ? (
        <DoneState
          message="Meme created! 😂"
          onDownload={() => downloadBlob(result!, "meme_" + (files[0]?.name || "image.jpg"))}
          onReset={() => { setResult(null); setFiles([]); setPreview(""); }}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Dropzone files={files} onChange={setFiles} accept=".jpg,.jpeg,.png,.webp,.bmp,.gif" label="Drop meme image here" sublabel="JPG, PNG, WebP, GIF supported" />

          {/* Live canvas preview */}
          {preview && (
            <div style={{ borderRadius: 10, overflow: "hidden", border: "1.5px solid #E5E7EB" }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: C.gray, textAlign: "center", background: "#F9FAFB", padding: "6px 0", borderBottom: "1px solid #E5E7EB" }}>
                LIVE PREVIEW
              </p>
              <canvas ref={canvasRef} width={560} style={{ width: "100%", display: "block" }} />
            </div>
          )}

          {/* Text inputs */}
          <Field label="Top text" hint="Leave blank to skip">
            <input
              style={{ ...S.input, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}
              value={topText}
              onChange={e => setTop(e.target.value)}
              placeholder="TOP MEME TEXT"
            />
          </Field>
          <Field label="Bottom text" hint="Leave blank to skip">
            <input
              style={{ ...S.input, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}
              value={botText}
              onChange={e => setBot(e.target.value)}
              placeholder="BOTTOM MEME TEXT"
            />
          </Field>

          <Slider
            label="Font size (0 = auto based on image width)"
            value={fontSize}
            min={0}
            max={200}
            step={4}
            onChange={setSize}
            format={v => v === 0 ? "Auto" : `${v}px`}
          />

          {!preview && (
            <div style={{
              background: "#1A1A2E", borderRadius: 10, padding: "20px 16px",
              textAlign: "center", fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif",
              fontSize: 22, letterSpacing: "0.05em", color: "#fff",
              textShadow: "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
            }}>
              {topText && <div>{topText.toUpperCase()}</div>}
              <div style={{ fontSize: 12, color: C.gray, fontFamily: "inherit", fontWeight: 400, margin: "8px 0", textShadow: "none" }}>
                [ upload image here ]
              </div>
              {botText && <div>{botText.toUpperCase()}</div>}
            </div>
          )}

          {error && <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ {error}</p>}

          <Btn onClick={process} loading={loading} disabled={!files.length} fullWidth style={{ background: "#F59E0B" }}>
            😂 Create Meme
          </Btn>
        </div>
      )}
    </ToolLayout>
  );
}
