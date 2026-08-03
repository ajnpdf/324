
"use client";

import { ImageSettings } from './types';
import { 
  Settings2, 
  Maximize, 
  Shrink, 
  Crop, 
  Sparkles, 
  RotateCw, 
  Type, 
  Image as ImageIcon,
  Download,
  Wand2,
  Lock,
  Link as LinkIcon,
  ChevronDown,
  Trash2,
  Edit3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface Props {
  settings: ImageSettings;
  setSettings: (s: ImageSettings) => void;
  onReset: () => void;
}

export function ControlsPanel({ settings, setSettings, onReset }: Props) {
  const updateSetting = (key: keyof ImageSettings, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <aside className="flex-1 h-full bg-[#0a0e1f]/40 backdrop-blur-3xl overflow-y-auto scrollbar-hide border-r border-white/5">
      <div className="p-4 border-b border-white/5 flex items-center justify-between sticky top-0 bg-background/60 backdrop-blur-md z-10">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Controls</h3>
        <Settings2 className="w-3.5 h-3.5 text-muted-foreground/40" />
      </div>

      <div className="p-6 space-y-6">
        <Accordion type="multiple" defaultValue={['resize', 'compress']} className="space-y-4">
          <AccordionItem value="resize" className="border border-white/5 bg-white/5 rounded-2xl overflow-hidden px-4">
            <AccordionTrigger className="hover:no-underline py-4"><div className="flex items-center gap-3"><Maximize className="w-4 h-4 text-blue-400" /><span className="text-[11px] font-black uppercase tracking-widest">Resize</span></div></AccordionTrigger>
            <AccordionContent className="pb-6 space-y-6 pt-2"><div className="grid grid-cols-2 gap-4"><div className="space-y-1.5"><Label className="text-[9px] text-muted-foreground font-bold uppercase">Width</Label><Input type="number" value={settings.width} onChange={(e) => updateSetting('width', parseInt(e.target.value))} className="h-9 bg-white/5 border-white/10 font-bold" /></div><div className="space-y-1.5"><Label className="text-[9px] text-muted-foreground font-bold uppercase">Height</Label><Input type="number" value={settings.height} onChange={(e) => updateSetting('height', parseInt(e.target.value))} className="h-9 bg-white/5 border-white/10 font-bold" /></div></div><div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5"><div className="flex items-center gap-2"><LinkIcon className="w-3.5 h-3.5 text-primary" /><span className="text-[10px] font-bold uppercase">Lock ratio</span></div><Switch checked={settings.lockAspectRatio} onCheckedChange={(v) => updateSetting('lockAspectRatio', v)} /></div></AccordionContent>
          </AccordionItem>

          <AccordionItem value="compress" className="border border-white/5 bg-white/5 rounded-2xl overflow-hidden px-4">
            <AccordionTrigger className="hover:no-underline py-4"><div className="flex items-center gap-3"><Shrink className="w-4 h-4 text-emerald-400" /><span className="text-[11px] font-black uppercase tracking-widest">Compression</span></div></AccordionTrigger>
            <AccordionContent className="pb-6 space-y-6 pt-2"><div className="space-y-4"><div className="flex justify-between items-center"><Label className="text-[10px] font-bold uppercase">Quality</Label><span className="text-xs font-black text-primary">{settings.quality}%</span></div><Slider value={[settings.quality]} onValueChange={([v]) => updateSetting('quality', v)} max={100} step={1} /></div><Button className="w-full h-10 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-black text-[10px] uppercase tracking-widest gap-2"><Sparkles className="w-3.5 h-3.5" /> Optimize</Button></AccordionContent>
          </AccordionItem>

          <AccordionItem value="enhance" className="border border-white/5 bg-white/5 rounded-2xl overflow-hidden px-4">
            <AccordionTrigger className="hover:no-underline py-4"><div className="flex items-center gap-3"><Wand2 className="w-4 h-4 text-purple-400" /><span className="text-[11px] font-black uppercase tracking-widest">Enhancements</span></div></AccordionTrigger>
            <AccordionContent className="pb-6 space-y-6 pt-2"><div className="space-y-6">{['Brightness', 'Contrast', 'Saturation'].map((label) => (<div key={label} className="space-y-3"><div className="flex justify-between text-[10px] font-bold uppercase"><span>{label}</span><span className="text-primary">{settings[label.toLowerCase() as keyof ImageSettings]}%</span></div><Slider value={[settings[label.toLowerCase() as keyof ImageSettings] as number]} min={-100} max={100} onValueChange={([v]) => updateSetting(label.toLowerCase() as keyof ImageSettings, v)} /></div>))}<Button variant="ghost" className="w-full h-8 text-[9px] font-bold text-muted-foreground hover:text-white" onClick={onReset}>Reset all</Button></div></AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="p-6 border-t border-white/5 bg-background/60 space-y-4 sticky bottom-0">
        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Output name (optional)</label>
          <div className="relative">
            <Edit3 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Custom_Image_Name" className="h-10 pl-12 bg-white/5 border-white/10 font-bold text-xs" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label className="text-[9px] text-muted-foreground font-bold uppercase">Format</Label><Select value={settings.outputFormat} onValueChange={(v) => updateSetting('outputFormat', v)}><SelectTrigger className="h-10 bg-white/5 border-white/10 font-bold"><SelectValue /></SelectTrigger><SelectContent className="bg-card border-white/10">{['JPG', 'PNG', 'WebP', 'AVIF'].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label className="text-[9px] text-muted-foreground font-bold uppercase">Output DPI</Label><Select value={settings.outputDpi.toString()} onValueChange={(v) => updateSetting('outputDpi', parseInt(v))}><SelectTrigger className="h-10 bg-white/5 border-white/10 font-bold"><SelectValue /></SelectTrigger><SelectContent className="bg-card border-white/10">{['72', '96', '150', '300'].map(d => <SelectItem key={d} value={d}>{d} DPI</SelectItem>)}</SelectContent></Select></div>
        </div>
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5"><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Strip metadata</span><Switch checked={settings.stripMetadata} onCheckedChange={(v) => updateSetting('stripMetadata', v)} /></div>
      </div>
    </aside>
  );
}
