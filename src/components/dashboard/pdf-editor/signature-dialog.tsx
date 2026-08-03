"use client";

import { useState, useRef, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PenTool, Type, Upload, Eraser, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: string, type: 'draw' | 'type' | 'upload') => void;
}

/**
 * AJN Professional Signature Suite
 * Features: Precision Draw, Calligraphic Type, and File Ingestion.
 */
export function SignatureDialog({ open, onOpenChange, onSave }: Props) {
  const [activeTab, setActiveTab] = useState('draw');
  const [typeText, setTypeText] = useState('');
  const [typeFont, setTypeFont] = useState('serif');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawing] = useState(false);

  useEffect(() => {
    if (open && activeTab === 'draw') {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
        }
      }
    }
  }, [open, activeTab]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    setHasDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawing(false);
  };

  const handleSave = () => {
    if (activeTab === 'draw') {
      const data = canvasRef.current?.toDataURL('image/png');
      if (data) onSave(data, 'draw');
    } else if (activeTab === 'type') {
      if (!typeText) return;
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 150;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = `italic 64px ${typeFont === 'serif' ? 'Times New Roman' : 'Arial'}`;
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(typeText, canvas.width / 2, canvas.height / 2);
        onSave(canvas.toDataURL('image/png'), 'type');
      }
    }
    onOpenChange(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          onSave(ev.target.result as string, 'upload');
          onOpenChange(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-white border-black/10 p-0 overflow-hidden font-sans rounded-[2rem] shadow-2xl">
        <DialogHeader className="p-8 border-b border-black/5 bg-slate-50/50">
          <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-slate-950">Add Digital Signature</DialogTitle>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Advanced Professional Setup</p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-14 bg-black/5 p-1 rounded-none border-b border-black/5">
            <TabsTrigger value="draw" className="text-[11px] font-black uppercase gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"><PenTool className="w-3.5 h-3.5" /> Draw</TabsTrigger>
            <TabsTrigger value="type" className="text-[11px] font-black uppercase gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"><Type className="w-3.5 h-3.5" /> Type</TabsTrigger>
            <TabsTrigger value="upload" className="text-[11px] font-black uppercase gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"><Upload className="w-3.5 h-3.5" /> Upload</TabsTrigger>
          </TabsList>

          <div className="p-10">
            <TabsContent value="draw" className="m-0 space-y-6">
              <div className="bg-slate-50 border-2 border-dashed border-black/10 rounded-3xl relative overflow-hidden group hover:border-primary/40 transition-all shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={250}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-[250px] cursor-crosshair touch-none"
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearCanvas}
                  className="absolute bottom-4 right-4 h-9 text-[10px] font-black uppercase gap-2 bg-white/80 backdrop-blur-md border border-black/5 rounded-xl hover:bg-red-50 hover:text-red-500 shadow-sm"
                >
                  <Eraser className="w-3.5 h-3.5" /> Clear Pad
                </Button>
              </div>
              <div className="flex items-center justify-center gap-2 text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em]">
                <PenTool className="w-3 h-3" /> Draw signature using mouse or touch
              </div>
            </TabsContent>

            <TabsContent value="type" className="m-0 space-y-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Full Legal Name</Label>
                <Input 
                  placeholder="e.g. Johnathan Doe" 
                  value={typeText} 
                  onChange={(e) => setTypeText(e.target.value)}
                  className="h-16 text-2xl font-bold border-black/10 bg-black/5 rounded-2xl focus:ring-primary/20 px-6"
                />
              </div>
              <div className="p-10 bg-slate-50 rounded-3xl border border-black/5 flex items-center justify-center min-h-[140px] shadow-inner">
                {typeText ? (
                  <span className={cn(
                    "text-5xl italic text-slate-900 transition-all duration-500",
                    typeFont === 'serif' ? 'font-serif' : 'font-sans font-bold'
                  )}>{typeText}</span>
                ) : (
                  <span className="text-xs text-slate-300 font-black uppercase tracking-[0.4em]">Preview Logic</span>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setTypeFont('serif')} className={cn("flex-1 h-11 text-[10px] font-black uppercase rounded-xl border-black/5 bg-white/50", typeFont === 'serif' && "bg-primary text-white border-primary")}>Calligraphic</Button>
                <Button variant="outline" onClick={() => setTypeFont('sans')} className={cn("flex-1 h-11 text-[10px] font-black uppercase rounded-xl border-black/5 bg-white/50", typeFont === 'sans' && "bg-primary text-white border-primary")}>Modern Script</Button>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="m-0">
              <div className="flex flex-col items-center justify-center p-16 bg-slate-50 border-2 border-dashed border-black/10 rounded-[3rem] space-y-6 group hover:border-primary/40 transition-all cursor-pointer relative shadow-inner">
                <input type="file" onChange={handleFileUpload} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-xl border border-black/5 group-hover:scale-110 transition-all duration-500 group-hover:bg-primary group-hover:text-white">
                  <Upload className="w-8 h-8" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-black uppercase tracking-tighter text-slate-950">Inhale Signature File</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">PNG, JPG, or SVG Supported</p>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="p-8 border-t border-black/5 bg-slate-50/50 flex items-center justify-between gap-4">
          <div className="hidden sm:flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[9px] font-black uppercase tracking-widest">Local Buffer Secure</span>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-[10px] font-black uppercase px-6 h-11 rounded-xl">Discard</Button>
            <Button 
              onClick={handleSave} 
              disabled={activeTab === 'draw' ? !hasDrawn : !typeText && activeTab !== 'upload'}
              className="bg-primary text-white font-black text-[10px] uppercase px-10 h-11 rounded-xl shadow-xl hover:scale-105 transition-all"
            >
              Adopt Signature
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
