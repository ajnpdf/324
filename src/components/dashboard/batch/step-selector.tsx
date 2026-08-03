"use client";

import { 
  Repeat, 
  Shrink, 
  Maximize, 
  Type, 
  Edit3, 
  Layers, 
  Scissors, 
  Scan,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const ops = [
  { id: 'convert', icon: Repeat, title: 'Convert All', desc: 'Transform all files into a single target format.' },
  { id: 'compress', icon: Shrink, title: 'Compress All', desc: 'Reduce file size across the entire batch.' },
  { id: 'resize', icon: Maximize, title: 'Resize All', desc: 'Scale dimensions for all images or videos.' },
  { id: 'watermark', icon: Type, title: 'Watermark All', desc: 'Apply text or image overlays to every file.' },
  { id: 'rename', icon: Edit3, title: 'Rename All', desc: 'Bulk rename files using smart tokens.' },
  { id: 'merge', icon: Layers, title: 'Merge to PDF', desc: 'Combine all images/docs into one PDF.' },
  { id: 'split', icon: Scissors, title: 'Split All PDFs', desc: 'Separate PDF pages into individual files.' },
  { id: 'ocr', icon: Scan, title: 'OCR All PDFs', desc: 'Recognize text across all document files.' },
];

export function StepSelector({ selectedOp, onSelect }: { selectedOp: string | null, onSelect: (id: string) => void }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <section className="text-center space-y-2">
        <h2 className="text-3xl font-black tracking-tight">Select Operation</h2>
        <p className="text-muted-foreground font-medium">What would you like to apply to your selected files?</p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {ops.map((op) => (
          <Card 
            key={op.id}
            onClick={() => onSelect(op.id)}
            className={cn(
              "cursor-pointer transition-all duration-300 relative group overflow-hidden border-2",
              selectedOp === op.id ? "border-primary bg-primary/5 shadow-2xl shadow-primary/10" : "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10"
            )}
          >
            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500",
                selectedOp === op.id ? "bg-primary text-white scale-110" : "bg-white/5 text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
              )}>
                <op.icon className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-sm uppercase tracking-tighter">{op.title}</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed font-bold">{op.desc}</p>
              </div>
              {selectedOp === op.id && (
                <div className="absolute top-2 right-2 animate-in zoom-in-50 duration-300">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
