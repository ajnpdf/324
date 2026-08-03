"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Repeat, 
  Shrink, 
  Scissors, 
  Music, 
  Maximize, 
  Type, 
  ImageIcon, 
  Clock,
  Zap,
  Edit3,
  Plus
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  onProcess: (op: string, settings: any, name?: string) => void;
}

export function ToolTabs({ onProcess }: Props) {
  const [activeTab, setActiveTab] = useState('convert');
  const [outputName, setOutputName] = useState("");

  const ActionButton = ({ label }: { label: string }) => (
    <div className="pt-6 border-t border-black/5 flex items-center justify-between mt-8">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
        <Clock className="w-3 h-3" /> 
        Est. Time: ~15 seconds
      </div>
      <Button 
        onClick={() => onProcess(activeTab.toUpperCase(), {}, outputName)}
        className="bg-primary text-white font-black text-xs px-10 shadow-xl hover:scale-105 transition-all gap-2 uppercase tracking-widest rounded-2xl h-14"
      >
        <Zap className="w-4 h-4" /> START {label.toUpperCase()}
      </Button>
    </div>
  );

  return (
    <Card className="bg-white/40 backdrop-blur-xl border-black/5 overflow-hidden rounded-[2.5rem] shadow-xl border-2">
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-black/5 bg-white/40">
            <TabsList className="bg-transparent h-14 p-0 gap-2 overflow-x-auto scrollbar-hide flex justify-start px-4">
              {[
                { id: 'convert', icon: Repeat, label: 'Convert' },
                { id: 'compress', icon: Shrink, label: 'Compress' },
                { id: 'trim', icon: Scissors, label: 'Trim' },
                { id: 'audio', icon: Music, label: 'Extract Audio' },
                { id: 'resize', icon: Maximize, label: 'Resize' },
                { id: 'watermark', icon: Type, label: 'Watermark' },
                { id: 'thumbnail', icon: ImageIcon, label: 'Thumbnail' },
              ].map((t) => (
                <TabsTrigger 
                  key={t.id} 
                  value={t.id} 
                  className="px-6 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary border-b-2 border-transparent transition-all text-[10px] font-black uppercase tracking-[0.2em] gap-2"
                >
                  <t.icon className="w-3.5 h-3.5" /> {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="p-8">
            <div className="space-y-2 mb-8">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">Output name (optional)</label>
              <div className="relative">
                <Edit3 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="New_Asset_Label" 
                  value={outputName} 
                  onChange={(e) => setOutputName(e.target.value)}
                  className="h-12 pl-12 bg-white/5 border-black/5 rounded-xl font-bold text-sm shadow-inner" 
                />
              </div>
            </div>
            
            <TabsContent value="convert" className="m-0 space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Output Format</Label>
                    <Select defaultValue="mp4">
                      <SelectTrigger className="bg-white/50 border-black/5 h-12 rounded-2xl font-bold px-4"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white rounded-xl">{['MP4', 'MOV', 'AVI', 'MKV', 'WebM'].map(f => <SelectItem key={f} value={f.toLowerCase()} className="font-bold uppercase text-[10px]">{f}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Transcoding Core</Label>
                    <Select defaultValue="h264">
                      <SelectTrigger className="bg-white/50 border-black/5 h-12 rounded-2xl font-bold px-4"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white rounded-xl"><SelectItem value="h264" className="font-bold uppercase text-[10px]">H.264 (AVC)</SelectItem><SelectItem value="h265" className="font-bold uppercase text-[10px]">H.265 (HEVC)</SelectItem><SelectItem value="vp9" className="font-bold uppercase text-[10px]">VP9 Stable</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Profile Preset</Label>
                    <div className="grid grid-cols-3 gap-2">{['Compact', 'Balanced', 'Pro'].map(p => (<Button key={p} variant="outline" className="h-12 text-[9px] font-black uppercase tracking-widest border-black/5 bg-white/40 hover:bg-primary/20 rounded-xl">{p}</Button>))}</div>
                  </div>
                  <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex flex-col gap-1 shadow-sm">
                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Efficiency Prediction</p>
                    <p className="text-sm font-black text-slate-900">~12.4 MB <span className="text-[10px] text-emerald-500 ml-2 font-bold">(-72%)</span></p>
                  </div>
                </div>
              </div>
              <ActionButton label="Conversion" />
            </TabsContent>

            <TabsContent value="compress" className="m-0 space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Target Matrix</Label>
                    <Select defaultValue="1080p">
                      <SelectTrigger className="bg-white/50 border-black/5 h-12 rounded-2xl font-bold px-4"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white rounded-xl">{['4K', '1080p', '720p', '480p'].map(r => <SelectItem key={r} value={r} className="font-bold uppercase text-[10px]">{r}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <Label className="text-[10px] font-black uppercase tracking-widest">Surgical Strength</Label>
                      <span className="text-xl font-black text-primary italic">70%</span>
                    </div>
                    <Slider defaultValue={[70]} max={100} step={1} />
                  </div>
                </div>
                <div className="space-y-4 flex flex-col justify-center">
                  <Button variant="outline" className="h-16 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary gap-4 rounded-[2rem] transition-all">
                    <Zap className="w-6 h-6" />
                    <div className="text-left">
                      <p className="text-xs font-black uppercase tracking-widest">Optimize for Network</p>
                      <p className="text-[9px] font-bold opacity-70 uppercase">High fidelity social delivery</p>
                    </div>
                  </Button>
                </div>
              </div>
              <ActionButton label="Compression" />
            </TabsContent>

            <TabsContent value="trim" className="m-0 space-y-10 animate-in fade-in duration-300">
              <div className="space-y-8">
                <div className="h-14 bg-white/40 rounded-2xl border border-black/5 relative overflow-hidden flex items-center px-6 shadow-inner">
                  <div className="absolute inset-y-0 left-[20%] right-[40%] bg-primary/10 border-x-4 border-primary/40" />
                  <div className="w-full h-1 bg-black/5 rounded-full" />
                  <div className="absolute left-[20%] h-full w-1 bg-primary" />
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">In Point</Label>
                    <Input defaultValue="00:00:15.00" className="bg-white/50 border-black/5 font-mono text-xs h-12 rounded-xl text-center" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Out Point</Label>
                    <Input defaultValue="00:01:22.00" className="bg-white/50 border-black/5 font-mono text-xs h-12 rounded-xl text-center" />
                  </div>
                </div>
              </div>
              <ActionButton label="Trim & Cut" />
            </TabsContent>

            <TabsContent value="audio" className="m-0 space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Audio Transcode</Label>
                  <Select defaultValue="mp3">
                    <SelectTrigger className="bg-white/50 border-black/5 h-12 rounded-2xl font-bold px-4"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white rounded-xl">{['MP3', 'WAV', 'AAC', 'FLAC'].map(f => <SelectItem key={f} value={f.toLowerCase()} className="font-bold uppercase text-[10px]">{f}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Master Bitrate</Label>
                  <Select defaultValue="320">
                    <SelectTrigger className="bg-white/50 border-black/5 h-12 rounded-2xl font-bold px-4"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white rounded-xl">{['320 kbps', '192 kbps', '128 kbps'].map(b => <SelectItem key={b} value={b.split(' ')[0]} className="font-bold uppercase text-[10px]">{b}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <ActionButton label="Extraction" />
            </TabsContent>

            <TabsContent value="merge" className="m-0 space-y-6 animate-in fade-in duration-300">
              <div className="space-y-4">
                <div className="p-5 bg-white/40 rounded-[2.5rem] border border-black/5 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center font-black text-xs text-primary border border-primary/10">1</div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-tight text-slate-900">Current_Recording.mp4</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Primary Source</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[9px] uppercase px-3 h-6">MASTER</Badge>
                </div>
                <Button variant="outline" className="w-full h-16 border-dashed border-black/10 bg-white/40 hover:bg-white/60 gap-3 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-[2rem] shadow-sm">
                  <Plus className="w-5 h-5" /> APPEND ADDITIONAL TRACK
                </Button>
              </div>
              <ActionButton label="Merge" />
            </TabsContent>

            <TabsContent value="resize" className="m-0 space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Scaling Profiles</Label>
                  <Select defaultValue="1080">
                    <SelectTrigger className="bg-white/50 border-black/5 h-12 rounded-2xl font-bold px-4"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white rounded-xl">
                      <SelectItem value="2160" className="font-bold text-[10px] uppercase">4K ULTRA HD</SelectItem>
                      <SelectItem value="1080" className="font-bold text-[10px] uppercase">1080P FULL HD</SelectItem>
                      <SelectItem value="720" className="font-bold text-[10px] uppercase">720P HD READY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Render Mode</Label>
                  <Select defaultValue="fit">
                    <SelectTrigger className="bg-white/50 border-black/5 h-12 rounded-2xl font-bold px-4"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white rounded-xl">
                      <SelectItem value="fit" className="font-bold text-[10px] uppercase">Fit Logic</SelectItem>
                      <SelectItem value="fill" className="font-bold text-[10px] uppercase">Fill & Crop</SelectItem>
                      <SelectItem value="stretch" className="font-bold text-[10px] uppercase">Dynamic Stretch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <ActionButton label="Resizing" />
            </TabsContent>

            <TabsContent value="watermark" className="m-0 space-y-10 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Brand Overlay Text</Label>
                    <Input placeholder="Enter industrial label..." className="bg-white/50 border-black/5 h-14 rounded-2xl font-black text-lg px-6 shadow-inner" />
                  </div>
                  <div className="space-y-6">
                    <div className="flex justify-between items-end"><Label className="text-[10px] font-black uppercase tracking-widest text-primary">Opacity Level</Label><span className="text-xl font-black text-primary italic">50%</span></div>
                    <Slider defaultValue={[50]} max={100} />
                  </div>
                </div>
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-center block">Surgical Positioning</Label>
                  <div className="grid grid-cols-3 gap-2 w-32 mx-auto">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className={cn("aspect-square border-2 border-black/5 bg-white/40 rounded-xl cursor-pointer hover:bg-primary/20 transition-all", i === 8 && "bg-primary/30 border-primary shadow-lg scale-95")} />
                    ))}
                  </div>
                </div>
              </div>
              <ActionButton label="Watermark" />
            </TabsContent>

            <TabsContent value="thumbnail" className="m-0 space-y-10 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest leading-relaxed">Extract a surgical frame or generate an automated thumbnail sequence from the active buffer.</p>
                  <Button variant="outline" className="w-full h-14 border-black/5 bg-white shadow-xl hover:bg-primary hover:text-white font-black text-[10px] uppercase tracking-widest rounded-2xl gap-3 transition-all">
                    <ImageIcon className="w-5 h-5" /> CAPTURE ACTIVE FRAME
                  </Button>
                </div>
                <div className="space-y-6">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-primary text-center block">Automated Array</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[5, 10, 20].map(n => (<Button key={n} variant="outline" className="h-12 text-[10px] font-black uppercase tracking-widest border-black/5 bg-white/40 hover:bg-black/10 rounded-xl">{n} Units</Button>))}
                  </div>
                  <p className="text-[8px] font-bold text-center text-slate-400 uppercase tracking-[0.4em]">Parallel Node extraction</p>
                </div>
              </div>
              <ActionButton label="Thumbnail" />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}