'use client';

import { useMemo, DependencyList } from 'react';

/**
 * useMemoFirebase - Stable Reference Hook
 * Ensures that Firestore queries and references are memoized correctly 
 * to prevent infinite re-render loops in hooks like useCollection and useDoc.
 */
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  return useMemo(factory, deps);
}
