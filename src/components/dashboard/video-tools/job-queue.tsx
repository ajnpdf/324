
"use client";

import { VideoJob } from './video-tools-container';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Download, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export function JobQueue({ jobs }: { jobs: VideoJob[] }) {
  return (
    <section className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black tracking-tight">Active Processing Queue</h3>
        <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white">
          Clear Finished
        </Button>
      </div>

      <div className="space-y-3">
        {jobs.map((job) => (
          <Card key={job.id} className="bg-card/40 backdrop-blur-md border-white/5 group hover:border-primary/20 transition-all overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center p-4 gap-6">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-sm truncate">{job.filename}</p>
                    <Badge variant="outline" className="text-[8px] h-4 border-primary/20 text-primary font-black uppercase tracking-widest">
                      {job.operation}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground">
                    <span className="flex items-center gap-1.5 uppercase">
                      {job.status === 'queued' && <><Loader2 className="w-3 h-3 animate-spin" /> Queued</>}
                      {job.status === 'processing' && <><Loader2 className="w-3 h-3 animate-spin" /> Processing</>}
                      {job.status === 'complete' && <><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Finished</>}
                      {job.status === 'failed' && <><AlertCircle className="w-3 h-3 text-red-500" /> Error</>}
                    </span>
                    {job.status === 'processing' && <span>ETA: {job.eta}</span>}
                  </div>
                </div>

                <div className="w-full sm:w-[200px] space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
                    <span>Progress</span>
                    <span>{job.progress}%</span>
                  </div>
                  <Progress value={job.progress} className={`h-1.5 bg-white/5 ${job.status === 'complete' ? '[&>div]:bg-emerald-500' : ''}`} />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {job.status === 'complete' ? (
                    <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 font-bold gap-2 h-9 text-[10px] px-4 shadow-lg shadow-emerald-500/20">
                      <Download className="w-3.5 h-3.5" /> DOWNLOAD
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-red-500 hover:bg-red-500/10">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {jobs.some(j => j.status === 'complete') && (
        <Button className="w-full h-12 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-xs gap-2">
          <Download className="w-4 h-4" /> DOWNLOAD ALL COMPLETE (ZIP)
        </Button>
      )}
    </section>
  );
}
