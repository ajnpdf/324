"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, CheckCircle2, Play, History, Share2 } from 'lucide-react';
import Link from 'next/link';
import { StepUpload } from './step-upload';
import { StepSelector } from './step-selector';
import { StepConfig } from './step-config';
import { StepMonitor } from './step-monitor';
import { cn } from '@/lib/utils';

export type BatchStep = 'upload' | 'select' | 'config' | 'monitor';

export interface BatchFile {
  id: string;
  file: File;
  status: 'uploading' | 'ready' | 'queued' | 'processing' | 'complete' | 'failed';
  progress: number;
  format: string;
  size: string;
  outputSize?: string;
  error?: string;
}

export function BatchContainer() {
  const [step, setStep] = useState<BatchStep>('upload');
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [operation, setOperation] = useState<string | null>(null);
  const [config, setConfig] = useState({
    namingPattern: '{filename}_{index}',
    targetFolder: 'Default Workspace',
    skipErrors: true,
    differentSettingsPerType: false,
  });

  const nextStep = () => {
    if (step === 'upload') setStep('select');
    else if (step === 'select') setStep('config');
    else if (step === 'config') setStep('monitor');
  };

  const prevStep = () => {
    if (step === 'select') setStep('upload');
    else if (step === 'config') setStep('select');
    else if (step === 'monitor') setStep('config');
  };

  const StepIndicator = ({ num, label, active, complete }: { num: number, label: string, active: boolean, complete: boolean }) => (
    <div className={cn(
      "flex items-center gap-3 transition-all",
      active ? "opacity-100" : complete ? "opacity-100" : "opacity-40"
    )}>
      <div className={cn(
        "w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-xs transition-all",
        active ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-110" : 
        complete ? "bg-emerald-500 border-emerald-500 text-white" : "border-white/20"
      )}>
        {complete ? <CheckCircle2 className="w-4 h-4" /> : num}
      </div>
      <span className={cn("text-[10px] font-black uppercase tracking-widest hidden lg:block", active && "text-primary")}>{label}</span>
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top Toolbar */}
      <header className="h-16 border-b border-white/5 bg-background/40 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-white/5">
                <ArrowLeft className="w-4 h-4 text-muted-foreground" />
              </Button>
            </Link>
            <div className="space-y-0.5">
              <h1 className="text-sm font-black tracking-tighter uppercase">Batch Processing Center</h1>
              <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Scale Your Workflow</p>
            </div>
          </div>

          <div className="h-8 w-px bg-white/10 mx-2 hidden lg:block" />

          {/* Stepper */}
          <nav className="flex items-center gap-8">
            <StepIndicator num={1} label="Upload" active={step === 'upload'} complete={files.length > 0 && step !== 'upload'} />
            <StepIndicator num={2} label="Operation" active={step === 'select'} complete={!!operation && !['upload', 'select'].includes(step)} />
            <StepIndicator num={3} label="Configure" active={step === 'config'} complete={step === 'monitor'} />
            <StepIndicator num={4} label="Monitor" active={step === 'monitor'} complete={false} />
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {step !== 'monitor' && (
            <>
              {step !== 'upload' && (
                <Button variant="ghost" onClick={prevStep} className="h-9 text-xs font-bold gap-2">
                  BACK
                </Button>
              )}
              <Button 
                onClick={nextStep} 
                disabled={step === 'upload' ? files.length === 0 : step === 'select' ? !operation : false}
                className="h-10 bg-brand-gradient hover:opacity-90 text-xs font-black shadow-xl shadow-primary/20 px-8 gap-2"
              >
                {step === 'config' ? <><Play className="w-4 h-4 fill-current" /> START BATCH</> : <>NEXT STEP <ArrowRight className="w-4 h-4" /></>}
              </Button>
            </>
          )}
          {step === 'monitor' && (
            <div className="flex items-center gap-2">
              <Button variant="outline" className="h-9 gap-2 border-white/10 bg-white/5 text-xs font-bold"><History className="w-3.5 h-3.5" /> LOGS</Button>
              <Button variant="outline" className="h-9 gap-2 border-white/10 bg-white/5 text-xs font-bold"><Share2 className="w-3.5 h-3.5" /> SHARE BATCH</Button>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <main className="max-w-6xl mx-auto p-8 space-y-10">
          {step === 'upload' && <StepUpload files={files} setFiles={setFiles} />}
          {step === 'select' && <StepSelector selectedOp={operation} onSelect={setOperation} />}
          {step === 'config' && (
            <StepConfig 
              files={files} 
              config={config} 
              setConfig={setConfig} 
            />
          )}
          {step === 'monitor' && <StepMonitor files={files} setFiles={setFiles} config={config} />}
        </main>
      </div>
    </div>
  );
}
