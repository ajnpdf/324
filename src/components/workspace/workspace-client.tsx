'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Download,
  FileText,
  History,
  Loader2,
  LockKeyhole,
  Play,
  Plus,
  RotateCcw,
  Save,
  Settings2,
  ShieldCheck,
  Trash2,
  Workflow,
  XCircle,
} from 'lucide-react';
import { executeWorkspaceWorkflow } from '@/lib/workspace/executor';
import {
  addWorkspaceHistory,
  clearWorkspaceHistory,
  deleteSavedWorkflow,
  loadSavedWorkflows,
  loadWorkspaceHistory,
  loadWorkspacePreferences,
  saveWorkspacePreferences,
  upsertSavedWorkflow,
} from '@/lib/workspace/storage';
import {
  createWorkspaceStep,
  DEFAULT_WORKSPACE_PREFERENCES,
  workspaceStepLabel,
  type SavedWorkspaceWorkflow,
  type WorkspaceHistoryItem,
  type WorkspacePreferences,
  type WorkspaceProgress,
  type WorkspaceStep,
  type WorkspaceStepType,
} from '@/lib/workspace/types';
import { MERGE_PDF_LIMITS } from '@/lib/tool-limit-constants';

const MAX_FILE_BYTES = MERGE_PDF_LIMITS.maxFileSizeMb * 1024 * 1024;
const MAX_TOTAL_BYTES = MERGE_PDF_LIMITS.maxTotalSizeMb * 1024 * 1024;
const STEP_TYPES: WorkspaceStepType[] = ['merge', 'rotate', 'watermark', 'page-numbers'];

