'use client';

import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { ProgressCallback, ConversionResult } from './pdf-converter';

/**
 * AJN MASTER POWERPOINT CONVERSION ENGINE
 * Implements professional coordinate-mapped slide reconstruction.
 * Converts EMU (English Metric Units) to PX for high-fidelity positioning.
 */
export class PPTConverter {
  private file: File;
  private onProgress?: ProgressCallback;

  constructor(file: File, onProgress?: ProgressCallback) {
    this.file = file;
    this.onProgress = onProgress;
  }

  private updateProgress(percent: number, message: string) {
    this.onProgress?.(percent, message);
  }

  /**
   * 1 EMU = 1/914400 inch
   * At 96 DPI, 1 inch = 96 pixels
   * So 1 pixel = 914400 / 96 = 9525 EMUs
   */
  private emuToPx(emu: number): number {
    return (emu * 96) / 914400;
  }

  async convertTo(targetFormat: string, settings: any = {}): Promise<ConversionResult> {
    const target = targetFormat.toUpperCase();
    const baseName = this.file.name.split('.')[0];

    if (target !== 'PDF') {
      throw new Error(`Master Engine optimized for PDF output. ${target} unit in calibration.`);
    }

    this.updateProgress(5, "Initializing Master Presentation Engine...");

    // STEP 1: Load ZIP Container
    const arrayBuffer = await this.file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // STEP 2: Extract Slide Files
    const slideFiles = Object.keys(zip.files)
      .filter(name => name.startsWith("ppt/slides/slide") && name.endsWith(".xml"))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)![0]);
        const numB = parseInt(b.match(/\d+/)![0]);
        return numA - numB;
      });

    const totalSlides = slideFiles.length;
    if (totalSlides === 0) throw new Error("No presentation slides detected.");
    
    this.updateProgress(15, `Detected ${totalSlides} segments...`);

    // STEP 3: Setup Rendering Target
    // Default Slide Size usually 10x5.625 inches (960x540 px)
    const pdf = new jsPDF("l", "px", [960, 540]);
    const parser = new DOMParser();

    // Off-screen rendering buffer
    const renderContainer = document.createElement('div');
    renderContainer.style.cssText = 'position:fixed;top:-9999px;left:0;width:960px;height:540px;background:white;';
    document.body.appendChild(renderContainer);

    // STEP 4: Iterative Reconstruction
    for (let i = 0; i < totalSlides; i++) {
      const slidePath = slideFiles[i];
      const progBase = 20 + Math.round((i / totalSlides) * 75);
      this.updateProgress(progBase, `Rasterizing slide ${i + 1} of ${totalSlides}...`);

      const xmlString = await zip.file(slidePath)!.async("string");
      const xmlDoc = parser.parseFromString(xmlString, "application/xml");

      renderContainer.innerHTML = '';
      const slideDiv = document.createElement('div');
      slideDiv.style.cssText = 'width:100%;height:100%;position:relative;overflow:hidden;font-family:Arial,sans-serif;';
      
      // Extract Shapes and Text Boxes
      const shapes = xmlDoc.getElementsByTagName('p:sp');
      Array.from(shapes).forEach(shape => {
        // Get Position (a:off) and Extent (a:ext)
        const off = shape.getElementsByTagName('a:off')[0];
        const ext = shape.getElementsByTagName('a:ext')[0];
        
        if (off && ext) {
          const x = this.emuToPx(parseInt(off.getAttribute('x') || '0'));
          const y = this.emuToPx(parseInt(off.getAttribute('y') || '0'));
          const w = this.emuToPx(parseInt(ext.getAttribute('cx') || '0'));
          const h = this.emuToPx(parseInt(ext.getAttribute('cy') || '0'));

          const box = document.createElement('div');
          box.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;display:flex;flex-direction:column;`;

          // Extract Text Runs
          const paragraphs = shape.getElementsByTagName('a:p');
          Array.from(paragraphs).forEach(p => {
            const pDiv = document.createElement('div');
            pDiv.style.cssText = 'margin-bottom:4px;';
            
            const runs = p.getElementsByTagName('a:r');
            Array.from(runs).forEach(r => {
              const text = r.getElementsByTagName('a:t')[0]?.textContent;
              if (text) {
                const span = document.createElement('span');
                span.textContent = text;
                
                // Basic font metrics
                const rPr = r.getElementsByTagName('a:rPr')[0];
                if (rPr) {
                  const sz = parseInt(rPr.getAttribute('sz') || '1800') / 100;
                  span.style.fontSize = `${sz}px`;
                  if (rPr.getAttribute('b') === '1') span.style.fontWeight = 'bold';
                  if (rPr.getAttribute('i') === '1') span.style.fontStyle = 'italic';
                }
                
                pDiv.appendChild(span);
              }
            });
            box.appendChild(pDiv);
          });

          slideDiv.appendChild(box);
        }
      });

      renderContainer.appendChild(slideDiv);

      // Snapshot capture
      const canvas = await html2canvas(slideDiv, {
        scale: 2, // High-Fidelity
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      
      if (i > 0) pdf.addPage([960, 540], "l");
      pdf.addImage(imgData, 'JPEG', 0, 0, 960, 540);
    }

    document.body.removeChild(renderContainer);

    this.updateProgress(98, "Synchronizing binary streams...");
    const blob = pdf.output('blob');

    this.updateProgress(100, "Successfully processed");

    return {
      blob,
      fileName: `${baseName}.pdf`,
      mimeType: 'application/pdf'
    };
  }
}
