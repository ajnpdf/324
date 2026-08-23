'use client';

import {
  DEFAULT_WORKSPACE_PREFERENCES,
  type SavedWorkspaceWorkflow,
  type WorkspaceHistoryItem,
  type WorkspacePreferences,
} from './types';

const PREFS_KEY = 'ajn-workspace-preferences-v1';
const HISTORY_KEY = 'ajn-workspace-history-v1';
const WORKFLOWS_KEY = 'ajn-workspace-saved-v1';
const HISTORY_LIMIT = 24;
const WORKFLOW_LIMIT = 20;

function hasWindow(): boolean {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function readJson<T>(key: string, fallback: T): T {
  if (!hasWindow()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable in private-browser modes. The workspace still works in-memory.
  }
}

export function loadWorkspacePreferences(): WorkspacePreferences {
  const stored = readJson<Partial<WorkspacePreferences>>(PREFS_KEY, {});
  return {
    privateSession: stored.privateSession ?? DEFAULT_WORKSPACE_PREFERENCES.privateSession,
    rememberHistory: stored.rememberHistory ?? DEFAULT_WORKSPACE_PREFERENCES.rememberHistory,
    autoDownload: stored.autoDownload ?? DEFAULT_WORKSPACE_PREFERENCES.autoDownload,
  };
}

export function saveWorkspacePreferences(value: WorkspacePreferences): void {
  writeJson(PREFS_KEY, value);
  if (value.privateSession || !value.rememberHistory) clearWorkspaceHistory();
}

export function loadWorkspaceHistory(): WorkspaceHistoryItem[] {
  return readJson<WorkspaceHistoryItem[]>(HISTORY_KEY, []).slice(0, HISTORY_LIMIT);
}

export function addWorkspaceHistory(item: WorkspaceHistoryItem, preferences: WorkspacePreferences): void {
  if (preferences.privateSession || !preferences.rememberHistory) return;
  const history = [item, ...loadWorkspaceHistory().filter(existing => existing.id !== item.id)].slice(0, HISTORY_LIMIT);
  writeJson(HISTORY_KEY, history);
}

export function clearWorkspaceHistory(): void {
  if (!hasWindow()) return;
  try { window.localStorage.removeItem(HISTORY_KEY); } catch { /* ignore */ }
}

export function loadSavedWorkflows(): SavedWorkspaceWorkflow[] {
  return readJson<SavedWorkspaceWorkflow[]>(WORKFLOWS_KEY, []).slice(0, WORKFLOW_LIMIT);
}

export function upsertSavedWorkflow(workflow: SavedWorkspaceWorkflow): SavedWorkspaceWorkflow[] {
  const next = [workflow, ...loadSavedWorkflows().filter(item => item.id !== workflow.id)].slice(0, WORKFLOW_LIMIT);
  writeJson(WORKFLOWS_KEY, next);
  return next;
}

export function deleteSavedWorkflow(id: string): SavedWorkspaceWorkflow[] {
  const next = loadSavedWorkflows().filter(item => item.id !== id);
  writeJson(WORKFLOWS_KEY, next);
  return next;
}
