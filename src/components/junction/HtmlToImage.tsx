
"use client";
import React, { useState, useRef, useCallback } from "react";
import { ToolWorkspace, Drop, Btn, Done, F, Pills, Range, Info, Err, ToolFile, dl, IS, T } from "./_shared";
import { toPng, toJpeg } from 'html-to-image';

type Mode = "paste" | "file" | "url";
type Format = "png" | "jpg";

/**
 * AJN Professional HTML to Image Engine - Upgraded v11.0
 * Powered by html-to-image for high-fidelity DOM capture.
 * Features: High-resolution rasterization, inline style preservation, and local buffer safety.
 */
export default function HtmlToImage() {
  const [mode, setMode] = useState<Mode>("paste");
  const [html, setHtml] = useState(`<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; background: #fff; }
  h1 { color: #1e3a8a; font-size: 2em; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
  p { color: #374151; line-height: 1.7; font-size: 16px; }
  .box { background: #EFF6FF; border-left: 4px solid #2563EB; padding: 20px; border-radius: 8px; margin-top: 20px; font-weight: bold; }
</style>
</head>
<body>
  <h1>Industrial Capture</h1>
  <p>This HTML will be converted into a high-fidelity pixel asset entirely in your browser.</p>
  <div class="box">Professional rendering enabled. Stays private on your device.</div>
</body>
</html>`);
  const [files, setF] = useState<ToolFile[]>([]);
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState<Format>("png");
  const [quality, setQuality] = useState(95);
  const [width, setWidth] = useState(1200);
  const [loading, setL] = useState(false);
  const [result, setR] = useState<Blob | null>(null);
  const [err, setE] = useState("");
  
  const captureRef = useRef<HTMLDivElement>(null);

  const run = async () => {
    setE(""); 
    setL(true);

    try {
      let content = html;
      if (mode === "file") {
        if (!files.length) { setE("Upload an HTML file."); setL(false); return; }
        content = await files[0].file.text();
      } else if (mode === "url") {
        if (!url.trim()) { setE("Enter a URL."); setL(false); return; }
        // URL mode creates a responsive iframe proxy for capture
        content = `<!DOCTYPE html><html><body style="margin:0;padding:0;"><iframe src="${url}" style="width:100%;height:100vh;border:none;"></iframe></body></html>`;
      }

      if (!content.trim()) { setE("No HTML content detected."); setL(false); return; }

      // Temporary render container for library capture
      const container = document.createElement('div');
      container.style.cssText = `position:fixed;top:-9999px;left:0;width:${width}px;background:white;z-index:-1;`;
      container.innerHTML = content;
      document.body.appendChild(container);

      // Allow DOM to settle
      await new Promise(r => setTimeout(r, 800));

      const options = {
        quality: quality / 100,
        backgroundColor: '#ffffff',
        width: width,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      };

      let dataUrl: string;
      if (format === 'png') {
        dataUrl = await toPng(container, options);
      } else {
        dataUrl = await toJpeg(container, options);
      }

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      
      document.body.removeChild(container);
      setR(blob);
    } catch (e: any) {
      setE("Rendering failed. Ensure HTML structure is valid and external resources allow CORS.");
    }

    setL(false);
  };

  const outputName = `html_capture.${format}`;

  return (
    <ToolWorkspace
      title="HTML to Image"
      description="RENDER ANY HTML SNIPPET OR PAGE INTO A PIXEL-PERFECT PNG OR JPG"
      icon="🖼️"
      accent={T.amber}
      badge="UPGRADED ENGINE"
    >
      {result ? (
        <Done
          msg="Capture correctly synthesized!"
          onDownload={() => dl(result, outputName)}
          dlLabel={`Download .${format.toUpperCase()}`}
          onReset={() => { setR(null); }}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          <F label="Input Source">
            <Pills
              opts={[
                { label: "Paste Code", value: "paste" },
                { label: "Load .html", value: "file" },
                { label: "Web URL", value: "url" },
              ]}
              val={mode}
              onChange={(v: any) => setMode(v)}
            />
          </F>

          {mode === "paste" && (
            <F label="HTML / CSS Content" hint="Standard HTML/CSS structure is supported for high-resolution capture.">
              <textarea
                value={html}
                onChange={e => setHtml(e.target.value)}
                rows={12}
                style={{ ...IS, resize: "vertical", fontFamily: "monospace", fontSize: 12, lineHeight: 1.6 }}
              />
            </F>
          )}

          {mode === "file" && (
            <Drop
              files={files}
              onChange={setF}
              accept=".html,.htm"
              label="Drop HTML file"
              sub="Binary mapped locally"
            />
          )}

          {mode === "url" && (
            <F label="Target URL" hint="Note: Some sites block iframe rendering via security headers.">
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://example.com"
                style={IS}
              />
            </F>
          )}

          <div className="jn-grid2" style={{ gap: 16 }}>
            <F label="Output Matrix">
              <Pills
                opts={[
                  { label: "PNG (Alpha)", value: "png" },
                  { label: "JPG (Light)", value: "jpg" },
                ]}
                val={format}
                onChange={(v: any) => setFormat(v)}
              />
            </F>
            <Range
              label="Canvas Width"
              value={width}
              min={400}
              max={2400}
              step={100}
              onChange={setWidth}
              fmt={v => `${v}px`}
            />
          </div>

          {format === "jpg" && (
            <Range
              label="JPG Fidelity"
              value={quality}
              min={50}
              max={100}
              step={1}
              onChange={setQuality}
              fmt={v => `${v}%`}
            />
          )}

          <Info bg="#FFFBEB" col="#92400E">
            🖼️ <strong>Upgraded v11.0 Core:</strong> Now utilizing <code>html-to-image</code> for 
            superior font rendering and style consistency. All processing occurs in a temporary 
            memory buffer on your device.
          </Info>

          <Err msg={err} />

          {loading && (
            <p style={{ fontSize: 12, color: T.amber, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", margin: 0, textAlign: "center" }}>
              ⚡ Synthesizing Pixel Grid...
            </p>
          )}

          <Btn onClick={run} loading={loading} full style={{ background: T.amber }}>
            🖼️ Generate Image
          </Btn>
        </div>
      )}
    </ToolWorkspace>
  );
}
