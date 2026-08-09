export function NightSky() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-20 overflow-hidden bg-white">
      <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-red-100/60 blur-3xl" />
      <div className="absolute left-[35%] -top-32 h-[34rem] w-[34rem] rounded-full bg-blue-100/70 blur-3xl" />
      <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-emerald-100/55 blur-3xl" />
      <svg className="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 1440 900" preserveAspectRatio="none">
        <path d="M-60 660C190 414 367 750 624 480C836 257 1060 298 1510 530" fill="none" stroke="url(#ajn-night-curve)" strokeWidth="2" strokeDasharray="10 14" />
        <defs><linearGradient id="ajn-night-curve" x1="0" y1="0" x2="1440" y2="0"><stop stopColor="#E9233F"/><stop offset=".5" stopColor="#2563EB"/><stop offset="1" stopColor="#059669"/></linearGradient></defs>
      </svg>
    </div>
  );
}
