"use client";

import { PDFPage, PDFElement, PDFTool } from './types';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
import { 
  Type, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Move, 
  Crosshair, 
  MousePointer2, 
  Eraser, 
  CheckSquare, 
  RotateCw,
  Maximize2
} from 'lucide-react';

interface Props {
  page: PDFPage;
  zoom: number;
  activeTool: PDFTool;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (el: PDFElement) => void;
  onAddElement: (el: PDFElement) => void;
  onRequestSignature?: (x: number, y: number, width: number, height: number) => void;
}

/**
 * AJN High-Performance Surgical Canvas
 * Industrial Vector Engine supporting Shapes, Paths, and Advanced Transforms.
 */
export function PDFCanvas({ page, zoom, activeTool, selectedElementId, onSelectElement, onUpdateElement, onAddElement, onRequestSignature }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [interactionType, setInteractionActiveType] = useState<'drawing' | 'resizing' | 'dragging' | 'rotating' | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [elementStart, setElementStart] = useState({ x: 0, y: 0, w: 0, h: 0, r: 0 });
  const [boxPreview, setBoxPreview] = useState<{x: number, y: number, w: number, h: number} | null>(null);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [snapGuides, setSnapGuides] = useState<{x?: number, y?: number} | null>(null);

  const scale = zoom / 100;
  const pageWidth = 595; 
  const pageHeight = 842;

  const getCoords = (e: React.MouseEvent | MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const { x, y } = getCoords(e);
    const toolNeedsBox = ['signature', 'insert-image', 'link', 'form-field', 'whiteout', 'shape-rect', 'shape-circle', 'shape-line'].includes(activeTool);

    if (toolNeedsBox) {
      setInteractionActiveType('drawing');
      setDragStart({ x: e.clientX, y: e.clientY });
      setBoxPreview({ x, y, w: 0, h: 0 });
      return;
    }

    if (activeTool === 'draw' || activeTool === 'highlight') {
      setInteractionActiveType('drawing');
      setCurrentPath(`M ${x} ${y}`);
      return;
    }

    if (activeTool === 'add-text') {
      onAddElement({
        id: `text-${Date.now()}`,
        type: 'text',
        x, y,
        width: 200, height: 50,
        content: 'Type something...',
        fontSize: 16,
        fontFamily: 'Arial',
        lineHeight: 1.2,
        letterSpacing: 0,
        color: '#000000',
        zIndex: page.elements.length,
        textAlign: 'left'
      });
      return;
    }

    if (e.target === canvasRef.current) {
      onSelectElement(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!interactionType) return;
    const { x, y } = getCoords(e);

    if (interactionType === 'drawing') {
      if (boxPreview) {
        const w = (e.clientX - dragStart.x) / scale;
        const h = (e.clientY - dragStart.y) / scale;
        setBoxPreview({ ...boxPreview, w, h });
      } else if (currentPath) {
        setCurrentPath(prev => `${prev} L ${x} ${y}`);
      }
      return;
    }

    const el = page.elements.find(e => e.id === selectedElementId);
    if (!el) return;

    if (interactionType === 'dragging') {
      const dx = (e.clientX - dragStart.x) / scale;
      const dy = (e.clientY - dragStart.y) / scale;
      
      let nx = elementStart.x + dx;
      let ny = elementStart.y + dy;

      const snapThreshold = 10;
      let snapped = null;
      if (Math.abs(nx + el.width/2 - pageWidth/2) < snapThreshold) { nx = pageWidth/2 - el.width/2; snapped = { x: pageWidth/2 }; }
      if (Math.abs(ny + el.height/2 - pageHeight/2) < snapThreshold) { ny = pageHeight/2 - el.height/2; snapped = { ...snapped, y: pageHeight/2 }; }
      
      setSnapGuides(snapped);
      onUpdateElement({ ...el, x: nx, y: ny });
    } else if (interactionType === 'resizing') {
      const dx = (e.clientX - dragStart.x) / scale;
      const dy = (e.clientY - dragStart.y) / scale;
      onUpdateElement({ ...el, width: Math.max(10, elementStart.w + dx), height: Math.max(10, elementStart.h + dy) });
    } else if (interactionType === 'rotating') {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const centerX = (el.x + el.width / 2) * scale + rect.left;
      const centerY = (el.y + el.height / 2) * scale + rect.top;
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI) + 90;
      onUpdateElement({ ...el, rotation: Math.round(angle / 5) * 5 });
    }
  };

  const handleMouseUp = () => {
    if (interactionType === 'drawing') {
      if (boxPreview) {
        const x = boxPreview.w < 0 ? boxPreview.x + boxPreview.w : boxPreview.x;
        const y = boxPreview.h < 0 ? boxPreview.y + boxPreview.h : boxPreview.y;
        const w = Math.abs(boxPreview.w);
        const h = Math.abs(boxPreview.h);
        
        if (w > 5 && h > 5) {
          const id = `${activeTool}-${Date.now()}`;
          if (activeTool === 'signature' && onRequestSignature) onRequestSignature(x, y, w, h);
          else if (activeTool === 'insert-image') {
            setPendingImageArea({ x, y, w, h });
            fileInputRef.current?.click();
          } else if (activeTool.startsWith('shape-')) {
            onAddElement({
              id, type: 'shape',
              shapeType: activeTool.replace('shape-', '') as any,
              x, y, width: w, height: h,
              color: '#3B82F6', fillColor: 'transparent', strokeWidth: 2, zIndex: 100
            });
          } else if (activeTool === 'link') {
            onAddElement({ id, type: 'link', x, y, width: w, height: h, url: 'https://', zIndex: 100 });
          } else if (activeTool === 'form-field') {
            onAddElement({ id, type: 'form-field', x, y, width: w, height: h, fieldType: 'text', zIndex: 100 });
          } else if (activeTool === 'whiteout') {
            onAddElement({ id, type: 'whiteout', x, y, width: w, height: h, color: '#FFFFFF', zIndex: 100 });
          }
        }
        setBoxPreview(null);
      } else if (currentPath) {
        onAddElement({
          id: `path-${Date.now()}`,
          type: 'path',
          x: 0, y: 0, width: pageWidth, height: pageHeight,
          pathData: currentPath,
          color: activeTool === 'highlight' ? '#FFFF00' : '#000000',
          strokeWidth: activeTool === 'highlight' ? 15 : 3,
          opacity: activeTool === 'highlight' ? 0.4 : 1,
          isHighlighter: activeTool === 'highlight',
          zIndex: 100
        });
        setCurrentPath("");
      }
    }
    setInteractionActiveType(null);
    setSnapGuides(null);
  };

  const handleElementInteraction = (e: React.MouseEvent, el: PDFElement, type: 'dragging' | 'resizing' | 'rotating') => {
    e.stopPropagation();
    onSelectElement(el.id);
    setInteractionActiveType(type);
    setDragStart({ x: e.clientX, y: e.clientY });
    setElementStart({ x: el.x, y: el.y, w: el.width, h: el.height, r: el.rotation || 0 });
  };

  const [pendingImageArea, setPendingImageArea] = useState<{x: number, y: number, w: number, h: number} | null>(null);

  return (
    <div 
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={cn(
        "bg-white rounded-sm shadow-[0_30px_100px_rgba(0,0,0,0.2)] relative transition-shadow duration-500 origin-center select-none overflow-hidden mx-auto",
        activeTool !== 'select' && 'cursor-crosshair'
      )}
      style={{ width: pageWidth * scale, height: pageHeight * scale, transform: `rotate(${page.rotation}deg)` }}
    >
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file && pendingImageArea) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            if (ev.target?.result) {
              onAddElement({
                id: `img-${Date.now()}`,
                type: 'image',
                x: pendingImageArea.x, y: pendingImageArea.y,
                width: pendingImageArea.w, height: pendingImageArea.h,
                content: ev.target.result as string,
                zIndex: page.elements.length,
              });
            }
          };
          reader.readAsDataURL(file);
        }
        setPendingImageArea(null);
      }} />

      {page.previewUrl && (
        <div className="absolute inset-0 pointer-events-none">
          <img src={page.previewUrl} className="w-full h-full object-contain" alt="" />
        </div>
      )}

      {snapGuides && (
        <>
          {snapGuides.x !== undefined && <div className="absolute top-0 bottom-0 w-px bg-primary/40 z-[2000]" style={{ left: snapGuides.x * scale }} />}
          {snapGuides.y !== undefined && <div className="absolute left-0 right-0 h-px bg-primary/40 z-[2000]" style={{ top: snapGuides.y * scale }} />}
        </>
      )}

      {boxPreview && (
        <div 
          className="absolute border-2 border-primary bg-primary/10 z-[1000] pointer-events-none flex items-center justify-center"
          style={{
            left: (boxPreview.w < 0 ? boxPreview.x + boxPreview.w : boxPreview.x) * scale,
            top: (boxPreview.h < 0 ? boxPreview.y + boxPreview.h : boxPreview.y) * scale,
            width: Math.abs(boxPreview.w) * scale,
            height: Math.abs(boxPreview.h) * scale
          }}
        >
          <Crosshair className="w-4 h-4 text-primary animate-pulse" />
        </div>
      )}

      {currentPath && (
        <svg className="absolute inset-0 z-[1000] pointer-events-none" style={{ width: '100%', height: '100%' }}>
          <path 
            d={currentPath} 
            fill="none" 
            stroke={activeTool === 'highlight' ? 'rgba(255,255,0,0.4)' : '#000000'} 
            strokeWidth={activeTool === 'highlight' ? 15 * scale : 3 * scale} 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </svg>
      )}

      <div 
        className="absolute inset-0 pointer-events-auto"
        style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: pageWidth, height: pageHeight }}
      >
        {page.elements.sort((a, b) => a.zIndex - b.zIndex).map(el => (
          <div
            key={el.id}
            className={cn(
              "absolute group transition-shadow",
              selectedElementId === el.id ? "ring-2 ring-primary shadow-2xl z-[999]" : "hover:ring-1 hover:ring-primary/40 cursor-pointer"
            )}
            style={{
              left: el.x,
              top: el.y,
              width: el.width,
              height: el.height,
              opacity: el.opacity,
              zIndex: el.zIndex,
              transform: `rotate(${el.rotation || 0}deg)`,
              willChange: 'transform, left, top'
            }}
            onMouseDown={(e) => handleElementInteraction(e, el, 'dragging')}
          >
            {el.type === 'text' && (
              <div 
                className="w-full h-full flex items-center p-2 outline-none font-medium whitespace-pre-wrap leading-tight overflow-hidden"
                contentEditable={selectedElementId === el.id}
                onBlur={(e) => onUpdateElement({ ...el, content: e.currentTarget.innerText })}
                onInput={(e) => {
                  if (selectedElementId === el.id) {
                    const h = e.currentTarget.scrollHeight;
                    if (h > el.height) onUpdateElement({ ...el, height: h });
                  }
                }}
                suppressContentEditableWarning
                style={{ 
                  fontSize: el.fontSize, 
                  fontFamily: el.fontFamily, 
                  lineHeight: el.lineHeight,
                  letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : 'normal',
                  color: el.color,
                  fontWeight: el.bold ? 'bold' : 'normal',
                  fontStyle: el.italic ? 'italic' : 'normal',
                  textAlign: el.textAlign
                }}
              >
                {el.content}
              </div>
            )}

            {el.type === 'shape' && (
              <svg width="100%" height="100%" viewBox={`0 0 ${el.width} ${el.height}`} preserveAspectRatio="none">
                {el.shapeType === 'rect' && <rect x="0" y="0" width="100%" height="100%" fill={el.fillColor} stroke={el.color} strokeWidth={el.strokeWidth} />}
                {el.shapeType === 'circle' && <ellipse cx="50%" cy="50%" rx="50%" ry="50%" fill={el.fillColor} stroke={el.color} strokeWidth={el.strokeWidth} />}
                {el.shapeType === 'line' && <line x1="0" y1="0" x2="100%" y2="100%" stroke={el.color} strokeWidth={el.strokeWidth} />}
              </svg>
            )}

            {el.type === 'path' && el.pathData && (
              <svg className="absolute inset-0 overflow-visible" style={{ width: pageWidth, height: pageHeight, left: -el.x, top: -el.y }}>
                <path d={el.pathData} fill="none" stroke={el.color} strokeWidth={el.strokeWidth} opacity={el.opacity} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}

            {el.type === 'whiteout' && <div className="w-full h-full shadow-inner" style={{ backgroundColor: el.color || '#FFFFFF' }} />}
            {el.type === 'link' && <div className="w-full h-full border border-blue-500/40 bg-blue-500/10 flex items-center justify-center"><LinkIcon className="w-4 h-4 text-blue-500 opacity-40" /></div>}
            {el.type === 'image' && el.content && <img src={el.content} className="w-full h-full object-cover pointer-events-none" alt="" />}
            {el.type === 'signature' && el.signatureData && <img src={el.signatureData} className="w-full h-full object-contain pointer-events-none" alt="" />}

            {selectedElementId === el.id && (
              <>
                <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-primary rounded-full cursor-nw-resize z-[1001]" onMouseDown={(e) => handleElementInteraction(e, el, 'resizing')} />
                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-primary rounded-full cursor-ne-resize z-[1001]" onMouseDown={(e) => handleElementInteraction(e, el, 'resizing')} />
                <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-primary rounded-full cursor-sw-resize z-[1001]" onMouseDown={(e) => handleElementInteraction(e, el, 'resizing')} />
                <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-primary rounded-full cursor-se-resize z-[1001]" onMouseDown={(e) => handleElementInteraction(e, el, 'resizing')} />
                
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-2xl border border-primary/20 cursor-pointer hover:bg-primary hover:text-white transition-all group/rot" onMouseDown={(e) => handleElementInteraction(e, el, 'rotating')}>
                  <RotateCw className="w-4 h-4 text-primary group-hover/rot:text-white transition-colors" />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
