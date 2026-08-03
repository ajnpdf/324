"use client";

import { useEffect, useState } from 'react';
import { BatchFile } from './batch-container';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Loader2, 
  Download, 
  Pause, 
  Play, 
  RotateCw,
  FolderOpen,
  Zap,
  ArrowRight
} from 'lucide-react';

interface Props {
  files: BatchFile[];
  setFiles: (f: BatchFile[]) => void;
  config: {
    namingPattern: string;
    targetFolder: string;
    skipErrors: boolean;
    differentSettingsPerType: boolean;
  };
}

/**
 * AJN Batch Monitor - Performance Synced
 * Fixed: Restored missing ArrowRight import and aligned interface.
 */
export function StepMonitor({ files, setFiles, config }: Props) {
  const [activeFiles, setActiveFiles] = useState<BatchFile[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [batchComplete, setBatchComplete] = useState(false);

  useEffect(() => {
    const initial = files.map(f => ({ ...f, status: 'queued' as const, progress: 0 }));
    setActiveFiles(initial);
    simulateBatch(initial);
  }, []);

  const simulateBatch = async (initialFiles: BatchFile[]) => {
    const currentFiles = [...initialFiles];
    const workerCount = 3;
    let index = 0;

    const runWorker = async () => {
      while (index < currentFiles.length) {
        if (isPaused) {
          await new Promise(r => setTimeout(r, 500));
          continue;
        }

        const myIndex = index++;
        if (!currentFiles[myIndex]) break;

        const file = currentFiles[myIndex];
        currentFiles[myIndex] = { ...file, status: 'processing', progress: 0 };
        setActiveFiles([...currentFiles]);

        for (let p = 0; p <= 100; p += 20) {
          await new Promise(r => setTimeout(r, 400 + Math.random() * 400));
          currentFiles[myIndex].progress = p;
          setActiveFiles([...currentFiles]);
        }

        const failed = Math.random() < 0.05;
        currentFiles[myIndex] = { 
          ...currentFiles[myIndex], 
          status: failed ? 'failed' : 'complete', 
          outputSize: failed ? undefined : (parseFloat(currentFiles[myIndex].size) * 0.4).toFixed(2) + ' MB',
          error: failed ? 'Worker timeout during encoding' : undefined
        };
        setActiveFiles([...currentFiles]);
      }
    };

    const workers = Array.from({ length: workerCount }, () => runWorker());
    await Promise.all(workers);
    setBatchComplete(true);
    setFiles(currentFiles);
  };

  const stats = {
    total: activeFiles.length,
    done: activeFiles.filter(f => f.status === 'complete').length,
    failed: activeFiles.filter(f => f.status === 'failed').length,
    processing: activeFiles.filter(f => f.status === 'processing').length,
  };

  const totalProgress = Math.round(((stats.done + stats.failed) / stats.total) * 100) || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <Card className="flex-1 bg-white/40 backdrop-blur-xl border-black/5 overflow-hidden">
          <CardContent className="p-8 space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                  {batchComplete ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <Loader2 className="w-6 h-6 text-primary animate-spin" />}
                  {batchComplete ? 'Batch Completed' : 'Processing Batch...'}
                </h2>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                  {stats.done} of {stats.total} successful &bull; {stats.failed} failures
                </p>
              </div>
              <div className="flex gap-2">
                {!batchComplete && (
                  <Button variant="outline" className="bg-white/5 border-black/5" onClick={() => setIsPaused(!isPaused)}>
                    {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
                  </Button>
                )}
                <Button variant="outline" className="bg-white/5 border-black/5 text-red-400 hover:text-red-500 font-bold text-[10px] uppercase">CANCEL BATCH</Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                <span className="text-primary">{totalProgress}% COMPLETE</span>
                <span className="text-muted-foreground flex items-center gap-2">
                  <Zap className="w-3 h-3" /> 14 FILES/MIN
                </span>
              </div>
              <Progress value={totalProgress} className="h-3 bg-black/5" />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-black/5 text-center">
                <p className="text-xl font-black">{stats.done}</p>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">SUCCESSFUL</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-black/5 text-center">
                <p className="text-xl font-black">{stats.failed}</p>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">FAILED</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-black/5 text-center">
                <p className="text-xl font-black">~2.4m</p>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">TIME LEFT</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {batchComplete && (
          <div className="w-full md:w-80 space-y-4 animate-in slide-in-from-right-4">
            <Button className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm gap-2 shadow-2xl shadow-emerald-500/20">
              <Download className="w-5 h-5" /> DOWNLOAD ALL (ZIP)
            </Button>
            <Button variant="outline" className="w-full h-12 bg-white/5 border-black/5 font-bold gap-2">
              <FolderOpen className="w-4 h-4 text-primary" /> VIEW IN WORKSPACE
            </Button>
            <button onClick={() => window.location.reload()} className="w-full h-12 hover:bg-white/5 font-bold gap-2 text-muted-foreground flex items-center justify-center uppercase text-[10px] tracking-widest">
              <RotateCw className="w-4 h-4" /> RETRY FAILED FILES
            </button>
          </div>
        )}
      </div>

      <Card className="bg-white/40 backdrop-blur-xl border-black/5 overflow-hidden">
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-y-auto scrollbar-hide">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-black/5 z-10">
                <tr className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                  <th className="px-6 py-4 w-12">#</th>
                  <th className="px-6 py-4">Filename</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 w-32">Output Size</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {activeFiles.map((f, i) => (
                  <tr key={f.id} className="group hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-muted-foreground opacity-40">{String(i + 1).padStart(3, '0')}</td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="font-bold truncate max-w-[240px] uppercase text-slate-950">{f.file.name}</p>
                        {f.status === 'processing' && <Progress value={f.progress} className="h-1 w-24 bg-black/5" />}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {f.status === 'queued' && <Badge variant="outline" className="bg-black/5 border-black/5 opacity-40 text-[8px] font-black">QUEUED</Badge>}
                      {f.status === 'processing' && <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black animate-pulse uppercase">PROCESSING {f.progress}%</Badge>}
                      {f.status === 'complete' && <Badge className="bg-emerald-500/20 text-emerald-600 border-none text-[8px] font-black uppercase">COMPLETE</Badge>}
                      {f.status === 'failed' && (
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive" className="text-[8px] font-black">FAILED</Badge>
                          <span className="text-[10px] text-red-400 font-bold uppercase">{f.error}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {f.status === 'complete' ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-emerald-600">{f.outputSize}</span>
                          <span className="text-[9px] font-black text-slate-400 line-through">{f.size}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground opacity-40">&mdash;</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {f.status === 'complete' ? (
                        <Button variant="ghost" size="icon" onClick={() => {}} className="h-8 w-8 hover:bg-primary/20 hover:text-primary transition-all">
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      ) : f.status === 'failed' ? (
                        <Button variant="ghost" size="icon" onClick={() => {}} className="h-8 w-8 hover:bg-black/5">
                          <RotateCw className="w-3.5 h-3.5" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" onClick={() => {}} className="h-8 w-8 text-muted-foreground opacity-20">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}