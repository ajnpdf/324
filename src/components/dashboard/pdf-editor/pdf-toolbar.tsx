
"use client";

import { 
  Type, 
  ImageIcon, 
  Link as LinkIcon, 
  Undo2, 
  Redo2, 
  Minus, 
  Plus, 
  Download, 
  Pen,
  Eraser,
  CheckSquare,
  MousePointer2,
  History,
  Square,
  Circle,
  Slash,
  Highlighter,
  Brush
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PDFTool } from './types';
import { cn } from '@/lib/utils';

interface Props {
  activeTool: PDFTool;
  setActiveTool: (tool: PDFTool) => void;
  zoom: number;
  setZoom: (z: number) => void;
  onRotate: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onSave: () => void;
}

/**
 * AJN Surgical Toolbar - 2026 Production Standard
 */
export function PDFToolbar({ activeTool, setActiveTool, zoom, setZoom, onUndo, onRedo, canUndo, canRedo, onSave }: Props) {
  const ToolButton = ({ tool, icon: Icon, label }: { tool: PDFTool, icon: any, label: string }) => (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            className={cn(
              "h-14 flex flex-col items-center justify-center gap-1 rounded-none px-4 transition-all border-b-2",
              activeTool === tool 
                ? "bg-slate-100 border-primary text-primary" 
                : "text-slate-600 border-transparent hover:bg-slate-50"
            )}
            onClick={() => setActiveTool(tool)}
          >
            <Icon className="w-4 h-4" />
            <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-slate-900 text-white border-none"><span className="text-[10px] font-bold uppercase tracking-widest">{label} Tool</span></TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <header className="h-20 bg-white border-b border-black/10 flex items-center justify-between px-8 shrink-0 z-100 shadow-sm relative overflow-x-auto scrollbar-hide">
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" disabled={!canUndo} onClick={onUndo} className="h-9 w-9 disabled:opacity-20"><Undo2 className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" disabled={!canRedo} onClick={onRedo} className="h-9 w-9 disabled:opacity-20"><Redo2 className="w-4 h-4" /></Button>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-1.5 border border-black/5">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(Math.max(25, zoom - 10))}><Minus className="w-3.5 h-3.5" /></Button>
          <span className="text-[11px] font-black w-10 text-center">{zoom}%</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(Math.min(400, zoom + 10))}><Plus className="w-3.5 h-3.5" /></Button>
        </div>
      </div>

      <div className="flex items-center bg-white/50 backdrop-blur rounded-2xl overflow-hidden border border-black/5 shadow-inner mx-4">
        <ToolButton tool="select" icon={MousePointer2} label="Select" />
        <Separator orientation="vertical" className="h-10 opacity-40" />
        <ToolButton tool="add-text" icon={Type} label="Text" />
        <ToolButton tool="link" icon={LinkIcon} label="Links" />
        <ToolButton tool="form-field" icon={CheckSquare} label="Forms" />
        <ToolButton tool="insert-image" icon={ImageIcon} label="Images" />
        <ToolButton tool="draw" icon={Brush} label="Draw" />
        <ToolButton tool="highlight" icon={Highlighter} label="Mark" />
        <Separator orientation="vertical" className="h-10 opacity-40" />
        <ToolButton tool="shape-rect" icon={Square} label="Rect" />
        <ToolButton tool="shape-circle" icon={Circle} label="Circle" />
        <ToolButton tool="shape-line" icon={Slash} label="Line" />
        <Separator orientation="vertical" className="h-10 opacity-40" />
        <ToolButton tool="whiteout" icon={Eraser} label="Whiteout" />
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <Button onClick={onSave} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] h-11 px-8 rounded-xl uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/20 gap-2 transition-all">
          <Download className="w-4 h-4" /> Apply changes
        </Button>
      </div>
    </header>
  );
}
