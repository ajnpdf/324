"use client";
import React, { useState, useRef } from "react";
import { ToolWorkspace, Drop, Btn, F, Pills, Info, Err, ToolFile, T, beginToolProcessing, completeToolProcessing, failToolProcessing } from "./_shared";

async function scanImage(file: File | HTMLCanvasElement): Promise<string> {
  const Tesseract = (await import("tesseract.js")).default;
  const result = await Tesseract.recognize(file, "eng");
  return result.data.text;
}

export default function OcrScanner() {
  const [files, setF] = useState<ToolFile[]>([]);
  const [mode, setMode] = useState<"upload" | "camera">("upload");
  const [loading, setL] = useState(false);
  const [text, setText] = useState("");
  const [err, setE] = useState("");
  const [copied, setCopied] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.play();
      }
      setCameraActive(true);
      setE("");
    } catch {
      setE("Camera access denied. Please allow camera permission or use the Upload tab.");
    }
  };

  const stopCamera = () => {
    const s = videoRef.current?.srcObject as MediaStream;
    s?.getTracks().forEach(t => t.stop());
    setCameraActive(false);
  };

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d")!.drawImage(v, 0, 0);
    stopCamera();
    setL(true); setText(""); setE("");
    beginToolProcessing("OCR scan");
    try {
      const out = await scanImage(c);
      setText(out.trim() || "(No text detected)");
      completeToolProcessing();
    } catch (e: any) {
      failToolProcessing();
      setE(e.message || "Scan failed.");
    }
    setL(false);
  };

  const runUpload = async () => {
    if (!files.length) { setE("Upload an image to scan."); return; }
    setE(""); setL(true); setText("");
    beginToolProcessing("OCR scan");
    try {
      const out = await scanImage(files[0].file);
      setText(out.trim() || "(No text detected)");
      completeToolProcessing();
    } catch (e: any) {
      failToolProcessing();
      setE(e.message || "Scan failed.");
    }
    setL(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => { setText(""); setF([]); setE(""); stopCamera(); };

  const wc = text ? text.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <ToolWorkspace
      title="Scan to Text"
      description="Turn supported document photos into selectable text with OCR."
      accent={T.teal}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {!text && (
          <>
            <F label="Input method">
              <Pills
                opts={[
                  { label: "📁 Upload Image", value: "upload" },
                  { label: "📷 Use Camera", value: "camera" },
                ]}
                val={mode}
                onChange={(v: any) => { setMode(v); if (v === "upload") stopCamera(); }}
              />
            </F>

            {mode === "upload" && (
              <Drop
                files={files}
                onChange={setF}
                accept=".png,.jpg,.jpeg,.webp,.bmp,.gif"
                label="Drop a photo or document image"
                sub="PNG, JPG, WEBP, BMP — stays on your device"
              />
            )}

            {mode === "camera" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ borderRadius: 32, overflow: "hidden", background: "#000", position: "relative", minHeight: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <video ref={videoRef} style={{ width: "100%", display: cameraActive ? "block" : "none", borderRadius: 32 }} playsInline />
                  {!cameraActive && (
                    <p style={{ color: "var(--jn-text-muted)", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      Camera standby
                    </p>
                  )}
                </div>
                <canvas ref={canvasRef} style={{ display: "none" }} />
                {!cameraActive
                  ? <Btn onClick={startCamera} full style={{ background: T.teal }}>📷 Start Camera</Btn>
                  : (
                    <div style={{ display: "flex", gap: 10 }}>
                      <Btn onClick={captureAndScan} loading={loading} full style={{ background: T.teal }}>📷 Capture & Scan</Btn>
                      <Btn variant="secondary" onClick={stopCamera}>✕ Stop</Btn>
                    </div>
                  )
                }
              </div>
            )}

            <Info bg="#F0FDFA" col="#0F766E">
              <strong>Privacy</strong> Camera frames stay in this workspace while text recognition runs.
            </Info>

            <Err msg={err} />

            {mode === "upload" && (
              <Btn onClick={runUpload} loading={loading} disabled={!files.length} full style={{ background: T.teal }}>
                📷 Scan Text from Image
              </Btn>
            )}
          </>
        )}

        {loading && (
          <p style={{ fontSize: 12, color: T.teal, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", margin: 0, textAlign: "center" }}>
            Reading text…
          </p>
        )}

        {text && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <p style={{ fontSize: 13, fontWeight: 800, margin: 0 }}>
                Extracted Text <span style={{ fontWeight: 400, color: "var(--jn-text-muted)" }}>({wc} words)</span>
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn variant="secondary" onClick={copy} style={{ padding: "5px 12px", fontSize: 12 }}>
                  {copied ? "Copied" : "Copy"}
                </Btn>
                <Btn variant="secondary" onClick={reset} style={{ padding: "5px 12px", fontSize: 12 }}>Scan another</Btn>
              </div>
            </div>
            <textarea
              readOnly
              value={text}
              rows={14}
              style={{ width: "100%", border: "1.5px solid var(--jn-border)", borderRadius: 16, padding: "16px", fontSize: 13, fontFamily: "monospace", outline: "none", resize: "vertical", lineHeight: 1.7, boxSizing: "border-box", background: "var(--jn-input-bg)", color: "var(--jn-text-primary)" }}
            />
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <Btn onClick={copy} style={{ background: T.teal }}>{copied ? "Copied" : "Copy all"}</Btn>
              <Btn variant="secondary" onClick={reset}>Scan another</Btn>
            </div>
          </div>
        )}
      </div>
    </ToolWorkspace>
  );
}