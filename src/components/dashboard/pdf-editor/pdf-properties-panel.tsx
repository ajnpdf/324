"use client";

import { PDFElement } from './types';
import { 
  Settings2, 
  Trash2, 
  Bold, 
  Italic, 
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Layers,
  ChevronUp,
  ChevronDown,
  Type,
  MoveVertical,
  ArrowRightLeft,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface Props {
  element: PDFElement | null;
  onUpdate: (el: PDFElement) => void;
  onDelete: () => void;
}

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72];

/**
 * AJN Modern Surgical Inspector
 * Featuring a sleek Glassmorphism UI and grouped industrial controls.
 */
export function PDFPropertiesPanel({ element, onUpdate, onDelete }: Props) {
  if (!element) return null;

  const handleFieldChange = (field: keyof PDFElement, value: any) => {
    onUpdate({ ...element, [field]: value });
  };

  return (
    <aside className="w-[320px] bg-white/80 backdrop-blur-3xl border border-white/20 shadow-[0_40px_120px_rgba(0,0,0,0.3)] rounded-[3rem] overflow-hidden m-8 animate-in slide-in-from-right-10 duration-700 pointer-events-auto flex flex-col h-[calc(100vh-160px)]">
      <header className="p-6 bg-slate-50/50 border-b border-black/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/10">
            <Settings2 className="w-4 h-4 text-primary" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Inspector</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onDelete} className="h-9 w-9 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl">
          <Trash2 className="w-4.5 h-4.5" />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-8 space-y-10">
        {/* TYPOGRAPHY GROUP */}
        {element.type === 'text' && (
          <section className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Type className="w-3.5 h-3.5 text-primary" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Typography</h4>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Family</Label>
                <Select value={element.fontFamily} onValueChange={(v) => handleFieldChange('fontFamily', v)}>
                  <SelectTrigger className="h-11 text-xs font-bold bg-white border-black/5 rounded-2xl shadow-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white rounded-2xl">{['Arial', 'Inter', 'Times New Roman', 'Courier'].map(f => <SelectItem key={f} value={f} className="text-xs font-bold">{f}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div className="flex gap-1 bg-black/5 p-1 rounded-2xl border border-black/5">
                {[
                  { icon: AlignLeft, val: 'left' },
                  { icon: AlignCenter, val: 'center' },
                  { icon: AlignRight, val: 'right' },
                ].map((btn, i) => (
                  <Button key={i} variant="ghost" className={cn("h-9 flex-1 rounded-xl transition-all", element.textAlign === btn.val ? "bg-white shadow-md text-primary" : "text-slate-400")} onClick={() => handleFieldChange('textAlign', btn.val)}>
                    <btn.icon className="w-4 h-4" />
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Sizing</Label>
                <span className="text-xs font-black text-primary bg-primary/5 px-2 py-0.5 rounded-lg">{element.fontSize}pt</span>
              </div>
              <div className="flex gap-3">
                <Select value={element.fontSize?.toString()} onValueChange={(v) => handleFieldChange('fontSize', parseInt(v))}>
                  <SelectTrigger className="h-11 w-24 text-xs font-bold bg-white border-black/5 rounded-2xl shadow-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white rounded-2xl max-h-64">{FONT_SIZES.map(s => <SelectItem key={s} value={s.toString()} className="text-xs font-bold">{s}pt</SelectItem>)}</SelectContent>
                </Select>
                <div className="flex-1 pt-4 px-2">
                  <Slider value={[element.fontSize || 16]} min={6} max={144} onValueChange={([v]) => handleFieldChange('fontSize', v)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                  <MoveVertical className="w-3 h-3" /> Leading
                </Label>
                <Slider value={[element.lineHeight || 1.2]} min={0.8} max={3} step={0.1} onValueChange={([v]) => handleFieldChange('lineHeight', v)} />
              </div>
              <div className="space-y-3">
                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                  <ArrowRightLeft className="w-3 h-3" /> Tracking
                </Label>
                <Slider value={[element.letterSpacing || 0]} min={-2} max={10} step={0.5} onValueChange={([v]) => handleFieldChange('letterSpacing', v)} />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className={cn("flex-1 h-11 rounded-2xl transition-all border-black/5", element.bold && "bg-primary text-white border-primary shadow-lg")} onClick={() => handleFieldChange('bold', !element.bold)}><Bold className="w-4 h-4" /></Button>
              <Button variant="outline" className={cn("flex-1 h-11 rounded-2xl transition-all border-black/5", element.italic && "bg-primary text-white border-primary shadow-lg")} onClick={() => handleFieldChange('italic', !element.italic)}><Italic className="w-4 h-4" /></Button>
            </div>
          </section>
        )}

        <Separator className="bg-black/5" />

        {/* SPATIAL CALIBRATION */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Maximize2 className="w-3.5 h-3.5 text-primary" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Calibration</h4>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Opacity</Label>
              <span className="text-xs font-black text-primary">{Math.round((element.opacity || 1) * 100)}%</span>
            </div>
            <Slider value={[(element.opacity || 1) * 100]} max={100} onValueChange={([v]) => handleFieldChange('opacity', v / 100)} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Width</Label>
              <Input type="number" value={Math.round(element.width)} onChange={(e) => handleFieldChange('width', parseInt(e.target.value))} className="h-11 bg-white border-black/5 rounded-2xl font-black text-xs" />
            </div>
            <div className="space-y-2">
              <Label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Height</Label>
              <Input type="number" value={Math.round(element.height)} onChange={(e) => handleFieldChange('height', parseInt(e.target.value))} className="h-11 bg-white border-black/5 rounded-2xl font-black text-xs" />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Primary Color</Label>
            <div className="flex gap-3">
              <div className="relative w-full h-11 rounded-2xl border border-black/5 overflow-hidden shadow-inner cursor-pointer group">
                <input type="color" value={element.color || '#000000'} onChange={(e) => handleFieldChange('color', e.target.value)} className="absolute inset-0 w-full h-full scale-150 cursor-pointer" />
              </div>
              <Input value={element.color} onChange={(e) => handleFieldChange('color', e.target.value)} className="h-11 text-[10px] font-mono uppercase bg-white border-black/5 rounded-2xl w-32 font-bold" />
            </div>
          </div>
        </section>

        <Separator className="bg-black/5" />

        {/* DEPTH & LAYERS */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Depth Management</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-11 gap-2 text-[9px] font-black uppercase tracking-widest rounded-2xl border-black/5 bg-white shadow-sm" onClick={() => handleFieldChange('zIndex', (element.zIndex || 0) + 1)}>
              <ChevronUp className="w-3.5 h-3.5" /> Forward
            </Button>
            <Button variant="outline" className="h-11 gap-2 text-[9px] font-black uppercase tracking-widest rounded-2xl border-black/5 bg-white shadow-sm" onClick={() => handleFieldChange('zIndex', Math.max(0, (element.zIndex || 0) - 1))}>
              <ChevronDown className="w-3.5 h-3.5" /> Backward
            </Button>
          </div>
        </section>
      </div>

      <footer className="p-6 bg-slate-50/50 border-t border-black/5 flex flex-col items-center gap-2 shrink-0">
        <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">AJN Surgical Layer</p>
      </footer>
    </aside>
  );
}