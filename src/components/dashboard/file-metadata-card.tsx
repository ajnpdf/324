"use client";

import { useEffect, useState } from 'react';
import { UploadedFile } from './upload-manager';
import { 
  FileIcon, 
  FileText,
  Shield, 
  CheckCircle2, 
  X, 
  Loader2, 
  Sparkles,
  AlertTriangle,
  Zap,
  ArrowRight,
  Monitor,
  Database,
  RefreshCcw,
  Check
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { smartToolSuggestions, type SmartToolSuggestionsOutput } from '@/ai/flows/smart-tool-suggestions';
import { ToolSuggestionCard } from './tool-suggestion-card';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  file: UploadedFile;
  onRemove: () => void;
  onRetry: () => void;
  viewMode: 'grid' | 'list';
}

export function FileMetadataCard({ file, onRemove, onRetry, viewMode }: Props) {
  const [suggestions, setSuggestions] = useState<SmartToolSuggestionsOutput['suggestions']>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    if (file.state === 'ready') {
      loadSuggestions();
    }
  }, [file.state]);

  const loadSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const result = await smartToolSuggestions({
        fileType: file.file.type || 'application/octet-stream',
      });
      setSuggestions(result.suggestions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const isLarge = file.insights?.includes('LARGE_FILE_DETECTED');

  const steps = [
    { key: 'uploading', label: 'Inhaling' },
    { key: 'scanning', label: 'Scanning' },
    { key: 'analyzing', label: 'Mapping' },
    { key: 'ready', label: 'Stable' }
  ];

  const getActiveStep = () => {
    return steps.findIndex(s => s.key === file.state);
  };

  return (
    <Card className="bg-white/60 backdrop-blur-2xl border-black/5 overflow-hidden group shadow-2xl rounded-[2.5rem] transition-all hover:border-primary/20 border-2">
      <CardContent className="p-0">
        <div className="flex flex-col">
          {/* Status Header */}
          <div className="p-5 bg-white/40 flex items-center justify-between border-b border-black/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shadow-inner border border-primary/10 overflow-hidden">
                {file.previewUrl ? (
                  <img src={file.previewUrl} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <FileIcon className="w-6 h-6 text-primary" />
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-black truncate max-w-[240px] uppercase text-slate-900">{file.file.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-widest",
                    file.state === 'ready' ? "text-emerald-600" : file.state === 'error' ? "text-red-500" : "text-slate-400"
                  )}>
                    {file.state === 'uploading' && 'Inhaling binary stream...'}
                    {file.state === 'scanning' && 'Security protocol active...'}
                    {file.state === 'analyzing' && 'Analyzing logic map...'}
                    {file.state === 'ready' && 'Sovereign Buffer Ready'}
                    {file.state === 'error' && 'Process Interrupt'}
                  </span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onRemove} className="h-10 w-10 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-8 space-y-8">
            {/* Real-time Visual Preview Node */}
            <AnimatePresence>
              {file.state === 'ready' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="aspect-video w-full bg-slate-900/5 rounded-[2rem] border border-black/5 overflow-hidden relative shadow-inner flex items-center justify-center"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(#00000005_1px,transparent_1px)] bg-[size:20px_20px]" />
                  {file.previewUrl ? (
                    <img src={file.previewUrl} className="max-h-full max-w-full object-contain shadow-2xl" alt="Document Preview" />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-slate-300">
                      <FileText className="w-12 h-12" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Document Core Synced</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step Indicators */}
            {file.state !== 'error' && (
              <div className="flex items-center justify-between px-2">
                {steps.map((step, i) => {
                  const isActive = file.state === step.key;
                  const isPast = getActiveStep() > i;
                  return (
                    <div key={step.key} className="flex flex-col items-center gap-2 flex-1">
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500",
                        isActive ? "bg-primary border-primary text-white shadow-lg scale-110" : 
                        isPast ? "bg-emerald-500 border-emerald-500 text-white" : "border-black/5 text-slate-200"
                      )}>
                        {isPast ? <Check className="w-3 h-3" strokeWidth={4} /> : <span className="text-[10px] font-black">{i + 1}</span>}
                      </div>
                      <span className={cn("text-[8px] font-black uppercase tracking-widest", isActive ? "text-primary" : "text-slate-300")}>{step.label}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Error State */}
            {file.state === 'error' && (
              <div className="p-8 bg-red-500/5 border border-red-500/20 rounded-[2rem] flex flex-col items-center text-center space-y-4 animate-in zoom-in-95">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black uppercase tracking-tight text-red-600">Processing Failed</h4>
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest leading-relaxed">
                    {file.error || "The local binary engine was unable to map this asset."}
                  </p>
                </div>
                <Button onClick={onRetry} variant="outline" className="h-10 border-red-500/20 bg-white text-red-500 font-black text-[10px] uppercase rounded-xl gap-2 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                  <RefreshCcw className="w-3.5 h-3.5" /> Retry Operation
                </Button>
              </div>
            )}

            {/* Progress / State Illustration */}
            {file.state !== 'error' && file.state !== 'ready' && (
              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <span>{file.state === 'uploading' ? 'Ingestion' : file.state === 'scanning' ? 'Security audit' : 'Logic mapping'}</span>
                    <span className="text-primary tabular-nums">{file.progress}%</span>
                  </div>
                  <Progress value={file.progress} className="h-1.5 bg-black/5" />
                </div>
              </div>
            )}

            {/* Metadata Grid */}
            {file.metadata && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5 p-4 bg-black/5 rounded-2xl border border-black/5">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Type</p>
                  <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black h-5 uppercase px-2">{file.metadata.format}</Badge>
                </div>
                <div className="space-y-1.5 p-4 bg-black/5 rounded-2xl border border-black/5">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Binary Size</p>
                  <p className="text-xs font-black text-slate-900">{file.metadata.size}</p>
                </div>
                <div className="space-y-1.5 p-4 bg-black/5 rounded-2xl border border-black/5">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Layer map</p>
                  <p className="text-xs font-black text-slate-900">{file.metadata.dimensions || 'Vector'}</p>
                </div>
                <div className="space-y-1.5 p-4 bg-black/5 rounded-2xl border border-black/5">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Buffer</p>
                  <Badge variant="outline" className="text-[8px] border-emerald-500/20 text-emerald-600 font-black h-5 uppercase px-2">Local only</Badge>
                </div>
              </div>
            )}

            {/* Tool Suggestions */}
            {file.state === 'ready' && (
              <div className="space-y-6 pt-6 border-t border-black/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Recommended Units</h4>
                  </div>
                </div>

                {loadingSuggestions ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4 opacity-40">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-[9px] font-black uppercase tracking-[0.3em]">Consulting Assistant...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {suggestions.slice(0, 2).map((tool, idx) => (
                      <ToolSuggestionCard key={idx} tool={tool} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
