'use client';

export type FeatureKey = 'workspace' | 'sharing' | 'ai_assistant' | 'batch_processing' | 'advanced_retouching';
export type FeatureSnapshot = Record<FeatureKey, boolean>;

const DEFAULTS: FeatureSnapshot = {
  workspace: true,
  sharing: true,
  batch_processing: true,
  ai_assistant: false,
  advanced_retouching: false,
};

class FeatureFlagSystem {
  private flags: FeatureSnapshot = { ...DEFAULTS };
  private loaded = false;
  private listeners = new Set<() => void>();

  isEnabled(key: FeatureKey): boolean {
    return Boolean(this.flags[key]);
  }

  snapshot(): FeatureSnapshot {
    return { ...this.flags };
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    for (const listener of this.listeners) listener();
  }

  async refresh(force = false): Promise<FeatureSnapshot> {
    if (this.loaded && !force) return this.snapshot();
    try {
      const response = await fetch('/api/config/features', { cache: 'no-store' });
      if (!response.ok) throw new Error('Feature configuration unavailable.');
      const payload = await response.json() as { flags?: Partial<FeatureSnapshot> };
      this.flags = { ...DEFAULTS, ...(payload.flags || {}) };
      this.loaded = true;
      this.emit();
    } catch {
      // Safe defaults keep proven production features available while risky unfinished features stay disabled.
      this.flags = { ...DEFAULTS };
      this.loaded = true;
    }
    return this.snapshot();
  }
}

export const featureFlags = new FeatureFlagSystem();
