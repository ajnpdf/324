
'use client';

/**
 * AJN Tool Engine
 * Connects the frontend tools to the live Python API.
 */

export type JobPhase = 'loading' | 'analyzing' | 'processing' | 'finalizing';

export interface JobProgress {
  stage: string;
  detail: string;
  pct: number;
  phase?: JobPhase;
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'success' | 'error';
  message: string;
}

export interface ProcessingJob {
  id: string;
  status: 'running' | 'idle' | 'error';
  progress: number;
  stage: string;
  logs: LogEntry[];
  inputs: File[];
}

export interface OutputBuffer {
  id: string;
  fileName: string;
  objectUrl: string;
  sizeFormatted: string;
  toFmt: string;
  stats?: {
    originalSize: string;
    reduction: string;
    time: string;
  };
}

export interface GlobalAppState {
  queue: ProcessingJob[];
  outputs: OutputBuffer[];
  engineStatus: 'idle' | 'busy' | 'ready';
  bufferPressure: number;
}

export interface EngineResponse {
  success: boolean;
  message: string;
  fileName?: string;
  byteLength?: number;
  blob?: Blob;
  error?: string;
  stats?: {
    time: string;
    quality: string;
  };
}

type ToolFunction = (files: File[], options: any, onProgress: (p: JobProgress) => void, signal?: AbortSignal) => Promise<Blob | any>;

const TOOL_REGISTRY: Record<string, ToolFunction> = {
  'merge-pdf-online': async (files, options, onProgress) => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://api.ajnpdf.com";
    const formData = new FormData();
    files.forEach(f => formData.append("files", f));

    try {
      onProgress({ stage: "Connecting", detail: "Checking tool availability...", pct: 20, phase: 'loading' });
      const res = await fetch(`${apiBase}/api/pdf/merge`, {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        throw new Error("Tool is not available right now. Please try again later.");
      }
      
      onProgress({ stage: "Finishing", detail: "Downloading your file...", pct: 80, phase: 'finalizing' });
      const blob = await res.blob();
      return blob;
    } catch (e: any) {
      throw new Error("Tool is not available right now. Please try again later.");
    }
  },
  'split-pdf-online': async (files, options, onProgress) => {
    const { PDFManipulator } = await import('./pdf-manipulator');
    return new PDFManipulator(files, (pct, msg) => onProgress({ stage: "Splitting", detail: msg, pct, phase: 'processing' })).runOperation('split-pdf', options);
  },
  'compress-pdf-online': async (files, options, onProgress) => {
    const logic = await import('./all-tools-logic');
    return logic.advancedCompressPDF(files[0], options.level || 'recommended', onProgress);
  }
};

