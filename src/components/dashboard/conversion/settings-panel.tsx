"use client";

import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Settings2, Wand2, RefreshCw, Layers, ShieldCheck, Cpu, Database } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Props {
  settings: any;
  setSettings: (s: any) => void;
}

export function SettingsPanel({ settings, setSettings }: Props) {
  const resetSettings = () => {
    setSettings({ quality: 85, resolution: '1080p', ocrLang: 'eng' });
  };

  return (
    <aside className="w-[340px] h-full border-l border-black/5 bg-white/40 backdrop-blur-3xl flex flex-col shrink-0 z-30 transition-all duration-500">
      <header className="h-16 border-b border-black/5 flex items-center justify-between px-6 shrink-0 bg-white/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black/5 rounded-lg flex items-center justify-center">
            <Settings2 className="w-4 h-4 text-muted-foreground/60" />
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Tool Configuration</h3>
        </div>
        <Badge variant="outline" className="text-[8px] font-black border-emerald-500/20 text-emerald-600 uppercase tracking-widest shadow-sm">LIVE SYNC</Badge>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-12 scrollbar-hide">
        {/* Quality Section */}
        <section className="space-y-6">
          <div className="flex justify-between items-center mb-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" /> Output Quality
            </Label>
            <span className="text-xs font-black text-slate-900">{settings.quality}%</span>
          </div>
          <Slider 
            value={[settings.quality]} 
            max={100} 
            step={1}
            onValueChange={([v]) => setSettings({...settings, quality: v})}
            className="py-4"
          />
          <div className="flex justify-between text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
            <span>Fast</span>
            <span>Balanced</span>
            <span>Best</span>
          </div>
        </section>

        {/* Video Settings */}
        <section className="space-y-4">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5" /> Smart Resolution
          </Label>
          <Select value={settings.resolution} onValueChange={(v) => setSettings({...settings, resolution: v})}>
            <SelectTrigger className="h-12 bg-white/60 border-black/5 rounded-xl font-black text-xs uppercase focus:ring-primary/20 px-4 shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white/95 backdrop-blur-xl border-black/5">
              <SelectItem value="4k" className="font-bold text-[10px]">4K ULTRA HD</SelectItem>
              <SelectItem value="1080p" className="font-bold text-[10px]">1080P FULL HD</SelectItem>
              <SelectItem value="720p" className="font-bold text-[10px]">720P HD READY</SelectItem>
              <SelectItem value="480p" className="font-bold text-[10px]">480P STANDARD</SelectItem>
            </SelectContent>
          </Select>
        </section>

        {/* OCR Language */}
        <section className="space-y-4">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
            <Wand2 className="w-3.5 h-3.5" /> OCR Recognition
          </Label>
          <Select value={settings.ocrLang} onValueChange={(v) => setSettings({...settings, ocrLang: v})}>
            <SelectTrigger className="h-12 bg-white/60 border-black/5 rounded-xl font-black text-xs uppercase focus:ring-primary/20 px-4 shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white/95 backdrop-blur-xl border-black/5">
              {['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Arabic'].map(l => (
                <SelectItem key={l} value={l.toLowerCase()} className="font-bold text-[10px] uppercase">{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        {/* Filename Template */}
        <section className="space-y-4">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
            <Database className="w-3.5 h-3.5" /> Output Template
          </Label>
          <Input 
            defaultValue="{name}_{format}_{date}" 
            className="h-12 bg-white/60 border-black/5 rounded-xl font-mono text-[10px] uppercase px-4 focus:ring-primary/20 shadow-sm"
          />
          <div className="flex flex-wrap gap-2">
            {['{name}', '{format}', '{date}', '{index}'].map(t => (
              <Badge key={t} variant="secondary" className="bg-black/5 text-slate-600 text-[8px] font-black py-1 px-2 cursor-pointer hover:bg-primary/10 transition-colors uppercase tracking-widest border border-black/5 shadow-sm">{t}</Badge>
            ))}
          </div>
        </section>

        {/* Privacy Toggles */}
        <section className="space-y-4 pt-6 border-t border-black/5">
          <div className="flex items-center justify-between p-5 bg-white/60 rounded-2xl border border-black/5 group transition-all hover:border-primary/20 shadow-sm">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Strip EXIF</p>
              <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest opacity-60">Wipe Metadata</p>
            </div>
            <Switch defaultChecked className="data-[state=checked]:bg-primary" />
          </div>
          <div className="flex items-center justify-between p-5 bg-white/60 rounded-2xl border border-black/5 group transition-all hover:border-primary/20 shadow-sm">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Local Cache</p>
              <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest opacity-60">Temporary Buffer</p>
            </div>
            <Switch className="data-[state=checked]:bg-primary" />
          </div>
        </section>
      </div>

      <div className="p-8 border-t border-black/5 bg-white/20 space-y-6">
        <div className="flex items-center gap-3 text-muted-foreground/40 px-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">Verified Secure Workspace</span>
        </div>
        <Button 
          variant="ghost" 
          onClick={resetSettings} 
          className="w-full h-12 text-[10px] font-black uppercase tracking-[0.3em] gap-2 text-muted-foreground hover:text-slate-900 hover:bg-black/5 rounded-xl transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset Preferences
        </Button>
      </div>
    </aside>
  );
}
