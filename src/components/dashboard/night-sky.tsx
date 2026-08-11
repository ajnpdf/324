export function NightSky() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-20 overflow-hidden bg-white">
      <div className="absolute inset-x-0 top-0 h-[28rem] bg-gradient-to-b from-violet-50/55 via-blue-50/35 to-transparent" />
      <svg className="absolute inset-x-0 top-8 h-[34rem] w-full opacity-70" viewBox="0 0 1440 620" preserveAspectRatio="none">
        <path d="M-80 360C190 145 425 510 710 288C958 95 1176 148 1520 330" fill="none" stroke="url(#ajn-page-wave-a)" strokeWidth="38" strokeLinecap="round" opacity=".16" />
        <path d="M-120 455C180 250 420 570 760 386C1035 238 1210 252 1540 430" fill="none" stroke="url(#ajn-page-wave-b)" strokeWidth="2" strokeDasharray="12 15" opacity=".55" />
        <defs>
          <linearGradient id="ajn-page-wave-a" x1="0" y1="0" x2="1440" y2="0"><stop stopColor="#7C3AED"/><stop offset=".5" stopColor="#2563EB"/><stop offset="1" stopColor="#059669"/></linearGradient>
          <linearGradient id="ajn-page-wave-b" x1="0" y1="0" x2="1440" y2="0"><stop stopColor="#E9233F"/><stop offset=".5" stopColor="#2563EB"/><stop offset="1" stopColor="#059669"/></linearGradient>
        </defs>
      </svg>
    </div>
  );
}