class AJNStudioSystem {
  private activeJobs = new Map<string, AbortController>();
  private state: GlobalAppState = { 
    queue: [], 
    outputs: [], 
    engineStatus: 'ready',
    bufferPressure: 0 
  };
  private listeners: ((state: GlobalAppState) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      setInterval(() => this.updateBufferPressure(), 3000);
    }
  }

  private updateBufferPressure() {
    try {
      const mem = (performance as any).memory;
      if (mem && mem.usedJSHeapSize && mem.jsHeapLimit) {
        this.state.bufferPressure = Math.round((mem.usedJSHeapSize / mem.jsHeapLimit) * 100);
        this.notify();
      }
    } catch (e) {}
  }

  subscribe(listener: (state: GlobalAppState) => void) {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l({ ...this.state }));
  }

  async download(blob: Blob, name: string) {
    if (!blob || typeof window === 'undefined') return;
    const u = URL.createObjectURL(blob);
    const a = document.body.appendChild(document.createElement("a"));
    a.style.display = 'none';
    a.href = u; 
    a.download = name;
    a.click();
    
    setTimeout(() => {
      if (document.body.contains(a)) document.body.removeChild(a);
      URL.revokeObjectURL(u);
      window.dispatchEvent(new CustomEvent('trigger-ajn-feedback'));
    }, 2000);
  }

  cancelJob(jobId: string) {
    const controller = this.activeJobs.get(jobId);
    if (controller) {
      controller.abort();
      this.activeJobs.delete(jobId);
      this.state.queue = this.state.queue.filter(j => j.id !== jobId);
      if (this.state.queue.length === 0) this.state.engineStatus = 'ready';
      this.notify();
      return true;
    }
    return false;
  }

  clearQueue() {
    this.state.outputs.forEach(o => URL.revokeObjectURL(o.objectUrl));
    this.state.outputs = [];
    this.notify();
  }

  addJobs(files: File[], toolId: string, targetFormat: string, settings: any) {
    const jobId = Math.random().toString(36).substr(2, 9);
    const newJob: ProcessingJob = {
      id: jobId,
      status: 'running',
      progress: 0,
      stage: 'Starting',
      logs: [{ timestamp: new Date().toLocaleTimeString(), level: 'info', message: "Setting up tool..." }],
      inputs: files
    };

    this.state.queue = [newJob, ...this.state.queue];
    this.state.engineStatus = 'busy';
    this.notify();

    this.runTool(toolId || 'merge-pdf-online', files, settings, (p) => {
      this.state.queue = this.state.queue.map(j => j.id === jobId ? {
        ...j,
        progress: p.pct,
        stage: p.stage,
        logs: [...j.logs, { timestamp: new Date().toLocaleTimeString(), level: 'info', message: p.detail }]
      } : j);
      this.notify();
    }, jobId).then(res => {
      if (res.success && res.blob) {
        const output: OutputBuffer = {
          id: Math.random().toString(36).substr(2, 9),
          fileName: res.fileName || 'output.pdf',
          objectUrl: URL.createObjectURL(res.blob),
          sizeFormatted: (res.byteLength! / (1024 * 1024)).toFixed(2) + ' MB',
          toFmt: targetFormat,
          stats: {
            originalSize: (files.reduce((a, b) => a + b.size, 0) / (1024 * 1024)).toFixed(2) + ' MB',
            reduction: 'Done',
            time: res.stats?.time || '0.2s'
          }
        };
        this.state.outputs = [output, ...this.state.outputs];
      }
      this.state.queue = this.state.queue.filter(j => j.id !== jobId);
      if (this.state.queue.length === 0) this.state.engineStatus = 'ready';
      this.notify();
    });
  }

  async runTool(
    toolId: string, 
    inputs: File | File[], 
    options: any = {}, 
    onProgress: (p: JobProgress) => void,
    jobId: string = Math.random().toString(36).substr(2, 9)
  ): Promise<EngineResponse> {
    const start = Date.now();
    const files = Array.isArray(inputs) ? inputs : (inputs ? [inputs] : []);
    const controller = new AbortController();
    this.activeJobs.set(jobId, controller);

    try {
      const toolFn = TOOL_REGISTRY[toolId];
      if (!toolFn) throw new Error(`Tool not found.`);

      onProgress({ stage: "Preparing", detail: "Getting ready...", pct: 5, phase: 'loading' });
      const result = await toolFn(files, options, onProgress, controller.signal);

      if (controller.signal.aborted) throw new Error("ABORTED");

      const resultBlob = (result && result.blob) ? result.blob : (result instanceof Blob ? result : null);
      if (!resultBlob) throw new Error("Processing failed.");

      this.activeJobs.delete(jobId);
      return {
        success: true,
        message: "Complete",
        fileName: options.outputName || "File_Result",
        byteLength: resultBlob.size,
        blob: resultBlob,
        stats: { time: `${((Date.now() - start) / 1000).toFixed(2)}s`, quality: "Standard" }
      };
    } catch (err: any) {
      this.activeJobs.delete(jobId);
      if (err.message === 'ABORTED') return { success: false, message: "Cancelled", error: 'ABORTED' };
      return { success: false, message: err.message || "Something went wrong.", error: err.toString() };
    }
  }
}

export const engine = new AJNStudioSystem();
