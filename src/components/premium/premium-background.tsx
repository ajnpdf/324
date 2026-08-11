export function PremiumBackground({ compact = false }: { compact?: boolean }) {
  return (
    <div aria-hidden="true" className={`ajn-premium-bg ajn-r8-wave-bg pointer-events-none absolute inset-0 overflow-hidden ${compact ? 'is-compact' : ''}`}>
      <svg className="ajn-r8-wave ajn-r8-wave-one" viewBox="0 0 1200 220" preserveAspectRatio="none"><path d="M-60 146C135 40 252 200 438 114C615 32 710 38 850 99C1005 166 1096 109 1260 31" /></svg>
      <svg className="ajn-r8-wave ajn-r8-wave-two" viewBox="0 0 1200 220" preserveAspectRatio="none"><path d="M-70 92C110 174 249 32 420 102C603 178 720 189 865 104C1020 14 1111 76 1260 157" /></svg>
    </div>
  );
}
