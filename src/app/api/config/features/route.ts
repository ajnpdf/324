import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type FlagName = 'workspace' | 'sharing' | 'ai_assistant' | 'batch_processing' | 'advanced_retouching';

function flag(name: string, fallback: boolean): boolean {
  const raw = String(process.env[name] ?? '').trim().toLowerCase();
  if (!raw) return fallback;
  if (['1', 'true', 'yes', 'on'].includes(raw)) return true;
  if (['0', 'false', 'no', 'off'].includes(raw)) return false;
  return fallback;
}

export async function GET() {
  const flags: Record<FlagName, boolean> = {
    workspace: flag('AJN_FEATURE_WORKSPACE', true),
    sharing: flag('AJN_FEATURE_SHARING', true),
    batch_processing: flag('AJN_FEATURE_BATCH_PROCESSING', true),
    ai_assistant: flag('AJN_FEATURE_AI_ASSISTANT', false),
    advanced_retouching: flag('AJN_FEATURE_ADVANCED_RETOUCHING', false),
  };

  return NextResponse.json(
    { service: 'AJN PDF feature configuration', version: 'r25', flags },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } },
  );
}
