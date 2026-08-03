"use client";

import React, { useState, useEffect } from 'react';

/**
 * AJN STUDIO Navy Modern Converter Animation
 * Visually demonstrates local PDF processing capability.
 */
export function ProcessingAnimation() {
  const [status, setStatus] = useState("Ready to process");
  const logs = ["Analyzing File", "Parsing Elements", "Exporting Formats", "Complete"];

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % logs.length;
      setStatus(logs[index]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-center items-center w-full overflow-hidden py-12 md:py-20">
      <div className="converter-card relative scale-[0.8] md:scale-100">
        <div className="stage relative">
          <div className="file-node">
            <div className="scanner-beam"></div>
            <div className="pdf-tag">PDF</div>
            <div className="ocr-lines">
              <div className="line"></div>
              <div className="line"></div>
              <div className="line" style={{ width: '70%' }}></div>
            </div>
          </div>
          <div className="burst-icon docx">DOCX</div>
          <div className="burst-icon xlsx">XLSX</div>
          <div className="burst-icon pptx">PPTX</div>
          <div className="burst-icon jpeg">JPEG</div>
        </div>

        <div className="footer">
          <div className="status-dot"></div>
          <span className="status-text">{status}</span>
        </div>

        <style jsx>{`
          .converter-card {
            width: 320px;
            height: 440px;
            background: #ffffff;
            border-radius: 40px;
            box-shadow: 0 25px 50px -12px rgba(30, 58, 138, 0.12);
            border: 1px solid rgba(30, 58, 138, 0.08);
            display: flex;
            flex-direction: column;
            padding: 24px;
            position: relative;
            overflow: hidden;
          }

          .stage {
            flex: 1;
            background: #fcfdfe;
            border: 2px dashed #e2e8f0;
            border-radius: 28px;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            transition: all 0.3s ease;
          }

          .file-node {
            width: 70px;
            height: 95px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 20px 40px rgba(30, 58, 138, 0.08);
            border: 1px solid #e2e8f0;
            position: absolute;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 10;
            animation: centerCycle 10s infinite cubic-bezier(0.4, 0, 0.2, 1);
          }

          .pdf-tag {
            position: absolute;
            top: 8px;
            background: #dc2626;
            color: white;
            font-size: 9px;
            font-weight: 900;
            padding: 2px 6px;
            border-radius: 4px;
            letter-spacing: 0.5px;
          }

          .ocr-lines {
            width: 50%;
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-top: 15px;
          }

          .line {
            height: 3px;
            background: #f1f5f9;
            border-radius: 2px;
            overflow: hidden;
            position: relative;
          }

          .line::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: #1e3a8a;
            animation: fillLine 2s infinite linear;
          }

          .scanner-beam {
            position: absolute;
            width: 100%;
            height: 2px;
            background: #3b82f6;
            box-shadow: 0 0 10px #3b82f6;
            top: 0;
            opacity: 0;
            z-index: 15;
            animation: scanMove 10s infinite;
          }

          .burst-icon {
            position: absolute;
            width: 50px;
            height: 65px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 9px;
            font-weight: 800;
            opacity: 0;
            z-index: 5;
            box-shadow: 0 10px 25px rgba(0,0,0,0.08);
            clip-path: polygon(0 0, 72% 0, 100% 18%, 100% 100%, 0 100%);
          }

          .docx { background: #2b579a; animation: burstWord 10s infinite; }
          .xlsx { background: #217346; animation: burstExcel 10s infinite; }
          .pptx { background: #d24726; animation: burstPPT 10s infinite; }
          .jpeg { background: #9333ea; animation: burstJPG 10s infinite; }

          .footer {
            height: 50px;
            margin-top: 15px;
            background: #f8fafc;
            border-radius: 14px;
            display: flex;
            align-items: center;
            padding: 0 16px;
            gap: 10px;
            border: 1px solid #f1f5f9;
          }

          .status-dot {
            width: 8px;
            height: 8px;
            background: #10b981;
            border-radius: 50%;
            box-shadow: 0 0 10px #10b981;
          }

          .status-text {
            font-size: 10px;
            font-weight: 700;
            color: #1e3a8a;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          @keyframes centerCycle {
            0% { transform: translateY(-200px) scale(0.8); opacity: 0; }
            10% { transform: translateY(0) scale(1); opacity: 1; }
            40% { transform: translateY(0) scale(1.05); opacity: 1; }
            45% { transform: translateY(0) scale(1.4); opacity: 0; }
            100% { opacity: 0; }
          }

          @keyframes scanMove {
            15% { opacity: 0; top: 0; }
            20% { opacity: 1; top: 0; }
            38% { opacity: 1; top: 100%; }
            40% { opacity: 0; }
          }

          @keyframes fillLine {
            0% { left: -100%; }
            50%, 100% { left: 100%; }
          }

          @keyframes burstWord {
            0%, 45% { opacity: 0; transform: translate(0,0) scale(0.5); }
            55%, 85% { opacity: 1; transform: translate(-70px, -60px) scale(1); }
            100% { opacity: 0; transform: translate(-70px, 120px); }
          }
          @keyframes burstExcel {
            0%, 45% { opacity: 0; transform: translate(0,0) scale(0.5); }
            55%, 85% { opacity: 1; transform: translate(70px, -60px) scale(1); }
            100% { opacity: 0; transform: translate(70px, 120px); }
          }
          @keyframes burstPPT {
            0%, 45% { opacity: 0; transform: translate(0,0) scale(0.5); }
            55%, 85% { opacity: 1; transform: translate(-70px, 60px) scale(1); }
            100% { opacity: 0; transform: translate(-70px, 120px); }
          }
          @keyframes burstJPG {
            0%, 45% { opacity: 0; transform: translate(0,0) scale(0.5); }
            55%, 85% { opacity: 1; transform: translate(80px, 70px) scale(1); }
            100% { opacity: 0; transform: translate(80px, 150px); }
          }
        `}</style>
      </div>
    </div>
  );
}