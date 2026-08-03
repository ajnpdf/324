"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward, 
  ZoomIn, 
  ZoomOut, 
  Info, 
  Volume2, 
  Mic 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

export function WaveformPlayer({ audio }: { audio: any }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [progress] = useState(15);
  const [waveformHeights, setWaveformHeights] = useState<{ upper: number[], lower: number[] }>({ upper: [], lower: [] });

  useEffect(() => {
    setWaveformHeights({
      upper: [...Array(120)].map(() => Math.random() * 80 + 10),
      lower: [...Array(120)].map(() => Math.random() * 60 + 5)
    });
  }, []);

  return (
    <section className="space-y-4">
      {/* Waveform Container */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 relative group overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-widest">
              Live Waveform
            </Badge>
            <div className="text-[10px] font-mono font-bold text-muted-foreground">
              00:01:45.20 / {audio.duration}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => setZoom(Math.min(3, zoom + 0.2))}>
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mock Stereo Waveform Visualizer */}
        <div className="h-48 flex items-center gap-[2px] relative">
          <div className="absolute inset-y-0 left-[15%] w-0.5 bg-primary shadow-[0_0_15px_rgba(59,130,246,0.5)] z-10" />
          <div className="flex-1 flex flex-col gap-4">
            {/* Upper Channel */}
            <div className="flex-1 flex items-center gap-[2px]">
              {waveformHeights.upper.map((height, i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded-full transition-all duration-500 ${i < progress ? 'bg-primary' : 'bg-white/10'}`} 
                  style={{ height: `${height}%` }} 
                />
              ))}
            </div>
            {/* Lower Channel */}
            <div className="flex-1 flex items-center gap-[2px]">
              {waveformHeights.lower.map((height, i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded-full transition-all duration-500 ${i < progress ? 'bg-primary/60' : 'bg-white/5'}`} 
                  style={{ height: `${height}%` }} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* Player Controls */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" className="h-10 w-10 border-white/10 bg-white/5 rounded-full">
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button 
              size="icon" 
              className="h-12 w-12 bg-primary hover:bg-primary/90 rounded-full shadow-xl shadow-primary/20"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </Button>
            <Button size="icon" variant="outline" className="h-10 w-10 border-white/10 bg-white/5 rounded-full">
              <SkipForward className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-10 w-10 ml-2">
              <Square className="w-4 h-4 fill-muted-foreground text-muted-foreground" />
            </Button>
          </div>

          <div className="flex items-center gap-4 min-w-[200px]">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <Slider defaultValue={[80]} max={100} step={1} className="w-32" />
          </div>
        </div>
      </div>

      {/* Metadata Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
        <div className="flex flex-wrap gap-6">
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Info className="w-3 h-3" /> Audio Engine Specifications
            </p>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-primary/10 text-primary border-none text-[10px] font-bold">{audio.format}</Badge>
              <span className="text-[10px] font-bold text-white/60">{audio.sampleRate}</span>
              <span className="text-[10px] font-bold text-white/60">{audio.bitrate}</span>
              <span className="text-[10px] font-bold text-white/60">{audio.channels}</span>
              <span className="text-[10px] font-bold text-white/60">{audio.duration}</span>
              <span className="text-[10px] font-bold text-white/60">{audio.size}</span>
            </div>
          </div>
        </div>
        <Button variant="outline" className="h-9 gap-2 border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-widest">
          <Mic className="w-3.5 h-3.5" /> Re-Record
        </Button>
      </div>
    </section>
  );
}
