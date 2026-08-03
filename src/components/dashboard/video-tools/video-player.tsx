
"use client";

import { Button } from '@/components/ui/button';
import { Replace, Play, Maximize2, Volume2, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function VideoPlayer({ video }: { video: any }) {
  return (
    <section className="space-y-4">
      <div className="aspect-video bg-black rounded-3xl overflow-hidden border border-white/5 relative group shadow-2xl">
        <video 
          className="w-full h-full object-contain"
          controls
          poster={`https://picsum.photos/seed/vid/1280/720`}
        >
          <source src={video.url} type="video/mp4" />
        </video>
        
        {/* Mock Controls Overlay if standard is not enough */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none p-6 flex flex-col justify-end">
           <div className="flex items-center justify-between pointer-events-auto">
              <div className="flex gap-4">
                 <Button size="icon" variant="ghost" className="text-white hover:bg-white/10"><Play className="w-5 h-5 fill-current" /></Button>
                 <Button size="icon" variant="ghost" className="text-white hover:bg-white/10"><Volume2 className="w-5 h-5" /></Button>
              </div>
              <Button size="icon" variant="ghost" className="text-white hover:bg-white/10"><Maximize2 className="w-5 h-5" /></Button>
           </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
        <div className="flex flex-wrap gap-6">
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Info className="w-3 h-3" /> Technical Specs
            </p>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-primary/10 text-primary border-none text-[10px] font-bold">{video.resolution}</Badge>
              <span className="text-[10px] font-bold text-white/60">{video.duration}</span>
              <span className="text-[10px] font-bold text-white/60">{video.size}</span>
              <span className="text-[10px] font-bold text-white/60">{video.vCodec} | {video.aCodec}</span>
              <span className="text-[10px] font-bold text-white/60">{video.fps} FPS</span>
            </div>
          </div>
        </div>
        <Button variant="outline" className="h-9 gap-2 border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-widest">
          <Replace className="w-3.5 h-3.5" /> Replace Video
        </Button>
      </div>
    </section>
  );
}
