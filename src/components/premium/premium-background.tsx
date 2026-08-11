export function PremiumBackground({ compact = false }: { compact?: boolean }) {
  return (
    <div aria-hidden="true" className={`ajn-premium-bg pointer-events-none absolute inset-0 overflow-hidden ${compact ? 'is-compact' : ''}`}>
      <span className="ajn-liquid-orb ajn-liquid-orb-one" />
      <span className="ajn-liquid-orb ajn-liquid-orb-two" />
      <span className="ajn-liquid-orb ajn-liquid-orb-three" />
      <span className="ajn-liquid-glow" />
      {!compact && <span className="ajn-liquid-mesh" />}
    </div>
  );
}