function bytes(value: number): string {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function cloneSteps(steps: WorkspaceStep[]): WorkspaceStep[] {
  return steps.map(step => ({ ...step } as WorkspaceStep));
}

export function WorkspaceClient() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [tab, setTab] = useState<'workspace' | 'saved' | 'history' | 'settings'>('workspace');
  const [files, setFiles] = useState<File[]>([]);
  const [steps, setSteps] = useState<WorkspaceStep[]>([createWorkspaceStep('merge')]);
  const [preferences, setPreferences] = useState<WorkspacePreferences>(DEFAULT_WORKSPACE_PREFERENCES);
  const [history, setHistory] = useState<WorkspaceHistoryItem[]>([]);
  const [saved, setSaved] = useState<SavedWorkspaceWorkflow[]>([]);
  const [workflowName, setWorkflowName] = useState('');
  const [progress, setProgress] = useState<WorkspaceProgress>({ phase: 'idle', current: 0, total: 1, message: 'Ready' });
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ blob: Blob; filename: string; pageCount: number; bytes: number } | null>(null);

  useEffect(() => {
    const prefs = loadWorkspacePreferences();
    setPreferences(prefs);
    setHistory(loadWorkspaceHistory());
    setSaved(loadSavedWorkflows());
  }, []);

  const totalInputBytes = useMemo(() => files.reduce((sum, file) => sum + file.size, 0), [files]);
  const activeSteps = useMemo(() => steps.filter(step => step.enabled), [steps]);
  const canRun = files.length > 0 && activeSteps.length > 0 && !running;

  const setPrefs = (next: WorkspacePreferences) => {
    setPreferences(next);
    saveWorkspacePreferences(next);
    if (next.privateSession || !next.rememberHistory) setHistory([]);
  };

  const validateFiles = (incoming: File[]) => {
    const pdfs = incoming.filter(file => file.type === 'application/pdf' || /\.pdf$/i.test(file.name));
    if (pdfs.length !== incoming.length) throw new Error('AJN Workspace currently accepts PDF files only.');
    if (files.length + pdfs.length > MERGE_PDF_LIMITS.maxFiles) throw new Error(`Choose no more than ${MERGE_PDF_LIMITS.maxFiles} PDFs in one workspace.`);
    const oversized = pdfs.find(file => file.size > MAX_FILE_BYTES);
    if (oversized) throw new Error(`${oversized.name} is larger than the current ${MERGE_PDF_LIMITS.maxFileSizeMb} MB local-workspace limit.`);
    const nextTotal = totalInputBytes + pdfs.reduce((sum, file) => sum + file.size, 0);
    if (nextTotal > MAX_TOTAL_BYTES) throw new Error(`The selected PDFs exceed the current ${MERGE_PDF_LIMITS.maxTotalSizeMb} MB workspace total.`);
    return pdfs;
  };

  const addFiles = (incoming: File[]) => {
    setError('');
    try {
      const pdfs = validateFiles(incoming);
      setFiles(current => [...current, ...pdfs]);
      setResult(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Files could not be added.');
    }
  };

  const removeFile = (index: number) => {
    setFiles(current => current.filter((_, itemIndex) => itemIndex !== index));
    setResult(null);
  };

  const addStep = (type: WorkspaceStepType) => {
    setError('');
    if (type === 'merge' && steps.some(step => step.type === 'merge')) {
      setError('Only one Merge PDFs step is allowed in a workflow.');
      return;
    }
    setSteps(current => [...current, createWorkspaceStep(type)]);
    setResult(null);
  };

  const updateStep = (id: string, patch: Partial<WorkspaceStep>) => {
    setSteps(current => current.map(step => step.id === id ? ({ ...step, ...patch } as WorkspaceStep) : step));
    setResult(null);
  };

  const removeStep = (id: string) => {
    setSteps(current => current.filter(step => step.id !== id));
    setResult(null);
  };

  const moveStep = (index: number, direction: -1 | 1) => {
    setSteps(current => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setResult(null);
  };

  const run = async () => {
    if (!canRun) return;
    setError('');
    setResult(null);
    setRunning(true);
    const controller = new AbortController();
    abortRef.current = controller;
    const historyId = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `run-${Date.now()}`;
    try {
      const output = await executeWorkspaceWorkflow(files, steps, { signal: controller.signal, onProgress: setProgress });
      const nextResult = { blob: output.blob, filename: output.filename, pageCount: output.pageCount, bytes: output.bytes.byteLength };
      setResult(nextResult);
      const item: WorkspaceHistoryItem = {
        id: historyId,
        createdAt: new Date().toISOString(),
        inputCount: files.length,
        inputBytes: totalInputBytes,
        outputBytes: output.bytes.byteLength,
        steps: activeSteps.map(step => step.type),
        status: 'success',
      };
      addWorkspaceHistory(item, preferences);
      if (!preferences.privateSession && preferences.rememberHistory) setHistory(loadWorkspaceHistory());
      if (preferences.autoDownload) downloadBlob(output.blob, output.filename);
    } catch (reason) {
      const cancelled = reason instanceof DOMException && reason.name === 'AbortError';
      const message = cancelled ? 'Workspace processing cancelled.' : reason instanceof Error ? reason.message : 'Workspace processing failed.';
      setError(message);
      setProgress({ phase: 'idle', current: 0, total: 1, message });
      const item: WorkspaceHistoryItem = {
        id: historyId,
        createdAt: new Date().toISOString(),
        inputCount: files.length,
        inputBytes: totalInputBytes,
        outputBytes: 0,
        steps: activeSteps.map(step => step.type),
        status: cancelled ? 'cancelled' : 'failed',
      };
      addWorkspaceHistory(item, preferences);
      if (!preferences.privateSession && preferences.rememberHistory) setHistory(loadWorkspaceHistory());
    } finally {
      abortRef.current = null;
      setRunning(false);
    }
  };

  const saveWorkflow = () => {
    const name = workflowName.trim();
    if (!name) { setError('Enter a name before saving this workflow.'); return; }
    if (!steps.length) { setError('Add at least one step before saving this workflow.'); return; }
    const now = new Date().toISOString();
    const workflow: SavedWorkspaceWorkflow = {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `workflow-${Date.now()}`,
      name: name.slice(0, 80),
      createdAt: now,
      updatedAt: now,
      steps: cloneSteps(steps),
    };
    setSaved(upsertSavedWorkflow(workflow));
    setWorkflowName('');
    setError('');
    setTab('saved');
  };

  const loadWorkflow = (workflow: SavedWorkspaceWorkflow) => {
    setSteps(cloneSteps(workflow.steps).map(step => ({ ...step, id: `${step.type}-${Date.now()}-${Math.random().toString(36).slice(2)}` } as WorkspaceStep)));
    setResult(null);
    setError('');
    setTab('workspace');
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-24 md:px-8">
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="AJN Workspace sections">
        {([
          ['workspace', 'Workspace', Workflow],
          ['saved', 'Saved workflows', Save],
          ['history', 'History', History],
          ['settings', 'Settings', Settings2],
        ] as const).map(([id, label, Icon]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-4 text-xs font-black transition ${tab === id ? 'border-violet-700 bg-violet-700 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:bg-violet-50'}`}>
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
      </div>

      {tab === 'workspace' && <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)_310px]">
        <aside className="space-y-4">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-violet-700">Files</p><h2 className="mt-2 text-lg font-black text-slate-950">Local file tray</h2></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-700">Device only</span></div>
            <p className="mt-2 text-xs font-medium leading-5 text-slate-600">Files in this R25 workspace stay in this browser tab. This workflow does not upload them to AJN servers.</p>
            <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple className="hidden" onChange={event => { addFiles(Array.from(event.target.files || [])); event.currentTarget.value = ''; }} />
            <button type="button" onClick={() => inputRef.current?.click()} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-black text-white"><Plus className="h-4 w-4"/>Add PDFs</button>
            <div className="mt-4 space-y-2">{files.length === 0 ? <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-xs font-semibold text-slate-500">Choose PDFs to begin.</div> : files.map((file, index) => <div key={`${file.name}-${file.lastModified}-${index}`} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"><FileText className="h-4 w-4 shrink-0 text-violet-700"/><div className="min-w-0 flex-1"><p className="truncate text-xs font-black text-slate-800">{file.name}</p><p className="mt-0.5 text-[10px] font-semibold text-slate-500">{bytes(file.size)}</p></div><button type="button" onClick={() => removeFile(index)} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700" aria-label={`Remove ${file.name}`}><Trash2 className="h-4 w-4"/></button></div>)}</div>
            <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-slate-500"><span>{files.length}/{MERGE_PDF_LIMITS.maxFiles} files</span><span>{bytes(totalInputBytes)} / {MERGE_PDF_LIMITS.maxTotalSizeMb} MB</span></div>
          </section>

          <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
            <ShieldCheck className="h-5 w-5 text-emerald-700"/><h3 className="mt-3 text-sm font-black text-emerald-950">Privacy boundary</h3><p className="mt-2 text-xs font-semibold leading-5 text-emerald-900/75">Merge, rotate, watermark and page numbering in this workspace execute locally. Server-only tools such as Protect, Unlock and Repair remain on their dedicated pages with their online-processing disclosure.</p>
          </section>
        </aside>

        <main className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-violet-700">Workflow</p><h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Upload once. Apply several PDF actions.</h2><p className="mt-2 max-w-2xl text-xs font-medium leading-5 text-slate-600">Steps run from top to bottom against one in-memory PDF result.</p></div><span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-black text-slate-600">{activeSteps.length} active step{activeSteps.length === 1 ? '' : 's'}</span></div>

          <div className="mt-5 flex flex-wrap gap-2">{STEP_TYPES.map(type => <button key={type} type="button" onClick={() => addStep(type)} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-[10px] font-black text-slate-700 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-800"><Plus className="h-3.5 w-3.5"/>{workspaceStepLabel(type)}</button>)}</div>

          <div className="mt-6 space-y-3">{steps.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-bold text-slate-500">Add a workflow step above.</div> : steps.map((step, index) => <div key={step.id} className={`rounded-2xl border p-4 transition ${step.enabled ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50 opacity-70'}`}>
            <div className="flex flex-wrap items-center gap-3"><label className="flex items-center gap-2 text-xs font-black text-slate-900"><input type="checkbox" checked={step.enabled} onChange={event => updateStep(step.id, { enabled: event.target.checked } as Partial<WorkspaceStep>)} />{index + 1}. {workspaceStepLabel(step.type)}</label><div className="ml-auto flex items-center gap-1"><button type="button" disabled={index === 0} onClick={() => moveStep(index, -1)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30" aria-label="Move step up"><ArrowUp className="h-4 w-4"/></button><button type="button" disabled={index === steps.length - 1} onClick={() => moveStep(index, 1)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30" aria-label="Move step down"><ArrowDown className="h-4 w-4"/></button><button type="button" onClick={() => removeStep(step.id)} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700" aria-label="Remove step"><Trash2 className="h-4 w-4"/></button></div></div>

            {step.type === 'merge' && <p className="mt-3 text-xs font-medium leading-5 text-slate-600">Combines every PDF in the file tray in the order shown. With multiple files, this must be the first active step.</p>}
            {step.type === 'rotate' && <div className="mt-3"><label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Rotate every page</label><select value={step.angle} onChange={event => updateStep(step.id, { angle: Number(event.target.value) as 90 | 180 | 270 })} className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800"><option value={90}>90° clockwise</option><option value={180}>180°</option><option value={270}>270° clockwise</option></select></div>}
            {step.type === 'watermark' && <div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-[10px] font-black uppercase tracking-wider text-slate-500 sm:col-span-2">Watermark text<input value={step.text} maxLength={80} onChange={event => updateStep(step.id, { text: event.target.value })} className="mt-2 h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-bold normal-case tracking-normal text-slate-800"/></label><label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Font size<input type="number" min={8} max={96} value={step.fontSize} onChange={event => updateStep(step.id, { fontSize: Number(event.target.value) })} className="mt-2 h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-800"/></label><label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Opacity<input type="number" min={0.05} max={0.9} step={0.05} value={step.opacity} onChange={event => updateStep(step.id, { opacity: Number(event.target.value) })} className="mt-2 h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-800"/></label></div>}
            {step.type === 'page-numbers' && <div className="mt-3 grid gap-3 sm:grid-cols-3"><label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Start at<input type="number" min={0} value={step.startAt} onChange={event => updateStep(step.id, { startAt: Number(event.target.value) })} className="mt-2 h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-800"/></label><label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Font size<input type="number" min={7} max={36} value={step.fontSize} onChange={event => updateStep(step.id, { fontSize: Number(event.target.value) })} className="mt-2 h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-800"/></label><label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Position<select value={step.position} onChange={event => updateStep(step.id, { position: event.target.value as Extract<WorkspaceStep, { type: 'page-numbers' }>['position'] })} className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800"><option value="bottom-center">Bottom center</option><option value="bottom-right">Bottom right</option><option value="top-right">Top right</option></select></label></div>}
          </div>)}</div>

          <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]"><input value={workflowName} onChange={event => setWorkflowName(event.target.value)} placeholder="Workflow name (optional)" maxLength={80} className="h-11 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-800 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100"/><button type="button" onClick={saveWorkflow} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-800 hover:bg-slate-50"><Save className="h-4 w-4"/>Save workflow</button></div>
        </main>

        <aside className="space-y-4">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-[10px] font-black uppercase tracking-[.18em] text-violet-700">Run</p><h2 className="mt-2 text-lg font-black text-slate-950">Generate final PDF</h2><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-violet-600 transition-all" style={{ width: `${Math.max(0, Math.min(100, progress.total ? progress.current / progress.total * 100 : 0))}%` }}/></div><p className="mt-3 min-h-10 text-xs font-semibold leading-5 text-slate-600">{progress.message}</p>
            {running ? <button type="button" onClick={() => abortRef.current?.abort()} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-xs font-black text-red-800"><XCircle className="h-4 w-4"/>Cancel processing</button> : <button type="button" disabled={!canRun} onClick={() => void run()} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 text-xs font-black text-white shadow-lg shadow-violet-100 hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50"><Play className="h-4 w-4"/>Run locally</button>}
            {running && <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-violet-700"><Loader2 className="h-3.5 w-3.5 animate-spin"/>Keep this tab open until processing finishes.</div>}
            {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold leading-5 text-red-800">{error}</p>}
            {result && <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex items-center gap-2 text-sm font-black text-emerald-900"><CheckCircle2 className="h-5 w-5"/>PDF ready</div><p className="mt-2 text-[10px] font-bold leading-4 text-emerald-800">{result.pageCount} page{result.pageCount === 1 ? '' : 's'} · {bytes(result.bytes)}</p><button type="button" onClick={() => downloadBlob(result.blob, result.filename)} className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-xs font-black text-white"><Download className="h-4 w-4"/>Download result</button></div>}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><div className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-violet-700"/><p className="text-xs font-black text-slate-900">Private Session {preferences.privateSession ? 'ON' : 'OFF'}</p></div><p className="mt-2 text-[10px] font-semibold leading-4 text-slate-600">When on, AJN does not store workspace run history in browser storage. PDF bytes are never stored in history.</p></section>
        </aside>
      </div>}

      {tab === 'saved' && <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-violet-700">Saved workflows</p><h2 className="mt-2 text-2xl font-black text-slate-950">Reusable settings, never PDF files.</h2><p className="mt-2 text-xs font-medium leading-5 text-slate-600">Only workflow definitions are saved in this browser. Documents are not persisted.</p></div><span className="text-xs font-black text-slate-500">{saved.length}/20</span></div><div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{saved.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-bold text-slate-500 md:col-span-2 xl:col-span-3">No saved workflows yet.</div> : saved.map(workflow => <article key={workflow.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><h3 className="text-sm font-black text-slate-900">{workflow.name}</h3><p className="mt-2 text-[10px] font-semibold leading-4 text-slate-500">{workflow.steps.filter(step => step.enabled).map(step => workspaceStepLabel(step.type)).join(' → ') || 'No active steps'}</p><div className="mt-4 flex gap-2"><button type="button" onClick={() => loadWorkflow(workflow)} className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-violet-700 px-3 text-[10px] font-black text-white"><RotateCcw className="h-3.5 w-3.5"/>Load</button><button type="button" onClick={() => setSaved(deleteSavedWorkflow(workflow.id))} className="flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-slate-600 hover:text-red-700" aria-label={`Delete ${workflow.name}`}><Trash2 className="h-4 w-4"/></button></div></article>)}</div></section>}

      {tab === 'history' && <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-violet-700">Local history</p><h2 className="mt-2 text-2xl font-black text-slate-950">Metadata only.</h2><p className="mt-2 text-xs font-medium leading-5 text-slate-600">No filenames, document contents or PDF bytes are written into workspace history.</p></div><button type="button" onClick={() => { clearWorkspaceHistory(); setHistory([]); }} disabled={!history.length} className="min-h-10 rounded-xl border border-slate-200 bg-white px-4 text-[10px] font-black text-slate-700 disabled:opacity-40">Clear history</button></div>{preferences.privateSession || !preferences.rememberHistory ? <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50 p-5 text-xs font-bold leading-5 text-violet-900">History is disabled by your privacy settings.</div> : <div className="mt-6 space-y-2">{history.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-bold text-slate-500">No local history yet.</div> : history.map(item => <div key={item.id} className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs md:grid-cols-[150px_1fr_auto] md:items-center"><div><p className="font-black text-slate-900">{new Date(item.createdAt).toLocaleString()}</p><p className="mt-1 text-[10px] font-semibold text-slate-500">{item.inputCount} file{item.inputCount === 1 ? '' : 's'} · {bytes(item.inputBytes)}</p></div><p className="font-semibold text-slate-600">{item.steps.map(workspaceStepLabel).join(' → ')}</p><span className={`w-fit rounded-full px-2.5 py-1 text-[9px] font-black uppercase ${item.status === 'success' ? 'bg-emerald-100 text-emerald-800' : item.status === 'cancelled' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>{item.status}</span></div>)}</div>}</section>}

      {tab === 'settings' && <section className="grid gap-5 lg:grid-cols-2"><div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-[10px] font-black uppercase tracking-[.18em] text-violet-700">Privacy</p><h2 className="mt-2 text-xl font-black text-slate-950">Workspace storage controls</h2><div className="mt-6 space-y-3"><label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4"><input type="checkbox" checked={preferences.privateSession} onChange={event => setPrefs({ ...preferences, privateSession: event.target.checked })} className="mt-1"/><span><span className="block text-sm font-black text-slate-900">Private Session</span><span className="mt-1 block text-xs font-medium leading-5 text-slate-600">Do not retain run-history metadata. Saved workflow definitions remain under your direct control.</span></span></label><label className={`flex items-start gap-3 rounded-2xl border border-slate-200 p-4 ${preferences.privateSession ? 'opacity-50' : ''}`}><input type="checkbox" disabled={preferences.privateSession} checked={preferences.rememberHistory} onChange={event => setPrefs({ ...preferences, rememberHistory: event.target.checked })} className="mt-1"/><span><span className="block text-sm font-black text-slate-900">Remember local run history</span><span className="mt-1 block text-xs font-medium leading-5 text-slate-600">Stores timestamp, file count, byte totals, step names and outcome only.</span></span></label></div></div><div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-[10px] font-black uppercase tracking-[.18em] text-violet-700">Result behavior</p><h2 className="mt-2 text-xl font-black text-slate-950">Download controls</h2><label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4"><input type="checkbox" checked={preferences.autoDownload} onChange={event => setPrefs({ ...preferences, autoDownload: event.target.checked })} className="mt-1"/><span><span className="block text-sm font-black text-slate-900">Auto-download successful results</span><span className="mt-1 block text-xs font-medium leading-5 text-slate-600">Automatically downloads only after the local PDF writer finishes successfully.</span></span></label><div className="mt-4 rounded-2xl bg-slate-50 p-4 text-xs font-medium leading-5 text-slate-600">AJN Workspace does not keep output PDFs after you leave or refresh the tab. Download the result before closing the session.</div></div></section>}
    </div>
  );
}
