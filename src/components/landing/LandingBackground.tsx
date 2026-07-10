export default function LandingBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-50 overflow-hidden bg-[#030508]">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-30%,rgba(16,185,129,0.18),transparent_50%),radial-gradient(ellipse_80%_60%_at_100%_50%,rgba(99,102,241,0.12),transparent_45%),radial-gradient(ellipse_70%_50%_at_0%_80%,rgba(236,72,153,0.1),transparent_40%)]" />

      {/* Aurora bands */}
      <div className="landing-aurora absolute -left-1/4 top-0 h-[70vh] w-[150%] opacity-40" />
      <div className="landing-aurora landing-aurora-delay absolute -right-1/4 top-1/4 h-[60vh] w-[140%] opacity-30" />

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 30%, black, transparent)",
        }}
      />

      {/* Noise texture */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJuIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC45IiBudW1PY3RhdmVzPSI0Ii8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI24pIi8+PC9zdmc+')]" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#030508_85%)]" />
    </div>
  );
}
