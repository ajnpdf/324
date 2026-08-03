"use client";

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Repeat, 
  Scissors, 
  Layers, 
  Volume2, 
  ShieldAlert, 
  Zap, 
  Clock, 
  Waves,
  Plus,
  Edit3
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface Props {
  onProcess: (op: string, settings: any, name?: string) => void;
}

export function AudioToolTabs({ onProcess }: Props) {
  const [activeTab, setActiveTab] = useState('convert');
  const [outputName, setOutputName] = useState("");

  const ActionButton = ({ label, icon: Icon = Zap }: { label: string, icon?: any }) => (
    <div className="pt-6 border-t border-white/5 flex items-center justify-between mt-8">
      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <Clock className="w-3 h-3" /> 
        Est. Time: ~5-10 seconds
      </div>
      <Button 
        onClick={() => onProcess(activeTab.toUpperCase(), {}, outputName)}
        className="bg-primary text-white font-black text-xs px-8 shadow-xl hover:scale-105 transition-all gap-2 uppercase tracking-widest"
      >
        <Icon className="w-4 h-4" /> PROCESS {label.toUpperCase()}
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
                { id: 'trim', icon: Scissors, label: 'Trim' },
                { id: 'merge', icon: Layers, label: 'Merge' },
                { id: 'normalize', icon: Volume2, label: 'Normalize' },
                { id: 'noise', icon: ShieldAlert, label: 'Noise Reduction' },
                { id: 'speed', icon: Zap, label: 'Speed' },
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
            <div className="space-y-2 mb-6">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">Output name (optional)</label>
              <div className="relative">
                <Edit3 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Custom_Audio_Label" 
                  value={outputName} 
                  onChange={(e) => setOutputName(e.target.value)}
                  className="h-12 pl-12 bg-white/50 border-black/5 rounded-2xl font-bold text-sm shadow-inner" 
                />
              </div>
            </div>

            <TabsContent value="convert" className="m-0 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Output Format</Label>
                  <Select defaultValue="mp3">
                    <SelectTrigger className="bg-white/50 border-black/5 h-12 rounded-2xl font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white rounded-xl">
                      {['MP3', 'WAV', 'AAC', 'FLAC', 'M4A', 'OGG'].map(f => <SelectItem key={f} value={f.toLowerCase()} className="font-bold uppercase text-[10px]">{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Bitrate</Label>
                  <Select defaultValue="320">
                    <SelectTrigger className="bg-white/50 border-black/5 h-12 rounded-2xl font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white rounded-xl">
                      {['128 kbps', '192 kbps', '256 kbps', '320 kbps'].map(b => <SelectItem key={b} value={b.split(' ')[0]} className="font-bold uppercase text-[10px]">{b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Sample Rate</Label>
                  <Select defaultValue="44100">
                    <SelectTrigger className="bg-white/50 border-black/5 h-12 rounded-2xl font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white rounded-xl">
                      <SelectItem value="22050" className="font-bold uppercase text-[10px]">22050 Hz</SelectItem>
                      <SelectItem value="44100" className="font-bold uppercase text-[10px]">44100 Hz (CD)</SelectItem>
                      <SelectItem value="48000" className="font-bold uppercase text-[10px]">48000 Hz (Studio)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <ActionButton label="Conversion" />
            </TabsContent>

            <TabsContent value="trim" className="m-0 space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Start Point</Label>
                      <Input defaultValue="00:00:05.00" className="bg-white/50 border-black/5 font-mono text-xs h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">End Point</Label>
                      <Input defaultValue="00:05:30.00" className="bg-white/50 border-black/5 font-mono text-xs h-12 rounded-xl" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-5 bg-primary/5 rounded-[2rem] border border-primary/10">
                    <Scissors className="w-5 h-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-xs font-black uppercase tracking-tight text-slate-900">Precision Trim</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Fade in/out will be applied.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-900">Fade Durations</Label>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                          <span>FADE IN</span>
                          <span className="text-primary">1.5s</span>
                        </div>
                        <Slider defaultValue={[1.5]} max={5} step={0.1} />
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                          <span>FADE OUT</span>
                          <span className="text-primary">2.0s</span>
                        </div>
                        <Slider defaultValue={[2]} max={5} step={0.1} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <ActionButton label="Trim" />
            </TabsContent>

            <TabsContent value="merge" className="m-0 space-y-6 animate-in fade-in duration-300">
              <div className="space-y-4">
                <div className="p-5 bg-white/40 rounded-[2rem] border border-black/5 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center font-black text-xs text-primary border border-primary/10">1</div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-tight text-slate-900">Current_Recording.mp3</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active File</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[9px] uppercase px-3">MASTER</Badge>
                </div>
                <Button variant="outline" className="w-full h-14 border-dashed border-black/10 bg-white/40 hover:bg-white/60 gap-3 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-2xl">
                  <Plus className="w-5 h-5" /> ADD ANOTHER TRACK
                </Button>
                <div className="pt-6">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-primary mb-6 block">Cross-Fade Transition</Label>
                  <div className="flex items-center gap-8 px-4">
                    <Slider defaultValue={[3]} max={10} className="flex-1" />
                    <span className="text-sm font-black w-14 text-right tabular-nums">3.0s</span>
                  </div>
                </div>
              </div>
              <ActionButton label="Merge" icon={Layers} />
            </TabsContent>

            <TabsContent value="normalize" className="m-0 space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Target Loudness (LUFS)</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {[{ l: 'Podcast', v: '-16' }, { l: 'Streaming', v: '-14' }, { l: 'Broadcast', v: '-23' }, { l: 'Custom', v: '---' }].map((item) => (
                      <Button key={item.l} variant="outline" className="h-16 flex flex-col items-center justify-center border-black/5 bg-white/40 hover:border-primary/50 transition-all rounded-2xl">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{item.l}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{item.v} LUFS</span>
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="bg-primary/5 rounded-[2.5rem] p-10 border border-primary/10 flex flex-col justify-center space-y-6 shadow-inner">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-500">Current Loudness</span>
                    <span className="text-slate-900">-18.4 LUFS</span>
                  </div>
                  <div className="h-2 bg-black/5 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-primary w-[65%] rounded-full shadow-[0_0_10px_rgba(30,58,138,0.3)]" />
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <Waves className="w-5 h-5 text-primary animate-pulse" />
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Analyzing levels...</p>
                  </div>
                </div>
              </div>
              <ActionButton label="Normalization" />
            </TabsContent>

            <TabsContent value="noise" className="m-0 space-y-8 animate-in fade-in duration-300">
              <div className="space-y-6">
                <div className="p-8 bg-amber-500/5 border border-amber-500/10 rounded-[2.5rem] space-y-3">
                  <div className="flex items-center gap-3 text-amber-600">
                    <ShieldAlert className="w-6 h-6" />
                    <h4 className="text-base font-black uppercase tracking-tight">Step 1: Noise Profiling</h4>
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">Select a silence segment on the waveform, then click to learn noise profile.</p>
                  <Button className="mt-4 bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] uppercase tracking-widest h-10 rounded-xl px-8 shadow-lg">Learn Profile</Button>
                </div>
                <div className="space-y-6 pt-6">
                  <div className="flex justify-between items-center">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Reduction Strength</Label>
                    <span className="text-base font-black text-primary tabular-nums">75%</span>
                  </div>
                  <Slider defaultValue={[75]} max={100} />
                </div>
              </div>
              <ActionButton label="Noise Removal" icon={Waves} />
            </TabsContent>

            <TabsContent value="speed" className="m-0 space-y-10 animate-in fade-in duration-300">
              <div className="max-w-2xl mx-auto space-y-12">
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Playback Velocity</Label>
                    <span className="text-3xl font-black text-primary italic tabular-nums">1.25×</span>
                  </div>
                  <Slider defaultValue={[1.25]} min={0.25} max={4} step={0.05} className="py-4" />
                  <div className="flex justify-between gap-3">
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => (
                      <Button key={s} variant="outline" className="flex-1 h-12 text-[10px] font-black border-black/5 bg-white/40 hover:bg-primary/20 rounded-xl transition-all">{s}x</Button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between p-8 bg-white/40 rounded-[2.5rem] border border-black/5 shadow-sm">
                  <div className="space-y-1">
                    <p className="text-base font-black uppercase tracking-tight text-slate-900">Preserve Pitch</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Maintains natural vocal tone during speed shift.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <ActionButton label="Speed" />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}