"use client";

import { useState } from 'react';
import { VideoPlayer } from './video-player';
import { ToolTabs } from './tool-tabs';
import { JobQueue } from './job-queue';
import { Button } from '@/components/ui/button';
import { ArrowLeft, History, Save } from 'lucide-react';
import Link from 'next/link';

export interface VideoJob {
  id: string;
  filename: string;
  operation: string;
  status: 'queued' | 'processing' | 'complete' | 'failed';
  progress: number;
  eta: string;
}

/**
 * AJN Video Studio - Industrial Transcoding Hub
 * Cleaned: Sharing node removed for local privacy.
 */
export function VideoToolsContainer({ initialFileId }: { initialFileId: string | null }) {
  const [jobs, setJobs] = useState<VideoJob[]>([]);
  const [activeVideo, setActiveVideo] = useState({
    name: 'Marketing_Ad_Q1.mp4',
    url: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
    resolution: '1280x720',
    duration: '00:03:45',
    size: '45.1 MB',
    vCodec: 'H.264',
    aCodec: 'AAC',
    fps: 30
  });

  const addJob = (operation: string, settings: any, customName?: string) => {
    const finalName = customName ? `${customName}.mp4` : activeVideo.name;
    const newJob: VideoJob = {
      id: Math.random().toString(36).substr(2, 9),
      filename: finalName,
      operation,
      status: 'queued',
      progress: 0,
      eta: 'Calculating...'
    };
    setJobs(prev => [newJob, ...prev]);
    simulateJob(newJob.id);
  };

  const simulateJob = async (id: string) => {
    await new Promise(r => setTimeout(r, 1500));
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'processing', eta: '12s' } : j));

    for (let i = 0; i <= 100; i += 10) {
      setJobs(prev => prev.map(j => j.id === id ? { ...j, progress: i, eta: `${Math.ceil((100 - i) / 8)}s` } : j));
      await new Promise(r => setTimeout(r, 800));
    }

    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'complete', progress: 100, eta: '0s' } : j));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="h-16 border-b border-white/5 bg-background/40 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/dashboard"><Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-white/5"><ArrowLeft className="w-4 h-4 text-muted-foreground" /></Button></Link>
          <div className="space-y-0.5"><h1 className="text-sm font-black tracking-tighter uppercase">{activeVideo.name}</h1><p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Video Studio</p></div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-9 gap-2 border-white/10 bg-white/5 text-xs font-bold"><History className="w-3.5 h-3.5" /> History</Button>
          <Button className="h-9 gap-2 bg-primary hover:bg-primary/90 text-xs font-black px-6"><Save className="w-3.5 h-3.5" /> Save</Button>
        </div>
      </header>
      <div className="flex-1 flex flex-col overflow-y-auto scrollbar-hide"><div className="p-6 space-y-8 max-w-6xl mx-auto w-full"><VideoPlayer video={activeVideo} /><ToolTabs onProcess={addJob} />{jobs.length > 0 && <JobQueue jobs={jobs} />}</div></div>
    </div>
  );
}
