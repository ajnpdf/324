export function PremiumBackground({ compact = false }: { compact?: boolean }) {
  return (
    <div aria-hidden="true" className="ajn-premium-bg pointer-events-none absolute inset-0 overflow-hidden">
      <svg className="ajn-wave ajn-wave-blue" viewBox="0 0 900 420" preserveAspectRatio="none">
        <defs>
          <linearGradient id="ajnWaveBlue" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1E4EFF" stopOpacity=".30" />
            <stop offset=".5" stopColor="#5F75FF" stopOpacity=".16" />
            <stop offset="1" stopColor="#A3B7FF" stopOpacity=".02" />
          </linearGradient>
        </defs>
        <path d="M0 255 C165 155 260 330 430 258 C585 193 636 69 900 128 L900 420 L0 420 Z" fill="url(#ajnWaveBlue)" />
        <path d="M0 306 C180 205 320 362 505 282 C630 228 720 160 900 174" fill="none" stroke="#3478F6" strokeOpacity=".12" strokeWidth="2" />
      </svg>
      <svg className="ajn-wave ajn-wave-red" viewBox="0 0 720 360" preserveAspectRatio="none">
        <defs>
          <linearGradient id="ajnWaveRed" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F51B3D" stopOpacity=".24" />
            <stop offset=".52" stopColor="#FF6477" stopOpacity=".13" />
            <stop offset="1" stopColor="#FFD6DA" stopOpacity=".02" />
          </linearGradient>
        </defs>
        <path d="M720 0 C560 58 604 171 466 178 C345 185 302 84 182 117 C102 139 50 183 0 198 L0 0 Z" fill="url(#ajnWaveRed)" />
      </svg>
      {!compact && (
        <div className="ajn-ring-field">
          {Array.from({ length: 10 }).map((_, index) => <span key={index} style={{ inset: `${index * 12}px` }} />)}
        </div>
      )}
      <div className="ajn-dot-field" />
      <div className="ajn-premium-glow ajn-premium-glow-blue" />
      <div className="ajn-premium-glow ajn-premium-glow-red" />
    </div>
  );
}
