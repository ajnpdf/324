export function PremiumBackground({ compact = false }: { compact?: boolean }) {
  return (
    <div aria-hidden="true" className={`ajn-premium-bg ajn-polished-bg pointer-events-none absolute inset-0 overflow-hidden ${compact ? 'is-compact' : ''}`}>
      <span className="ajn-polished-glow ajn-polished-glow-one" />
      <span className="ajn-polished-glow ajn-polished-glow-two" />
    </div>
  );
}
