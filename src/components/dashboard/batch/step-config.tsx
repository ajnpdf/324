"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Info, Settings2, Folder, Type, FileCode } from 'lucide-react';
import { BatchFile } from './batch-container';

interface Props {
  files: BatchFile[];
  config: any;
  setConfig: (c: any) => void;
}

export function StepConfig({ files, config, setConfig }: Props) {
  const tokens = ['{filename}', '{index}', '{date}', '{format}', '{width}', '{height}'];

  const getPreviewName = () => {
    let name = config.namingPattern;
    name = name.replace('{filename}', 'Document');
    name = name.replace('{index}', '001');
    name = name.replace('{date}', '2025-01-15');
    name = name.replace('{format}', 'PDF');
    return name + '.pdf';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="lg:col-span-2 space-y-8">
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Settings2 className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-black tracking-tight uppercase">Operation Settings</h2>
          </div>
          
          <Card className="bg-white/60 backdrop-blur-xl border-black/5 rounded-[2.5rem] shadow-xl border-2">
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Master Optimization</Label>
                  <Slider defaultValue={[80]} max={100} />
                  <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Compact</span>
                    <span>Balanced</span>
                    <span>HD</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Unified Format</Label>
                  <Select defaultValue="same">
                    <SelectTrigger className="bg-white/50 border-black/5 h-12 rounded-2xl font-bold">
                      <SelectValue placeholder="Match Original" />
                    </SelectTrigger>
                    <SelectContent className="bg-white rounded-xl">
                      <SelectItem value="same" className="font-bold uppercase text-[10px]">Match Source</SelectItem>
                      <SelectItem value="pdf" className="font-bold uppercase text-[10px]">Universal PDF</SelectItem>
                      <SelectItem value="jpg" className="font-bold uppercase text-[10px]">Standard JPEG</SelectItem>
                      <SelectItem value="png" className="font-bold uppercase text-[10px]">Lossless PNG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
                <div className="space-y-1">
                  <p className="text-sm font-black uppercase tracking-tight text-slate-950">Per-Format Calibration</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">Adjust settings independently for different asset classes.</p>
                </div>
                <Switch 
                  checked={config.differentSettingsPerType} 
                  onCheckedChange={(v) => setConfig({...config, differentSettingsPerType: v})} 
                />
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Type className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-black tracking-tight uppercase">Naming & Target</h2>
          </div>
          
          <Card className="bg-white/60 backdrop-blur-xl border-black/5 rounded-[2.5rem] shadow-xl border-2">
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Dynamic Pattern</Label>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-none text-[9px] font-black tracking-widest px-3 h-6">OUT: {getPreviewName()}</Badge>
                </div>
                <Input 
                  value={config.namingPattern} 
                  onChange={(e) => setConfig({...config, namingPattern: e.target.value})}
                  className="bg-white/50 border-black/5 font-bold h-14 text-xl rounded-2xl shadow-inner px-6"
                />
                <div className="flex flex-wrap gap-2 pt-2">
                  {tokens.map(t => (
                    <Button 
                      key={t} 
                      variant="outline" 
                      onClick={() => setConfig({...config, namingPattern: config.namingPattern + t})}
                      className="h-8 text-[9px] font-black border-black/5 bg-white shadow-sm rounded-lg hover:bg-primary/5"
                    >
                      {t}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-3">
                  <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Destination</Label>
                  <Select defaultValue="default">
                    <SelectTrigger className="bg-white/50 border-black/5 h-12 rounded-2xl font-bold px-4">
                      <div className="flex items-center gap-3">
                        <Folder className="w-4 h-4 text-primary" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-white rounded-xl">
                      <SelectItem value="default" className="font-bold text-[10px] uppercase">Default Workspace</SelectItem>
                      <SelectItem value="clients" className="font-bold text-[10px] uppercase">Client Exports</SelectItem>
                      <SelectItem value="archives" className="font-bold text-[10px] uppercase">Local Archive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between gap-4 p-4 bg-white/40 rounded-2xl border border-black/5 self-end h-12">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Skip Logic Errors</span>
                  <Switch checked={config.skipErrors} onCheckedChange={(v) => setConfig({...config, skipErrors: v})} />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      <div className="space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Batch Analysis</h3>
        <Card className="bg-primary/5 border-primary/20 shadow-none overflow-hidden rounded-[2.5rem] border-2">
          <CardContent className="p-8 space-y-8">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-black/5">
                <FileCode className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-black tracking-tighter tabular-nums">{files.length}</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Assets in Queue</p>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-black/5">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-400">Estimated Load</span>
                <span className="text-slate-900">~482 MB</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-400">Compute Cycle</span>
                <span className="text-slate-900">~5.5 Mins</span>
              </div>
            </div>

            <div className="p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-4 shadow-sm">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[9px] text-amber-700 font-bold leading-relaxed uppercase tracking-wide">
                Large batches are processed in the background. Ensure the browser tab remains active during calibration.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
