export type WorkspaceStepType = 'merge' | 'rotate' | 'watermark' | 'page-numbers';

export type WorkspaceStep =
  | { id: string; type: 'merge'; enabled: boolean }
  | { id: string; type: 'rotate'; enabled: boolean; angle: 90 | 180 | 270 }
  | { id: string; type: 'watermark'; enabled: boolean; text: string; fontSize: number; opacity: number; rotation: number }
  | { id: string; type: 'page-numbers'; enabled: boolean; startAt: number; fontSize: number; position: 'bottom-center' | 'bottom-right' | 'top-right' };

export type WorkspacePreferences = {
  privateSession: boolean;
  rememberHistory: boolean;
  autoDownload: boolean;
};

export type WorkspaceHistoryItem = {
  id: string;
  createdAt: string;
  inputCount: number;
  inputBytes: number;
  outputBytes: number;
  steps: WorkspaceStepType[];
  status: 'success' | 'failed' | 'cancelled';
};

export type SavedWorkspaceWorkflow = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  steps: WorkspaceStep[];
};

export type WorkspaceProgress = {
  phase: 'idle' | 'loading' | 'processing' | 'saving' | 'done';
  current: number;
  total: number;
  message: string;
};

export const DEFAULT_WORKSPACE_PREFERENCES: WorkspacePreferences = {
  privateSession: true,
  rememberHistory: false,
  autoDownload: false,
};

export function workspaceStepLabel(type: WorkspaceStepType): string {
  if (type === 'merge') return 'Merge PDFs';
  if (type === 'rotate') return 'Rotate pages';
  if (type === 'watermark') return 'Watermark';
  return 'Page numbers';
}

export function createWorkspaceStep(type: WorkspaceStepType): WorkspaceStep {
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${type}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  if (type === 'merge') return { id, type, enabled: true };
  if (type === 'rotate') return { id, type, enabled: true, angle: 90 };
  if (type === 'watermark') return { id, type, enabled: true, text: 'CONFIDENTIAL', fontSize: 36, opacity: 0.2, rotation: -35 };
  return { id, type, enabled: true, startAt: 1, fontSize: 10, position: 'bottom-center' };
}
